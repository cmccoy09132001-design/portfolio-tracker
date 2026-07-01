import { useState, useEffect } from 'react'
import AddTransaction from './AddTransaction'
import Holdings from './Holdings'
import { calculateHoldings } from './calculateHoldings'
import { fetchPrices } from './fetchPrices'

const FINNHUB_API_KEY = 'd92m6ghr01qpou36t2r0d92m6ghr01qpou36t2rg'

async function fetchMarketStatus() {
  try {
    const res = await fetch(
      `https://finnhub.io/api/v1/stock/market-status?exchange=US&token=${FINNHUB_API_KEY}`,
      { cache: 'no-store' }
    )
    const data = await res.json()
    return data.isOpen
  } catch {
    return null
  }
}

function App() {
  const [transactions, setTransactions] = useState(() => {
    const saved = localStorage.getItem('transactions')
    return saved ? JSON.parse(saved) : []
  })
  const [prices, setPrices] = useState({})
  const [loading, setLoading] = useState(false)
  const [marketOpen, setMarketOpen] = useState(null)

  function handleAddTransaction(transaction) {
    setTransactions([...transactions, transaction])
  }

  function handleDeleteHolding(ticker) {
    const confirmed = window.confirm(`Delete all ${ticker} transactions?`)
    if (!confirmed) return
    setTransactions(transactions.filter((t) => t.ticker !== ticker))
  }

  const holdings = calculateHoldings(transactions)

  async function refreshPrices() {
    if (holdings.length === 0) return
    setLoading(true)
    const tickers = holdings.map((h) => h.ticker)
    const [newPrices, isOpen] = await Promise.all([
      fetchPrices(tickers),
      fetchMarketStatus(),
    ])
    setPrices(newPrices)
    setMarketOpen(isOpen)
    setLoading(false)
  }

  useEffect(() => {
    fetchMarketStatus().then(setMarketOpen)
  }, [])

  useEffect(() => {
    refreshPrices()
  }, [transactions])

  useEffect(() => {
    localStorage.setItem('transactions', JSON.stringify(transactions))
  }, [transactions])

  return (
    <div>
      <div className="header-row">
        <h1>My Portfolio</h1>
        {marketOpen !== null && (
          <span className={`market-badge ${marketOpen ? 'open' : 'closed'}`}>
            <span className="market-dot" />
            {marketOpen ? 'Market open' : 'Market closed'}
          </span>
        )}
      </div>
      <AddTransaction onAdd={handleAddTransaction} />
      <div className="status-row">
        {loading && <p>Fetching prices...</p>}
        <button className="secondary" onClick={refreshPrices}>Refresh prices</button>
      </div>
      <Holdings holdings={holdings} prices={prices} onDeleteHolding={handleDeleteHolding} />
    </div>
  )
}

export default App