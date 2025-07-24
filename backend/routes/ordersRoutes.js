

const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/verifyToken");

const { OrdersModel } = require("../model/OrdersModel");
const { UsersModel } = require("../model/UsersModel");
const { HoldingsModel } = require("../model/HoldingsModel");
const { PositionsModel } = require("../model/PositionsModel");


router.get("/", verifyToken, async (req, res) => {
  try {
    const orders = await OrdersModel.find({ userId: req.user.id });
    res.json(orders);
  } catch (err) {
    console.error("Error fetching orders:", err);
    res.status(500).json({ success: false, message: "Error fetching orders" });
  }
});

router.post("/new", verifyToken, async (req, res) => {
  const userId = req.user.id;
  const { name, qty, price, mode, orderType, symbol = "MARKET", product = "CNC", isPositionSell = false, positionId } = req.body;

  if (!name || !qty || !mode || !price) {
    return res.status(400).json({ success: false, message: "Missing required fields" });
  }

  try {
    const user = await UsersModel.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const quantity = Number(qty);
    const finalPrice = Number(price);
    const amount = quantity * finalPrice;

    if (isNaN(quantity) || quantity <= 0 || isNaN(finalPrice) || finalPrice <= 0) {
      return res.status(400).json({ success: false, message: "Invalid qty or price" });
    }

    // ---------- POSITION SQUARE-OFF LOGIC ----------
    if ((mode === "SELL" || mode === "SQUAREOFF") && isPositionSell && positionId) {
      const position = await PositionsModel.findOne({ _id: positionId, userId });
      if (!position) {
        return res.status(404).json({ success: false, message: "Position not found" });
      }
      if (position.qty < quantity) {
        return res.status(400).json({ success: false, message: "Not enough quantity in position to square-off" });
      }

      // Calculate P&L, update user funds
      const sellAmount = quantity * finalPrice;
      const buyAmount = quantity * position.price;
      const pnl = sellAmount - buyAmount;

      user.availableMargin += sellAmount;
      user.usedMargin -= buyAmount;
      if (user.usedMargin < 0) user.usedMargin = 0;
      await user.save();

      // Update or remove position
      position.qty -= quantity;
      let positionClosed = false;
      if (position.qty <= 0) {
        await PositionsModel.deleteOne({ _id: position._id });
        positionClosed = true;
      } else {
        await position.save();
      }

      // Record as an Order
      const status = orderType === "MARKET" ? "EXECUTED" : "PENDING";
      const newOrder = new OrdersModel({
        name,
        qty: quantity,
        price: finalPrice,
        mode: "SELL", 
        status,
        timestamp: new Date(),
        userId,
        positionId,
      });
      await newOrder.save();

      return res.status(200).json({
        success: true,
        message: "Position squared off successfully",
        order: newOrder,
        positionClosed,
        pnl,
        funds: {
          availableMargin: user.availableMargin,
          usedMargin: user.usedMargin,
        }
      });
    }

    // ----------- HOLDINGS LOGIC (Your old code) -----------
    if (mode === "BUY") {
      if (user.availableMargin < amount) {
        return res.status(400).json({ success: false, message: "Insufficient margin" });
      }
      user.availableMargin -= amount;
      user.usedMargin += amount;
      user.availableCash -= amount;
    }

    if (mode === "SELL") {
      const holding = await HoldingsModel.findOne({ userId, symbol });
      if (!holding || holding.qty < quantity) {
        return res.status(400).json({ success: false, message: "Insufficient holdings to sell" });
      }
      holding.qty -= quantity;
      if (holding.qty === 0) {
        await HoldingsModel.deleteOne({ _id: holding._id });
      } else {
        await holding.save();
      }
      user.availableMargin += amount;
      user.usedMargin -= amount;
      user.availableCash += amount;
    }

    const status = orderType === "MARKET" ? "EXECUTED" : "PENDING";

    const newOrder = new OrdersModel({
      name,
      qty: quantity,
      price: finalPrice,
      mode,
      status,
      timestamp: new Date(),
      userId,
    });

    await newOrder.save();
    await user.save();

    if (status === "EXECUTED" && mode === "BUY") {
      const newPosition = new PositionsModel({
        product,
        name,
        qty: quantity,
        price: finalPrice,
        userId,
      });
      await newPosition.save();
    }

    res.status(200).json({
      success: true,
      message: `${orderType} ${mode} order placed successfully`,
      order: newOrder,
      funds: {
        availableMargin: user.availableMargin,
        usedMargin: user.usedMargin,
      },
    });
  } catch (err) {
    console.error("Order processing error:", err);
    res.status(500).json({ success: false, message: "Server error: " + err.message });
  }
});

module.exports = router;
