const { model } = require("mongoose");

const { WatchListSchema } = require("../schemas/WatchListSchema");

const WatchListModel =new model("Watchlist", WatchListSchema);

module.exports = { WatchListModel };

