require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
require("./squareoff.js");
const {
  fetchQuote,
  mapFinnhubQuote,
  searchSymbols,
  fetchCandles,
} = require("./utils/finnhubClient");
const { mapToUsSymbol } = require("./utils/symbolMapper");

const authRoutes = require("./routes/authRoutes");
const fundsRoutes = require("./routes/fundsRoutes");
const ordersRoutes = require("./routes/ordersRoutes");
const holdingsRoutes = require("./routes/holdingsRoutes");
const positionsRoutes = require("./routes/positionsRoutes");
const watchlistRoutes = require("./routes/watchlistRoutes");
const stockRoutes = require("./routes/stock.js");

const PORT = process.env.PORT || 3002;
const app = express();

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "https://zerodha-frontend-swjp.onrender.com",
  "https://zerodha-dashboard-ezcd.onrender.com",
  "https://zerodha-nu-nine.vercel.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use(bodyParser.json());
app.use(express.json());

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

app.use("/", authRoutes);
app.use("/funds", fundsRoutes);
app.use("/orders", ordersRoutes);
app.use("/holdings", holdingsRoutes);
app.use("/positions", positionsRoutes);
app.use("/watchlist", watchlistRoutes);
app.use("/api/stock", stockRoutes);

const DEFAULT_INDICES = {
  sp500: { value: 0, change: 0 },
  dowJones: { value: 0, change: 0 },
};

app.get("/indices", async (req, res) => {
  try {
    // Using Finnhub Quote API for index snapshots.
    const [sp500Raw, dowRaw] = await Promise.all([
      fetchQuote("SPY"),
      fetchQuote("DIA"),
    ]);

    const sp500 = mapFinnhubQuote(sp500Raw);
    const dowJones = mapFinnhubQuote(dowRaw);

    const response = {
      sp500: {
        value: Number.isFinite(sp500?.currentPrice) ? sp500.currentPrice : 0,
        change: Number.isFinite(sp500?.percent) ? sp500.percent : 0,
      },
      dowJones: {
        value: Number.isFinite(dowJones?.currentPrice) ? dowJones.currentPrice : 0,
        change: Number.isFinite(dowJones?.percent) ? dowJones.percent : 0,
      },
    };

    return res.json(response);
  } catch (error) {
    console.error("Finnhub API error:", error?.message || error);
    return res.json({
      ...DEFAULT_INDICES,
      sourceError: "indices_unavailable",
    });
  }
});

app.get("/search/symbols", async (req, res) => {
  const query = req.query.q;
  if (!query) return res.status(400).json({ error: "Missing query" });

  try {
    const result = await searchSymbols(query);
    const filtered = (result?.result || [])
      .filter((item) => {
        const type = String(item?.type || "").toLowerCase();
        return !type || type.includes("stock") || type.includes("equity");
      })
      .slice(0, 10)
      .map((item) => ({
        symbol: item.symbol || item.displaySymbol,
        name: item.description || item.symbol || item.displaySymbol,
      }));

    res.json(filtered);
  } catch (err) {
    console.error("Finnhub search error:", err?.message || err);
    res.status(500).json({ error: "Search failed" });
  }
});

app.get("/history/:symbol", async (req, res) => {
  const symbol = mapToUsSymbol(req.params.symbol);
  const { range = "1mo", interval = "1d" } = req.query;

  try {
    const now = Math.floor(Date.now() / 1000);
    const rangeToDays = {
      "1mo": 30,
      "6mo": 182,
      "1y": 365,
    };

    // Keep the same route contract while mapping UI interval to Finnhub resolution.
    const resolution = interval === "1mo" ? "M" : "D";
    const days = rangeToDays[range] || 30;
    const from = now - days * 24 * 60 * 60;

    const candles = await fetchCandles({
      symbol,
      resolution,
      from,
      to: now,
    });

    if (candles?.s !== "ok" || !Array.isArray(candles?.t) || !Array.isArray(candles?.c)) {
      return res.json([]);
    }

    const timestamps = candles.t;
    const closePrices = candles.c;

    const formattedData = timestamps
      .map((ts, i) => {
        const price = closePrices[i];
        if (price == null) return null;
        const date = new Date(ts * 1000).toISOString().split("T")[0];
        return { date, close: price };
      })
      .filter(Boolean);

    res.json(formattedData);
  } catch (err) {
    console.error("Failed to fetch stock history:", err?.message || err);
    res.status(500).json({ error: "Failed to fetch stock history" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
