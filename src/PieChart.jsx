import { useEffect, useRef } from 'react'

// A set of distinct colors for up to 10 holdings
const COLORS = [
  '#5B8FD4', // slate blue (accent)
  '#5FB890', // green
  '#6B9FD4', // blue
  '#C97BB2', // purple
  '#5ECEC8', // teal
  '#A8D96B', // lime
  '#8B7FD4', // indigo
]

function PieChart({ holdings, prices }) {
  const canvasRef = useRef(null)
  const chartRef = useRef(null)

  useEffect(() => {
    if (!canvasRef.current) return

    // Build data — only include holdings where we have a current price
    const slices = holdings
      .map((h) => {
        const quote = prices[h.ticker]
        const value = quote ? h.shares * quote.current : null
        return { ticker: h.ticker, value }
      })
      .filter((s) => s.value !== null && s.value > 0)

    if (slices.length === 0) return

    // Destroy previous chart instance before creating a new one,
    // otherwise Chart.js complains about a canvas already in use
    if (chartRef.current) {
      chartRef.current.destroy()
    }

    chartRef.current = new window.Chart(canvasRef.current, {
      type: 'doughnut',
      data: {
        labels: slices.map((s) => s.ticker),
        datasets: [
          {
            data: slices.map((s) => s.value.toFixed(2)),
            backgroundColor: COLORS.slice(0, slices.length),
            borderColor: '#14181A',  // matches your --bg color
            borderWidth: 3,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: '#9CA5AB',  // --text-secondary
              font: { family: 'Inter', size: 12 },
              padding: 16,
              boxWidth: 12,
              boxHeight: 12,
            },
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const total = context.dataset.data.reduce((a, b) => a + parseFloat(b), 0)
                const value = parseFloat(context.raw)
                const pct = ((value / total) * 100).toFixed(1)
                return ` $${value.toFixed(2)} (${pct}%)`
              },
            },
          },
        },
      },
    })

    // Cleanup on unmount
    return () => {
      if (chartRef.current) {
        chartRef.current.destroy()
      }
    }
  }, [holdings, prices])

  return (
    <div className="pie-wrap">
      <p className="pie-title">Allocation</p>
      <canvas ref={canvasRef} />
    </div>
  )
}

export default PieChart