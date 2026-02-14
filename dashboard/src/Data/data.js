export const watchlist = [
  { name: "AAPL", price: 189.32, percent: "-0.88%", isDown: true },
  { name: "MSFT", price: 421.1, percent: "0.42%", isDown: false },
  { name: "NVDA", price: 812.45, percent: "1.91%", isDown: false },
  { name: "JPM", price: 194.62, percent: "-0.25%", isDown: true },
  { name: "BAC", price: 35.27, percent: "0.51%", isDown: false },
  { name: "KO", price: 61.54, percent: "0.11%", isDown: false },
  { name: "GS", price: 389.8, percent: "-0.39%", isDown: true },
  { name: "V", price: 273.65, percent: "0.64%", isDown: false },
  { name: "PG", price: 156.93, percent: "-0.12%", isDown: true },
];

export const holdings = [
  { name: "AAPL", qty: 2, avg: 172.1, price: 189.32, net: "+10.01%", day: "-0.88%" },
  { name: "MSFT", qty: 1, avg: 398.4, price: 421.1, net: "+5.70%", day: "+0.42%" },
  { name: "NVDA", qty: 1, avg: 710.25, price: 812.45, net: "+14.39%", day: "+1.91%" },
  { name: "JPM", qty: 3, avg: 182.3, price: 194.62, net: "+6.76%", day: "-0.25%" },
  { name: "BAC", qty: 6, avg: 32.8, price: 35.27, net: "+7.53%", day: "+0.51%" },
  { name: "KO", qty: 4, avg: 58.1, price: 61.54, net: "+5.92%", day: "+0.11%" },
  { name: "GS", qty: 1, avg: 402.5, price: 389.8, net: "-3.15%", day: "-0.39%", isLoss: true },
  { name: "V", qty: 2, avg: 249.2, price: 273.65, net: "+9.81%", day: "+0.64%" },
];

export const positions = [
  {
    product: "GTC",
    name: "AAPL",
    qty: 1,
    avg: 186.45,
    price: 189.32,
    net: "+1.53%",
    day: "-0.88%",
    isLoss: true,
  },
  {
    product: "DAY",
    name: "NVDA",
    qty: 1,
    avg: 804.2,
    price: 812.45,
    net: "+1.03%",
    day: "+1.91%",
    isLoss: false,
  },
];
