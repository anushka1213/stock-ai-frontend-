import { useState, useEffect } from 'react'
import axios from 'axios'
import { API_URL } from './config'

const SYMBOLS = { INR: '₹', USD: '$', EUR: '€', GBP: '£', JPY: '¥' }

const card = {
  background: '#1a1a2e',
  borderRadius: '16px',
  padding: '20px',
  marginBottom: '20px',
  border: '1px solid #333',
}

function unitFor(cur) {
  const sym = SYMBOLS[cur] || (cur ? cur + ' ' : '')
  if (cur === 'INR') return { div: 1e7, label: `${sym} Crores`, sym }
  return { div: 1e6, label: `${sym} millions`, sym }
}

function bigMoney(v, cur) {
  if (v == null) return '—'
  const { sym } = unitFor(cur)
  if (cur === 'INR') {
    const cr = v / 1e7
    if (cr >= 1e5) return `${sym}${(cr / 1e5).toFixed(2)} L Cr`
    return `${sym}${cr.toLocaleString('en-IN', { maximumFractionDigits: 1 })} Cr`
  }
  if (v >= 1e12) return `${sym}${(v / 1e12).toFixed(2)}T`
  if (v >= 1e9) return `${sym}${(v / 1e9).toFixed(2)}B`
  return `${sym}${(v / 1e6).toFixed(0)}M`
}

const num = (v, d = 2) => (v == null ? '—' : Number(v).toFixed(d))
const pct = (v) => (v == null ? '—' : `${Number(v).toFixed(2)} %`)

