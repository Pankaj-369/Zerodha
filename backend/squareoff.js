const cron = require("node-cron");
const { PositionsModel } = require("./model/PositionsModel");
const { HoldingsModel } = require("./model/HoldingsModel");
const { UsersModel } = require("./model/UsersModel");
const { fetchQuote, mapFinnhubQuote } = require("./utils/finnhubClient");
const {
  mapToUsSymbol,
  mapProductToUs,
  getSymbolLookupCandidates,
} = require("./utils/symbolMapper");

cron.schedule(
  "0 16 * * 1-5", // 4:00 PM US/Eastern
  async () => {
    console.log("Starting auto square-off...");

    try {
      const allPositions = await PositionsModel.find();

      for (const pos of allPositions) {
        const user = await UsersModel.findById(pos.userId);
        if (!user) continue;
        const mappedSymbol = mapToUsSymbol(pos.name);
        const normalizedProduct = mapProductToUs(pos.product);

        let LTP;
        try {
          const quote = await fetchQuote(mappedSymbol);
          const mapped = mapFinnhubQuote(quote);
          LTP = mapped.currentPrice;
          if (!LTP) throw new Error("No LTP found");
        } catch (e) {
          console.error(`Failed to get price for ${mappedSymbol}:`, e.message);
          continue;
        }

        const buyPrice = pos.price;
        const qty = pos.qty;
        const sellAmount = qty * LTP;
        const cost = qty * buyPrice;

        if (normalizedProduct === "DAY") {
          // Day Order positions are auto squared-off.
          user.availableMargin += sellAmount;
          user.usedMargin -= cost;
          if (user.usedMargin < 0) user.usedMargin = 0;
          await user.save();

          await PositionsModel.findByIdAndDelete(pos._id);
          console.log(`Day Order squared off: ${mappedSymbol}, qty: ${qty}`);
        } else if (normalizedProduct === "GTC") {
          // GTC positions are moved to holdings.
          const symbolCandidates = getSymbolLookupCandidates(mappedSymbol);
          const existingHolding = await HoldingsModel.findOne({
            userId: pos.userId,
            symbol: { $in: symbolCandidates },
          });

          if (existingHolding) {
            const totalQty = existingHolding.qty + qty;
            const totalCost =
              existingHolding.avgBuyPrice * existingHolding.qty + buyPrice * qty;
            const avgBuyPrice = totalCost / totalQty;

            existingHolding.qty = totalQty;
            existingHolding.avgBuyPrice = avgBuyPrice;
            existingHolding.symbol = mappedSymbol;
            await existingHolding.save();

            console.log(
              `Updated holding: ${mappedSymbol}, qty: ${totalQty}, avg: ${avgBuyPrice}`
            );
          } else {
            await HoldingsModel.create({
              userId: pos.userId,
              symbol: mappedSymbol,
              qty,
              avgBuyPrice: buyPrice,
            });

            console.log(`New holding created: ${mappedSymbol}, qty: ${qty}`);
          }

          await PositionsModel.findByIdAndDelete(pos._id);
          console.log(`GTC position moved to holdings: ${mappedSymbol}, qty: ${qty}`);
        }
      }

      console.log("Auto square-off process completed.");
    } catch (err) {
      console.error("Auto square-off error:", err.message);
    }
  },
  {
    timezone: "America/New_York",
  }
);
