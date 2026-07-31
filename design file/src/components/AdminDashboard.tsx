import { useState } from 'react'

type Section = 'overview' | 'restaurants' | 'users' | 'orders' | 'analytics' | 'payments' | 'settings'

const revenueData = [
  { month: 'Jan', value: 4820000 },
  { month: 'Feb', value: 5230000 },
  { month: 'Mar', value: 6110000 },
  { month: 'Apr', value: 5890000 },
  { month: 'May', value: 7340000 },
  { month: 'Jun', value: 8120000 },
  { month: 'Jul', value: 9640000 },
]
const maxRevenue = Math.max(...revenueData.map(d => d.value))

const restaurants = [
  { id: 1, name: 'Olive Garden Bistro', city: 'Bangalore', rating: 4.8, orders: 2341, revenue: 1284350, status: 'active' },
  { id: 2, name: 'The Burger Collective', city: 'Mumbai', rating: 4.6, orders: 1872, revenue: 831840, status: 'active' },
  { id: 3, name: 'Sakura Sushi House', city: 'Pune', rating: 4.9, orders: 987, revenue: 963690, status: 'pending' },
  { id: 4, name: 'Spice Route Kitchen', city: 'Delhi', rating: 4.5, orders: 3210, revenue: 1566480, status: 'active' },
  { id: 5, name: 'The Green Bowl', city: 'Chennai', rating: 4.3, orders: 654, revenue: 274680, status: 'suspended' },
]

const recentTransactions = [
  { id: 'TXN-84721', user: 'Priya Sharma', type: 'Order Payment', amount: 1725, date: 'Today 7:41 PM', status: 'success' },
  { id: 'TXN-84720', user: 'Olive Garden Bistro', type: 'Restaurant Payout', amount: 38450, date: 'Today 6:00 PM', status: 'success' },
  { id: 'TXN-84719', user: 'Arjun Sharma', type: 'Delivery Earning', amount: 1340, date: 'Today 5:30 PM', status: 'success' },
  { id: 'TXN-84718', user: 'Karan Patel', type: 'Refund', amount: 485, date: 'Today 3:15 PM', status: 'refund' },
]

const pendingApprovals = [
  { type: 'Restaurant', name: 'Sakura Sushi House', city: 'Pune', submitted: '2 days ago' },
  { type: 'Partner', name: 'Vikram Mehta', city: 'Bangalore', submitted: '1 day ago' },
  { type: 'Restaurant', name: 'The Healthy Hub', city: 'Mumbai', submitted: '3 hours ago' },
]

