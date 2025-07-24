const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/verifyToken");
const { WatchListModel } = require("../model/WatchListModel");
const yahooFinance = require("yahoo-finance2").default;

const priceCache = {};
const CACHE_DURATION = 60 * 1000;

async function getCachedQuote(symbol) {
  const now = Date.now();

  if (priceCache[symbol] && now - priceCache[symbol].timestamp < CACHE_DURATION) {
    return priceCache[symbol].data;
  }

  try {
    const result = await yahooFinance.quote(symbol);
    const liveData = {
      price: result.regularMarketPrice,
      change: result.regularMarketChange,
      percent: result.regularMarketChangePercent,
      isDown: result.regularMarketChange < 0,
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
        const liveData = await getCachedQuote(item.symbol);
        return {
          _id: item._id,
          symbol: item.symbol,
          name: item.name,
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

  console.log("Adding to watchlist:", { userId, symbol, name });

  if (!symbol || !name) {
    return res.status(400).json({ success: false, message: "Missing fields" });
  }

  try {
    const exists = await WatchListModel.findOne({ userId, symbol });
    if (exists) {
      return res.json({ success: false, message: "Already in watchlist" });
    }

    const newItem = new WatchListModel({ userId, symbol, name });
    await newItem.save();
    res.json({ success: true, message: "Added to watchlist" });
  } catch (err) {
    console.error("Error adding to watchlist", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

router.delete("/remove", verifyToken, async (req, res) => {
  const userId = req.user.id;
  const {symbol} = req.body;

  try {
    await WatchListModel.findOneAndDelete({ user: userId, symbol });
    res.json({ success: true, message: "Removed from watchlist" });
  } catch (err) {
    console.error("Watchlist delete error:", err);
    res.status(500).json({ success: false, message: "Failed to remove" });
  }
});


module.exports = router;
