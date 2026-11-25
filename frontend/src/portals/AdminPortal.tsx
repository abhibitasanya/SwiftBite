import { useState, useRef, useEffect, type Dispatch, type FormEvent, type SetStateAction } from 'react'
import { askChatbot } from '../services/chatbot'
import { reviewDemoProfile, useDemoProfiles, type DemoProfile, type ProfileRole } from '../profileManagement'
import HamburgerMenu from '../components/HamburgerMenu'

const C = {
  primary: '#7C3AED',
  primaryLight: '#F5F3FF',
  primaryBorder: '#DDD6FE',
  text: '#1F2937',
  muted: '#6B7280',
  subtle: '#9CA3AF',
  border: '#E5E7EB',
  surface: '#FFFFFF',
  bg: '#F8F7FF',
  green: '#16A34A',
  greenLight: '#F0FDF4',
  red: '#E23744',
  redLight: '#FFF5F5',
  orange: '#EA580C',
  orangeLight: '#FFF7ED',
}

type AdminTab = 'dashboard' | 'orders' | 'restaurants' | 'riders' | 'users' | 'verify'

const STATS = [
  { label: 'Orders Today',    value: '12,847',  delta: '+18%',  positive: true,  icon: '📦', color: C.primary,    bg: C.primaryLight },
  { label: 'Revenue Today',   value: '₹7,83,000', delta: '+22%',  positive: true,  icon: '💰', color: C.green,      bg: C.greenLight },
  { label: 'Active Users',    value: '3,241',   delta: '+5%',   positive: true,  icon: '👥', color: '#2563EB',    bg: '#EFF6FF' },
  { label: 'Restaurants',     value: '142',     delta: '+3 new',positive: true,  icon: '🍽️', color: C.orange,     bg: C.orangeLight },
]

const RECENT_ORDERS = [
  { id: 'SWB-20847', customer: 'Alex Johnson',   restaurant: 'The Burger Lab',  amount: '₹1,575', status: 'Delivered', time: '2:58 PM' },
  { id: 'SWB-20846', customer: 'Priya Sharma',   restaurant: 'Spice Route',     amount: '₹2033', status: 'In Transit', time: '3:02 PM' },
  { id: 'SWB-20845', customer: 'Marcus Lee',     restaurant: 'Sakura Garden',   amount: '₹2589', status: 'Preparing', time: '3:05 PM' },
  { id: 'SWB-20844', customer: 'Emma Wilson',    restaurant: 'Pizza Piazza',    amount: '₹1639', status: 'Delivered', time: '3:10 PM' },
  { id: 'SWB-20843', customer: 'David Kim',      restaurant: 'Green Bowl',      amount: '₹1244', status: 'Pending', time: '3:12 PM' },
  { id: 'SWB-20842', customer: 'Sofia Martinez', restaurant: 'Wok & Roll',      amount: '₹1859', status: 'Cancelled', time: '3:14 PM' },
]

const PENDING_RESTAURANTS = [
  { name: 'Noodle Palace',    cuisine: 'Chinese',  owner: 'Lin Wei',       since: '2 days ago',  docs: 'Verified' },
  { name: 'Taco Fiesta',      cuisine: 'Mexican',  owner: 'Carlos Rivera', since: '4 days ago',  docs: 'Pending' },
  { name: 'Pita & Hummus',    cuisine: 'Middle Eastern', owner: 'Amir Hassan', since: '1 day ago', docs: 'Verified' },
]

const ALL_RESTAURANTS = [
  { name: 'The Burger Lab',  cuisine: 'American',  orders: 234, revenue: '₹4,00,000', rating: 4.8, status: 'Active' },
  { name: 'Sakura Garden',   cuisine: 'Japanese',  orders: 189, revenue: '₹4,70,000', rating: 4.6, status: 'Active' },
  { name: 'Spice Route',     cuisine: 'Indian',    orders: 312, revenue: '₹5,18,000', rating: 4.7, status: 'Active' },
  { name: 'Pizza Piazza',    cuisine: 'Italian',   orders: 145, revenue: '₹2,41,000', rating: 4.5, status: 'Active' },
  { name: 'Green Bowl',      cuisine: 'Healthy',   orders: 98,  revenue: '₹1,63,000', rating: 4.9, status: 'Active' },
  { name: 'Wok & Roll',      cuisine: 'Asian Fusion', orders: 210, revenue: '₹3,49,000', rating: 4.4, status: 'Suspended' },
]
type AdminRestaurant = (typeof ALL_RESTAURANTS)[number]

type AdminRider = { id: string; name: string; zone: string; status: string }

const INITIAL_RIDERS: AdminRider[] = [
  { id: 'rider-1', name: 'Aarav Das', zone: 'Bhubaneswar North', status: 'Active' },
  { id: 'rider-2', name: 'Meera Patel', zone: 'Bhubaneswar Central', status: 'Active' },
  { id: 'rider-3', name: 'Kabir Sahu', zone: 'Bhubaneswar South', status: 'Suspended' },
]

