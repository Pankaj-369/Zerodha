const axios = require("axios");

const FINNHUB_BASE_URL = "https://finnhub.io/api/v1";

function getApiKey() {
  return process.env.FINNHUB_API_KEY;
}

function ensureApiKey() {
  if (!getApiKey()) {
    throw new Error("FINNHUB_API_KEY is not configured");
  }
}

function isFiniteNumber(value) {
  return Number.isFinite(Number(value));
}

function toNumberOrZero(value) {
  return isFiniteNumber(value) ? Number(value) : 0;
}

// Finnhub Quote API mapping:
// c -> current, o -> open, h -> high, l -> low, pc -> previous close.
function mapFinnhubQuote(rawQuote = {}) {
  const currentPrice = toNumberOrZero(rawQuote.c);
  const open = toNumberOrZero(rawQuote.o);
  const high = toNumberOrZero(rawQuote.h);
  const low = toNumberOrZero(rawQuote.l);
  const previousClose = toNumberOrZero(rawQuote.pc);
  const change = currentPrice - previousClose;
  const percent = previousClose ? (change / previousClose) * 100 : 0;

  return {
    currentPrice,
    open,
    high,
    low,
    previousClose,
    change,
    percent,
  };
}

async function fetchQuote(symbol) {
  ensureApiKey();
  const response = await axios.get(`${FINNHUB_BASE_URL}/quote`, {
    params: {
      symbol,
      token: getApiKey(),
    },
    timeout: 8000,
  });

  return response.data || {};
}

async function searchSymbols(query) {
  ensureApiKey();
  const response = await axios.get(`${FINNHUB_BASE_URL}/search`, {
    params: {
      q: query,
      token: getApiKey(),
    },
    timeout: 8000,
  });

  return response.data || {};
}

async function fetchCandles({ symbol, resolution, from, to }) {
  ensureApiKey();
  const response = await axios.get(`${FINNHUB_BASE_URL}/stock/candle`, {
    params: {
      symbol,
      resolution,
      from,
      to,
      token: getApiKey(),
    },
    timeout: 8000,
  });

  return response.data || {};
}

module.exports = {
  fetchQuote,
  mapFinnhubQuote,
  searchSymbols,
  fetchCandles,
};
