import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { API_URL } from '../config'
import { card } from '../ui'
import { currencySymbol } from '../utils'

function Change({ v }) {
  if (v == null) return <span style={{ color: '#888' }}>—</span>
  return (
    <span style={{ color: v >= 0 ? '#00c853' : '#ff5252' }}>
      {v >= 0 ? '▲' : '▼'} {Math.abs(v).toFixed(2)}%
    </span>
  )
}

function Table({ title, rows }) {
  return (
    <div style={card}>
      <h3 style={{ margin: '0 0 12px', fontSize: '16px' }}>{title}</h3>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
          <tbody>
            {rows.map((r) => (
              <tr key={r.symbol} style={{ borderTop: '1px solid #2a2a40' }}>
                <td style={{ padding: '10px 6px' }}>
                  <Link to={`/stock/${r.symbol}`} style={{ color: '#4da3ff', textDecoration: 'none', fontWeight: 600 }}>
                    {r.symbol}
                  </Link>
                </td>
                <td style={{ padding: '10px 6px', textAlign: 'right' }}>
                  {r.price == null ? '—' : `${currencySymbol(r.symbol)}${r.price.toLocaleString()}`}
                </td>
                <td style={{ padding: '10px 6px', textAlign: 'right' }}>
                  <Change v={r.change_pct} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function Markets() {
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    axios
      .get(`${API_URL}/market`)
      .then((r) => {
        if (cancelled) return
        if (r.data.error) setError(r.data.error)
        else setData(r.data)
      })
      .catch(() => !cancelled && setError('Could not load market data.'))
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div>
      <h1 style={{ fontSize: '28px', margin: '0 0 20px' }}>Markets</h1>
      {error && <div style={{ ...card, color: '#ff5252' }}>{error}</div>}
      {!data && !error && <div style={{ ...card, color: '#888' }}>Loading markets…</div>}
      {data && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '20px' }}>
            {data.indices.map((i) => (
              <div key={i.symbol} style={{ background: '#1a1a2e', border: '1px solid #333', borderRadius: '12px', padding: '16px' }}>
                <p style={{ color: '#888', fontSize: '13px', margin: '0 0 6px' }}>{i.name}</p>
                <p style={{ fontSize: '20px', fontWeight: 600, margin: '0 0 4px' }}>
                  {i.price == null ? '—' : i.price.toLocaleString()}
                </p>
                <Change v={i.change_pct} />
              </div>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
            <Table title="🇺🇸 US stocks" rows={data.us} />
            <Table title="🇮🇳 Indian stocks" rows={data.india} />
          </div>
        </>
      )}
    </div>
  )
}

export default Markets