import { useState } from 'react'

const C = {
  primary: '#EA580C',
  primaryLight: '#FFF7ED',
  primaryBorder: '#FED7AA',
  text: '#1F2937',
  muted: '#6B7280',
  subtle: '#9CA3AF',
  border: '#E5E7EB',
  surface: '#FFFFFF',
  bg: '#FFFBF7',
  green: '#16A34A',
  greenLight: '#F0FDF4',
  red: '#E23744',
  redLight: '#FFF5F5',
  blue: '#2563EB',
  blueLight: '#EFF6FF',
}

type RestaurantTab = 'dashboard' | 'orders' | 'menu' | 'analytics'

const INCOMING_ORDERS = [
  { id: 'SWB-20848', customer: 'Priya Sharma', items: ['Classic Smash Burger ×2', 'Truffle Fries ×1'], total: '$31.97', time: '3:08 PM', status: 'New', avatar: '👩' },
  { id: 'SWB-20849', customer: 'Marcus Lee',   items: ['Crispy Chicken Sandwich ×1', 'Double Cheese ×1'], total: '$26.98', time: '3:05 PM', status: 'Preparing', avatar: '👨' },
  { id: 'SWB-20845', customer: 'Emma Wilson',  items: ['Garden Impossible Burger ×1', 'Fries ×2'], total: '$25.97', time: '3:00 PM', status: 'Ready', avatar: '👩' },
  { id: 'SWB-20843', customer: 'David Kim',    items: ['Classic Smash Burger ×1'], total: '$12.99', time: '2:55 PM', status: 'Delivered', avatar: '👦' },
]

const MENU_ITEMS = [
  { id: 1, name: 'Classic Smash Burger',      price: '$12.99', category: 'Burgers',  orders: 234, active: true,  image: '🍔' },
  { id: 2, name: 'Double Cheese Deluxe',       price: '$14.99', category: 'Burgers',  orders: 189, active: true,  image: '🍔' },
  { id: 3, name: 'Crispy Chicken Sandwich',    price: '$11.99', category: 'Burgers',  orders: 145, active: true,  image: '🥪' },
  { id: 4, name: 'Truffle Parmesan Fries',     price: '$5.99',  category: 'Sides',    orders: 312, active: true,  image: '🍟' },
  { id: 5, name: 'Garden Impossible Burger',   price: '$13.99', category: 'Burgers',  orders: 98,  active: false, image: '🌿' },
  { id: 6, name: 'Classic Chocolate Shake',    price: '$6.49',  category: 'Drinks',   orders: 176, active: true,  image: '🥤' },
]

const REVIEWS = [
  { customer: 'Alex Johnson',   rating: 5, text: 'Best smash burger in the city! Crispy edges, juicy inside. Will order again.', time: '2 hours ago' },
  { customer: 'Priya Sharma',   rating: 5, text: 'Fries were incredibly fresh. Delivery was super fast too!', time: '5 hours ago' },
  { customer: 'Marcus Lee',     rating: 4, text: 'Great food overall. Chicken sandwich was a bit salty but still delicious.', time: '1 day ago' },
]

const STATUS_STYLE: Record<string, { color: string; bg: string }> = {
  'New':       { color: '#D97706', bg: '#FFFBEB' },
  'Preparing': { color: C.blue,    bg: C.blueLight },
  'Ready':     { color: C.green,   bg: C.greenLight },
  'Delivered': { color: C.muted,   bg: '#F9FAFB' },
}

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_STYLE[status] || { color: C.muted, bg: '#F9FAFB' }
  return <span style={{ fontSize: 10, fontWeight: 700, color: s.color, backgroundColor: s.bg, padding: '4px 8px', borderRadius: 6 }}>{status}</span>
}

