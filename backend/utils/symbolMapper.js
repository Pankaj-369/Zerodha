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
  HDB: "JPM",
  "HINDUNILVR.NS": "PG",
  HINDUNILVR: "PG",
  "KOTAKBANK.NS": "C",
  KOTAKBANK: "C",
  LT: "CAT",
  "LT.NS": "CAT",
  MARUTI: "TM",
  "MARUTI.NS": "TM",
  ZEEL: "DIS",
  "ZEEL.NS": "DIS",
  IRFC: "BAC",
  "IRFC.NS": "BAC",
  "YHA.F": "SPY",
  WIPRO: "ORCL",
  "WIPRO.NS": "ORCL",
  ONGC: "XOM",
  "ONGC.NS": "XOM",
  KPITTECH: "AMD",
  "KPITTECH.NS": "AMD",
  QUICKHEAL: "CRWD",
  "QUICKHEAL.NS": "CRWD",
  "M&M": "TSLA",
  "M&M.NS": "TSLA",
  HUL: "PG",
  "HUL.NS": "PG",
  BHARTIARTL: "VZ",
  "BHARTIARTL.NS": "VZ",
  TATAPOWER: "NEE",
  "TATAPOWER.NS": "NEE",
  SGBMAY29: "GLD",
  "EVEREADY.NS": "WMT",
  EVEREADY: "WMT",
  JUBLFOOD: "MCD",
  "JUBLFOOD.NS": "MCD",
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
  CAT: "Caterpillar Inc.",
  TM: "Toyota Motor Corp.",
  DIS: "Walt Disney Co.",
  SPY: "SPDR S&P 500 ETF Trust",
  ORCL: "Oracle Corp.",
  XOM: "Exxon Mobil Corp.",
  AMD: "Advanced Micro Devices Inc.",
  CRWD: "CrowdStrike Holdings Inc.",
  TSLA: "Tesla Inc.",
  VZ: "Verizon Communications Inc.",
  NEE: "NextEra Energy Inc.",
  GLD: "SPDR Gold Shares",
  WMT: "Walmart Inc.",
  MCD: "McDonald's Corp.",
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
  if (LEGACY_TO_US_SYMBOL[normalized]) return LEGACY_TO_US_SYMBOL[normalized];

  // Handle generic exchange suffixes when explicit key is not present.
  if (normalized.endsWith(".NS") || normalized.endsWith(".BO") || normalized.endsWith(".F")) {
    const base = normalized.split(".")[0];
    return LEGACY_TO_US_SYMBOL[base] || base;
  }

  return normalized;
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
