const mongoose = require("mongoose");

const HoldingsSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  symbol: String,                // e.g. TCS.NS
  qty: Number,             // e.g. 5
  avgBuyPrice: Number,          // e.g. 3850
});


module.exports =  {HoldingsSchema};