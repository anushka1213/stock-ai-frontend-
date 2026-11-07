// import { useState } from 'react'
// import axios from 'axios'
// import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

// const API_URL = 'http://127.0.0.1:8000'
// function getSignal(rsi, changePct) {
//   if (rsi < 35) return { label: 'STRONG BUY', color: '#00c853' }
//   if (rsi < 45) return { label: 'BUY', color: '#69f0ae' }
//   if (rsi > 65) return { label: 'STRONG SELL', color: '#d50000' }
//   if (rsi > 55) return { label: 'SELL', color: '#ff5252' }
//   return { label: 'HOLD', color: '#ffd740' }
// }

// function App() {
//   const [ticker, setTicker] = useState('')
//   const [stockData, setStockData] = useState(null)
//   const [loading, setLoading] = useState(false)
//   const [error, setError] = useState('')
//   const [question, setQuestion] = useState('')
//   const [chatHistory, setChatHistory] = useState([])
//   const [chatLoading, setChatLoading] = useState(false)

//   const fetchStock = async () => {
//     if (!ticker) return
//     setLoading(true)
//     setError('')
//     setStockData(null)
//     setChatHistory([])
//     try {
//       const response = await axios.get(`${API_URL}/stock/${ticker}`)
//       if (response.data.error) {
//         setError(response.data.error)
//       } else {
//         setStockData(response.data)
//       }
//     } catch (e) {
//       setError('Could not reach backend. Is uvicorn running on port 8000?')
//     }
//     setLoading(false)
//   }

//   const sendQuestion = async () => {
//     if (!question || !stockData) return
//     const userMsg = { role: 'user', text: question }
//     setChatHistory(prev => [...prev, userMsg])
//     setQuestion('')
//     setChatLoading(true)
//     try {
//       const response = await axios.post(`${API_URL}/chat`, {
//         question: question,
//         stock_context: stockData
//       })
//       const aiMsg = { role: 'ai', text: response.data.answer || response.data.error }
//       setChatHistory(prev => [...prev, aiMsg])
//     } catch (e) {
//       setChatHistory(prev => [...prev, { role: 'ai', text: 'Error reaching AI. Try again.' }])
//     }
//     setChatLoading(false)
//   }

//   const signal = stockData ? getSignal(stockData.rsi, stockData.change_pct) : null

//   return (
//     <div style={{ minHeight: '100vh', background: '#0a0a0f', color: '#ffffff', fontFamily: 'sans-serif', padding: '30px' }}>
//       <div style={{ maxWidth: '900px', margin: '0 auto' }}>

//         {/* Header */}
//         <div style={{ marginBottom: '30px' }}>
//           <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#ffffff', margin: 0 }}>📈 Stock AI Dashboard</h1>
//           <p style={{ color: '#888', marginTop: '5px' }}>Real-time stock analysis powered by AI</p>
//         </div>

//         {/* Search Bar */}
//         <div style={{ display: 'flex', gap: '10px', marginBottom: '30px' }}>
//           <input
//             type="text"
//             placeholder="Enter ticker e.g. AAPL, TSLA, NVDA"
//             value={ticker}
//             onChange={(e) => setTicker(e.target.value.toUpperCase())}
//             onKeyDown={(e) => e.key === 'Enter' && fetchStock()}
//             style={{ padding: '12px 16px', fontSize: '16px', flex: 1, borderRadius: '10px', border: '1px solid #333', background: '#1a1a2e', color: 'white', outline: 'none' }}
//           />
//           <button
//             onClick={fetchStock}
//             style={{ padding: '12px 24px', fontSize: '16px', background: '#0070f3', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '600' }}
//           >
//             {loading ? 'Loading...' : 'Search'}
//           </button>
//         </div>

//         {error && (
//           <div style={{ background: '#2d1b1b', color: '#ff5252', padding: '12px', borderRadius: '10px', marginBottom: '20px' }}>
//             {error}
//           </div>
//         )}

//         {stockData && (
//           <div>
//             {/* Price Header */}
//             <div style={{ background: '#1a1a2e', borderRadius: '16px', padding: '24px', marginBottom: '20px', border: '1px solid #333' }}>
//               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
//                 <div>
//                   <p style={{ color: '#888', marginBottom: '4px', fontSize: '14px' }}>{stockData.ticker}</p>
//                   <h1 style={{ fontSize: '52px', margin: '0', fontWeight: '700' }}>${stockData.price}</h1>
//                   <p style={{ color: stockData.change_pct >= 0 ? '#00c853' : '#ff5252', fontSize: '20px', margin: '5px 0' }}>
//                     {stockData.change_pct >= 0 ? '▲' : '▼'} {stockData.change_pct}% today
//                   </p>
//                 </div>
//                 {signal && (
//                   <div style={{ background: signal.color + '22', border: `2px solid ${signal.color}`, borderRadius: '12px', padding: '16px 24px', textAlign: 'center' }}>
//                     <p style={{ color: '#888', fontSize: '12px', margin: '0 0 4px' }}>AI SIGNAL</p>
//                     <p style={{ color: signal.color, fontSize: '22px', fontWeight: '700', margin: 0 }}>{signal.label}</p>
//                   </div>
//                 )}
//               </div>
//             </div>

