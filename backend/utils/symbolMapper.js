const LEGACY_TO_US_SYMBOL = {
  "RELIANCE.NS": "AAPL",
  RELIANCE: "AAPL",
  "TCS.NS": "MSFT",
  TCS: "MSFT",
  "INFY.NS": "NVDA",
  INFY: "NVDA",
  "HDFCBANK.NS": "JPM",
  HDFCBANK: "JPM",
  "SBIN.NS": "BAC",
  SBIN: "BAC",
  "ITC.NS": "KO",
  ITC: "KO",
  "AXISBANK.NS": "GS",
  AXISBANK: "GS",
  "ICICIBANK.NS": "V",
  ICICIBANK: "V",
  "HINDUNILVR.NS": "PG",
  HINDUNILVR: "PG",
  "KOTAKBANK.NS": "C",
  KOTAKBANK: "C",
};

const US_SYMBOL_TO_COMPANY = {
  AAPL: "Apple Inc.",
  MSFT: "Microsoft Corp.",
  NVDA: "NVIDIA Corp.",
  JPM: "JPMorgan Chase & Co.",
  BAC: "Bank of America Corp.",
  KO: "Coca-Cola Co.",
  GS: "Goldman Sachs Group Inc.",
  V: "Visa Inc.",
  PG: "Procter & Gamble Co.",
  C: "Citigroup Inc.",
};

const US_TO_LEGACY_SYMBOL = Object.entries(LEGACY_TO_US_SYMBOL).reduce(
  (acc, [legacy, us]) => {
    if (!acc[us]) acc[us] = legacy;
    return acc;
  },
  {}
);

function normalizeSymbol(symbol) {
  return String(symbol || "").trim().toUpperCase();
}

// Preferred runtime migration path: map old Indian symbols to US symbols before API calls.
function mapToUsSymbol(symbol) {
  const normalized = normalizeSymbol(symbol);
  if (!normalized) return "";
  return LEGACY_TO_US_SYMBOL[normalized] || normalized;
}

function getSymbolLookupCandidates(symbol) {
  const normalized = normalizeSymbol(symbol);
  const usSymbol = mapToUsSymbol(symbol);
  const legacy = US_TO_LEGACY_SYMBOL[usSymbol];
  return Array.from(new Set([normalized, usSymbol, legacy].filter(Boolean)));
}

function getCompanyName(symbol, fallback = "") {
  const usSymbol = mapToUsSymbol(symbol);
  return US_SYMBOL_TO_COMPANY[usSymbol] || fallback || usSymbol;
}

function mapProductToUs(product) {
  const normalized = String(product || "").trim().toUpperCase();

  if (normalized === "MIS" || normalized === "DAY") return "DAY";
  if (normalized === "CNC" || normalized === "NRML" || normalized === "GTC") {
    return "GTC";
  }

  return normalized || "GTC";
}

function getProductLabel(product) {
  const normalized = mapProductToUs(product);
  if (normalized === "DAY") return "Day Order";
  if (normalized === "GTC") return "GTC";
  return normalized;
}

module.exports = {
  mapToUsSymbol,
  getSymbolLookupCandidates,
  getCompanyName,
  mapProductToUs,
  getProductLabel,
};