const USERS = [
  { name: 'Alex Johnson',   email: 'alex.j@gmail.com',   orders: 47,  spent: '₹69,886', joined: 'Mar 2024', status: 'Active' },
  { name: 'Priya Sharma',   email: 'priya.s@gmail.com',  orders: 31,  spent: '₹46,480', joined: 'Apr 2024', status: 'Active' },
  { name: 'Marcus Lee',     email: 'marcus.l@gmail.com', orders: 18,  spent: '₹26,892', joined: 'May 2024', status: 'Active' },
  { name: 'Emma Wilson',    email: 'emma.w@gmail.com',   orders: 62,  spent: '₹92,960', joined: 'Jan 2024', status: 'Active' },
  { name: 'David Kim',      email: 'david.k@gmail.com',  orders: 8,   spent: '₹11,952', joined: 'Jun 2024', status: 'Suspended' },
  { name: 'Sofia Martinez', email: 'sofia.m@gmail.com',  orders: 25,  spent: '₹37,350', joined: 'Feb 2024', status: 'Active' },
]

const STATUS_STYLE: Record<string, { color: string; bg: string }> = {
  'Delivered':  { color: C.green,  bg: C.greenLight },
  'In Transit': { color: '#2563EB', bg: '#EFF6FF' },
  'Preparing':  { color: C.orange, bg: C.orangeLight },
  'Pending':    { color: '#D97706', bg: '#FFFBEB' },
  'Cancelled':  { color: C.red,    bg: C.redLight },
  'Active':     { color: C.green,  bg: C.greenLight },
  'Suspended':  { color: C.red,    bg: C.redLight },
  'Verified':   { color: C.green,  bg: C.greenLight },
  'Pending review': { color: '#D97706', bg: '#FFFBEB' },
  'Changes requested': { color: C.red, bg: C.redLight },
}

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_STYLE[status] || { color: C.muted, bg: '#F9FAFB' }
  return (
    <span style={{ fontSize: 10, fontWeight: 700, color: s.color, backgroundColor: s.bg, padding: '3px 8px', borderRadius: 6, whiteSpace: 'nowrap' }}>
      {status}
    </span>
  )
}

function AdminNav({ tab, onTab }: { tab: AdminTab; onTab: (t: AdminTab) => void }) {
  const tabs: { id: AdminTab; label: string; icon: string }[] = [
    { id: 'dashboard',   label: 'Dashboard',   icon: '📊' },
    { id: 'orders',      label: 'Orders',      icon: '📦' },
    { id: 'restaurants', label: 'Restaurants', icon: '🍽️' },
    { id: 'riders',      label: 'Riders',      icon: '🛵' },
    { id: 'users',       label: 'Users',       icon: '👥' },
    { id: 'verify',      label: 'Verify',      icon: '✅' },
  ]
  return (
    <nav className="portal-bottom-nav">
      {tabs.map(t => (
        <button key={t.id} onClick={() => onTab(t.id)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, background: 'none', border: 'none', cursor: 'pointer', padding: '0 8px' }}>
          <span style={{ fontSize: 20 }}>{t.icon}</span>
          <span style={{ fontSize: 10, fontWeight: tab === t.id ? 700 : 500, color: tab === t.id ? C.primary : C.muted }}>{t.label}</span>
          {tab === t.id && <div style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: C.primary }} />}
        </button>
      ))}
    </nav>
  )
}

