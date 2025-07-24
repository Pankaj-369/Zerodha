const mongoose = require("mongoose");

const UsersSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email:    { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },

  funds: { type: Number, default: 100000 },  

  availableMargin: { type: Number, default: 100000 },
  usedMargin:      { type: Number, default: 0 },
  openingBalance:  { type: Number, default: 100000 },

  orders:    [{ type: mongoose.Schema.Types.ObjectId, ref: "Order" }],
  holdings:  [{ type: mongoose.Schema.Types.ObjectId, ref: "Holding" }],
  positions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Position" }],
});

module.exports = { UsersSchema };
