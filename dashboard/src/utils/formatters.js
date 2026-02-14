const usdFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export const formatUSD = (value = 0) => {
  const numeric = Number(value);
  return usdFormatter.format(Number.isFinite(numeric) ? numeric : 0);
};