//             {/* Stat Cards */}
//             <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', marginBottom: '20px' }}>
//               {[
//                 { label: 'RSI (14)', value: stockData.rsi ?? '—' },
//                 { label: 'SMA 20', value: stockData.sma20 ? `$${stockData.sma20}` : '—' },
//                 { label: 'Volume', value: `${(stockData.volume / 1000000).toFixed(1)}M` }
//               ].map((stat, i) => (
//                 <div key={i} style={{ background: '#1a1a2e', borderRadius: '12px', padding: '16px', border: '1px solid #333' }}>
//                   <p style={{ color: '#888', fontSize: '13px', margin: '0 0 6px' }}>{stat.label}</p>
//                   <h3 style={{ margin: 0, fontSize: '22px', fontWeight: '600' }}>{stat.value}</h3>
//                 </div>
//               ))}
//             </div>

//             {/* Price Chart */}
//             <div style={{ background: '#1a1a2e', borderRadius: '16px', padding: '20px', marginBottom: '20px', border: '1px solid #333' }}>
//               <h3 style={{ margin: '0 0 15px', color: '#ccc', fontSize: '15px' }}>Price History — 30 days</h3>
//               <ResponsiveContainer width="100%" height={220}>
//                 <LineChart data={stockData.history}>
//                   <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#666' }} interval={6} />
//                   <YAxis domain={['auto', 'auto']} tick={{ fontSize: 11, fill: '#666' }} />
//                   <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid #333', borderRadius: '8px' }} />
//                   <Line type="monotone" dataKey="price" stroke="#0070f3" dot={false} strokeWidth={2} />
//                 </LineChart>
//               </ResponsiveContainer>
//             </div>

//             {/* AI Chat */}
//             <div style={{ background: '#1a1a2e', borderRadius: '16px', padding: '20px', border: '1px solid #333' }}>
//               <h3 style={{ margin: '0 0 15px', fontSize: '16px' }}>🤖 Ask AI Analyst</h3>

//               <div style={{ minHeight: '120px', maxHeight: '300px', overflowY: 'auto', marginBottom: '15px' }}>
//                 {chatHistory.length === 0 && (
//                   <p style={{ color: '#555', fontSize: '14px' }}>Ask anything about {stockData.ticker} — e.g. "Should I buy?", "What does RSI mean?"</p>
//                 )}
//                 {chatHistory.map((msg, i) => (
//                   <div key={i} style={{ marginBottom: '12px', textAlign: msg.role === 'user' ? 'right' : 'left' }}>
//                     <span style={{
//                       display: 'inline-block',
//                       padding: '10px 14px',
//                       borderRadius: '10px',
//                       background: msg.role === 'user' ? '#0070f3' : '#12122a',
//                       color: 'white',
//                       border: msg.role === 'ai' ? '1px solid #333' : 'none',
//                       maxWidth: '80%',
//                       fontSize: '14px',
//                       lineHeight: '1.6',
//                       textAlign: 'left'
//                     }}>
//                       {msg.text}
//                     </span>
//                   </div>
//                 ))}
//                 {chatLoading && <p style={{ color: '#555', fontSize: '14px' }}>AI is thinking...</p>}
//               </div>

//               <div style={{ display: 'flex', gap: '10px' }}>
//                 <input
//                   type="text"
//                   placeholder="Ask about this stock..."
//                   value={question}
//                   onChange={(e) => setQuestion(e.target.value)}
//                   onKeyDown={(e) => e.key === 'Enter' && sendQuestion()}
//                   style={{ flex: 1, padding: '10px 14px', fontSize: '14px', borderRadius: '8px', border: '1px solid #333', background: '#12122a', color: 'white', outline: 'none' }}
//                 />
//                 <button
//                   onClick={sendQuestion}
//                   style={{ padding: '10px 20px', fontSize: '14px', background: '#0070f3', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}
//                 >
//                   Ask
//                 </button>
//               </div>
//             </div>

//           </div>
//         )}

//       </div>
//     </div>
//   )
// }

// export default App
import { Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Markets from './pages/Markets'
import StockPage from './pages/StockPage'
import Watchlist from './pages/Watchlist'

function App() {
  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', color: '#fff', fontFamily: 'sans-serif' }}>
      <Navbar />
      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '30px 20px' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/markets" element={<Markets />} />
          <Route path="/stock/:ticker" element={<StockPage />} />
          <Route path="/watchlist" element={<Watchlist />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <p style={{ color: '#555', fontSize: '12px', textAlign: 'center', marginTop: '40px' }}>
          For education only. Nothing here is financial advice.
        </p>
      </div>
    </div>
  )
}

export default App