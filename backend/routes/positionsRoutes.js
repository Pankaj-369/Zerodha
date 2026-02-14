const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/verifyToken");
const { PositionsModel } = require("../model/PositionsModel");
const { fetchQuote, mapFinnhubQuote } = require("../utils/finnhubClient");
const { mapToUsSymbol, getProductLabel } = require("../utils/symbolMapper");


router.get("/", verifyToken, async (req, res) => {
   try {
   
    const userId = req.user.id;

    const positions = await PositionsModel.find({ userId });

    const enrichedPositions = await Promise.all(
      positions.map(async (pos) => {
        const mappedSymbol = mapToUsSymbol(pos.name);
        try {
          const quote = await fetchQuote(mappedSymbol);
          const mapped = mapFinnhubQuote(quote);
          const LTP = mapped.currentPrice;
          const prevClose = mapped.previousClose;
          const dayChange = LTP - prevClose;
          const isLoss = dayChange < 0;

          return {
            ...pos._doc,
            name: mappedSymbol,
            product: getProductLabel(pos.product),
            LTP,
            day: dayChange.toFixed(2),
            isLoss,
          };
        } catch (err) {
          console.error("Error fetching price for:", mappedSymbol, err);
          return {
            ...pos._doc,
            name: mappedSymbol,
            product: getProductLabel(pos.product),
            LTP: pos.price,
            day: "N/A",
            isLoss: false,
          };
        }
      })
    );

    res.status(200).json(enrichedPositions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch positions." });
  }
});

module.exports = router;
