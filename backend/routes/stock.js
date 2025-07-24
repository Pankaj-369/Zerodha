const express = require("express");
const router = express.Router();
const yahooFinance = require("yahoo-finance2").default;

// In-memory cache object
const cache = {};
const CACHE_TTL_MS = 60 * 1000; // Cache TTL: 60 seconds

router.get("/live/:symbol", async (req, res) => {
  const symbol = req.params.symbol;
  const now = Date.now();

  // Check if the symbol is cached and still fresh
  if (cache[symbol] && (now - cache[symbol].timestamp < CACHE_TTL_MS)) {
    console.log(`✅ Cache hit for ${symbol}`);
    return res.status(200).json(cache[symbol].data);
  }

  try {
    console.log(`🌐 Fetching live data for: ${symbol}`);
    const result = await yahooFinance.quote(symbol);

    const data = {
      name: result.shortName || result.symbol,
      price: result.regularMarketPrice,
      change: result.regularMarketChange,
      percent: result.regularMarketChangePercent,
      isDown: result.regularMarketChange < 0,
    };

    // Store the result in cache
    cache[symbol] = {
      data,
      timestamp: now,
    };

    res.status(200).json(data);
  } catch (err) {
    console.error("❌ Yahoo Finance Error:", err);
    res.status(500).json({ error: "Failed to fetch stock data" });
  }
});

module.exports = router;
