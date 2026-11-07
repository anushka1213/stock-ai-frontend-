import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { card, textInput, primaryBtn } from '../ui'

const CHIPS = ['AAPL', 'TSLA', 'NVDA', 'MSFT', 'RELIANCE.NS', 'TCS.NS', 'INFY.NS']

const FEATURES = [
  { icon: '📊', title: 'Live price & indicators', text: 'Price, 30-day chart, RSI, SMA20 and volume for any ticker.' },
  { icon: '🏢', title: 'Fundamentals', text: 'Ratios, pros and cons, profit and loss, balance sheet and cash flow.' },
  { icon: '🤖', title: 'AI analyst', text: 'Ask questions about a stock and get a short, data-aware answer.' },
]

function Home() {
  const [ticker, setTicker] = useState('')
  const navigate = useNavigate()

  const go = (t) => {
    const v = (t || ticker).trim().toUpperCase()
    if (v) navigate(`/stock/Rs
        {v}`)
  }

  return (
    <div>
      <div style={{ textAlign: 'center', padding: '40px 0 30px' }}>
        <h1 style={{ fontSize: '42px', margin: '0 0 10px' }}>Understand any stock in minutes</h1>
        <p style={{ color: '#888', fontSize: '18px', margin: '0 0 30px' }}>
          Prices, fundamentals and an AI analyst for US and Indian markets.
        </p>
        <div style={{ display: 'flex', gap: '10px', maxWidth: '560px', margin: '0 auto 18px' }}>
          <input
            value={ticker}
            onChange={(e) => setTicker(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === 'Enter' && go()}
            placeholder="Enter ticker e.g. AAPL, RELIANCE.NS"
            style={{ ...textInput, flex: 1 }}
          />
          <button onClick={() => go()} style={primaryBtn}>Search</button>
        </div>
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
          {CHIPS.map((c) => (
            <button
              key={c}
              onClick={() => go(c)}
              style={{ padding: '6px 12px', fontSize: '13px', borderRadius: '20px', border: '1px solid #333', background: '#12122a', color: '#ccc', cursor: 'pointer' }}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginTop: '20px' }}>
        {FEATURES.map((f) => (
          <div key={f.title} style={{ ...card, marginBottom: 0 }}>
            <div style={{ fontSize: '28px', marginBottom: '8px' }}>{f.icon}</div>
            <h3 style={{ margin: '0 0 6px', fontSize: '16px' }}>{f.title}</h3>
            <p style={{ margin: 0, color: '#999', fontSize: '14px', lineHeight: 1.6 }}>{f.text}</p>
          </div>
        ))}
      </div>

      <div style={{ textAlign: 'center', marginTop: '30px' }}>
        <Link to="/markets" style={{ color: '#4da3ff', textDecoration: 'none' }}>See what the markets are doing →</Link>
      </div>
    </div>
  )
}

export default Home