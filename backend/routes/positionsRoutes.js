const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/verifyToken");
const { PositionsModel } = require("../model/PositionsModel");
const yahooFinance = require("yahoo-finance2").default;


router.get("/", verifyToken, async (req, res) => {
   try {
   
    const userId = req.user.id;

    const positions = await PositionsModel.find({ userId });

    const enrichedPositions = await Promise.all(
      positions.map(async (pos) => {
        try {
          const quote = await yahooFinance.quote(pos.name);
          const LTP = quote.regularMarketPrice;
          const prevClose = quote.regularMarketPreviousClose;
          const dayChange = LTP - prevClose;
          const isLoss = dayChange < 0;

          return {
            ...pos._doc,
            LTP,
            day: dayChange.toFixed(2),
            isLoss,
          };
        } catch (err) {
          console.error("Error fetching price for:", pos.name, err);
          return {
            ...pos._doc,
            price: pos.avg,
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
