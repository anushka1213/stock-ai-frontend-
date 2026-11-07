import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { API_URL } from '../config'
import { card } from '../ui'
import { currencySymbol, getSignal, getWatchlist, toggleWatch } from '../utils'

function Watchlist() {
  const [tickers, setTickers] = useState(getWatchlist())
  const [rows, setRows] = useState({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let cancelled = false
    if (tickers.length === 0) return
    setLoading(true)
    Promise.all(
      tickers.map((t) =>
        axios
          .get(`${API_URL}/stock/${t}`)
          .then((r) => [t, r.data])
          .catch(() => [t, { error: true }])
      )
    ).then((results) => {
      if (cancelled) return
      setRows(Object.fromEntries(results))
      setLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [tickers])

  const remove = (t) => setTickers(toggleWatch(t))

  if (tickers.length === 0) {
    return (
      <div style={{ ...card, textAlign: 'center', padding: '50px 20px' }}>
        <div style={{ fontSize: '36px' }}>⭐</div>
        <h2 style={{ margin: '10px 0 6px' }}>Your watchlist is empty</h2>
        <p style={{ color: '#888', margin: '0 0 18px' }}>Open any stock and tap the star to save it here.</p>
        <Link to="/markets" style={{ color: '#4da3ff', textDecoration: 'none' }}>Browse markets →</Link>
      </div>
    )
  }

  return (
    <div>
      <h1 style={{ fontSize: '28px', margin: '0 0 20px' }}>Watchlist</h1>
      <div style={card}>
        {loading && <p style={{ color: '#888', fontSize: '13px', margin: '0 0 10px' }}>Refreshing prices…</p>}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
            <thead>
              <tr style={{ color: '#888', textAlign: 'right' }}>
                <th style={{ textAlign: 'left', padding: '8px 6px', fontWeight: 400 }}>Ticker</th>
                <th style={{ padding: '8px 6px', fontWeight: 400 }}>Price</th>
                <th style={{ padding: '8px 6px', fontWeight: 400 }}>Change</th>
                <th style={{ padding: '8px 6px', fontWeight: 400 }}>RSI</th>
                <th style={{ padding: '8px 6px', fontWeight: 400 }}>Signal</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {tickers.map((t) => {
                const d = rows[t]
                const ok = d && !d.error
                const sig = ok ? getSignal(d.rsi) : null
                return (
                  <tr key={t} style={{ borderTop: '1px solid #2a2a40', textAlign: 'right' }}>
                    <td style={{ textAlign: 'left', padding: '10px 6px' }}>
                      <Link to={`/stock/${t}`} style={{ color: '#4da3ff', textDecoration: 'none', fontWeight: 600 }}>{t}</Link>
                    </td>
                    <td style={{ padding: '10px 6px' }}>{ok ? `${currencySymbol(t)}${d.price}` : '—'}</td>
                    <td style={{ padding: '10px 6px', color: ok && d.change_pct >= 0 ? '#00c853' : '#ff5252' }}>
                      {ok ? `${d.change_pct >= 0 ? '▲' : '▼'} ${Math.abs(d.change_pct)}%` : '—'}
                    </td>
                    <td style={{ padding: '10px 6px' }}>{ok ? d.rsi ?? '—' : '—'}</td>
                    <td style={{ padding: '10px 6px', color: sig ? sig.color : '#888', fontWeight: 600 }}>{sig ? sig.label : '—'}</td>
                    <td style={{ padding: '10px 6px' }}>
                      <button
                        onClick={() => remove(t)}
                        style={{ background: 'transparent', border: '1px solid #333', color: '#999', borderRadius: '6px', padding: '4px 8px', cursor: 'pointer' }}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default Watchlist