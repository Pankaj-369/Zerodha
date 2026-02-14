const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/verifyToken");
const { HoldingsModel } = require("../model/HoldingsModel");
const { fetchQuote, mapFinnhubQuote } = require("../utils/finnhubClient");

// In-memory cache
const cache = {};
const CACHE_TTL = 60 * 1000; // 60 seconds

// Fetch quote data with caching
const getQuoteData = async (symbol) => {
  const now = Date.now();

  // Check cache
  if (cache[symbol] && now - cache[symbol].timestamp < CACHE_TTL) {
    return cache[symbol].data;
  }

  try {
    const quote = await fetchQuote(symbol);
    const mapped = mapFinnhubQuote(quote);

    const data = {
      // Preserve existing response contract consumed by holdings UI.
      name: symbol,
      price: mapped.currentPrice || 0,
      net: (mapped.change ?? 0).toFixed(2),
      day: (mapped.percent ?? 0).toFixed(2) + "%",
    };

    // Save to cache
    cache[symbol] = {
      data,
      timestamp: now,
    };

    return data;
  } catch (err) {
    console.error(`Finnhub quote error for ${symbol}:`, err.message);
    return {
      name: symbol,
      price: 0,
      net: "0.00",
      day: "0.00%",
    };
  }
};

// GET route for holdings
router.get("/", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const holdings = await HoldingsModel.find({ userId });

    const enriched = await Promise.all(
      holdings.map(async (h) => {
        const stock = await getQuoteData(h.symbol);
        return {
          name: stock.name,
          symbol: h.symbol,
          qty: h.qty,
          avg: h.avgBuyPrice,
          price: stock.price,
          net: stock.net,
          day: stock.day,
        };
      })
    );

    res.json(enriched);
  } catch (err) {
    console.error("Error fetching holdings:", err.message);
    res.status(500).json({ error: "Failed to fetch holdings", details: err.message });
  }
});

module.exports = router;
