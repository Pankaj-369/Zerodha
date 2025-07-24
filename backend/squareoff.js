const cron = require("node-cron");
const { PositionsModel } = require("./model/PositionsModel");
const { HoldingsModel } = require("./model/HoldingsModel");
const { UsersModel } = require("./model/UsersModel");
const yahooFinance = require("yahoo-finance2").default;

cron.schedule(
  "20 15 * * 1-5", // 2:00 PM IST
  async () => {
    console.log("🟡 Starting auto square-off...");

    try {
      const allPositions = await PositionsModel.find();

      for (const pos of allPositions) {
        const user = await UsersModel.findById(pos.userId);
        if (!user) continue;

        let LTP;
        try {
          const quote = await yahooFinance.quote(pos.name);
          LTP = quote.regularMarketPrice;
          if (!LTP) throw new Error("No LTP found");
        } catch (e) {
          console.error(`❌ Failed to get price for ${pos.name}:`, e.message);
          continue;
        }

        const buyPrice = pos.price;
        const qty = pos.qty;
        const sellAmount = qty * LTP;
        const cost = qty * buyPrice;

        if (pos.product === "MIS") {
          // 🔴 Square off intraday MIS
          user.availableMargin += sellAmount;
          user.usedMargin -= cost;
          if (user.usedMargin < 0) user.usedMargin = 0;
          await user.save();

          await PositionsModel.findByIdAndDelete(pos._id);
          console.log(`✅ MIS squared off: ${pos.name}, qty: ${qty}`);
        } else if (pos.product === "CNC") {
          // 🟢 Delivery-based: move to Holdings
          const existingHolding = await HoldingsModel.findOne({
            userId: pos.userId,
            symbol: pos.name,
          });

          if (existingHolding) {
            const totalQty = existingHolding.qty + qty;
            const totalCost =
              existingHolding.avgBuyprice * existingHolding.qty + buyPrice * qty;
            const avgBuyPrice = totalCost / totalQty;

            existingHolding.qty = totalQty;
            existingHolding.avgBuyprice = avgBuyPrice;
            await existingHolding.save();

            console.log(
              `✅ Updated holding: ${pos.name}, qty: ${totalQty}, avg: ${avgBuyPrice}`
            );
          } else {
            await HoldingsModel.create({
              userId: pos.userId,
              symbol: pos.name,
              qty,
              avgBuyPrice: buyPrice,
            });

            console.log(`✅ New holding created: ${pos.name}, qty: ${qty}`);
          }

          await PositionsModel.findByIdAndDelete(pos._id);
          console.log(`✅ CNC delivery moved to holdings: ${pos.name}, qty: ${qty}`);
        }
      }

      console.log("✅ Auto square-off process completed.");
    } catch (err) {
      console.error("❌ Auto square-off error:", err.message);
    }
  },
  {
    timezone: "Asia/Kolkata",
  }
);
