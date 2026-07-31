import { useState } from 'react'

type Screen = 'dashboard' | 'orders' | 'menu' | 'analytics' | 'settings'

const incomingOrders = [
  { id: 'ORD-2847', customer: 'Priya Sharma', items: ['Truffle Mushroom Risotto ×1', 'Grilled Salmon ×2'], total: 1725, time: '2 min ago', status: 'new', address: '42 Green Ave, Indiranagar' },
  { id: 'ORD-2846', customer: 'Karan Patel', items: ['Margherita Pizza ×2', 'Classic Burger ×1'], total: 1085, time: '8 min ago', status: 'preparing', address: '15 MG Road, Koramangala' },
  { id: 'ORD-2845', customer: 'Sneha Roy', items: ['Truffle Mushroom Risotto ×1'], total: 485, time: '15 min ago', status: 'ready', address: '7 Church St, Richmond Town' },
]

const menuItems = [
  { id: 1, name: 'Truffle Mushroom Risotto', category: 'Mains', price: 485, available: true, orders: 234 },
  { id: 2, name: 'Grilled Salmon Fillet', category: 'Mains', price: 620, available: true, orders: 187 },
  { id: 3, name: 'Margherita Pizza', category: 'Pizza', price: 345, available: false, orders: 312 },
  { id: 4, name: 'Classic Beef Burger', category: 'Burgers', price: 395, available: true, orders: 156 },
  { id: 5, name: 'Chocolate Lava Cake', category: 'Desserts', price: 195, available: true, orders: 98 },
]

const weekData = [
  { day: 'Mon', orders: 34, revenue: 18450 },
  { day: 'Tue', orders: 42, revenue: 23100 },
  { day: 'Wed', orders: 38, revenue: 20800 },
  { day: 'Thu', orders: 56, revenue: 30800 },
  { day: 'Fri', orders: 71, revenue: 39000 },
  { day: 'Sat', orders: 89, revenue: 48900 },
  { day: 'Sun', orders: 63, revenue: 34650 },
]

const maxOrders = Math.max(...weekData.map(d => d.orders))

