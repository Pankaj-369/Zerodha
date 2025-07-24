const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/verifyToken");
const { UsersModel } = require("../model/UsersModel");

// GET current funds
router.get("/", verifyToken, async (req, res) => {
  try {
    const user = await UsersModel.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    res.json({
      availableMargin: user.availableMargin,
      usedMargin: user.usedMargin,
      funds: user.funds,
      openingBalance: user.openingBalance,
    });
  } catch (err) {
    res.status(500).json({ error: "Server error", message: err.message });
  }
});

// POST: Add Funds
router.post("/add", verifyToken, async (req, res) => {
  const { amount } = req.body;
  if (!amount || amount <= 0) {
    return res.status(400).json({ message: "Invalid amount." });
  }

  try {
    const user = await UsersModel.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found." });

    user.funds += amount;
    user.availableMargin += amount;
    user.openingBalance += amount; // Also update opening balance

    await user.save();

    res.status(200).json({
      success: true,
      message: "Funds added successfully.",
      funds: user.funds,
      availableMargin: user.availableMargin,
      openingBalance: user.openingBalance // Fixed this line
    });
  } catch (err) {
    console.error("Add funds error:", err);
    res.status(500).json({ 
      message: "Error adding funds.", 
      error: err.message 
    });
  }
});

// POST: Withdraw Funds
router.post("/withdraw", verifyToken, async (req, res) => {
  const { amount } = req.body;
  if (!amount || amount <= 0) {
    return res.status(400).json({ message: "Invalid amount." });
  }

  try {
    const user = await UsersModel.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found." });

    if (user.funds < amount) {
      return res.status(400).json({ message: "Insufficient funds." });
    }

    user.funds -= amount;
    user.availableMargin -= amount;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Funds withdrawn successfully.",
      funds: user.funds,
      availableMargin: user.availableMargin,
    });
  } catch (err) {
    console.error("Withdraw funds error:", err);
    res.status(500).json({ 
      message: "Error withdrawing funds.", 
      error: err.message 
    });
  }
});

module.exports = router;
