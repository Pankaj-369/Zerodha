require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
require("./squareoff.js");
const axios = require("axios");

const yahooFinance = require("yahoo-finance2").default;


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
  'http://localhost:3000',        
  'http://localhost:3001',        
  'https://zerodha-frontend-swjp.onrender.com',
  'https://zerodha-dashboard-ezcd.onrender.com'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));


app.use(bodyParser.json());
app.use(express.json());

mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log("Connected to MongoDB"))
  .catch(err => console.error("MongoDB connection error:", err));

app.use("/", authRoutes);
app.use("/funds", fundsRoutes);
app.use("/orders", ordersRoutes);
app.use("/holdings", holdingsRoutes);
app.use("/positions", positionsRoutes);
app.use("/watchlist", watchlistRoutes);
app.use("/api/stock", stockRoutes);

app.get("/indices", async (req, res) => {
  try {
    const nifty = await yahooFinance.quote("^NSEI");
    const sensex = await yahooFinance.quote("^BSESN");

    res.json({
      nifty: {
        value: nifty.regularMarketPrice,
        change: nifty.regularMarketChangePercent,
      },
      sensex: {
        value: sensex.regularMarketPrice,
        change: sensex.regularMarketChangePercent,
      },
    });
  } catch (error) {
    console.error("Yahoo API error:", error);
    res.status(500).json({ error: "Failed to fetch data" });
  }
});



app.get("/search/symbols", async (req, res) => {
  const query = req.query.q;
  if (!query) return res.status(400).json({ error: "Missing query" });

  try {
    const result = await yahooFinance.search(query);
    const filtered = result.quotes
      .filter((item) => item.quoteType === "EQUITY")
      .slice(0, 10) // limit results
      .map((item) => ({
        symbol: item.symbol,
        name: item.shortname,
      }));

    res.json(filtered);
  } catch (err) {
    console.error("Yahoo search error:", err);
    res.status(500).json({ error: "Search failed" });
  }
});

app.get('/history/:symbol', async (req, res) => {
  const symbol = req.params.symbol;
  const { range = "1mo", interval = "1d" } = req.query;

  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?range=${range}&interval=${interval}`;
    const response = await axios.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0",
      },
    });

    const result = response.data.chart.result && response.data.chart.result[0];
    if (!result || !result.timestamp || !result.indicators?.quote[0]?.close) {
      return res.json([]);
    }
    const timestamps = result.timestamp;
    const closePrices = result.indicators.quote[0].close;

    // Format to standard "YYYY-MM-DD" and filter out missing prices
    const formattedData = timestamps.map((ts, i) => {
      const price = closePrices[i];
      // Filter out null/undefined price entries
      if (price == null) return null;
      // Format: 2025-07-23 (safe for chart)
      const date = new Date(ts * 1000).toISOString().split('T')[0];
      return { date, close: price };
    }).filter(Boolean);

    res.json(formattedData);
  } catch (err) {
    console.error("Failed to fetch stock history:", err.message);
    res.status(500).json({ error: "Failed to fetch stock history" });
  }
});







app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});


























