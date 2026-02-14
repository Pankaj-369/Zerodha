const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/verifyToken");
const { WatchListModel } = require("../model/WatchListModel");
const { fetchQuote, mapFinnhubQuote } = require("../utils/finnhubClient");
const {
  mapToUsSymbol,
  getSymbolLookupCandidates,
  getCompanyName,
} = require("../utils/symbolMapper");

const priceCache = {};
const CACHE_DURATION = 60 * 1000;

async function getCachedQuote(symbol) {
  const now = Date.now();

  if (priceCache[symbol] && now - priceCache[symbol].timestamp < CACHE_DURATION) {
    return priceCache[symbol].data;
  }

  try {
    const result = await fetchQuote(symbol);
    const mapped = mapFinnhubQuote(result);

    const liveData = {
      // Preserve existing UI shape while sourcing values from Finnhub fields.
      price: mapped.currentPrice,
      change: mapped.change,
      percent: mapped.percent,
      isDown: mapped.change < 0,
    };

    priceCache[symbol] = {
      timestamp: now,
      data: liveData,
    };

    return liveData;
  } catch (err) {
    console.error(`Error fetching live price for ${symbol}:`, err.message);
    return {
      price: null,
      change: null,
      percent: null,
      isDown: false,
    };
  }
}

router.get("/", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // Step 1: Fetch user's saved stocks
    const watchlist = await WatchListModel.find({ userId });

    // Step 2: Fetch live price for each stock
    const enrichedWatchlist = await Promise.all(
      watchlist.map(async (item) => {
        const mappedSymbol = mapToUsSymbol(item.symbol);
        const liveData = await getCachedQuote(mappedSymbol);
        return {
          _id: item._id,
          symbol: mappedSymbol,
          name: getCompanyName(mappedSymbol, item.name),
          ...liveData, // price, change, percent, isDown
        };
      })
    );

    res.json(enrichedWatchlist);
  } catch (err) {
    res.status(500).json({
      error: "Failed to fetch watchlist",
      details: err.message,
    });
  }
});

router.post("/add", verifyToken, async (req, res) => {
  const { symbol, name } = req.body;
  const userId = req.user.id;
  const mappedSymbol = mapToUsSymbol(symbol);
  const symbolCandidates = getSymbolLookupCandidates(mappedSymbol);

  console.log("Adding to watchlist:", { userId, symbol: mappedSymbol, name });

  if (!mappedSymbol || !name) {
    return res.status(400).json({ success: false, message: "Missing fields" });
  }

  try {
    const exists = await WatchListModel.findOne({
      userId,
      symbol: { $in: symbolCandidates },
    });
    if (exists) {
      return res.json({ success: false, message: "Already in watchlist" });
    }

    const newItem = new WatchListModel({
      userId,
      symbol: mappedSymbol,
      name: getCompanyName(mappedSymbol, name),
    });
    await newItem.save();
    res.json({ success: true, message: "Added to watchlist" });
  } catch (err) {
    console.error("Error adding to watchlist", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

router.delete("/remove", verifyToken, async (req, res) => {
  const userId = req.user.id;
  const { symbol } = req.body;
  const symbolCandidates = getSymbolLookupCandidates(symbol);

  try {
    // Match both legacy and mapped symbols without requiring DB migration.
    await WatchListModel.findOneAndDelete({
      userId,
      symbol: { $in: symbolCandidates },
    });
    res.json({ success: true, message: "Removed from watchlist" });
  } catch (err) {
    console.error("Watchlist delete error:", err);
    res.status(500).json({ success: false, message: "Failed to remove" });
  }
});


module.exports = router;
