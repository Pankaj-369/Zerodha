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
app.use(cors());
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
























// app.get("/addHoldings", async (req, res) => {
//   const userId = "6873686cc39c34aba2726387";
//   let tempHoldings = [
//     {
//       name: "BHARTIARTL",
//       qty: 2,
//       avg: 538.05,
//       price: 541.15,
//       net: "+0.58%",
//       day: "+2.99%",
//     },
//     {
//       name: "HDFCBANK",
//       qty: 2,
//       avg: 1383.4,
//       price: 1522.35,
//       net: "+10.04%",
//       day: "+0.11%",
//     },
//     {
//       name: "HINDUNILVR",
//       qty: 1,
//       avg: 2335.85,
//       price: 2417.4,
//       net: "+3.49%",
//       day: "+0.21%",
//     },
//     {
//       name: "INFY",
//       qty: 1,
//       avg: 1350.5,
//       price: 1555.45,
//       net: "+15.18%",
//       day: "-1.60%",
//       isLoss: true,
//     },
//     {
//       name: "ITC",
//       qty: 5,
//       avg: 202.0,
//       price: 207.9,
//       net: "+2.92%",
//       day: "+0.80%",
//     },
//     {
//       name: "KPITTECH",
//       qty: 5,
//       avg: 250.3,
//       price: 266.45,
//       net: "+6.45%",
//       day: "+3.54%",
//     },
//     {
//       name: "M&M",
//       qty: 2,
//       avg: 809.9,
//       price: 779.8,
//       net: "-3.72%",
//       day: "-0.01%",
//       isLoss: true,
//     },
//     {
//       name: "RELIANCE",
//       qty: 1,
//       avg: 2193.7,
//       price: 2112.4,
//       net: "-3.71%",
//       day: "+1.44%",
//     },
//     {
//       name: "SBIN",
//       qty: 4,
//       avg: 324.35,
//       price: 430.2,
//       net: "+32.63%",
//       day: "-0.34%",
//       isLoss: true,
//     },
//     {
//       name: "SGBMAY29",
//       qty: 2,
//       avg: 4727.0,
//       price: 4719.0,
//       net: "-0.17%",
//       day: "+0.15%",
//     },
//     {
//       name: "TATAPOWER",
//       qty: 5,
//       avg: 104.2,
//       price: 124.15,
//       net: "+19.15%",
//       day: "-0.24%",
//       isLoss: true,
//     },
//     {
//       name: "TCS",
//       qty: 1,
//       avg: 3041.7,
//       price: 3194.8,
//       net: "+5.03%",
//       day: "-0.25%",
//       isLoss: true,
//     },
//     {
//       name: "WIPRO",
//       qty: 4,
//       avg: 489.3,
//       price: 577.75,
//       net: "+18.08%",
//       day: "+0.32%",
//     },
//   ];

//   tempHoldings.forEach((item) => {
//     let newHolding = new HoldingsModel({
//       ...item,
//       userId,
//     });

//     newHolding.save();
//   });
//   res.send("Done!");
// });
// app.get("/addPositions", async (req, res) => {
//    const userId = "6873686cc39c34aba2726387";
//   let tempPositions = [
//     {
//       product: "CNC",
//       name: "EVEREADY",
//       qty: 2,
//       avg: 316.27,
//       price: 312.35,
//       net: "+0.58%",
//       day: "-1.24%",
//       isLoss: true,
//     },
//     {
//       product: "CNC",
//       name: "JUBLFOOD",
//       qty: 1,
//       avg: 3124.75,
//       price: 3082.65,
//       net: "+10.04%",
//       day: "-1.35%",
//       isLoss: true,
//     },
//   ];

//   tempPositions.forEach((item) => {
//     let newPosition = new PositionsModel({
//     ...item,
//     userId,
//     });

//     newPosition.save();
//   });
//   res.send("Done!");
// });
// app.get("/addWatchlist", async (req, res) => {
//   const userId = "6873686cc39c34aba2726387";

//   const staticWatchlist = [
//     { name: "INFY", price: 1555.45, percent: "-1.60%", isDown: true },
//     { name: "ONGC", price: 116.8, percent: "-0.09%", isDown: true },
//     { name: "TCS", price: 3194.8, percent: "-0.25%", isDown: true },
//     { name: "KPITTECH", price: 266.45, percent: "3.54%", isDown: false },
//     { name: "QUICKHEAL", price: 308.55, percent: "-0.15%", isDown: true },
//     { name: "WIPRO", price: 577.75, percent: "0.32%", isDown: false },
//     { name: "M&M", price: 779.8, percent: "-0.01%", isDown: true },
//     { name: "RELIANCE", price: 2112.4, percent: "1.44%", isDown: false },
//     { name: "HUL", price: 512.4, percent: "1.04%", isDown: false },
//   ];

//   staticWatchlist.forEach((item) => {
//     let newwatchlist = new WatchListModel({
//     ...item,
//     userId,
//     });

//     newwatchlist.save();
//   });
//   res.send("User-specific watchlist added.");
// });

// app.post("/verify-token", (req, res) => {
//   const token = req.body.token;
//   if (!token) {
//     return res.status(401).json({ valid: false, msg: "Token not provided" });
//   }

//   try {
//     const decoded = jwt.verify(token, secret);
//     res.status(200).json({ valid: true, user: decoded });
//   } catch (err) {
//     res.status(403).json({ valid: false, msg: "Invalid or expired token" });
//   }
// });



