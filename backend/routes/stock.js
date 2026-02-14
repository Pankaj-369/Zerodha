const express = require("express");
const router = express.Router();
const { fetchQuote, mapFinnhubQuote } = require("../utils/finnhubClient");
const { mapToUsSymbol, getCompanyName } = require("../utils/symbolMapper");

// In-memory cache object
const cache = {};
const CACHE_TTL_MS = 60 * 1000; // Cache TTL: 60 seconds

router.get("/live/:symbol", async (req, res) => {
  const symbol = mapToUsSymbol(req.params.symbol);
  const now = Date.now();

  // Check if the symbol is cached and still fresh
  if (cache[symbol] && now - cache[symbol].timestamp < CACHE_TTL_MS) {
    console.log(`Cache hit for ${symbol}`);
    return res.status(200).json(cache[symbol].data);
  }

  try {
    console.log(`Fetching live data for: ${symbol}`);
    const result = await fetchQuote(symbol);
    const mapped = mapFinnhubQuote(result);

    const data = {
      // Quote endpoint does not include long instrument names; keep stable fallback.
      name: getCompanyName(symbol),
      price: mapped.currentPrice,
      change: mapped.change,
      percent: mapped.percent,
      isDown: mapped.change < 0,
    };

    // Store the result in cache
    cache[symbol] = {
      data,
      timestamp: now,
    };

    res.status(200).json(data);
  } catch (err) {
    console.error("Finnhub quote error:", err?.message || err);
    res.status(500).json({ error: "Failed to fetch stock data" });
  }
});

module.exports = router;