function Table({ data, cur }) {
  if (!data || !data.rows || data.rows.length === 0) {
    return <p style={{ color: '#888', fontSize: '14px' }}>No data available for this stock.</p>
  }
  const { div, label } = unitFor(cur)
  const fmtCell = (v, kind) => {
    if (v == null) return '—'
    if (kind === 'money') return (v / div).toLocaleString('en-IN', { maximumFractionDigits: 2 })
    if (kind === 'pct') return `${Number(v).toFixed(1)}%`
    return Number(v).toFixed(2)
  }
  return (
    <div>
      <p style={{ color: '#888', fontSize: '12px', margin: '0 0 8px' }}>Figures in {label}</p>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', padding: '8px', color: '#888', fontWeight: 400 }}></th>
              {data.periods.map((p) => (
                <th key={p} style={{ textAlign: 'right', padding: '8px', color: '#888', fontWeight: 400, whiteSpace: 'nowrap' }}>
                  {p}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.rows.map((r) => (
              <tr key={r.label} style={{ borderTop: '1px solid #2a2a40' }}>
                <td style={{ padding: '8px', color: '#ccc', whiteSpace: 'nowrap' }}>{r.label}</td>
                {r.values.map((v, i) => (
                  <td key={i} style={{ textAlign: 'right', padding: '8px', color: v != null && v < 0 ? '#ff5252' : '#fff' }}>
                    {fmtCell(v, r.kind)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function Fundamentals({ ticker }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [tab, setTab] = useState('income')
  const [showAbout, setShowAbout] = useState(false)

  useEffect(() => {
    if (!ticker) return
    let cancelled = false
    setLoading(true)
    setError('')
    setData(null)
    axios
      .get(`${API_URL}/fundamentals/${ticker}`)
      .then((r) => {
        if (cancelled) return
        if (r.data.error) setError(r.data.error)
        else setData(r.data)
      })
      .catch(() => !cancelled && setError('Could not load fundamentals.'))
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [ticker])

  if (loading) return <div style={{ ...card, color: '#888' }}>Loading fundamentals…</div>
  if (error) return <div style={{ ...card, color: '#ff5252' }}>{error}</div>
  if (!data) return null

  const cur = data.currency
  const sym = unitFor(cur).sym
  const r = data.ratios
  const sh = data.shareholding

  const ratioItems = [
    { label: 'Market cap', value: bigMoney(r.market_cap, cur) },
    { label: 'Current price', value: r.price == null ? '—' : `${sym}${num(r.price)}` },
    { label: 'High / low (52w)', value: `${sym}${num(r.high)} / ${num(r.low)}` },
    { label: 'Stock P/E', value: num(r.pe, 1) },
    { label: 'Book value', value: r.book_value == null ? '—' : `${sym}${num(r.book_value)}` },
    { label: 'Dividend yield', value: pct(r.dividend_yield) },
    { label: 'ROCE', value: pct(r.roce) },
    { label: 'ROE', value: pct(r.roe) },
    { label: 'Debt to equity', value: r.debt_to_equity == null ? '—' : `${num(r.debt_to_equity)}x` },
    { label: 'EPS (TTM)', value: r.eps == null ? '—' : `${sym}${num(r.eps)}` },
    { label: 'Sales growth (CAGR)', value: pct(data.growth.sales_cagr) },
    { label: 'Profit growth (CAGR)', value: pct(data.growth.profit_cagr) },
  ]

  const tabs = [
    { id: 'income', label: 'Profit & loss', data: data.income },
    { id: 'quarterly', label: 'Quarterly', data: data.quarterly },
    { id: 'balance', label: 'Balance sheet', data: data.balance },
    { id: 'cashflow', label: 'Cash flow', data: data.cashflow },
  ]
  const active = tabs.find((t) => t.id === tab)

  const shareRows = [
    { label: 'Insiders / promoters', value: sh.insiders, color: '#0070f3' },
    { label: 'Institutions', value: sh.institutions, color: '#00c853' },
    { label: 'Public / other', value: sh.public, color: '#ffd740' },
  ]

  return (
    <div>
      <div style={card}>
        <h3 style={{ margin: '0 0 4px', fontSize: '18px' }}>🏢 {data.name}</h3>
        <p style={{ color: '#888', fontSize: '13px', margin: '0 0 14px' }}>
          {[data.exchange, data.sector, data.industry].filter(Boolean).join(' · ')}
          {data.website && (
            <>
              {' · '}
              <a href={data.website} target="_blank" rel="noreferrer" style={{ color: '#4da3ff' }}>website</a>
            </>
          )}
        </p>
        {data.about && (
          <p style={{ color: '#aaa', fontSize: '13px', lineHeight: '1.6', margin: 0 }}>
            {showAbout || data.about.length <= 320 ? data.about : data.about.slice(0, 320) + '…'}{' '}
            {data.about.length > 320 && (
              <span onClick={() => setShowAbout(!showAbout)} style={{ color: '#4da3ff', cursor: 'pointer' }}>
                {showAbout ? 'Show less' : 'Read more'}
              </span>
            )}
          </p>
        )}
      </div>

      <div style={card}>
        <h3 style={{ margin: '0 0 14px', fontSize: '16px' }}>Key ratios</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px' }}>
          {ratioItems.map((it) => (
            <div key={it.label} style={{ background: '#12122a', borderRadius: '10px', padding: '12px' }}>
              <p style={{ color: '#888', fontSize: '12px', margin: '0 0 4px' }}>{it.label}</p>
              <p style={{ margin: 0, fontSize: '15px', fontWeight: 600 }}>{it.value}</p>
            </div>
          ))}
        </div>
      </div>

      {(data.pros.length > 0 || data.cons.length > 0) && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px', marginBottom: '20px' }}>
          <div style={{ ...card, marginBottom: 0 }}>
            <h3 style={{ margin: '0 0 10px', fontSize: '15px', color: '#00c853' }}>Pros</h3>
            {data.pros.length === 0 && <p style={{ color: '#666', fontSize: '13px' }}>Nothing stands out.</p>}
            <ul style={{ margin: 0, paddingLeft: '18px', color: '#ccc', fontSize: '13px', lineHeight: '1.7' }}>
              {data.pros.map((p) => <li key={p}>{p}</li>)}
            </ul>
          </div>
          <div style={{ ...card, marginBottom: 0 }}>
            <h3 style={{ margin: '0 0 10px', fontSize: '15px', color: '#ff5252' }}>Cons</h3>
            {data.cons.length === 0 && <p style={{ color: '#666', fontSize: '13px' }}>Nothing stands out.</p>}
            <ul style={{ margin: 0, paddingLeft: '18px', color: '#ccc', fontSize: '13px', lineHeight: '1.7' }}>
              {data.cons.map((c) => <li key={c}>{c}</li>)}
            </ul>
          </div>
        </div>
      )}
      <p style={{ color: '#666', fontSize: '12px', margin: '-8px 0 20px' }}>
        Pros and cons are generated from simple rules on the numbers above. Not financial advice.
      </p>

      <div style={card}>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                padding: '8px 14px',
                fontSize: '13px',
                borderRadius: '8px',
                cursor: 'pointer',
                border: '1px solid #333',
                background: tab === t.id ? '#0070f3' : '#12122a',
                color: 'white',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
        <Table data={active.data} cur={cur} />
      </div>

      {(sh.insiders != null || sh.institutions != null) && (
        <div style={card}>
          <h3 style={{ margin: '0 0 14px', fontSize: '16px' }}>Shareholding pattern</h3>
          <div style={{ display: 'flex', height: '14px', borderRadius: '7px', overflow: 'hidden', marginBottom: '14px', background: '#12122a' }}>
            {shareRows.map((s) => s.value != null && <div key={s.label} style={{ width: `${s.value}%`, background: s.color }} />)}
          </div>
          <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
            {shareRows.map((s) => (
              <div key={s.label} style={{ fontSize: '13px', color: '#ccc' }}>
                <span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '2px', background: s.color, marginRight: '6px' }} />
                {s.label}: <b>{s.value == null ? '—' : `${s.value}%`}</b>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default Fundamentals