// ── Dashboard ─────────────────────────────────────────────────────────────────
function Dashboard() {
  // Simple sparkline using bars
  const weekData = [42, 58, 71, 65, 88, 94, 78]
  const weekLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const maxVal = Math.max(...weekData)

  return (
    <div style={{ backgroundColor: C.bg, minHeight: '100vh', paddingBottom: 100 }}>
      {/* Header */}
      <div style={{ background: `linear-gradient(135deg, ${C.primary} 0%, #5B21B6 100%)`, padding: '56px 20px 28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
          <div>
            <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13, margin: '0 0 2px', fontWeight: 500 }}>Admin Console</p>
            <h1 style={{ color: 'white', fontSize: 22, fontWeight: 800, margin: 0, letterSpacing: -0.4 }}>Platform Overview</h1>
          </div>
          <div style={{ backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 12, padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 8, height: 8, backgroundColor: '#4ADE80', borderRadius: '50%' }} />
            <span style={{ color: 'white', fontSize: 12, fontWeight: 600 }}>Live</span>
          </div>
        </div>
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, margin: 0 }}>Thursday, July 31 · Last updated just now</p>
      </div>

      {/* Stats */}
      <div style={{ padding: '16px 20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {STATS.map(s => (
          <div key={s.label} style={{ backgroundColor: C.surface, borderRadius: 18, padding: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
              <div style={{ width: 36, height: 36, backgroundColor: s.bg, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>{s.icon}</div>
              <span style={{ fontSize: 11, fontWeight: 700, color: s.positive ? C.green : C.red, backgroundColor: s.positive ? C.greenLight : C.redLight, padding: '3px 7px', borderRadius: 6 }}>
                {s.delta}
              </span>
            </div>
            <p style={{ fontSize: 20, fontWeight: 800, color: C.text, margin: '0 0 3px', letterSpacing: -0.5 }}>{s.value}</p>
            <p style={{ fontSize: 11, color: C.muted, margin: 0, fontWeight: 500 }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Revenue chart */}
      <div style={{ padding: '0 20px 16px' }}>
        <div style={{ backgroundColor: C.surface, borderRadius: 18, padding: 18, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: C.text, margin: '0 0 2px' }}>Revenue This Week</h3>
              <p style={{ fontSize: 12, color: C.muted, margin: 0 }}>Daily earnings in thousands</p>
            </div>
            <div style={{ backgroundColor: C.primaryLight, padding: '6px 12px', borderRadius: 10 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: C.primary }}>₹39.5L total</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', height: 80 }}>
            {weekData.map((v, i) => (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <div style={{ width: '100%', backgroundColor: C.primaryLight, borderRadius: 6, overflow: 'hidden', height: 60 }}>
                  <div style={{ width: '100%', height: `${(v / maxVal) * 100}%`, backgroundColor: i === 5 ? C.primary : '#A78BFA', borderRadius: 6, marginTop: 'auto', transition: 'height 0.5s ease' }} />
                </div>
                <span style={{ fontSize: 9, color: C.muted, fontWeight: 600 }}>{weekLabels[i]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pending approvals */}
      <div style={{ padding: '0 20px 16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: C.text, margin: 0 }}>Pending Approvals</h3>
          <div style={{ backgroundColor: C.orange, color: 'white', fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 8 }}>{PENDING_RESTAURANTS.length} new</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {PENDING_RESTAURANTS.map(r => (
            <div key={r.name} style={{ backgroundColor: C.surface, borderRadius: 16, padding: '14px 16px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 40, height: 40, backgroundColor: C.primaryLight, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>🍽️</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: C.text, margin: '0 0 2px' }}>{r.name}</p>
                <p style={{ fontSize: 11, color: C.muted, margin: 0 }}>{r.cuisine} · {r.owner} · {r.since}</p>
              </div>
              <StatusBadge status={r.docs} />
              <div style={{ display: 'flex', gap: 6 }}>
                <button onClick={() => window.alert(`${r.name} approved`)} style={{ width: 30, height: 30, borderRadius: 8, backgroundColor: C.greenLight, border: `1px solid #BBF7D0`, fontSize: 14, cursor: 'pointer' }}>✓</button>
                <button onClick={() => window.alert(`${r.name} rejected`)} style={{ width: 30, height: 30, borderRadius: 8, backgroundColor: C.redLight, border: `1px solid #FECDD3`, fontSize: 14, cursor: 'pointer' }}>✕</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent orders */}
      <div style={{ padding: '0 20px' }}>
        <h3 style={{ fontSize: 16, fontWeight: 800, color: C.text, margin: '0 0 12px' }}>Recent Orders</h3>
        <div style={{ backgroundColor: C.surface, borderRadius: 18, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          {RECENT_ORDERS.map((o, i) => (
            <div key={o.id}>
              <div style={{ padding: '12px 16px', display: 'flex', gap: 10, alignItems: 'center' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                    <p style={{ fontSize: 13, fontWeight: 700, color: C.text, margin: 0 }}>{o.customer}</p>
                    <span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{o.amount}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <p style={{ fontSize: 11, color: C.muted, margin: 0 }}>{o.restaurant} · {o.time}</p>
                    <StatusBadge status={o.status} />
                  </div>
                </div>
              </div>
              {i < RECENT_ORDERS.length - 1 && <div style={{ height: 1, backgroundColor: '#F3F4F6', margin: '0 16px' }} />}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Orders Management ─────────────────────────────────────────────────────────
function OrdersTab() {
  const [filter, setFilter] = useState('All')
  const filters = ['All', 'Pending', 'Preparing', 'In Transit', 'Delivered', 'Cancelled']
  const shown = filter === 'All' ? RECENT_ORDERS : RECENT_ORDERS.filter(o => o.status === filter)

  return (
    <div style={{ backgroundColor: C.bg, minHeight: '100vh', paddingBottom: 100 }}>
      <div style={{ background: `linear-gradient(135deg, ${C.primary} 0%, #5B21B6 100%)`, padding: '56px 20px 20px' }}>
        <h1 style={{ color: 'white', fontSize: 22, fontWeight: 800, margin: '0 0 4px', letterSpacing: -0.4 }}>Order Management</h1>
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, margin: 0 }}>{RECENT_ORDERS.length} orders today</p>
      </div>
      <div style={{ backgroundColor: 'white', padding: '12px 20px', borderBottom: `1px solid ${C.border}` }}>
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', scrollbarWidth: 'none' }}>
          {filters.map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{ flex: '0 0 auto', padding: '7px 14px', backgroundColor: filter === f ? C.primary : 'white', color: filter === f ? 'white' : C.muted, border: `1.5px solid ${filter === f ? C.primary : C.border}`, borderRadius: 100, fontSize: 12, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.2s' }}>
              {f}
            </button>
          ))}
        </div>
      </div>
      <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {shown.map(o => (
          <div key={o.id} style={{ backgroundColor: 'white', borderRadius: 16, padding: '14px 16px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: C.primary, fontFamily: 'monospace' }}>{o.id}</span>
              <StatusBadge status={o.status} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <p style={{ fontSize: 14, fontWeight: 700, color: C.text, margin: '0 0 2px' }}>{o.customer}</p>
                <p style={{ fontSize: 12, color: C.muted, margin: 0 }}>{o.restaurant} · {o.time}</p>
              </div>
              <span style={{ fontSize: 16, fontWeight: 800, color: C.text }}>{o.amount}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Restaurant Management ─────────────────────────────────────────────────────
function RestaurantsTab({ restaurants, setRestaurants }: { restaurants: AdminRestaurant[]; setRestaurants: Dispatch<SetStateAction<AdminRestaurant[]>> }) {
  const [search, setSearch] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [formError, setFormError] = useState('')
  const [draft, setDraft] = useState({ name: '', cuisine: '' })
  const shown = restaurants.filter(r => r.name.toLowerCase().includes(search.toLowerCase()))

  const addRestaurant = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const name = draft.name.trim()
    const cuisine = draft.cuisine.trim()
    if (!name || !cuisine) {
      setFormError('Enter both a restaurant name and cuisine.')
      return
    }
    if (restaurants.some(restaurant => restaurant.name.toLowerCase() === name.toLowerCase())) {
      setFormError('A restaurant with this name is already in the demo list.')
      return
    }

    setRestaurants(prev => [{
      name,
      cuisine,
      orders: 0,
      revenue: '₹0',
      rating: 0,
      status: 'Active',
    }, ...prev])
    setDraft({ name: '', cuisine: '' })
    setFormError('')
    setFormOpen(false)
  }

  return (
    <div style={{ backgroundColor: C.bg, minHeight: '100vh', paddingBottom: 100 }}>
      <div style={{ background: `linear-gradient(135deg, ${C.primary} 0%, #5B21B6 100%)`, padding: '56px 20px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
          <div>
            <h1 style={{ color: 'white', fontSize: 22, fontWeight: 800, margin: '0 0 4px', letterSpacing: -0.4 }}>Restaurants</h1>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, margin: 0 }}>{restaurants.length} registered · 3 pending approval</p>
          </div>
          <button type="button" onClick={() => { setFormOpen(value => !value); setFormError('') }} style={{ backgroundColor: 'rgba(255,255,255,0.15)', border: '1.5px solid rgba(255,255,255,0.3)', borderRadius: 10, padding: '9px 12px', color: 'white', fontSize: 12, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>+ Add Restaurant</button>
        </div>
        <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 11, margin: '8px 0 0' }}>Demo only: changes reset when the page is refreshed.</p>
      </div>
      {formOpen && (
        <form onSubmit={addRestaurant} style={{ margin: 16, padding: 16, backgroundColor: 'white', borderRadius: 16, border: `1px solid ${C.border}` }}>
          <h2 style={{ margin: '0 0 12px', color: C.text, fontSize: 16 }}>Add a restaurant</h2>
          <label style={{ display: 'block', marginBottom: 10, color: C.muted, fontSize: 12 }}>
            Restaurant name
            <input autoFocus required maxLength={100} value={draft.name} onChange={event => setDraft(prev => ({ ...prev, name: event.target.value }))} style={{ display: 'block', width: '100%', boxSizing: 'border-box', marginTop: 5, padding: 10, border: `1px solid ${C.border}`, borderRadius: 9, color: C.text }} />
          </label>
          <label style={{ display: 'block', color: C.muted, fontSize: 12 }}>
            Cuisine
            <input required maxLength={80} value={draft.cuisine} onChange={event => setDraft(prev => ({ ...prev, cuisine: event.target.value }))} style={{ display: 'block', width: '100%', boxSizing: 'border-box', marginTop: 5, padding: 10, border: `1px solid ${C.border}`, borderRadius: 9, color: C.text }} />
          </label>
          {formError && <p role="alert" style={{ margin: '10px 0 0', color: C.red, fontSize: 12 }}>{formError}</p>}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 14 }}>
            <button type="button" onClick={() => setFormOpen(false)} style={{ padding: '8px 12px', border: `1px solid ${C.border}`, borderRadius: 9, backgroundColor: 'white', color: C.muted, cursor: 'pointer' }}>Cancel</button>
            <button type="submit" style={{ padding: '8px 14px', border: 0, borderRadius: 9, backgroundColor: C.primary, color: 'white', fontWeight: 700, cursor: 'pointer' }}>Add restaurant</button>
          </div>
        </form>
      )}
      <div style={{ backgroundColor: 'white', padding: '12px 20px', borderBottom: `1px solid ${C.border}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, backgroundColor: '#F9FAFB', border: `1.5px solid ${C.border}`, borderRadius: 14, padding: '11px 14px' }}>
          <span style={{ fontSize: 16 }}>🔍</span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search restaurants…" style={{ flex: 1, border: 'none', background: 'transparent', fontSize: 14, color: C.text, outline: 'none' }} />
        </div>
      </div>
      <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {shown.map(r => (
          <div key={r.name} style={{ backgroundColor: 'white', borderRadius: 18, padding: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: C.text, margin: '0 0 2px' }}>{r.name}</h3>
                <p style={{ fontSize: 12, color: C.muted, margin: 0 }}>{r.cuisine}</p>
              </div>
              <StatusBadge status={r.status} />
            </div>
            <div style={{ display: 'flex', gap: 16 }}>
              {[
                { label: 'Orders', value: r.orders },
                { label: 'Revenue', value: r.revenue },
                { label: 'Rating', value: `${r.rating}⭐` },
              ].map(s => (
                <div key={s.label}>
                  <p style={{ fontSize: 14, fontWeight: 700, color: C.text, margin: '0 0 2px' }}>{s.value}</p>
                  <p style={{ fontSize: 11, color: C.muted, margin: 0 }}>{s.label}</p>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <button onClick={() => window.alert(`${r.name}\n${r.cuisine}\n${r.orders} orders\nRevenue: ${r.revenue}`)} style={{ flex: 1, padding: '8px', backgroundColor: C.primaryLight, color: C.primary, border: `1px solid ${C.primaryBorder}`, borderRadius: 10, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>View Details</button>
              <button onClick={() => setRestaurants(prev => prev.map(item => item.name === r.name ? { ...item, status: item.status === 'Active' ? 'Suspended' : 'Active' } : item))} style={{ flex: 1, padding: '8px', backgroundColor: r.status === 'Active' ? C.redLight : C.greenLight, color: r.status === 'Active' ? C.red : C.green, border: `1px solid ${r.status === 'Active' ? '#FECDD3' : '#BBF7D0'}`, borderRadius: 10, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>{r.status === 'Active' ? 'Suspend' : 'Restore'}</button>
              <button onClick={() => { if (window.confirm(`Remove ${r.name} from this demo list?`)) setRestaurants(prev => prev.filter(item => item.name !== r.name)) }} style={{ flex: 1, padding: '8px', backgroundColor: '#FFF1F2', color: C.red, border: '1px solid #FECDD3', borderRadius: 10, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Remove</button>
            </div>
          </div>
        ))}
        {shown.length === 0 && <p style={{ color: C.muted, textAlign: 'center', fontSize: 13 }}>No restaurants match this search.</p>}
      </div>
    </div>
  )
}

function RidersTab({ riders, setRiders }: { riders: AdminRider[]; setRiders: Dispatch<SetStateAction<AdminRider[]>> }) {
  const [search, setSearch] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [formError, setFormError] = useState('')
  const [draft, setDraft] = useState({ name: '', zone: '' })
  const shown = riders.filter(rider => `${rider.name} ${rider.zone}`.toLowerCase().includes(search.toLowerCase()))

  const addRider = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const name = draft.name.trim()
    const zone = draft.zone.trim()
    if (!name || !zone) {
      setFormError('Enter both a rider name and delivery zone.')
      return
    }
    setRiders(prev => [{ id: `rider-${Date.now()}`, name, zone, status: 'Active' }, ...prev])
    setDraft({ name: '', zone: '' })
    setFormError('')
    setFormOpen(false)
  }

  return (
    <div style={{ backgroundColor: C.bg, minHeight: '100vh', paddingBottom: 100 }}>
      <div style={{ background: `linear-gradient(135deg, ${C.primary} 0%, #5B21B6 100%)`, padding: '56px 20px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
          <div>
            <h1 style={{ color: 'white', fontSize: 22, fontWeight: 800, margin: '0 0 4px', letterSpacing: -0.4 }}>Delivery Riders</h1>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, margin: 0 }}>{riders.length} riders in the demo list</p>
          </div>
          <button type="button" onClick={() => { setFormOpen(value => !value); setFormError('') }} style={{ backgroundColor: 'rgba(255,255,255,0.15)', border: '1.5px solid rgba(255,255,255,0.3)', borderRadius: 10, padding: '9px 12px', color: 'white', fontSize: 12, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>+ Add Rider</button>
        </div>
        <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 11, margin: '8px 0 0' }}>Demo only: changes reset when the page is refreshed.</p>
      </div>
      {formOpen && (
        <form onSubmit={addRider} style={{ margin: 16, padding: 16, backgroundColor: 'white', borderRadius: 16, border: `1px solid ${C.border}` }}>
          <h2 style={{ margin: '0 0 12px', color: C.text, fontSize: 16 }}>Add a delivery rider</h2>
          <label style={{ display: 'block', marginBottom: 10, color: C.muted, fontSize: 12 }}>
            Rider name
            <input autoFocus required maxLength={100} value={draft.name} onChange={event => setDraft(prev => ({ ...prev, name: event.target.value }))} style={{ display: 'block', width: '100%', boxSizing: 'border-box', marginTop: 5, padding: 10, border: `1px solid ${C.border}`, borderRadius: 9, color: C.text }} />
          </label>
          <label style={{ display: 'block', color: C.muted, fontSize: 12 }}>
            Delivery zone
            <input required maxLength={100} value={draft.zone} onChange={event => setDraft(prev => ({ ...prev, zone: event.target.value }))} style={{ display: 'block', width: '100%', boxSizing: 'border-box', marginTop: 5, padding: 10, border: `1px solid ${C.border}`, borderRadius: 9, color: C.text }} />
          </label>
          {formError && <p role="alert" style={{ margin: '10px 0 0', color: C.red, fontSize: 12 }}>{formError}</p>}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 14 }}>
            <button type="button" onClick={() => setFormOpen(false)} style={{ padding: '8px 12px', border: `1px solid ${C.border}`, borderRadius: 9, backgroundColor: 'white', color: C.muted, cursor: 'pointer' }}>Cancel</button>
            <button type="submit" style={{ padding: '8px 14px', border: 0, borderRadius: 9, backgroundColor: C.primary, color: 'white', fontWeight: 700, cursor: 'pointer' }}>Add rider</button>
          </div>
        </form>
      )}
      <div style={{ backgroundColor: 'white', padding: '12px 20px', borderBottom: `1px solid ${C.border}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, backgroundColor: '#F9FAFB', border: `1.5px solid ${C.border}`, borderRadius: 14, padding: '11px 14px' }}>
          <span style={{ fontSize: 16 }}>🔍</span>
          <input value={search} onChange={event => setSearch(event.target.value)} placeholder="Search riders or zones…" style={{ flex: 1, border: 'none', background: 'transparent', fontSize: 14, color: C.text, outline: 'none' }} />
        </div>
      </div>
      <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {shown.map(rider => (
          <div key={rider.id} style={{ backgroundColor: 'white', borderRadius: 18, padding: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: '#EFF6FF', display: 'grid', placeItems: 'center', fontSize: 22 }}>🛵</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: '0 0 3px', color: C.text, fontSize: 14, fontWeight: 700 }}>{rider.name}</p>
                <p style={{ margin: 0, color: C.muted, fontSize: 12 }}>{rider.zone}</p>
              </div>
              <StatusBadge status={rider.status} />
            </div>
            <button type="button" aria-label={`Remove rider ${rider.name}`} onClick={() => { if (window.confirm(`Remove ${rider.name} from this demo list?`)) setRiders(prev => prev.filter(item => item.id !== rider.id)) }} style={{ width: '100%', marginTop: 12, padding: 8, backgroundColor: '#FFF1F2', color: C.red, border: '1px solid #FECDD3', borderRadius: 10, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Remove Rider</button>
          </div>
        ))}
        {shown.length === 0 && <p style={{ color: C.muted, textAlign: 'center', fontSize: 13 }}>No riders match this search.</p>}
      </div>
    </div>
  )
}

// ── User Management ───────────────────────────────────────────────────────────
function UsersTab() {
  const [search, setSearch] = useState('')
  const shown = USERS.filter(u => u.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <div style={{ backgroundColor: C.bg, minHeight: '100vh', paddingBottom: 100 }}>
      <div style={{ background: `linear-gradient(135deg, ${C.primary} 0%, #5B21B6 100%)`, padding: '56px 20px 20px' }}>
        <h1 style={{ color: 'white', fontSize: 22, fontWeight: 800, margin: '0 0 4px', letterSpacing: -0.4 }}>Users</h1>
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, margin: 0 }}>{USERS.length} registered users</p>
      </div>
      <div style={{ backgroundColor: 'white', padding: '12px 20px', borderBottom: `1px solid ${C.border}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, backgroundColor: '#F9FAFB', border: `1.5px solid ${C.border}`, borderRadius: 14, padding: '11px 14px' }}>
          <span style={{ fontSize: 16 }}>🔍</span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users…" style={{ flex: 1, border: 'none', background: 'transparent', fontSize: 14, color: C.text, outline: 'none' }} />
        </div>
      </div>
      <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {shown.map(u => (
          <div key={u.email} style={{ backgroundColor: 'white', borderRadius: 18, padding: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <div style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: C.primaryLight, border: `1.5px solid ${C.primaryBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
                {u.name.charAt(0)}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                  <p style={{ fontSize: 14, fontWeight: 700, color: C.text, margin: 0 }}>{u.name}</p>
                  <StatusBadge status={u.status} />
                </div>
                <p style={{ fontSize: 11, color: C.muted, margin: '0 0 6px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.email}</p>
                <div style={{ display: 'flex', gap: 14 }}>
                  <span style={{ fontSize: 11, color: C.muted }}><strong style={{ color: C.text }}>{u.orders}</strong> orders</span>
                  <span style={{ fontSize: 11, color: C.muted }}><strong style={{ color: C.text }}>{u.spent}</strong> spent</span>
                  <span style={{ fontSize: 11, color: C.muted }}>Since {u.joined}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function VerificationTab({ profiles }: { profiles: DemoProfile[] }) {
  const [search, setSearch] = useState('')
  const shown = profiles.filter(profile => `${profile.fullName} ${profile.phone} ${profile.city} ${profile.businessName || ''}`.toLowerCase().includes(search.toLowerCase()))
  const pendingCount = profiles.filter(profile => profile.status === 'Pending review').length
  const roleLabel: Record<ProfileRole, string> = { customer: 'Customer', delivery: 'Delivery partner', restaurant: 'Restaurant owner' }

  return (
    <div style={{ backgroundColor: C.bg, minHeight: '100vh', paddingBottom: 100 }}>
      <div style={{ background: `linear-gradient(135deg, ${C.primary} 0%, #5B21B6 100%)`, padding: '56px 20px 20px' }}>
        <h1 style={{ color: 'white', fontSize: 22, fontWeight: 800, margin: '0 0 4px', letterSpacing: -0.4 }}>Profile verification</h1>
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, margin: 0 }}>{pendingCount} pending · {profiles.length} submitted in this demo session</p>
        <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 11, margin: '8px 0 0' }}>Only contact and location details are shown. Driver proof is a mock status; no ID document is stored.</p>
      </div>
      <div style={{ backgroundColor: 'white', padding: '12px 20px', borderBottom: `1px solid ${C.border}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, backgroundColor: '#F9FAFB', border: `1.5px solid ${C.border}`, borderRadius: 14, padding: '11px 14px' }}>
          <span style={{ fontSize: 16 }}>🔍</span>
          <input value={search} onChange={event => setSearch(event.target.value)} placeholder="Search name, phone, city…" style={{ flex: 1, border: 'none', background: 'transparent', fontSize: 14, color: C.text, outline: 'none' }} />
        </div>
      </div>
      <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {shown.map(profile => (
          <div key={`${profile.role}:${profile.accountId}`} style={{ backgroundColor: 'white', borderRadius: 18, padding: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
              <div>
                <p style={{ margin: '0 0 3px', color: C.text, fontSize: 15, fontWeight: 700 }}>{profile.fullName}</p>
                <p style={{ margin: 0, color: C.muted, fontSize: 12 }}>{roleLabel[profile.role]} · {profile.phone}</p>
              </div>
              <StatusBadge status={profile.status} />
            </div>
            <div style={{ marginTop: 12, padding: 11, backgroundColor: '#F9FAFB', borderRadius: 11 }}>
              {profile.businessName && <p style={{ margin: '0 0 5px', color: C.text, fontSize: 12 }}><strong>Restaurant:</strong> {profile.businessName} · {profile.cuisine}</p>}
              <p style={{ margin: '0 0 5px', color: C.text, fontSize: 12 }}><strong>Location:</strong> {profile.address}, {profile.city} {profile.postalCode}</p>
              {profile.serviceZone && <p style={{ margin: '0 0 5px', color: C.text, fontSize: 12 }}><strong>Service area:</strong> {profile.serviceZone} · {profile.vehicleType}</p>}
              {profile.role === 'delivery' && <p style={{ margin: 0, color: C.muted, fontSize: 12 }}><strong>Mock ID proof:</strong> {profile.proofType} · {profile.mockProofSubmitted ? 'Marked submitted' : 'Not submitted'}</p>}
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <button type="button" onClick={() => reviewDemoProfile(profile.accountId, profile.role, 'Verified')} style={{ flex: 1, padding: 9, backgroundColor: C.greenLight, color: C.green, border: '1px solid #BBF7D0', borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>Mark verified</button>
              <button type="button" onClick={() => reviewDemoProfile(profile.accountId, profile.role, 'Changes requested')} style={{ flex: 1, padding: 9, backgroundColor: C.redLight, color: C.red, border: '1px solid #FECDD3', borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>Request changes</button>
            </div>
          </div>
        ))}
        {shown.length === 0 && <p style={{ color: C.muted, textAlign: 'center', fontSize: 13 }}>{profiles.length ? 'No profiles match this search.' : 'No profiles have been submitted in this demo session yet.'}</p>}
      </div>
    </div>
  )
}

// ── Chatbot Component ──────────────────────────────────────────────────────────
function AdminChatbot() {
  const [chatOpen, setChatOpen] = useState(false)
  const [chatMessages, setChatMessages] = useState<Array<{ id: string; role: 'user' | 'bot'; text: string; timestamp: number }>>([])
  const [chatInput, setChatInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const [chatSessionId, setChatSessionId] = useState<string>()
  const [chatError, setChatError] = useState<string | null>(null)
  const chatEndRef = useRef<HTMLDivElement>(null)

  const chatQuickReplies = [
    'Show me revenue stats',
    'How many restaurants?',
    'Pending approvals',
    'Help with orders',
  ]

  useEffect(() => {
    if (chatOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [chatMessages, chatLoading, chatOpen])

  const sendChatMessage = async (msg: string) => {
    const text = msg.trim()
    if (!text || chatLoading) return

    setChatError(null)

    const userMsg = { id: Date.now().toString(), role: 'user' as const, text, timestamp: Date.now() }
    const nextMessages = [...chatMessages, userMsg]
    setChatMessages(nextMessages)
    setChatInput('')
    setChatLoading(true)

    await new Promise(resolve => setTimeout(resolve, 800))

    try {
      const apiMessages = nextMessages.map((message) => ({
        role: message.role === 'user' ? ('user' as const) : ('assistant' as const),
        text: message.text,
        timestamp: new Date(message.timestamp).toISOString(),
      }))

      const { reply, sessionId } = await askChatbot({
        messages: apiMessages,
        sessionId: chatSessionId,
        role: 'platform',
      })

      if (sessionId) setChatSessionId(sessionId)

      const botMsg = {
        id: (Date.now() + 1).toString(),
        role: 'bot' as const,
        text: reply,
        timestamp: Date.now(),
      }
      setChatMessages((prev) => [...prev, botMsg])
    } catch (error) {
      setChatError('Something went wrong. Please try again.')
    } finally {
      setChatLoading(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setChatOpen(v => !v)}
        aria-label="Open AI assistant"
        style={{
          position: 'fixed',
          right: 18,
          bottom: 80,
          width: 56,
          height: 56,
          borderRadius: '50%',
          border: 'none',
          background: 'linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)',
          color: 'white',
          boxShadow: '0 14px 34px rgba(124,58,237,0.30)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 120,
          fontSize: 24,
        }}
      >
        🤖
      </button>

      {chatOpen && (
        <div style={{
          position: 'fixed',
          right: 18,
          bottom: 148,
          width: 320,
          maxHeight: 450,
          borderRadius: 18,
          background: 'rgba(255,253,248,0.98)',
          border: `1px solid ${C.border}`,
          boxShadow: '0 18px 40px rgba(47,58,45,0.16)',
          zIndex: 130,
          backdropFilter: 'blur(10px)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', borderBottom: `1px solid ${C.border}` }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: C.text }}>🤖 AdminBot</div>
            <button onClick={() => setChatOpen(false)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 16, color: C.muted }}>×</button>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '12px 12px', display: 'flex', flexDirection: 'column', gap: 10, minHeight: 280 }}>
            {chatMessages.length === 0 && (
              <div style={{ color: C.muted, fontSize: 12, textAlign: 'center', paddingTop: 12 }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>👋</div>
                <div style={{ marginBottom: 14, lineHeight: 1.5 }}>Hi! I can help with admin tasks, revenue stats, restaurant approvals, and more.</div>
                <button
                  type="button"
                  onClick={() => sendChatMessage('Hi')}
                  disabled={chatLoading}
                  style={{
                    border: 'none',
                    borderRadius: 999,
                    padding: '10px 16px',
                    background: 'linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)',
                    color: 'white',
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: chatLoading ? 'not-allowed' : 'pointer',
                    opacity: chatLoading ? 0.7 : 1,
                    marginBottom: 12,
                  }}
                >
                  Start chatting
                </button>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center' }}>
                  {chatQuickReplies.map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      onClick={() => sendChatMessage(prompt)}
                      disabled={chatLoading}
                      style={{
                        border: `1px solid ${C.border}`,
                        borderRadius: 999,
                        padding: '6px 10px',
                        backgroundColor: 'white',
                        color: C.text,
                        fontSize: 11,
                        cursor: chatLoading ? 'not-allowed' : 'pointer',
                      }}
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {chatMessages.map(msg => (
              <div key={msg.id} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                <div style={{
                  maxWidth: '75%',
                  padding: '8px 12px',
                  borderRadius: 12,
                  backgroundColor: msg.role === 'user' ? C.primary : '#F3F4F6',
                  color: msg.role === 'user' ? 'white' : C.text,
                  fontSize: 12,
                  lineHeight: 1.4,
                  whiteSpace: 'pre-wrap',
                }}>
                  {msg.text}
                </div>
              </div>
            ))}
            {chatLoading && (
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <div style={{ padding: '8px 12px', borderRadius: 12, backgroundColor: '#F3F4F6', color: C.text, fontSize: 12 }}>
                  <div style={{ display: 'flex', gap: 4, alignItems: 'center', height: 16 }}>
                    <span style={{ animation: 'swiftPulse 1s infinite', animationDelay: '0s' }}>●</span>
                    <span style={{ animation: 'swiftPulse 1s infinite', animationDelay: '0.2s' }}>●</span>
                    <span style={{ animation: 'swiftPulse 1s infinite', animationDelay: '0.4s' }}>●</span>
                  </div>
                </div>
              </div>
            )}
            {chatError && (
              <div style={{ fontSize: 11, color: '#B45309', backgroundColor: '#FFFBEB', borderRadius: 10, padding: '8px 10px', lineHeight: 1.4 }}>
                {chatError}
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <div style={{ padding: '10px 12px', borderTop: `1px solid ${C.border}`, display: 'flex', gap: 6 }}>
            <input
              type="text"
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  sendChatMessage(chatInput)
                }
              }}
              placeholder="Ask about admin tasks..."
              disabled={chatLoading}
              style={{
                flex: 1,
                border: `1px solid ${C.border}`,
                borderRadius: 10,
                padding: '8px 10px',
                fontSize: 12,
                fontFamily: 'inherit',
                outline: 'none',
                backgroundColor: '#F9FAFB',
                color: C.text,
                opacity: chatLoading ? 0.6 : 1,
              }}
            />
            <button
              onClick={() => sendChatMessage(chatInput)}
              disabled={chatLoading || !chatInput.trim()}
              style={{
                width: 36,
                height: 36,
                border: 'none',
                borderRadius: 10,
                backgroundColor: C.primary,
                color: 'white',
                cursor: chatLoading || !chatInput.trim() ? 'not-allowed' : 'pointer',
                fontSize: 16,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: chatLoading || !chatInput.trim() ? 0.6 : 1,
              }}
            >
              ↑
            </button>
          </div>
        </div>
      )}
    </>
  )
}

// ── Root export ───────────────────────────────────────────────────────────────
export default function AdminPortal({ onSignOut }: { onSignOut: () => void }) {
  const [tab, setTab] = useState<AdminTab>('dashboard')
  const [restaurants, setRestaurants] = useState<AdminRestaurant[]>(ALL_RESTAURANTS)
  const [riders, setRiders] = useState<AdminRider[]>(INITIAL_RIDERS)
  const profiles = useDemoProfiles()
  const menuItems = [
    { label: 'Verification queue', description: 'Review submitted user profiles', icon: '✅', onSelect: () => setTab('verify') },
    { label: 'Settings', description: 'Platform preferences', icon: '⚙️', onSelect: () => window.alert('Settings are not configured in this demo yet.') },
    { label: 'Help Centre', description: 'Admin support and app help', icon: '🎧', onSelect: () => window.alert('Help Centre is a demo placeholder; support content is not configured yet.') },
    { label: 'Sign out', icon: '🚪', danger: true, onSelect: onSignOut },
  ]
  return (
    <div style={{ minHeight: '100vh' }}>
      {tab === 'dashboard'   && <Dashboard />}
      {tab === 'orders'      && <OrdersTab />}
      {tab === 'restaurants' && <RestaurantsTab restaurants={restaurants} setRestaurants={setRestaurants} />}
      {tab === 'riders'      && <RidersTab riders={riders} setRiders={setRiders} />}
      {tab === 'users'       && <UsersTab />}
      {tab === 'verify'      && <VerificationTab profiles={profiles} />}
      <AdminNav tab={tab} onTab={setTab} />
      <AdminChatbot />
      <HamburgerMenu role="Admin" items={menuItems} />
    </div>
  )
}
