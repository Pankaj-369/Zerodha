const { fetchQuote, mapFinnhubQuote } = require("./utils/finnhubClient");


const test = async () => {
  const quote = await fetchQuote("AAPL");
  console.log(mapFinnhubQuote(quote));
};

test();