export default function AdminDashboard({ onBack }: { onBack: () => void }) {
  const [section, setSection] = useState<Section>('overview')
  const [collapsed, setCollapsed] = useState(false)

  const navItems: Array<{ key: Section; label: string; icon: string; badge?: number }> = [
    { key: 'overview', label: 'Overview', icon: 'M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z' },
    { key: 'restaurants', label: 'Restaurants', icon: 'M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z', badge: 3 },
    { key: 'users', label: 'Users', icon: 'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75' },
    { key: 'orders', label: 'Orders', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2' },
    { key: 'analytics', label: 'Analytics', icon: 'M18 20V10M12 20V4M6 20v-6' },
    { key: 'payments', label: 'Payments', icon: 'M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6' },
    { key: 'settings', label: 'Settings', icon: 'M12 15a3 3 0 100-6 3 3 0 000 6z' },
  ]

  const statusBadge = (s: string) => {
    if (s === 'active') return { bg: '#f0f4e8', color: '#6b7c2a', label: 'Active' }
    if (s === 'pending') return { bg: '#fef3c7', color: '#92400e', label: 'Pending' }
    if (s === 'suspended') return { bg: '#fee2e2', color: '#991b1b', label: 'Suspended' }
    if (s === 'success') return { bg: '#f0f4e8', color: '#6b7c2a', label: 'Success' }
    if (s === 'refund') return { bg: '#fee2e2', color: '#991b1b', label: 'Refund' }
    return { bg: '#f4f2ea', color: '#9ca3af', label: s }
  }

  return (
    <div className="min-h-screen flex" style={{ background: '#f4f2ea', fontFamily: 'Manrope, sans-serif' }}>
      {/* Sidebar */}
      <aside className="flex flex-col sticky top-0 h-screen overflow-y-auto transition-all" style={{ width: collapsed ? 72 : 240, background: '#1a1a16', flexShrink: 0 }}>
        <div className="p-4 flex items-center gap-3 border-b" style={{ borderColor: 'rgba(255,255,255,0.08)', minHeight: 64 }}>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#6b7c2a' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
          </div>
          {!collapsed && (
            <div>
              <p className="text-white font-bold text-sm leading-tight">SwiftBite</p>
              <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.4)' }}>Admin Console</p>
            </div>
          )}
          <button onClick={() => setCollapsed(!collapsed)} className="ml-auto" style={{ color: 'rgba(255,255,255,0.4)' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d={collapsed ? 'M9 18l6-6-6-6' : 'M15 18l-6-6 6-6'} />
            </svg>
          </button>
        </div>

        <nav className="flex-1 p-3">
          {navItems.map(item => (
            <button
              key={item.key}
              onClick={() => setSection(item.key)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1 text-left relative"
              style={{
                background: section === item.key ? 'rgba(107,124,42,0.25)' : 'transparent',
                color: section === item.key ? '#d0da9f' : 'rgba(255,255,255,0.55)',
              }}
              title={collapsed ? item.label : undefined}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
                <path d={item.icon} />
              </svg>
              {!collapsed && <span className="text-sm font-semibold">{item.label}</span>}
              {item.badge && !collapsed && (
                <span className="ml-auto badge text-xs" style={{ background: '#6b7c2a', color: 'white', padding: '2px 7px' }}>{item.badge}</span>
              )}
              {item.badge && collapsed && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full text-white text-[9px] font-bold flex items-center justify-center" style={{ background: '#6b7c2a' }}>{item.badge}</span>
              )}
            </button>
          ))}
        </nav>

        <div className="p-3 border-t" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
          <button onClick={onBack} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl" style={{ color: 'rgba(255,255,255,0.35)' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></svg>
            {!collapsed && <span className="text-sm">Exit Dashboard</span>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Top bar */}
        <header className="flex items-center justify-between px-6 py-4 sticky top-0 z-30" style={{ background: 'white', borderBottom: '1px solid #e8e4d4' }}>
          <div>
            <h1 className="font-bold text-xl" style={{ color: '#1a1a16', fontFamily: 'Fraunces, Georgia, serif' }}>
              {section === 'overview' && 'Platform Overview'}
              {section === 'restaurants' && 'Restaurant Management'}
              {section === 'users' && 'User Management'}
              {section === 'orders' && 'All Orders'}
              {section === 'analytics' && 'Analytics & Reports'}
              {section === 'payments' && 'Payments & Finance'}
              {section === 'settings' && 'System Settings'}
            </h1>
            <p className="text-xs mt-0.5" style={{ color: '#9ca3af' }}>July 31, 2026 · Last updated just now</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="w-9 h-9 rounded-xl flex items-center justify-center relative" style={{ background: '#f4f2ea' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6b7c2a" strokeWidth="2" strokeLinecap="round"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"/></svg>
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full text-white text-[9px] font-bold flex items-center justify-center" style={{ background: '#6b7c2a' }}>5</span>
            </button>
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: '#f4f2ea' }}>
              <div className="w-7 h-7 rounded-full overflow-hidden">
                <img src="https://images.unsplash.com/photo-1629407119384-d42320c3e576?w=40&h=40&fit=crop&auto=format" alt="Admin" className="w-full h-full object-cover" />
              </div>
              <span className="text-sm font-semibold" style={{ color: '#1a1a16' }}>Super Admin</span>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          {section === 'overview' && (
            <div className="animate-fade-in">
              {/* KPI row */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {[
                  { label: 'Total Revenue (MTD)', value: '₹9.64 Cr', change: '+18.2%', icon: '💰', color: '#6b7c2a' },
                  { label: 'Active Orders', value: '2,847', change: 'right now', icon: '📦', color: '#2d5016' },
                  { label: 'Registered Users', value: '2.41M', change: '+12,340 this week', icon: '👥', color: '#404a1a' },
                  { label: 'Active Restaurants', value: '12,483', change: '94 pending approval', icon: '🏪', color: '#556322' },
                ].map(stat => (
                  <div key={stat.label} className="rounded-2xl p-5 card-hover" style={{ background: 'white', border: '1px solid #e8e4d4' }}>
                    <div className="flex items-start justify-between mb-3">
                      <span className="text-2xl">{stat.icon}</span>
                      <span className="badge text-[11px]" style={{ background: '#f0f4e8', color: '#6b7c2a' }}>{stat.change}</span>
                    </div>
                    <p className="font-bold text-2xl" style={{ color: '#1a1a16' }}>{stat.value}</p>
                    <p className="text-xs mt-1" style={{ color: '#9ca3af' }}>{stat.label}</p>
                  </div>
                ))}
              </div>

              <div className="grid lg:grid-cols-3 gap-6">
                {/* Revenue Chart */}
                <div className="lg:col-span-2 rounded-2xl p-6" style={{ background: 'white', border: '1px solid #e8e4d4' }}>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold" style={{ color: '#1a1a16' }}>Revenue Trend</h3>
                    <span className="badge" style={{ background: '#f0f4e8', color: '#6b7c2a' }}>2026</span>
                  </div>
                  <div className="flex items-end gap-4 h-48">
                    {revenueData.map(d => (
                      <div key={d.month} className="flex flex-col items-center gap-2 flex-1">
                        <span className="text-xs font-bold" style={{ color: '#6b7c2a' }}>
                          ₹{(d.value / 100000).toFixed(1)}L
                        </span>
                        <div
                          className="w-full rounded-t-lg transition-all"
                          style={{
                            height: `${(d.value / maxRevenue) * 160}px`,
                            background: d.month === 'Jul' ? '#6b7c2a' : '#e8edcf',
                            minHeight: 8,
                          }}
                        />
                        <span className="text-xs" style={{ color: '#9ca3af' }}>{d.month}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pending Approvals */}
                <div className="rounded-2xl p-5" style={{ background: 'white', border: '1px solid #e8e4d4' }}>
                  <h3 className="font-bold mb-4" style={{ color: '#1a1a16' }}>Pending Approvals</h3>
                  {pendingApprovals.map((item, i) => (
                    <div key={i} className={`py-3 ${i < pendingApprovals.length - 1 ? 'border-b' : ''}`} style={{ borderColor: '#f4f2ea' }}>
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-semibold text-sm" style={{ color: '#1a1a16' }}>{item.name}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="badge text-[10px]" style={{ background: '#fef3c7', color: '#92400e' }}>{item.type}</span>
                            <span className="text-xs" style={{ color: '#9ca3af' }}>{item.city}</span>
                          </div>
                        </div>
                        <span className="text-xs" style={{ color: '#9ca3af' }}>{item.submitted}</span>
                      </div>
                      <div className="flex gap-2">
                        <button className="flex-1 text-xs py-1.5 rounded-lg font-semibold" style={{ background: '#f0f4e8', color: '#6b7c2a' }}>Approve</button>
                        <button className="flex-1 text-xs py-1.5 rounded-lg font-semibold" style={{ background: '#fee2e2', color: '#991b1b' }}>Reject</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Platform stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                {[
                  { label: 'Avg Delivery Time', value: '23 min', icon: '⚡' },
                  { label: 'Order Success Rate', value: '97.8%', icon: '✅' },
                  { label: 'Active Delivery Partners', value: '8,421', icon: '🛵' },
                  { label: 'Support Tickets', value: '142 open', icon: '🎫' },
                ].map(s => (
                  <div key={s.label} className="rounded-2xl p-4" style={{ background: 'white', border: '1px solid #e8e4d4' }}>
                    <span className="text-xl">{s.icon}</span>
                    <p className="font-bold mt-2" style={{ color: '#1a1a16' }}>{s.value}</p>
                    <p className="text-xs mt-0.5" style={{ color: '#9ca3af' }}>{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {section === 'restaurants' && (
            <div className="animate-fade-in">
              <div className="flex items-center gap-3 mb-4">
                <input className="input-field max-w-xs" placeholder="Search restaurants..." />
                <select className="input-field max-w-40" style={{ width: 'auto' }}>
                  <option>All Status</option>
                  <option>Active</option>
                  <option>Pending</option>
                  <option>Suspended</option>
                </select>
              </div>

              <div className="rounded-2xl overflow-hidden" style={{ background: 'white', border: '1px solid #e8e4d4' }}>
                <table className="w-full">
                  <thead>
                    <tr style={{ borderBottom: '1px solid #f4f2ea' }}>
                      {['Restaurant', 'City', 'Rating', 'Orders', 'Revenue', 'Status', 'Action'].map(h => (
                        <th key={h} className="px-4 py-3.5 text-left text-xs font-bold" style={{ color: '#9ca3af' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {restaurants.map((r, i) => {
                      const sc = statusBadge(r.status)
                      return (
                        <tr key={r.id} className={i < restaurants.length - 1 ? 'border-b' : ''} style={{ borderColor: '#f4f2ea' }}>
                          <td className="px-4 py-3.5">
                            <p className="font-semibold text-sm" style={{ color: '#1a1a16' }}>{r.name}</p>
                          </td>
                          <td className="px-4 py-3.5 text-sm" style={{ color: '#6b7a5a' }}>{r.city}</td>
                          <td className="px-4 py-3.5">
                            <span className="text-sm font-semibold" style={{ color: '#6b7c2a' }}>★ {r.rating}</span>
                          </td>
                          <td className="px-4 py-3.5 text-sm" style={{ color: '#6b7a5a' }}>{r.orders.toLocaleString()}</td>
                          <td className="px-4 py-3.5 text-sm font-semibold" style={{ color: '#1a1a16' }}>₹{(r.revenue / 100000).toFixed(2)}L</td>
                          <td className="px-4 py-3.5">
                            <span className="badge" style={{ background: sc.bg, color: sc.color, fontSize: '0.7rem' }}>{sc.label}</span>
                          </td>
                          <td className="px-4 py-3.5">
                            <button className="text-xs font-semibold" style={{ color: '#6b7c2a' }}>View →</button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>

                {/* Pagination */}
                <div className="flex items-center justify-between px-4 py-3.5 border-t" style={{ borderColor: '#f4f2ea' }}>
                  <span className="text-sm" style={{ color: '#9ca3af' }}>Showing 1–5 of 12,483</span>
                  <div className="flex gap-1">
                    {[1, 2, 3, '...', 124].map((p, i) => (
                      <button key={i} className="w-8 h-8 rounded-lg text-xs font-semibold" style={{ background: p === 1 ? '#6b7c2a' : '#f4f2ea', color: p === 1 ? 'white' : '#6b7a5a' }}>
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {section === 'users' && (
            <div className="animate-fade-in">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {[
                  { label: 'Total Customers', value: '2.41M', icon: '👤' },
                  { label: 'Restaurant Partners', value: '12,483', icon: '🏪' },
                  { label: 'Delivery Partners', value: '34,912', icon: '🛵' },
                  { label: 'New This Week', value: '12,340', icon: '📈' },
                ].map(s => (
                  <div key={s.label} className="rounded-2xl p-4" style={{ background: 'white', border: '1px solid #e8e4d4' }}>
                    <span className="text-2xl">{s.icon}</span>
                    <p className="font-bold text-xl mt-2" style={{ color: '#1a1a16' }}>{s.value}</p>
                    <p className="text-xs mt-0.5" style={{ color: '#9ca3af' }}>{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Recent users table */}
              <div className="rounded-2xl overflow-hidden" style={{ background: 'white', border: '1px solid #e8e4d4' }}>
                <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: '#f4f2ea' }}>
                  <h3 className="font-bold" style={{ color: '#1a1a16' }}>Recent Registrations</h3>
                  <input className="input-field max-w-56 py-2 text-sm" placeholder="Search users..." />
                </div>
                {[
                  { name: 'Priya Sharma', email: 'priya@email.com', type: 'Customer', city: 'Bangalore', joined: 'Today 9:12 AM', status: 'active' },
                  { name: 'Karan Patel', email: 'karan@email.com', type: 'Customer', city: 'Mumbai', joined: 'Today 8:34 AM', status: 'active' },
                  { name: 'Arjun Sharma', email: 'arjun@email.com', type: 'Delivery Partner', city: 'Bangalore', joined: 'Yesterday', status: 'active' },
                  { name: 'Sneha Roy', email: 'sneha@email.com', type: 'Customer', city: 'Delhi', joined: 'Yesterday', status: 'active' },
                ].map((user, i) => {
                  const sc = statusBadge(user.status)
                  return (
                    <div key={i} className={`flex items-center gap-4 px-4 py-3.5 ${i < 3 ? 'border-b' : ''}`} style={{ borderColor: '#f4f2ea' }}>
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm" style={{ background: '#f0f4e8', color: '#6b7c2a' }}>
                        {user.name[0]}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-sm" style={{ color: '#1a1a16' }}>{user.name}</p>
                        <p className="text-xs" style={{ color: '#9ca3af' }}>{user.email}</p>
                      </div>
                      <span className="badge text-xs" style={{ background: '#f0f4e8', color: '#6b7c2a' }}>{user.type}</span>
                      <span className="text-xs hidden md:block" style={{ color: '#9ca3af' }}>{user.city}</span>
                      <span className="text-xs hidden md:block" style={{ color: '#9ca3af' }}>{user.joined}</span>
                      <span className="badge" style={{ background: sc.bg, color: sc.color, fontSize: '0.7rem' }}>{sc.label}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {section === 'orders' && (
            <div className="animate-fade-in">
              <div className="grid grid-cols-4 gap-4 mb-6">
                {[
                  { label: 'Total Orders Today', value: '18,492' },
                  { label: 'In Progress', value: '2,847' },
                  { label: 'Completed', value: '15,312' },
                  { label: 'Cancelled', value: '333' },
                ].map(s => (
                  <div key={s.label} className="rounded-2xl p-4" style={{ background: 'white', border: '1px solid #e8e4d4' }}>
                    <p className="font-bold text-2xl" style={{ color: '#1a1a16' }}>{s.value}</p>
                    <p className="text-xs mt-1" style={{ color: '#9ca3af' }}>{s.label}</p>
                  </div>
                ))}
              </div>

              <div className="rounded-2xl overflow-hidden" style={{ background: 'white', border: '1px solid #e8e4d4' }}>
                <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: '#f4f2ea' }}>
                  <h3 className="font-bold" style={{ color: '#1a1a16' }}>Live Orders</h3>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full animate-pulse-soft" style={{ background: '#22c55e' }} />
                    <span className="text-xs font-medium" style={{ color: '#22c55e' }}>Auto-refreshing</span>
                  </div>
                </div>
                {[
                  { id: 'ORD-29481', customer: 'Priya Sharma', restaurant: 'Olive Garden Bistro', driver: 'Arjun Sharma', amount: 1725, status: 'delivering', eta: '8 min' },
                  { id: 'ORD-29480', customer: 'Karan Patel', restaurant: 'The Burger Collective', driver: 'Ravi Kumar', amount: 1085, status: 'preparing', eta: '22 min' },
                  { id: 'ORD-29479', customer: 'Sneha Roy', restaurant: 'Sakura Sushi House', driver: 'Pradeep S.', amount: 2340, status: 'picked_up', eta: '14 min' },
                ].map((order, i) => {
                  const stMap: Record<string, { bg: string; color: string; label: string }> = {
                    preparing: { bg: '#dbeafe', color: '#1e40af', label: 'Preparing' },
                    picked_up: { bg: '#fef3c7', color: '#92400e', label: 'Picked Up' },
                    delivering: { bg: '#f0f4e8', color: '#6b7c2a', label: 'Out for Delivery' },
                  }
                  const sc = stMap[order.status]
                  return (
                    <div key={i} className={`flex items-center gap-4 px-4 py-4 ${i < 2 ? 'border-b' : ''}`} style={{ borderColor: '#f4f2ea' }}>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-sm" style={{ color: '#1a1a16' }}>#{order.id}</span>
                          <span className="badge" style={{ background: sc.bg, color: sc.color, fontSize: '0.68rem' }}>{sc.label}</span>
                        </div>
                        <p className="text-xs" style={{ color: '#9ca3af' }}>{order.customer} → {order.restaurant}</p>
                      </div>
                      <div className="text-right hidden md:block">
                        <p className="text-xs font-semibold" style={{ color: '#1a1a16' }}>{order.driver}</p>
                        <p className="text-xs" style={{ color: '#9ca3af' }}>ETA: {order.eta}</p>
                      </div>
                      <p className="font-bold" style={{ color: '#1a1a16' }}>₹{order.amount.toLocaleString()}</p>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {section === 'analytics' && (
            <div className="animate-fade-in">
              <div className="rounded-2xl p-6 mb-6" style={{ background: 'white', border: '1px solid #e8e4d4' }}>
                <h3 className="font-bold mb-6" style={{ color: '#1a1a16' }}>Monthly Revenue (2026)</h3>
                <div className="flex items-end gap-4 h-56">
                  {revenueData.map(d => (
                    <div key={d.month} className="flex flex-col items-center gap-2 flex-1">
                      <span className="text-xs font-bold" style={{ color: '#6b7c2a' }}>₹{(d.value / 100000).toFixed(1)}L</span>
                      <div
                        className="w-full rounded-t-xl transition-all"
                        style={{
                          height: `${(d.value / maxRevenue) * 180}px`,
                          background: d.month === 'Jul' ? 'linear-gradient(180deg, #6b7c2a 0%, #2d5016 100%)' : '#e8edcf',
                          minHeight: 8,
                        }}
                      />
                      <span className="text-xs font-medium" style={{ color: '#9ca3af' }}>{d.month}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="rounded-2xl p-6" style={{ background: 'white', border: '1px solid #e8e4d4' }}>
                  <h3 className="font-bold mb-4" style={{ color: '#1a1a16' }}>Top Cities by Revenue</h3>
                  {[
                    { city: 'Bangalore', revenue: '₹2.84 Cr', share: 29 },
                    { city: 'Mumbai', revenue: '₹2.41 Cr', share: 25 },
                    { city: 'Delhi', revenue: '₹1.93 Cr', share: 20 },
                    { city: 'Pune', revenue: '₹1.35 Cr', share: 14 },
                    { city: 'Chennai', revenue: '₹1.11 Cr', share: 12 },
                  ].map(item => (
                    <div key={item.city} className="mb-3">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium" style={{ color: '#1a1a16' }}>{item.city}</span>
                        <span className="text-sm font-semibold" style={{ color: '#6b7c2a' }}>{item.revenue}</span>
                      </div>
                      <div className="h-2 rounded-full" style={{ background: '#f0f4e8' }}>
                        <div className="h-2 rounded-full" style={{ width: `${item.share}%`, background: '#6b7c2a' }} />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="rounded-2xl p-6" style={{ background: 'white', border: '1px solid #e8e4d4' }}>
                  <h3 className="font-bold mb-4" style={{ color: '#1a1a16' }}>Category Performance</h3>
                  {[
                    { cat: 'North Indian', orders: 48200, share: 82 },
                    { cat: 'Fast Food', orders: 35100, share: 60 },
                    { cat: 'Chinese', orders: 28400, share: 48 },
                    { cat: 'Italian', orders: 18900, share: 32 },
                    { cat: 'Desserts', orders: 12300, share: 21 },
                  ].map(item => (
                    <div key={item.cat} className="mb-3">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium" style={{ color: '#1a1a16' }}>{item.cat}</span>
                        <span className="text-sm font-semibold" style={{ color: '#6b7c2a' }}>{item.orders.toLocaleString()} orders</span>
                      </div>
                      <div className="h-2 rounded-full" style={{ background: '#f0f4e8' }}>
                        <div className="h-2 rounded-full" style={{ width: `${item.share}%`, background: item.share > 60 ? '#6b7c2a' : '#b3c26a' }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {section === 'payments' && (
            <div className="animate-fade-in">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {[
                  { label: 'Total GMV (MTD)', value: '₹9.64 Cr', icon: '💰' },
                  { label: 'Platform Revenue', value: '₹96.4 L', icon: '📈' },
                  { label: 'Pending Payouts', value: '₹14.2 L', icon: '⏳' },
                  { label: 'Disputes Open', value: '23', icon: '⚠️' },
                ].map(s => (
                  <div key={s.label} className="rounded-2xl p-4" style={{ background: 'white', border: '1px solid #e8e4d4' }}>
                    <span className="text-2xl">{s.icon}</span>
                    <p className="font-bold text-xl mt-2" style={{ color: '#1a1a16' }}>{s.value}</p>
                    <p className="text-xs mt-0.5" style={{ color: '#9ca3af' }}>{s.label}</p>
                  </div>
                ))}
              </div>

              <div className="rounded-2xl overflow-hidden" style={{ background: 'white', border: '1px solid #e8e4d4' }}>
                <div className="p-4 border-b" style={{ borderColor: '#f4f2ea' }}>
                  <h3 className="font-bold" style={{ color: '#1a1a16' }}>Recent Transactions</h3>
                </div>
                {recentTransactions.map((txn, i) => {
                  const sc = statusBadge(txn.status)
                  return (
                    <div key={txn.id} className={`flex items-center gap-4 px-4 py-4 ${i < recentTransactions.length - 1 ? 'border-b' : ''}`} style={{ borderColor: '#f4f2ea' }}>
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#f0f4e8' }}>
                        <span className="text-sm">{txn.type === 'Refund' ? '↩️' : '₹'}</span>
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-sm" style={{ color: '#1a1a16' }}>{txn.user}</p>
                        <p className="text-xs" style={{ color: '#9ca3af' }}>{txn.type} · {txn.date}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold" style={{ color: txn.status === 'refund' ? '#ef4444' : '#1a1a16' }}>
                          {txn.status === 'refund' ? '-' : ''}₹{txn.amount.toLocaleString()}
                        </p>
                        <span className="badge" style={{ background: sc.bg, color: sc.color, fontSize: '0.68rem' }}>{sc.label}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {section === 'settings' && (
            <div className="animate-fade-in max-w-2xl">
              <div className="grid gap-6">
                {[
                  { section: 'Platform', fields: [
                    { label: 'Platform Name', value: 'SwiftBite' },
                    { label: 'Support Email', value: 'support@swiftbite.com' },
                    { label: 'Platform Fee (%)', value: '10' },
                  ]},
                  { section: 'Delivery', fields: [
                    { label: 'Base Delivery Fee (₹)', value: '25' },
                    { label: 'Max Delivery Radius (km)', value: '15' },
                    { label: 'Partner Earning per km (₹)', value: '8' },
                  ]},
                ].map(group => (
                  <div key={group.section} className="rounded-2xl p-6" style={{ background: 'white', border: '1px solid #e8e4d4' }}>
                    <h3 className="font-bold mb-4" style={{ color: '#1a1a16' }}>{group.section} Settings</h3>
                    {group.fields.map(f => (
                      <div key={f.label} className="mb-4">
                        <label className="block text-sm font-semibold mb-1.5" style={{ color: '#6b7a5a' }}>{f.label}</label>
                        <input className="input-field" defaultValue={f.value} />
                      </div>
                    ))}
                    <button className="btn-primary py-2.5 px-6 text-sm">Save {group.section} Settings</button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
