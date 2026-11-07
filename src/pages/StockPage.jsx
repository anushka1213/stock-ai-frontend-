import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import axios from 'axios'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import Fundamentals from '../Fundamentals'
import { API_URL } from '../config'
import { card, primaryBtn } from '../ui'
import { currencySymbol, getSignal, getWatchlist, toggleWatch } from '../utils'

function StockPage() {
  const { ticker: raw } = useParams()
  const ticker = (raw || '').toUpperCase()

  const [stockData, setStockData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [question, setQuestion] = useState('')
  const [chatHistory, setChatHistory] = useState([])
  const [chatLoading, setChatLoading] = useState(false)
  const [watched, setWatched] = useState(getWatchlist().includes(ticker))

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError('')
    setStockData(null)
    setChatHistory([])
    setWatched(getWatchlist().includes(ticker))
    axios
      .get(`${API_URL}/stock/${ticker}`)
      .then((r) => {
        if (cancelled) return
        if (r.data.error) setError(r.data.error)
        else setStockData(r.data)
      })
      .catch(() => !cancelled && setError('Could not reach backend. Is it running?'))
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [ticker])

  const sendQuestion = async () => {
    if (!question || !stockData) return
    const q = question
    setChatHistory((prev) => [...prev, { role: 'user', text: q }])
    setQuestion('')
    setChatLoading(true)
    try {
      const response = await axios.post(`${API_URL}/chat`, { question: q, stock_context: stockData })
      setChatHistory((prev) => [...prev, { role: 'ai', text: response.data.answer || response.data.error }])
    } catch (e) {
      setChatHistory((prev) => [...prev, { role: 'ai', text: 'Error reaching AI. Try again.' }])
    }
    setChatLoading(false)
  }

  const toggle = () => {
    const next = toggleWatch(ticker)
    setWatched(next.includes(ticker))
  }

  if (loading) return <div style={{ ...card, color: '#888' }}>Loading {ticker}…</div>
  if (error) {
    return (
      <div style={{ ...card, color: '#ff5252' }}>
        {error}
        <div style={{ marginTop: '12px' }}>
          <Link to="/" style={{ color: '#4da3ff', textDecoration: 'none' }}>← Back to home</Link>
        </div>
      </div>
    )
  }
  if (!stockData) return null

  const signal = getSignal(stockData.rsi)
  const sym = currencySymbol(ticker)

  return (
    <div>
      <div style={card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <p style={{ color: '#888', marginBottom: '4px', fontSize: '14px' }}>
              {stockData.ticker}{' '}
              <button
                onClick={toggle}
                title={watched ? 'Remove from watchlist' : 'Add to watchlist'}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '18px', color: watched ? '#ffd740' : '#666' }}
              >
                {watched ? '★' : '☆'}
              </button>
            </p>
            <h1 style={{ fontSize: '52px', margin: 0, fontWeight: 700 }}>{sym}{stockData.price}</h1>
            <p style={{ color: stockData.change_pct >= 0 ? '#00c853' : '#ff5252', fontSize: '20px', margin: '5px 0' }}>
              {stockData.change_pct >= 0 ? '▲' : '▼'} {stockData.change_pct}% today
            </p>
          </div>
          <div style={{ background: signal.color + '22', border: `2px solid ${signal.color}`, borderRadius: '12px', padding: '16px 24px', textAlign: 'center' }}>
            <p style={{ color: '#888', fontSize: '12px', margin: '0 0 4px' }}>TECHNICAL SIGNAL</p>
            <p style={{ color: signal.color, fontSize: '22px', fontWeight: 700, margin: 0 }}>{signal.label}</p>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', marginBottom: '20px' }}>
        {[
          { label: 'RSI (14)', value: stockData.rsi ?? '—' },
          { label: 'SMA 20', value: stockData.sma20 ?? '—' },
          { label: 'Volume', value: `${(stockData.volume / 1000000).toFixed(1)}M` },
        ].map((s) => (
          <div key={s.label} style={{ background: '#1a1a2e', borderRadius: '12px', padding: '16px', border: '1px solid #333' }}>
            <p style={{ color: '#888', fontSize: '13px', margin: '0 0 6px' }}>{s.label}</p>
            <h3 style={{ margin: 0, fontSize: '22px', fontWeight: 600 }}>{s.value}</h3>
          </div>
        ))}
      </div>

      <div style={card}>
        <h3 style={{ margin: '0 0 15px', color: '#ccc', fontSize: '15px' }}>Price history, 30 days</h3>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={stockData.history}>
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#666' }} interval={6} />
            <YAxis domain={['auto', 'auto']} tick={{ fontSize: 11, fill: '#666' }} />
            <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid #333', borderRadius: '8px' }} />
            <Line type="monotone" dataKey="price" stroke="#0070f3" dot={false} strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <Fundamentals ticker={stockData.ticker} />

      <div style={card}>
        <h3 style={{ margin: '0 0 15px', fontSize: '16px' }}>🤖 Ask AI Analyst</h3>
        <div style={{ minHeight: '120px', maxHeight: '300px', overflowY: 'auto', marginBottom: '15px' }}>
          {chatHistory.length === 0 && (
            <p style={{ color: '#555', fontSize: '14px' }}>
              Ask anything about {stockData.ticker}, e.g. "Should I buy?" or "What does RSI mean?"
            </p>
          )}
          {chatHistory.map((msg, i) => (
            <div key={i} style={{ marginBottom: '12px', textAlign: msg.role === 'user' ? 'right' : 'left' }}>
              <span
                style={{
                  display: 'inline-block',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  background: msg.role === 'user' ? '#0070f3' : '#12122a',
                  color: 'white',
                  border: msg.role === 'ai' ? '1px solid #333' : 'none',
                  maxWidth: '80%',
                  fontSize: '14px',
                  lineHeight: 1.6,
                  textAlign: 'left',
                }}
              >
                {msg.text}
              </span>
            </div>
          ))}
          {chatLoading && <p style={{ color: '#555', fontSize: '14px' }}>AI is thinking...</p>}
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <input
            type="text"
            placeholder="Ask about this stock..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendQuestion()}
            style={{ flex: 1, padding: '10px 14px', fontSize: '14px', borderRadius: '8px', border: '1px solid #333', background: '#12122a', color: 'white', outline: 'none' }}
          />
          <button onClick={sendQuestion} style={{ ...primaryBtn, padding: '10px 20px', fontSize: '14px' }}>Ask</button>
        </div>
      </div>
    </div>
  )
}

export default StockPage