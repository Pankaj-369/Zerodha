const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { UsersModel } = require("../model/UsersModel");
const { WatchListModel } = require("../model/WatchListModel");

const router = express.Router();
const secret = process.env.JWT_SECRET;

router.post("/signup", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const userdata = new UsersModel({ username, email, password: hashedPassword });
    await userdata.save();

    const defaultWatchlist = [
      { symbol: "RELIANCE", name: "Reliance Industries" },
      { symbol: "TCS", name: "Tata Consultancy Services" },
      { symbol: "HDFCBANK", name: "HDFC Bank" },
      { symbol: "INFY", name: "Infosys Limited" },
      { symbol: "ICICIBANK", name: "ICICI Bank" },
      { symbol: "HINDUNILVR", name: "Hindustan Unilever" },
      { symbol: "SBIN", name: "State Bank of India" },
      { symbol: "KOTAKBANK", name: "Kotak Mahindra Bank" },
    ];

    const watchlistDocs = defaultWatchlist.map(item => ({
      ...item,
      userId: userdata._id,
    }));
    await WatchListModel.insertMany(watchlistDocs);

    res.status(201).json({ message: "User registered successfully." });
  } catch (err) {
    res.status(400).json({ message: "Error signing up", error: err.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await UsersModel.findOne({ username });
    if (!user) return res.status(400).json({ message: "Invalid credentials." });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials." });

    const token = jwt.sign({ id: user._id }, secret, { expiresIn: "1d" });

    res.status(200).json({ message: "Login successful", token, user: { id: user._id, username: user.username, email: user.email } });
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
});

module.exports = router;
