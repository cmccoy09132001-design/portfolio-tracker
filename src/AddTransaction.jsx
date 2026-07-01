import { useState } from 'react'

function AddTransaction({ onAdd }) {
  const [ticker, setTicker] = useState('')
  const [shares, setShares] = useState('')
  const [price, setPrice] = useState('')
  const [date, setDate] = useState('')

  function handleSubmit(e) {
    e.preventDefault()

    if (!ticker || !shares || !price || !date) {
      alert('Please fill in all fields')
      return
    }

    onAdd({
      id: Date.now(),
      ticker: ticker.toUpperCase(),
      shares: parseFloat(shares),
      price: parseFloat(price),
      date: date,
    })

    setTicker('')
    setShares('')
    setPrice('')
    setDate('')
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2 className="form-title">Log a purchase</h2>
      <input
        type="text"
        placeholder="Ticker"
        value={ticker}
        onChange={(e) => setTicker(e.target.value)}
      />
      <input
        type="number"
        placeholder="Shares"
        value={shares}
        onChange={(e) => setShares(e.target.value)}
      />
      <input
        type="number"
        placeholder="Price Per Share"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
      />
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        data-has-value={date ? 'true' : 'false'}
      />
      <button type="submit">Add transaction</button>
    </form>
  )
}

export default AddTransaction