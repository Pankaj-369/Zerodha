const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { UsersModel } = require("../model/UsersModel");
const { WatchListModel } = require("../model/WatchListModel");

const router = express.Router();
const secret = process.env.JWT_SECRET;
const GUEST_USERNAME = "guest_user";
const GUEST_EMAIL = "guest@demo.local";

const getDefaultWatchlist = () => [
  // Rebranded default watchlist for US market symbols.
  { symbol: "AAPL", name: "Apple Inc." },
  { symbol: "MSFT", name: "Microsoft Corp." },
  { symbol: "NVDA", name: "NVIDIA Corp." },
  { symbol: "JPM", name: "JPMorgan Chase & Co." },
  { symbol: "BAC", name: "Bank of America Corp." },
  { symbol: "KO", name: "Coca-Cola Co." },
  { symbol: "GS", name: "Goldman Sachs Group Inc." },
  { symbol: "V", name: "Visa Inc." },
];

async function seedDefaultWatchlist(userId) {
  const defaultWatchlist = getDefaultWatchlist();
  const watchlistDocs = defaultWatchlist.map((item) => ({
    ...item,
    userId,
  }));
  await WatchListModel.insertMany(watchlistDocs);
}

function buildAuthResponse(user, expiresIn = "1d") {
  const token = jwt.sign({ id: user._id }, secret, { expiresIn });
  return {
    message: "Login successful",
    token,
    user: { id: user._id, username: user.username, email: user.email },
  };
}

router.post("/signup", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const userdata = new UsersModel({ username, email, password: hashedPassword });
    await userdata.save();
    await seedDefaultWatchlist(userdata._id);

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

    res.status(200).json(buildAuthResponse(user));
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
});

router.post("/login/guest", async (req, res) => {
  try {
    let guest = await UsersModel.findOne({ username: GUEST_USERNAME });

    if (!guest) {
      const hashedPassword = await bcrypt.hash(`guest-${Date.now()}`, 10);
      try {
        guest = await UsersModel.create({
          username: GUEST_USERNAME,
          email: GUEST_EMAIL,
          password: hashedPassword,
        });
      } catch (createErr) {
        // Handle race condition on unique email/username creation.
        guest = await UsersModel.findOne({ username: GUEST_USERNAME });
      }
    }

    if (!guest) {
      return res.status(500).json({ message: "Failed to initialize guest account." });
    }

    // Reset guest watchlist each login for a predictable demo experience.
    await WatchListModel.deleteMany({ userId: guest._id });
    await seedDefaultWatchlist(guest._id);

    return res.status(200).json(buildAuthResponse(guest, "12h"));
  } catch (err) {
    return res.status(500).json({ message: "Guest login failed", error: err.message });
  }
});

module.exports = router;
