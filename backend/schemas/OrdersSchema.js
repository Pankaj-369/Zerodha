const { Schema } = require("mongoose");

const OrdersSchema = new Schema({
  name: String,
  qty: Number,
  price: Number,
  mode: String,
  timestamp:Date,
  userId: { type: Schema.Types.ObjectId, ref: "User" },
  // Support US order types while preserving existing structure.
  type: { type: String, enum: ["MARKET", "LIMIT", "STOP"], default: "MARKET" },
  status: { type: String, enum: ["PENDING", "EXECUTED", "EXPIRED"], default: "EXECUTED" }
});

module.exports = { OrdersSchema };





// const { Schema } = require("mongoose");

// const OrdersSchema = new Schema({
//   userId: Schema.Types.ObjectId,
//   stockSymbol: String,
//   stockName: String,
//   quantity: Number,
//   orderType: String, 
//   price: Number,      
//   status: String,   
//   createdAt: { type: Date, default: Date.now }
// });

// module.exports = { OrdersSchema };
