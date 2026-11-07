import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'

function Navbar() {
  const [q, setQ] = useState('')
  const navigate = useNavigate()

  const go = () => {
    const t = q.trim().toUpperCase()
    if (!t) return
    navigate(`/stock/${t}`)
    setQ('')
  }

  const linkStyle = ({ isActive }) => ({
    padding: '8px 14px',
    borderRadius: '8px',
    textDecoration: 'none',
    fontSize: '15px',
    color: isActive ? '#fff' : '#9aa',
    background: isActive ? '#1a1a2e' : 'transparent',
  })

  return (
    <div style={{ borderBottom: '1px solid #222', background: '#0d0d14', position: 'sticky', top: 0, zIndex: 10 }}>
      <div
        style={{
          maxWidth: '960px',
          margin: '0 auto',
          padding: '12px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          flexWrap: 'wrap',
        }}
      >
        <Link to="/" style={{ textDecoration: 'none', fontWeight: 700, fontSize: '18px', marginRight: '10px' }}>
          📈 StockAI
        </Link>
        <NavLink to="/" end style={linkStyle}>Home</NavLink>
        <NavLink to="/markets" style={linkStyle}>Markets</NavLink>
        <NavLink to="/watchlist" style={linkStyle}>Watchlist</NavLink>
        <div style={{ flex: 1 }} />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && go()}
          placeholder="Search ticker…"
          style={{ padding: '8px 12px', fontSize: '14px', borderRadius: '8px', border: '1px solid #333', background: '#1a1a2e', color: 'white', outline: 'none', width: '150px' }}
        />
      </div>
    </div>
  )
}

export default Navbar