function RestaurantNav({ tab, onTab, newOrders }: { tab: RestaurantTab; onTab: (t: RestaurantTab) => void; newOrders: number }) {
  const tabs: { id: RestaurantTab; label: string; icon: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'orders',    label: 'Orders',    icon: '🧾' },
    { id: 'menu',      label: 'Menu',      icon: '🍽️' },
    { id: 'analytics', label: 'Analytics', icon: '📈' },
  ]
  return (
    <nav style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 430, backgroundColor: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', borderTop: `1px solid rgba(229,231,235,0.9)`, padding: '10px 0 calc(18px + env(safe-area-inset-bottom))', display: 'flex', justifyContent: 'space-around', zIndex: 100, boxShadow: '0 -12px 32px rgba(15,23,42,0.08)' }}>
      {tabs.map(t => (
        <button key={t.id} onClick={() => onTab(t.id)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, background: 'none', border: 'none', cursor: 'pointer', padding: '0 16px', position: 'relative' }}>
          <span style={{ fontSize: 20 }}>{t.icon}</span>
          <span style={{ fontSize: 10, fontWeight: tab === t.id ? 700 : 500, color: tab === t.id ? C.primary : C.muted }}>{t.label}</span>
          {tab === t.id && <div style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: C.primary }} />}
          {t.id === 'orders' && newOrders > 0 && (
            <div style={{ position: 'absolute', top: -2, right: 8, width: 16, height: 16, backgroundColor: C.red, borderRadius: '50%', border: '2px solid white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, color: 'white' }}>{newOrders}</div>
          )}
        </button>
      ))}
    </nav>
  )
}

