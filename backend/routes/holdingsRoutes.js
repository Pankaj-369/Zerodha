const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/verifyToken");
const { HoldingsModel } = require("../model/HoldingsModel");
const { fetchQuote, mapFinnhubQuote } = require("../utils/finnhubClient");
const { mapToUsSymbol, getCompanyName } = require("../utils/symbolMapper");

// In-memory cache
const cache = {};
const CACHE_TTL = 60 * 1000; // 60 seconds

// Fetch quote data with caching
const getQuoteData = async (symbol) => {
  const mappedSymbol = mapToUsSymbol(symbol);
  const now = Date.now();

  // Check cache
  if (cache[mappedSymbol] && now - cache[mappedSymbol].timestamp < CACHE_TTL) {
    return cache[mappedSymbol].data;
  }

  try {
    const quote = await fetchQuote(mappedSymbol);
    const mapped = mapFinnhubQuote(quote);

    const data = {
      // Preserve existing response contract consumed by holdings UI.
      symbol: mappedSymbol,
      name: getCompanyName(mappedSymbol),
      price: mapped.currentPrice || 0,
      net: (mapped.change ?? 0).toFixed(2),
      day: (mapped.percent ?? 0).toFixed(2) + "%",
    };

    // Save to cache
    cache[mappedSymbol] = {
      data,
      timestamp: now,
    };

    return data;
  } catch (err) {
    console.error(`Finnhub quote error for ${mappedSymbol}:`, err.message);
    return {
      symbol: mappedSymbol,
      name: getCompanyName(mappedSymbol),
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
          symbol: stock.symbol,
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
