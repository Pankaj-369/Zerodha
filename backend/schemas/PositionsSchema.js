const mongoose = require("mongoose");


const PositionsSchema = new mongoose.Schema({
  product: String, 
  name: String, 
  qty: Number, 
  price: Number, 
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});

module.exports = {PositionsSchema}

