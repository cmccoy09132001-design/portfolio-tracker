import { useState, useEffect, useRef } from 'react'
import PieChart from './PieChart'

const COLORS = [
  '#5B8FD4',
  '#5FB890',
  '#6B9FD4',
  '#C97BB2',
  '#E0716A',
  '#5ECEC8',
  '#E89B4B',
  '#A8D96B',
  '#D4A06B',
  '#8B7FD4',
]

// Counts a number up from 0 to `target` over `duration` ms
function useCountUp(target, duration = 800) {
  const [display, setDisplay] = useState(0)
  const prevTarget = useRef(null)

  useEffect(() => {
    if (target === null || target === undefined) return
    if (prevTarget.current === target) return
    prevTarget.current = target

    const start = Date.now()
    const from = 0
    const to = target

    function tick() {
      const elapsed = Date.now() - start
      const progress = Math.min(elapsed / duration, 1)
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(from + (to - from) * eased)
      if (progress < 1) requestAnimationFrame(tick)
    }

    requestAnimationFrame(tick)
  }, [target, duration])

  return display
}

// Single row component so each can independently track its flash state
function HoldingRow({ h, index, prices, onDeleteHolding }) {
  const quote = prices[h.ticker]
  const currentPrice = quote ? quote.current : null
  const previousClose = quote ? quote.previousClose : null
  const value = currentPrice ? h.shares * currentPrice : null
  const costBasis = h.shares * h.avgCost
  const gainDollar = value !== null ? value - costBasis : null
  const gainPct = gainDollar !== null ? (gainDollar / costBasis) * 100 : null
  const dayGain = currentPrice && previousClose ? h.shares * (currentPrice - previousClose) : null
  const dayGainPct = currentPrice && previousClose ? ((currentPrice - previousClose) / previousClose) * 100 : null
  const color = COLORS[index % COLORS.length]

  // Track previous price to detect changes for row flash
  const prevPrice = useRef(null)
  const [flashing, setFlashing] = useState(false)

  useEffect(() => {
    if (currentPrice === null) return
    if (prevPrice.current !== null && prevPrice.current !== currentPrice) {
      setFlashing(true)
      setTimeout(() => setFlashing(false), 800)
    }
    prevPrice.current = currentPrice
  }, [currentPrice])

  // Count-up animations for key numbers
  const animatedValue = useCountUp(value)
  const animatedGainDollar = useCountUp(gainDollar)
  const animatedDayGain = useCountUp(dayGain)

  return (
    <tr className={flashing ? 'row-flash' : ''}>
      <td>
        <span
          className="ticker-badge"
          style={{ background: `${color}22`, color: color, borderColor: `${color}55` }}
        >
          {h.ticker}
        </span>
      </td>
      <td>{h.shares}</td>
      <td>${h.avgCost.toFixed(2)}</td>
      <td>{currentPrice ? `$${currentPrice.toFixed(2)}` : '—'}</td>
      <td>{value ? `$${animatedValue.toFixed(2)}` : '—'}</td>
      <td className={dayGain >= 0 ? 'gain' : 'loss'}>
        {dayGain !== null
          ? `${dayGain >= 0 ? '+' : ''}$${animatedDayGain.toFixed(2)} (${dayGainPct >= 0 ? '+' : ''}${dayGainPct.toFixed(1)}%)`
          : '—'}
      </td>
      <td className={gainDollar >= 0 ? 'gain' : 'loss'}>
        {gainDollar !== null
          ? `${gainDollar >= 0 ? '+' : ''}$${animatedGainDollar.toFixed(2)}`
          : '—'}
      </td>
      <td className={gainPct >= 0 ? 'gain' : 'loss'}>
        {gainPct !== null ? `${gainPct >= 0 ? '+' : ''}${gainPct.toFixed(1)}%` : '—'}
      </td>
      <td>
        <button
          className="icon-btn-x"
          onClick={() => onDeleteHolding(h.ticker)}
          aria-label={`Delete ${h.ticker}`}
        >
          ×
        </button>
      </td>
    </tr>
  )
}

function Holdings({ holdings, prices, onDeleteHolding }) {
  if (holdings.length === 0) {
    return <p className="empty">No transactions yet.</p>
  }

  let totalValue = 0
  let totalCost = 0
  let totalDayGain = 0

  // Pre-calculate totals for summary (can't use animated values here since
  // those live inside HoldingRow — we use real values for the summary)
  holdings.forEach((h) => {
    const quote = prices[h.ticker]
    const currentPrice = quote ? quote.current : null
    const previousClose = quote ? quote.previousClose : null
    const value = currentPrice ? h.shares * currentPrice : null
    const costBasis = h.shares * h.avgCost
    const dayGain = currentPrice && previousClose ? h.shares * (currentPrice - previousClose) : null

    if (value) totalValue += value
    if (dayGain) totalDayGain += dayGain
    totalCost += costBasis
  })

  const animatedTotalValue = useCountUp(totalValue)
  const animatedTotalDayGain = useCountUp(totalDayGain)
  const animatedTotalGain = useCountUp(totalValue - totalCost)

  return (
    <div>
      <h2>Holdings</h2>
      <div className="holdings-wrap">
        <table>
          <thead>
            <tr>
              <th>Ticker</th>
              <th>Shares</th>
              <th>Avg cost</th>
              <th>Current price</th>
              <th>Value</th>
              <th>Day</th>
              <th>Gain/loss</th>
              <th>Return</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {holdings.map((h, index) => (
              <HoldingRow
                key={h.ticker}
                h={h}
                index={index}
                prices={prices}
                onDeleteHolding={onDeleteHolding}
              />
            ))}
          </tbody>
        </table>

        <PieChart holdings={holdings} prices={prices} />
      </div>

      <div className="summary">
        <div className="summary-item">
          <p className="label">Today's gain/loss</p>
          <p className={`value ${totalDayGain >= 0 ? 'gain' : 'loss'}`}>
            {totalDayGain !== 0
              ? `${totalDayGain >= 0 ? '+' : ''}$${animatedTotalDayGain.toFixed(2)}`
              : '—'}
          </p>
        </div>
        <div className="summary-item">
          <p className="label">Total invested</p>
          <p className="value">${totalCost.toFixed(2)}</p>
        </div>
        <div className="summary-item">
          <p className="label">Total value</p>
          <p className="value">${animatedTotalValue.toFixed(2)}</p>
        </div>
        <div className="summary-item">
          <p className="label">Total gain/loss</p>
          <p className={`value ${totalValue - totalCost >= 0 ? 'gain' : 'loss'}`}>
            {totalValue - totalCost >= 0 ? '+' : ''}${animatedTotalGain.toFixed(2)}
          </p>
        </div>
      </div>
    </div>
  )
}

export default Holdings