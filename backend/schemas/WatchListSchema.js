const mongoose = require("mongoose");


const WatchListSchema = new mongoose.Schema({
  name: String, 
  symbol: String, 
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});

module.exports = {WatchListSchema}
