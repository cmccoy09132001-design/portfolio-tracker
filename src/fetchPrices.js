const API_KEY = 'd92m6ghr01qpou36t2r0d92m6ghr01qpou36t2rg'

export async function fetchPrices(tickers) {
  const prices = {}

  for (const ticker of tickers) {
    try {
      // Current price
      const quoteUrl = `https://finnhub.io/api/v1/quote?symbol=${ticker}&token=${API_KEY}`
      const response = await fetch(quoteUrl, { cache: 'no-store' })
      const data = await response.json()

      // Finnhub returns:
      // c = current price
      // pc = previous close
      prices[ticker] = {
        current: data.c,
        previousClose: data.pc,
      }
    } catch (error) {
      console.error(`Failed to fetch price for ${ticker}:`, error)
      prices[ticker] = null
    }
  }

  return prices
}