// ── Dashboard ─────────────────────────────────────────────────────────────────
function RestaurantDashboard({ onGoToOrders }: { onGoToOrders: () => void }) {
  const [isOpen, setIsOpen] = useState(true)

  return (
    <div style={{ backgroundColor: C.bg, minHeight: '100vh', paddingBottom: 100 }}>
      <div style={{ background: `linear-gradient(135deg, ${C.primary} 0%, #C2410C 100%)`, padding: '56px 20px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
          <div>
            <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13, margin: '0 0 2px', fontWeight: 500 }}>Restaurant Console</p>
            <h1 style={{ color: 'white', fontSize: 22, fontWeight: 800, margin: 0, letterSpacing: -0.4 }}>The Burger Lab</h1>
          </div>
          <button onClick={() => setIsOpen(!isOpen)} style={{ display: 'flex', alignItems: 'center', gap: 8, backgroundColor: isOpen ? 'rgba(74,222,128,0.2)' : 'rgba(255,255,255,0.15)', border: `1.5px solid ${isOpen ? '#4ADE80' : 'rgba(255,255,255,0.3)'}`, borderRadius: 100, padding: '8px 14px', cursor: 'pointer' }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: isOpen ? '#4ADE80' : '#9CA3AF' }} />
            <span style={{ color: 'white', fontSize: 13, fontWeight: 700 }}>{isOpen ? 'Open' : 'Closed'}</span>
          </button>
        </div>
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, margin: '0 0 20px' }}>Thursday, July 31 · Closes at 11:00 PM</p>

        <div style={{ display: 'flex', gap: 10 }}>
          {[
            { label: "Today's Orders", value: '23', icon: '📦' },
            { label: "Today's Revenue", value: '$892', icon: '💰' },
            { label: 'Pending', value: '3', icon: '⏳' },
          ].map(s => (
            <div key={s.label} style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 14, padding: '10px 8px', textAlign: 'center' }}>
              <span style={{ fontSize: 18 }}>{s.icon}</span>
              <p style={{ color: 'white', fontSize: 18, fontWeight: 800, margin: '4px 0 2px', letterSpacing: -0.3 }}>{s.value}</p>
              <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 9, margin: 0 }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Pending orders alert */}
      <div style={{ padding: '16px 20px 0' }}>
        <button onClick={onGoToOrders} style={{ width: '100%', backgroundColor: '#FFFBEB', border: '1.5px solid #FDE68A', borderRadius: 16, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', textAlign: 'left' }}>
          <div style={{ width: 40, height: 40, backgroundColor: '#FEF3C7', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>🔔</div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#92400E', margin: '0 0 2px' }}>3 new orders waiting!</p>
            <p style={{ fontSize: 12, color: '#D97706', margin: 0 }}>Tap to view and accept</p>
          </div>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      </div>

      {/* Recent orders */}
      <div style={{ padding: '16px 20px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: C.text, margin: 0 }}>Recent Orders</h3>
          <button onClick={onGoToOrders} style={{ color: C.primary, fontSize: 13, fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}>See all</button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {INCOMING_ORDERS.slice(0, 3).map(o => (
            <div key={o.id} style={{ backgroundColor: C.surface, borderRadius: 16, padding: '14px 16px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <div style={{ width: 40, height: 40, backgroundColor: C.primaryLight, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>{o.avatar}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: C.text, margin: 0 }}>{o.customer}</p>
                  <StatusBadge status={o.status} />
                </div>
                <p style={{ fontSize: 11, color: C.muted, margin: '0 0 2px', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{o.items[0]}{o.items.length > 1 ? ` +${o.items.length - 1} more` : ''}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 11, color: C.subtle }}>{o.time}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{o.total}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top dishes */}
      <div style={{ padding: '16px 20px' }}>
        <h3 style={{ fontSize: 16, fontWeight: 800, color: C.text, margin: '0 0 12px' }}>Today's Top Dishes</h3>
        <div style={{ backgroundColor: C.surface, borderRadius: 18, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          {MENU_ITEMS.filter(i => i.active).slice(0, 4).map((item, i) => (
            <div key={item.id}>
              <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 32, height: 32, backgroundColor: C.primaryLight, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>{item.image}</div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: C.text, margin: '0 0 2px' }}>{item.name}</p>
                  <p style={{ fontSize: 11, color: C.muted, margin: 0 }}>{item.orders} orders · {item.price}</p>
                </div>
                <div style={{ height: 4, width: 60, backgroundColor: '#F3F4F6', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${(item.orders / 312) * 100}%`, backgroundColor: C.primary, borderRadius: 2 }} />
                </div>
              </div>
              {i < 3 && <div style={{ height: 1, backgroundColor: '#F3F4F6', margin: '0 16px' }} />}
            </div>
          ))}
        </div>
      </div>

      {/* Reviews */}
      <div style={{ padding: '0 20px 16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: C.text, margin: 0 }}>Recent Reviews</h3>
          <div style={{ backgroundColor: C.primaryLight, padding: '4px 10px', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ fontSize: 12, fontWeight: 800, color: C.primary }}>4.8</span>
            <span style={{ fontSize: 14 }}>⭐</span>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {REVIEWS.map(r => (
            <div key={r.customer} style={{ backgroundColor: C.surface, borderRadius: 16, padding: '14px 16px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: C.text, margin: 0 }}>{r.customer}</p>
                <div style={{ display: 'flex', gap: 2 }}>{'⭐'.repeat(r.rating)}</div>
              </div>
              <p style={{ fontSize: 12, color: C.muted, margin: '0 0 6px', lineHeight: 1.5 }}>{r.text}</p>
              <p style={{ fontSize: 11, color: C.subtle, margin: 0 }}>{r.time}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Orders Management ─────────────────────────────────────────────────────────
function OrdersTab() {
  const [orders, setOrders] = useState(INCOMING_ORDERS)
  const [filter, setFilter] = useState('All')
  const filters = ['All', 'New', 'Preparing', 'Ready', 'Delivered']

  const updateStatus = (id: string, status: string) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o))
  }

  const shown = filter === 'All' ? orders : orders.filter(o => o.status === filter)

  return (
    <div style={{ backgroundColor: C.bg, minHeight: '100vh', paddingBottom: 100 }}>
      <div style={{ background: `linear-gradient(135deg, ${C.primary} 0%, #C2410C 100%)`, padding: '56px 20px 16px' }}>
        <h1 style={{ color: 'white', fontSize: 22, fontWeight: 800, margin: '0 0 4px', letterSpacing: -0.4 }}>Order Management</h1>
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, margin: 0 }}>{orders.filter(o => o.status === 'New').length} new orders pending</p>
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
      <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {shown.map(o => (
          <div key={o.id} style={{ backgroundColor: C.surface, borderRadius: 18, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', border: o.status === 'New' ? `1.5px solid #FDE68A` : `1.5px solid ${C.border}` }}>
            <div style={{ padding: '14px 16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 18 }}>{o.avatar}</span>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 700, color: C.text, margin: '0 0 1px' }}>{o.customer}</p>
                    <p style={{ fontSize: 11, color: C.muted, margin: 0, fontFamily: 'monospace' }}>{o.id} · {o.time}</p>
                  </div>
                </div>
                <StatusBadge status={o.status} />
              </div>
              <div style={{ backgroundColor: '#F9FAFB', borderRadius: 10, padding: '10px 12px', marginBottom: 10 }}>
                {o.items.map((item, i) => (
                  <p key={i} style={{ fontSize: 12, color: C.text, margin: i < o.items.length - 1 ? '0 0 4px' : 0, fontWeight: 500 }}>· {item}</p>
                ))}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 16, fontWeight: 800, color: C.text }}>{o.total}</span>
                {o.status === 'New' && (
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => updateStatus(o.id, 'Preparing')} style={{ padding: '8px 16px', backgroundColor: C.primary, color: 'white', border: 'none', borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>✓ Accept</button>
                    <button onClick={() => updateStatus(o.id, 'Delivered')} style={{ padding: '8px 12px', backgroundColor: C.redLight, color: C.red, border: `1px solid #FECDD3`, borderRadius: 10, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Reject</button>
                  </div>
                )}
                {o.status === 'Preparing' && (
                  <button onClick={() => updateStatus(o.id, 'Ready')} style={{ padding: '8px 16px', backgroundColor: C.greenLight, color: C.green, border: `1px solid #BBF7D0`, borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>Mark Ready</button>
                )}
                {o.status === 'Ready' && (
                  <span style={{ fontSize: 12, color: C.muted, fontWeight: 500 }}>Waiting for delivery partner…</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Menu Management ───────────────────────────────────────────────────────────
function MenuTab() {
  const [items, setItems] = useState(MENU_ITEMS)
  const [filter, setFilter] = useState('All')
  const cats = ['All', 'Burgers', 'Sides', 'Drinks']

  const toggle = (id: number) => setItems(prev => prev.map(i => i.id === id ? { ...i, active: !i.active } : i))
  const shown = filter === 'All' ? items : items.filter(i => i.category === filter)

  return (
    <div style={{ backgroundColor: C.bg, minHeight: '100vh', paddingBottom: 100 }}>
      <div style={{ background: `linear-gradient(135deg, ${C.primary} 0%, #C2410C 100%)`, padding: '56px 20px 16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ color: 'white', fontSize: 22, fontWeight: 800, margin: '0 0 4px', letterSpacing: -0.4 }}>Menu</h1>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, margin: 0 }}>{items.filter(i => i.active).length} active · {items.filter(i => !i.active).length} unavailable</p>
          </div>
          <button style={{ backgroundColor: 'rgba(255,255,255,0.15)', border: '1.5px solid rgba(255,255,255,0.3)', borderRadius: 12, padding: '8px 14px', color: 'white', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
            + Add Item
          </button>
        </div>
      </div>
      <div style={{ backgroundColor: 'white', padding: '12px 20px', borderBottom: `1px solid ${C.border}` }}>
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', scrollbarWidth: 'none' }}>
          {cats.map(c => (
            <button key={c} onClick={() => setFilter(c)} style={{ flex: '0 0 auto', padding: '7px 14px', backgroundColor: filter === c ? C.primary : 'white', color: filter === c ? 'white' : C.muted, border: `1.5px solid ${filter === c ? C.primary : C.border}`, borderRadius: 100, fontSize: 12, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>
              {c}
            </button>
          ))}
        </div>
      </div>
      <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {shown.map(item => (
          <div key={item.id} style={{ backgroundColor: C.surface, borderRadius: 18, padding: '14px 16px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', opacity: item.active ? 1 : 0.6 }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <div style={{ width: 48, height: 48, backgroundColor: C.primaryLight, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>{item.image}</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 2 }}>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 700, color: C.text, margin: '0 0 2px' }}>{item.name}</p>
                    <p style={{ fontSize: 12, color: C.muted, margin: 0 }}>{item.category} · {item.orders} orders today</p>
                  </div>
                  <p style={{ fontSize: 15, fontWeight: 800, color: C.primary, margin: 0 }}>{item.price}</p>
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
              <div style={{ display: 'flex', gap: 8 }}>
                <button style={{ padding: '6px 14px', backgroundColor: C.primaryLight, color: C.primary, border: `1px solid ${C.primaryBorder}`, borderRadius: 8, fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>Edit</button>
              </div>
              {/* Toggle switch */}
              <button onClick={() => toggle(item.id)} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', cursor: 'pointer' }}>
                <span style={{ fontSize: 12, color: C.muted, fontWeight: 500 }}>{item.active ? 'Available' : 'Unavailable'}</span>
                <div style={{ width: 44, height: 24, borderRadius: 12, backgroundColor: item.active ? C.primary : '#D1D5DB', position: 'relative', transition: 'background 0.25s', flexShrink: 0 }}>
                  <div style={{ width: 18, height: 18, borderRadius: '50%', backgroundColor: 'white', position: 'absolute', top: 3, left: item.active ? 23 : 3, transition: 'left 0.25s', boxShadow: '0 1px 4px rgba(0,0,0,0.2)' }} />
                </div>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Analytics ─────────────────────────────────────────────────────────────────
function AnalyticsTab() {
  const weekData = [42, 67, 55, 80, 73, 92, 68]
  const weekLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const maxVal = Math.max(...weekData)

  return (
    <div style={{ backgroundColor: C.bg, minHeight: '100vh', paddingBottom: 100 }}>
      <div style={{ background: `linear-gradient(135deg, ${C.primary} 0%, #C2410C 100%)`, padding: '56px 20px 20px' }}>
        <h1 style={{ color: 'white', fontSize: 22, fontWeight: 800, margin: '0 0 4px', letterSpacing: -0.4 }}>Analytics</h1>
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, margin: 0 }}>The Burger Lab · July 2026</p>
      </div>

      <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* Revenue chart */}
        <div style={{ backgroundColor: C.surface, borderRadius: 18, padding: 18, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: C.text, margin: 0 }}>Orders This Week</h3>
            <span style={{ fontSize: 12, fontWeight: 700, color: C.primary, backgroundColor: C.primaryLight, padding: '4px 10px', borderRadius: 8 }}>477 total</span>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', height: 80 }}>
            {weekData.map((v, i) => (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <div style={{ width: '100%', height: 60, display: 'flex', alignItems: 'flex-end', backgroundColor: C.primaryLight, borderRadius: 6, overflow: 'hidden' }}>
                  <div style={{ width: '100%', height: `${(v / maxVal) * 100}%`, backgroundColor: i === 5 ? C.primary : '#FDBA74', borderRadius: 6, transition: 'height 0.5s' }} />
                </div>
                <span style={{ fontSize: 9, color: C.muted, fontWeight: 600 }}>{weekLabels[i]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* KPIs */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {[
            { label: 'Monthly Revenue', value: '$18,420', delta: '+14%', icon: '💰', positive: true },
            { label: 'Avg Order Value', value: '$22.40', delta: '+8%', icon: '🧾', positive: true },
            { label: 'Repeat Customers', value: '68%', delta: '+5%', icon: '💛', positive: true },
            { label: 'Avg Prep Time', value: '12 min', delta: '-2 min', icon: '⏱️', positive: true },
          ].map(s => (
            <div key={s.label} style={{ backgroundColor: C.surface, borderRadius: 16, padding: 14, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <span style={{ fontSize: 20 }}>{s.icon}</span>
                <span style={{ fontSize: 10, fontWeight: 700, color: s.positive ? C.green : C.red, backgroundColor: s.positive ? C.greenLight : C.redLight, padding: '2px 6px', borderRadius: 6 }}>{s.delta}</span>
              </div>
              <p style={{ fontSize: 19, fontWeight: 800, color: C.primary, margin: '0 0 3px', letterSpacing: -0.4 }}>{s.value}</p>
              <p style={{ fontSize: 11, color: C.muted, margin: 0 }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Top items */}
        <div style={{ backgroundColor: C.surface, borderRadius: 18, padding: 18, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: C.text, margin: '0 0 14px' }}>Top Performing Items</h3>
          {MENU_ITEMS.sort((a, b) => b.orders - a.orders).slice(0, 4).map((item, i) => (
            <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: i < 3 ? 12 : 0 }}>
              <span style={{ fontSize: 13, fontWeight: 800, color: C.subtle, width: 16, textAlign: 'center' }}>#{i + 1}</span>
              <span style={{ fontSize: 16 }}>{item.image}</span>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: C.text, margin: '0 0 4px' }}>{item.name}</p>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <div style={{ flex: 1, height: 4, backgroundColor: '#F3F4F6', borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${(item.orders / 312) * 100}%`, backgroundColor: i === 0 ? C.primary : '#FDBA74', borderRadius: 2 }} />
                  </div>
                  <span style={{ fontSize: 11, color: C.muted, fontWeight: 600, whiteSpace: 'nowrap' }}>{item.orders}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Root export ───────────────────────────────────────────────────────────────
export default function RestaurantPortal() {
  const [tab, setTab] = useState<RestaurantTab>('dashboard')
  const newOrders = INCOMING_ORDERS.filter(o => o.status === 'New').length
  return (
    <div style={{ minHeight: '100vh' }}>
      {tab === 'dashboard' && <RestaurantDashboard onGoToOrders={() => setTab('orders')} />}
      {tab === 'orders'    && <OrdersTab />}
      {tab === 'menu'      && <MenuTab />}
      {tab === 'analytics' && <AnalyticsTab />}
      <RestaurantNav tab={tab} onTab={setTab} newOrders={newOrders} />
    </div>
  )
}