export default function RestaurantApp({ onBack }: { onBack: () => void }) {
  const [screen, setScreen] = useState<Screen>('dashboard')
  const [orders, setOrders] = useState(incomingOrders)
  const [items, setItems] = useState(menuItems)
  const [open, setOpen] = useState(true)

  const updateStatus = (id: string, status: string) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o))
  }

  const toggleItem = (id: number) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, available: !i.available } : i))
  }

  const statusColor = (s: string) => {
    if (s === 'new') return { bg: '#fef3c7', color: '#92400e', label: 'New Order' }
    if (s === 'preparing') return { bg: '#dbeafe', color: '#1e40af', label: 'Preparing' }
    if (s === 'ready') return { bg: '#f0f4e8', color: '#6b7c2a', label: 'Ready' }
    return { bg: '#f4f2ea', color: '#9ca3af', label: s }
  }

  return (
    <div className="min-h-screen flex" style={{ background: '#f4f2ea', fontFamily: 'Manrope, sans-serif' }}>
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-60 min-h-screen sticky top-0" style={{ background: '#1a1a16', color: 'white' }}>
        <div className="p-6 border-b" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: '#6b7c2a' }}>
              <span className="text-white font-bold text-sm">OG</span>
            </div>
            <div>
              <p className="font-bold text-sm">Olive Garden Bistro</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className="w-2 h-2 rounded-full" style={{ background: open ? '#22c55e' : '#ef4444' }} />
                <span className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>{open ? 'Open' : 'Closed'}</span>
              </div>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4">
          {([
            { screen: 'dashboard', label: 'Dashboard', icon: 'M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z' },
            { screen: 'orders', label: 'Orders', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2', badge: orders.filter(o => o.status === 'new').length },
            { screen: 'menu', label: 'Menu', icon: 'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5' },
            { screen: 'analytics', label: 'Analytics', icon: 'M18 20V10M12 20V4M6 20v-6' },
            { screen: 'settings', label: 'Settings', icon: 'M12 15a3 3 0 100-6 3 3 0 000 6zM19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z' },
          ] as Array<{ screen: Screen; label: string; icon: string; badge?: number }>).map(item => (
            <button
              key={item.screen}
              onClick={() => setScreen(item.screen)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1 text-left"
              style={{ background: screen === item.screen ? 'rgba(107,124,42,0.3)' : 'transparent', color: screen === item.screen ? '#d0da9f' : 'rgba(255,255,255,0.6)' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d={item.icon} />
              </svg>
              <span className="text-sm font-semibold">{item.label}</span>
              {item.badge ? (
                <span className="ml-auto badge text-xs" style={{ background: '#6b7c2a', color: 'white', padding: '2px 8px' }}>{item.badge}</span>
              ) : null}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
          <button onClick={onBack} className="w-full flex items-center gap-2 text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></svg>
            Exit Portal
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="flex items-center justify-between px-6 py-4 sticky top-0 z-30" style={{ background: 'white', borderBottom: '1px solid #e8e4d4' }}>
          <div>
            <h1 className="font-bold text-lg" style={{ color: '#1a1a16' }}>
              {screen === 'dashboard' && 'Dashboard'}
              {screen === 'orders' && 'Live Orders'}
              {screen === 'menu' && 'Menu Management'}
              {screen === 'analytics' && 'Analytics'}
              {screen === 'settings' && 'Settings'}
            </h1>
            <p className="text-xs mt-0.5" style={{ color: '#9ca3af' }}>Olive Garden Bistro · Koramangala, Bangalore</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium" style={{ color: open ? '#22c55e' : '#ef4444' }}>{open ? 'Open' : 'Closed'}</span>
              <button
                onClick={() => setOpen(!open)}
                className="w-12 h-6 rounded-full relative transition-colors"
                style={{ background: open ? '#6b7c2a' : '#e8e4d4' }}
              >
                <div className="w-4 h-4 bg-white rounded-full absolute top-1 transition-all" style={{ left: open ? '28px' : '4px', boxShadow: '0 1px 4px rgba(0,0,0,0.2)' }} />
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          {screen === 'dashboard' && (
            <div className="animate-fade-in">
              {/* KPI Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {[
                  { label: "Today's Revenue", value: '₹34,650', change: '+12.4%', up: true, icon: '💰' },
                  { label: 'Total Orders', value: '63', change: '+8 from yesterday', up: true, icon: '📦' },
                  { label: 'Avg Order Value', value: '₹549', change: '+₹34', up: true, icon: '📊' },
                  { label: 'Customer Rating', value: '4.8★', change: '342 reviews', up: true, icon: '⭐' },
                ].map(stat => (
                  <div key={stat.label} className="rounded-2xl p-5" style={{ background: 'white', border: '1px solid #e8e4d4' }}>
                    <div className="text-2xl mb-3">{stat.icon}</div>
                    <p className="font-bold text-xl" style={{ color: '#1a1a16' }}>{stat.value}</p>
                    <p className="text-xs mt-0.5" style={{ color: '#9ca3af' }}>{stat.label}</p>
                    <span className="badge mt-2 text-[11px]" style={{ background: '#f0f4e8', color: '#6b7c2a' }}>{stat.change}</span>
                  </div>
                ))}
              </div>

              {/* Recent orders */}
              <div className="rounded-2xl overflow-hidden" style={{ background: 'white', border: '1px solid #e8e4d4' }}>
                <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: '#f4f2ea' }}>
                  <h3 className="font-bold" style={{ color: '#1a1a16' }}>Recent Orders</h3>
                  <button className="text-sm font-semibold" style={{ color: '#6b7c2a' }} onClick={() => setScreen('orders')}>View all →</button>
                </div>
                {orders.slice(0, 3).map((order, i) => {
                  const sc = statusColor(order.status)
                  return (
                    <div key={order.id} className={`flex items-center justify-between p-5 ${i < 2 ? 'border-b' : ''}`} style={{ borderColor: '#f4f2ea' }}>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-sm" style={{ color: '#1a1a16' }}>#{order.id}</span>
                          <span className="badge" style={{ background: sc.bg, color: sc.color, fontSize: '0.7rem' }}>{sc.label}</span>
                        </div>
                        <p className="text-xs" style={{ color: '#9ca3af' }}>{order.customer} · {order.time}</p>
                      </div>
                      <span className="font-bold" style={{ color: '#1a1a16' }}>₹{order.total.toLocaleString()}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {screen === 'orders' && (
            <div className="animate-fade-in grid gap-4">
              {orders.map(order => {
                const sc = statusColor(order.status)
                return (
                  <div key={order.id} className="rounded-2xl p-5" style={{ background: 'white', border: '1px solid #e8e4d4' }}>
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold" style={{ color: '#1a1a16' }}>#{order.id}</span>
                          <span className="badge" style={{ background: sc.bg, color: sc.color, fontSize: '0.7rem' }}>{sc.label}</span>
                        </div>
                        <p className="text-sm mt-0.5" style={{ color: '#9ca3af' }}>{order.customer} · {order.time}</p>
                      </div>
                      <span className="font-bold text-lg" style={{ color: '#1a1a16' }}>₹{order.total.toLocaleString()}</span>
                    </div>
                    <div className="mb-3">
                      {order.items.map(item => (
                        <p key={item} className="text-sm" style={{ color: '#6b7a5a' }}>• {item}</p>
                      ))}
                    </div>
                    <p className="text-xs mb-4" style={{ color: '#9ca3af' }}>📍 {order.address}</p>
                    <div className="flex gap-2">
                      {order.status === 'new' && (
                        <>
                          <button onClick={() => updateStatus(order.id, 'preparing')} className="btn-primary flex-1 py-2.5 text-sm">Accept Order</button>
                          <button onClick={() => updateStatus(order.id, 'rejected')} className="btn-secondary flex-1 py-2.5 text-sm" style={{ color: '#ef4444', borderColor: '#fca5a5' }}>Reject</button>
                        </>
                      )}
                      {order.status === 'preparing' && (
                        <button onClick={() => updateStatus(order.id, 'ready')} className="btn-primary flex-1 py-2.5 text-sm">Mark as Ready</button>
                      )}
                      {order.status === 'ready' && (
                        <div className="flex-1 py-2.5 text-sm text-center rounded-xl font-semibold" style={{ background: '#f0f4e8', color: '#6b7c2a' }}>Waiting for pickup...</div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {screen === 'menu' && (
            <div className="animate-fade-in">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm" style={{ color: '#9ca3af' }}>{items.filter(i => i.available).length} of {items.length} items available</p>
                <button className="btn-primary py-2.5 text-sm">+ Add Item</button>
              </div>
              <div className="rounded-2xl overflow-hidden" style={{ background: 'white', border: '1px solid #e8e4d4' }}>
                {items.map((item, i) => (
                  <div key={item.id} className={`flex items-center gap-4 p-4 ${i < items.length - 1 ? 'border-b' : ''}`} style={{ borderColor: '#f4f2ea' }}>
                    <div className="flex-1">
                      <p className="font-semibold text-sm" style={{ color: '#1a1a16' }}>{item.name}</p>
                      <div className="flex items-center gap-3 mt-0.5">
                        <span className="text-xs" style={{ color: '#9ca3af' }}>{item.category}</span>
                        <span className="text-xs font-semibold" style={{ color: '#6b7c2a' }}>₹{item.price}</span>
                        <span className="text-xs" style={{ color: '#9ca3af' }}>{item.orders} orders</span>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleItem(item.id)}
                      className="w-12 h-6 rounded-full relative transition-colors"
                      style={{ background: item.available ? '#6b7c2a' : '#e8e4d4' }}
                    >
                      <div className="w-4 h-4 bg-white rounded-full absolute top-1 transition-all" style={{ left: item.available ? '28px' : '4px', boxShadow: '0 1px 4px rgba(0,0,0,0.2)' }} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {screen === 'analytics' && (
            <div className="animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {[
                  { label: 'Weekly Revenue', value: '₹2,15,700', sub: 'This week' },
                  { label: 'Total Orders', value: '393', sub: 'This week' },
                  { label: 'Avg Rating', value: '4.8 ★', sub: '1,247 reviews' },
                ].map(s => (
                  <div key={s.label} className="rounded-2xl p-5" style={{ background: 'white', border: '1px solid #e8e4d4' }}>
                    <p className="text-sm" style={{ color: '#9ca3af' }}>{s.label}</p>
                    <p className="font-bold text-2xl mt-1" style={{ color: '#1a1a16' }}>{s.value}</p>
                    <p className="text-xs mt-0.5" style={{ color: '#6b7c2a' }}>{s.sub}</p>
                  </div>
                ))}
              </div>

              {/* Bar chart */}
              <div className="rounded-2xl p-6" style={{ background: 'white', border: '1px solid #e8e4d4' }}>
                <h3 className="font-bold mb-6" style={{ color: '#1a1a16' }}>Orders This Week</h3>
                <div className="flex items-end gap-3 h-40">
                  {weekData.map(d => (
                    <div key={d.day} className="flex flex-col items-center gap-2 flex-1">
                      <span className="text-xs font-bold" style={{ color: '#6b7c2a' }}>{d.orders}</span>
                      <div
                        className="w-full rounded-t-lg transition-all"
                        style={{
                          height: `${(d.orders / maxOrders) * 120}px`,
                          background: d.day === 'Sat' ? '#6b7c2a' : '#e8edcf',
                          minHeight: 8,
                        }}
                      />
                      <span className="text-xs" style={{ color: '#9ca3af' }}>{d.day}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {screen === 'settings' && (
            <div className="animate-fade-in max-w-xl">
              {[
                { label: 'Restaurant Name', value: 'Olive Garden Bistro', type: 'text' },
                { label: 'Phone', value: '+91 98765 43210', type: 'text' },
                { label: 'Address', value: '45 Koramangala 5th Block, Bangalore', type: 'text' },
                { label: 'Delivery Radius', value: '5 km', type: 'text' },
              ].map(f => (
                <div key={f.label} className="mb-4">
                  <label className="block text-sm font-semibold mb-1.5" style={{ color: '#6b7a5a' }}>{f.label}</label>
                  <input className="input-field" defaultValue={f.value} />
                </div>
              ))}
              <button className="btn-primary py-3 px-8">Save Changes</button>
            </div>
          )}
        </main>

        {/* Mobile bottom nav */}
        <nav className="md:hidden bottom-nav">
          {([
            { screen: 'dashboard', label: 'Home' },
            { screen: 'orders', label: 'Orders' },
            { screen: 'menu', label: 'Menu' },
            { screen: 'analytics', label: 'Stats' },
            { screen: 'settings', label: 'Settings' },
          ] as Array<{ screen: Screen; label: string }>).map(item => (
            <button key={item.screen} onClick={() => setScreen(item.screen)} className="flex flex-col items-center gap-1">
              <div className="w-8 h-1 rounded-full" style={{ background: screen === item.screen ? '#6b7c2a' : 'transparent' }} />
              <span className="text-xs font-semibold" style={{ color: screen === item.screen ? '#6b7c2a' : '#9ca3af' }}>{item.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </div>
  )
}
