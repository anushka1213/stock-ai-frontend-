export function getSignal(rsi) {
    if (rsi == null) return { label: 'N/A', color: '#888' }
    if (rsi < 35) return { label: 'STRONG BUY', color: '#00c853' }
    if (rsi < 45) return { label: 'BUY', color: '#69f0ae' }
    if (rsi > 65) return { label: 'STRONG SELL', color: '#d50000' }
    if (rsi > 55) return { label: 'SELL', color: '#ff5252' }
    return { label: 'HOLD', color: '#ffd740' }
  }
  
  export function currencySymbol(ticker = '') {
    const t = ticker.toUpperCase()
    if (t.endsWith('.NS') || t.endsWith('.BO')) return '₹'
    if (t.startsWith('^') || t.includes('.')) return ''
    return '$'
  }
  
  const KEY = 'stockai_watchlist'
  
  export function getWatchlist() {
    try {
      return JSON.parse(localStorage.getItem(KEY)) || []
    } catch {
      return []
    }
  }
  
  export function toggleWatch(ticker) {
    const list = getWatchlist()
    const next = list.includes(ticker) ? list.filter((t) => t !== ticker) : [...list, ticker]
    try {
      localStorage.setItem(KEY, JSON.stringify(next))
    } catch {
      /* storage unavailable, ignore */
    }
    return next
  }