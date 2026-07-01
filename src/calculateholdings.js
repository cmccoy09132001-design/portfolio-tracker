export function calculateHoldings(transactions) {
  const holdingsMap = {}

  for (const t of transactions) {
    if (!holdingsMap[t.ticker]) {
      holdingsMap[t.ticker] = {
        ticker: t.ticker,
        totalShares: 0,
        totalCost: 0,
      }
    }

    holdingsMap[t.ticker].totalShares += t.shares
    holdingsMap[t.ticker].totalCost += t.shares * t.price
  }

  return Object.values(holdingsMap).map((h) => ({
    ticker: h.ticker,
    shares: h.totalShares,
    avgCost: h.totalCost / h.totalShares,
  }))
}