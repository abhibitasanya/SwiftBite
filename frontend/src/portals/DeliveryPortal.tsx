import { useState, useEffect } from 'react'

const C = {
  primary: '#2563EB',
  primaryLight: '#EFF6FF',
  primaryBorder: '#BFDBFE',
  text: '#1F2937',
  muted: '#6B7280',
  subtle: '#9CA3AF',
  border: '#E5E7EB',
  surface: '#FFFFFF',
  bg: '#F0F7FF',
  green: '#16A34A',
  greenLight: '#F0FDF4',
  red: '#E23744',
  redLight: '#FFF5F5',
  orange: '#EA580C',
  orangeLight: '#FFF7ED',
}

type DeliveryTab = 'home' | 'orders' | 'earnings' | 'profile'

const AVAILABLE_ORDERS = [
  { id: 'SWB-20848', restaurant: 'The Burger Lab', customer: 'Priya Sharma', address: '45 Oak Avenue, Apt 2', distance: '0.8 km', payout: '$4.50', items: 2, eta: '12 min', urgent: true },
  { id: 'SWB-20849', restaurant: 'Pizza Piazza',   customer: 'Marcus Lee',   address: '12 Park Street, #3A', distance: '1.4 km', payout: '$5.20', items: 3, eta: '18 min', urgent: false },
  { id: 'SWB-20850', restaurant: 'Spice Route',    customer: 'Emma Wilson',  address: '88 Elm Road',        distance: '2.1 km', payout: '$6.80', items: 4, eta: '25 min', urgent: false },
]

const DELIVERY_HISTORY = [
  { id: 'SWB-20847', restaurant: 'The Burger Lab', customer: 'Alex Johnson', payout: '$4.20', time: '2:58 PM', rating: 5 },
  { id: 'SWB-20831', restaurant: 'Sakura Garden',  customer: 'Sofia Martinez', payout: '$5.60', time: '1:45 PM', rating: 5 },
  { id: 'SWB-20820', restaurant: 'Green Bowl',     customer: 'David Kim',    payout: '$6.10', time: '12:30 PM', rating: 4 },
  { id: 'SWB-20811', restaurant: 'Wok & Roll',     customer: 'James Park',   payout: '$3.90', time: '11:15 AM', rating: 5 },
  { id: 'SWB-20803', restaurant: 'Pizza Piazza',   customer: 'Lily Chen',    payout: '$4.80', time: '10:02 AM', rating: 5 },
]

function DeliveryNav({ tab, onTab }: { tab: DeliveryTab; onTab: (t: DeliveryTab) => void }) {
  const tabs: { id: DeliveryTab; label: string; icon: string }[] = [
    { id: 'home',     label: 'Home',     icon: '🏠' },
    { id: 'orders',   label: 'Orders',   icon: '📦' },
    { id: 'earnings', label: 'Earnings', icon: '💰' },
    { id: 'profile',  label: 'Profile',  icon: '👤' },
  ]
  return (
    <nav style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 430, backgroundColor: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', borderTop: `1px solid rgba(229,231,235,0.9)`, padding: '10px 0 calc(18px + env(safe-area-inset-bottom))', display: 'flex', justifyContent: 'space-around', zIndex: 100, boxShadow: '0 -12px 32px rgba(15,23,42,0.08)' }}>
      {tabs.map(t => (
        <button key={t.id} onClick={() => onTab(t.id)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, background: 'none', border: 'none', cursor: 'pointer', padding: '0 16px' }}>
          <span style={{ fontSize: 20 }}>{t.icon}</span>
          <span style={{ fontSize: 10, fontWeight: tab === t.id ? 700 : 500, color: tab === t.id ? C.primary : C.muted }}>{t.label}</span>
          {tab === t.id && <div style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: C.primary }} />}
        </button>
      ))}
    </nav>
  )
}

// ── Home ──────────────────────────────────────────────────────────────────────
function DeliveryHome({ onGoToOrders }: { onGoToOrders: () => void }) {
  const [isOnline, setIsOnline] = useState(true)
  const [activeStep, setActiveStep] = useState(1)

  useEffect(() => {
    if (isOnline) {
      const t = setInterval(() => setActiveStep(s => s < 3 ? s + 1 : 1), 3000)
      return () => clearInterval(t)
    }
  }, [isOnline])

  return (
    <div style={{ backgroundColor: C.bg, minHeight: '100vh', paddingBottom: 100 }}>
      {/* Header */}
      <div style={{ background: `linear-gradient(135deg, ${C.primary} 0%, #1D4ED8 100%)`, padding: '56px 20px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <img src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=80&h=80&fit=crop" alt="Marcus" style={{ width: 48, height: 48, borderRadius: 16, objectFit: 'cover', border: '2px solid rgba(255,255,255,0.3)' }} />
            <div>
              <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 12, margin: '0 0 2px' }}>Delivery Partner</p>
              <h1 style={{ color: 'white', fontSize: 20, fontWeight: 800, margin: 0, letterSpacing: -0.3 }}>Marcus Chen</h1>
            </div>
          </div>
          {/* Online toggle */}
          <button
            onClick={() => setIsOnline(!isOnline)}
            style={{ display: 'flex', alignItems: 'center', gap: 8, backgroundColor: isOnline ? 'rgba(74,222,128,0.2)' : 'rgba(255,255,255,0.15)', border: `1.5px solid ${isOnline ? '#4ADE80' : 'rgba(255,255,255,0.3)'}`, borderRadius: 100, padding: '8px 14px', cursor: 'pointer' }}
          >
            <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: isOnline ? '#4ADE80' : '#9CA3AF' }} />
            <span style={{ color: 'white', fontSize: 13, fontWeight: 700 }}>{isOnline ? 'Online' : 'Offline'}</span>
          </button>
        </div>

        {/* Today stats */}
        <div style={{ display: 'flex', gap: 10 }}>
          {[
            { label: "Today's Deliveries", value: '8', icon: '🛵' },
            { label: "Today's Earnings", value: '$127.50', icon: '💰' },
            { label: 'Rating', value: '4.9★', icon: '⭐' },
          ].map(s => (
            <div key={s.label} style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 14, padding: '10px 8px', textAlign: 'center' }}>
              <span style={{ fontSize: 16 }}>{s.icon}</span>
              <p style={{ color: 'white', fontSize: 16, fontWeight: 800, margin: '4px 0 2px', letterSpacing: -0.3 }}>{s.value}</p>
              <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 9, margin: 0, fontWeight: 500 }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {isOnline ? (
        <>
          {/* Active delivery */}
          <div style={{ padding: '16px 20px 0' }}>
            <div style={{ backgroundColor: C.surface, borderRadius: 20, overflow: 'hidden', boxShadow: '0 4px 16px rgba(37,99,235,0.15)', border: `1.5px solid ${C.primaryBorder}` }}>
              <div style={{ backgroundColor: C.primaryLight, padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 8, height: 8, backgroundColor: C.primary, borderRadius: '50%' }} />
                  <span style={{ fontSize: 12, fontWeight: 700, color: C.primary }}>Active Delivery · SWB-20847</span>
                </div>
                <span style={{ fontSize: 11, color: C.muted, fontWeight: 500 }}>ETA 8 min</span>
              </div>

              {/* Map placeholder */}
              <div style={{ height: 140, background: 'linear-gradient(135deg, #DBEAFE 0%, #EDE9FE 100%)', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.2 }} viewBox="0 0 430 140" fill="none">
                  {[28, 56, 84, 112].map(y => <line key={y} x1="0" y1={y} x2="430" y2={y} stroke="#6B7280" strokeWidth="1"/>)}
                  {[70, 140, 210, 280, 350].map(x => <line key={x} x1={x} y1="0" x2={x} y2="140" stroke="#6B7280" strokeWidth="1"/>)}
                </svg>
                <div className="animate-swift-bounce" style={{ fontSize: 36, zIndex: 1 }}>🛵</div>
                <div style={{ position: 'absolute', right: 40, fontSize: 24 }}>📍</div>
              </div>

              {/* Steps */}
              <div style={{ padding: '14px 16px' }}>
                {[
                  { step: 1, label: 'Head to restaurant', sub: 'The Burger Lab · 0.3 km away', icon: '🍔' },
                  { step: 2, label: 'Pick up order', sub: '#SWB-20847 · 1 item', icon: '📦' },
                  { step: 3, label: 'Deliver to customer', sub: 'Alex Johnson · 123 Main St', icon: '🏠' },
                ].map(s => (
                  <div key={s.step} style={{ display: 'flex', gap: 12, marginBottom: s.step < 3 ? 0 : 0 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <div style={{ width: 28, height: 28, borderRadius: '50%', backgroundColor: activeStep >= s.step ? C.primary : '#F3F4F6', border: `2px solid ${activeStep >= s.step ? C.primary : C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, transition: 'all 0.5s', flexShrink: 0 }}>
                        {activeStep > s.step ? <span style={{ color: 'white', fontWeight: 700 }}>✓</span> : <span style={{ fontSize: 12 }}>{s.icon}</span>}
                      </div>
                      {s.step < 3 && <div style={{ width: 2, height: 24, backgroundColor: activeStep > s.step ? C.primary : C.border, transition: 'background 0.5s' }} />}
                    </div>
                    <div style={{ paddingBottom: s.step < 3 ? 16 : 0, paddingTop: 4 }}>
                      <p style={{ fontSize: 13, fontWeight: 700, color: activeStep >= s.step ? C.text : C.subtle, margin: '0 0 2px', transition: 'color 0.5s' }}>{s.label}</p>
                      <p style={{ fontSize: 11, color: C.muted, margin: 0 }}>{s.sub}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ padding: '0 16px 16px', display: 'flex', gap: 8 }}>
                <button style={{ flex: 1, padding: '12px', backgroundColor: C.primary, color: 'white', border: 'none', borderRadius: 12, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>Mark Picked Up</button>
                <button style={{ width: 44, padding: '12px', backgroundColor: C.primaryLight, border: `1.5px solid ${C.primaryBorder}`, borderRadius: 12, fontSize: 18, cursor: 'pointer' }}>📞</button>
              </div>
            </div>
          </div>

          {/* Available orders */}
          <div style={{ padding: '16px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: C.text, margin: 0 }}>Available Orders</h3>
              <button onClick={onGoToOrders} style={{ color: C.primary, fontSize: 13, fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}>See all</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {AVAILABLE_ORDERS.slice(0, 2).map(o => (
                <div key={o.id} style={{ backgroundColor: C.surface, borderRadius: 16, padding: '14px 16px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', border: o.urgent ? `1.5px solid #FDE68A` : 'none' }}>
                  {o.urgent && <div style={{ fontSize: 10, fontWeight: 700, color: '#D97706', backgroundColor: '#FFFBEB', padding: '2px 8px', borderRadius: 6, display: 'inline-block', marginBottom: 8 }}>⚡ URGENT</div>}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 700, color: C.text, margin: '0 0 2px' }}>{o.restaurant}</p>
                      <p style={{ fontSize: 12, color: C.muted, margin: 0 }}>{o.distance} · {o.items} items · {o.eta} est.</p>
                    </div>
                    <span style={{ fontSize: 18, fontWeight: 800, color: C.primary }}>{o.payout}</span>
                  </div>
                  <button style={{ width: '100%', padding: '10px', backgroundColor: C.primary, color: 'white', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>Accept Order</button>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div style={{ padding: '60px 40px', textAlign: 'center' }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>💤</div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: C.text, margin: '0 0 8px' }}>You're offline</h2>
          <p style={{ fontSize: 14, color: C.muted, margin: '0 0 24px', lineHeight: 1.6 }}>Go online to start receiving delivery requests in your area</p>
          <button onClick={() => setIsOnline(true)} style={{ padding: '14px 32px', backgroundColor: C.primary, color: 'white', border: 'none', borderRadius: 14, fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>Go Online</button>
        </div>
      )}
    </div>
  )
}

// ── Available Orders ──────────────────────────────────────────────────────────
function AvailableOrdersTab() {
  return (
    <div style={{ backgroundColor: C.bg, minHeight: '100vh', paddingBottom: 100 }}>
      <div style={{ background: `linear-gradient(135deg, ${C.primary} 0%, #1D4ED8 100%)`, padding: '56px 20px 20px' }}>
        <h1 style={{ color: 'white', fontSize: 22, fontWeight: 800, margin: '0 0 4px', letterSpacing: -0.4 }}>Available Orders</h1>
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, margin: 0 }}>{AVAILABLE_ORDERS.length} orders near you</p>
      </div>
      <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {AVAILABLE_ORDERS.map(o => (
          <div key={o.id} style={{ backgroundColor: C.surface, borderRadius: 18, padding: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', border: o.urgent ? `1.5px solid #FDE68A` : `1.5px solid ${C.border}` }}>
            {o.urgent && <div style={{ fontSize: 10, fontWeight: 700, color: '#D97706', backgroundColor: '#FFFBEB', padding: '3px 10px', borderRadius: 6, display: 'inline-block', marginBottom: 10 }}>⚡ URGENT ORDER</div>}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
              <div>
                <p style={{ fontSize: 15, fontWeight: 700, color: C.text, margin: '0 0 2px' }}>{o.restaurant}</p>
                <p style={{ fontSize: 12, color: C.muted, margin: '0 0 2px' }}>To: {o.customer}</p>
                <p style={{ fontSize: 12, color: C.muted, margin: 0 }}>{o.address}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: 20, fontWeight: 800, color: C.primary, margin: '0 0 2px' }}>{o.payout}</p>
                <p style={{ fontSize: 11, color: C.muted, margin: 0 }}>{o.distance} · {o.eta}</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button style={{ flex: 1, padding: '12px', backgroundColor: C.primary, color: 'white', border: 'none', borderRadius: 12, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>✓ Accept</button>
              <button style={{ flex: 1, padding: '12px', backgroundColor: '#F9FAFB', color: C.muted, border: `1.5px solid ${C.border}`, borderRadius: 12, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Skip</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Earnings ──────────────────────────────────────────────────────────────────
function EarningsTab() {
  const weekData = [18, 34, 22, 45, 38, 52, 28]
  const weekLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const maxVal = Math.max(...weekData)

  return (
    <div style={{ backgroundColor: C.bg, minHeight: '100vh', paddingBottom: 100 }}>
      <div style={{ background: `linear-gradient(135deg, ${C.primary} 0%, #1D4ED8 100%)`, padding: '56px 20px 24px' }}>
        <h1 style={{ color: 'white', fontSize: 22, fontWeight: 800, margin: '0 0 4px', letterSpacing: -0.4 }}>My Earnings</h1>
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, margin: '0 0 20px' }}>July 2026</p>
        <div style={{ backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 20, padding: 20 }}>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13, margin: '0 0 6px', fontWeight: 500 }}>This Week's Total</p>
          <p style={{ color: 'white', fontSize: 36, fontWeight: 800, margin: '0 0 4px', letterSpacing: -1 }}>$742.30</p>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, margin: 0 }}>47 deliveries · avg $15.79/hr</p>
        </div>
      </div>

      <div style={{ padding: '16px 20px' }}>
        {/* Weekly chart */}
        <div style={{ backgroundColor: C.surface, borderRadius: 18, padding: 18, marginBottom: 14, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: C.text, margin: '0 0 16px' }}>Daily Earnings This Week</h3>
          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', height: 80 }}>
            {weekData.map((v, i) => (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <div style={{ width: '100%', height: 60, display: 'flex', alignItems: 'flex-end', backgroundColor: C.primaryLight, borderRadius: 6, overflow: 'hidden' }}>
                  <div style={{ width: '100%', height: `${(v / maxVal) * 100}%`, backgroundColor: i === 5 ? C.primary : '#93C5FD', borderRadius: 6, transition: 'height 0.5s' }} />
                </div>
                <span style={{ fontSize: 9, color: C.muted, fontWeight: 600 }}>{weekLabels[i]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
          {[
            { label: 'Deliveries', value: '47', icon: '🛵' },
            { label: 'Online Hours', value: '31 hrs', icon: '⏱️' },
            { label: 'Avg per Delivery', value: '$15.79', icon: '💵' },
            { label: 'Customer Rating', value: '4.9 ★', icon: '⭐' },
          ].map(s => (
            <div key={s.label} style={{ backgroundColor: C.surface, borderRadius: 16, padding: 14, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
              <span style={{ fontSize: 20 }}>{s.icon}</span>
              <p style={{ fontSize: 18, fontWeight: 800, color: C.primary, margin: '6px 0 2px' }}>{s.value}</p>
              <p style={{ fontSize: 11, color: C.muted, margin: 0 }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* History */}
        <h3 style={{ fontSize: 16, fontWeight: 800, color: C.text, margin: '0 0 12px' }}>Today's Deliveries</h3>
        <div style={{ backgroundColor: C.surface, borderRadius: 18, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          {DELIVERY_HISTORY.map((d, i) => (
            <div key={d.id}>
              <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 36, height: 36, backgroundColor: C.primaryLight, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>🛵</div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: C.text, margin: '0 0 2px' }}>{d.restaurant}</p>
                  <p style={{ fontSize: 11, color: C.muted, margin: 0 }}>{d.customer} · {d.time} · {'⭐'.repeat(d.rating)}</p>
                </div>
                <span style={{ fontSize: 15, fontWeight: 800, color: C.primary }}>{d.payout}</span>
              </div>
              {i < DELIVERY_HISTORY.length - 1 && <div style={{ height: 1, backgroundColor: '#F3F4F6', margin: '0 16px' }} />}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Delivery Profile ──────────────────────────────────────────────────────────
function DeliveryProfile() {
  return (
    <div style={{ backgroundColor: C.bg, minHeight: '100vh', paddingBottom: 100 }}>
      <div style={{ background: `linear-gradient(135deg, ${C.primary} 0%, #1D4ED8 100%)`, padding: '56px 20px 28px' }}>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 16 }}>
          <img src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=160&h=160&fit=crop" alt="Marcus" style={{ width: 72, height: 72, borderRadius: 22, objectFit: 'cover', border: '3px solid rgba(255,255,255,0.3)' }} />
          <div>
            <h2 style={{ color: 'white', fontSize: 20, fontWeight: 800, margin: '0 0 4px' }}>Marcus Chen</h2>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, margin: '0 0 6px' }}>Delivery Partner · ID #DP-2041</p>
            <div style={{ backgroundColor: 'rgba(74,222,128,0.2)', border: '1px solid #4ADE80', borderRadius: 8, padding: '3px 10px', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 6, height: 6, backgroundColor: '#4ADE80', borderRadius: '50%' }} />
              <span style={{ color: 'white', fontSize: 11, fontWeight: 700 }}>Verified Partner</span>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          {[{ v: '4.9★', l: 'Rating' }, { v: '847', l: 'Total Deliveries' }, { v: '98%', l: 'Acceptance' }].map(s => (
            <div key={s.l} style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 12, padding: '10px 8px', textAlign: 'center' }}>
              <p style={{ color: 'white', fontSize: 16, fontWeight: 800, margin: '0 0 2px' }}>{s.v}</p>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 9, margin: 0 }}>{s.l}</p>
            </div>
          ))}
        </div>
      </div>
      <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {[
          { icon: '🏍️', label: 'My Vehicle', sub: 'Honda Activa · SF-2041' },
          { icon: '📄', label: 'Documents', sub: 'All verified' },
          { icon: '💳', label: 'Bank Account', sub: 'HDFC ·····4242' },
          { icon: '📞', label: 'Support', sub: 'Available 24/7' },
          { icon: '⚙️', label: 'Settings', sub: 'Notifications, navigation' },
        ].map(r => (
          <button key={r.label} style={{ backgroundColor: C.surface, borderRadius: 16, padding: '14px 16px', display: 'flex', gap: 12, alignItems: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', border: 'none', cursor: 'pointer', textAlign: 'left', width: '100%' }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: C.primaryLight, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>{r.icon}</div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 14, fontWeight: 700, color: C.text, margin: 0 }}>{r.label}</p>
              <p style={{ fontSize: 12, color: C.muted, margin: '2px 0 0' }}>{r.sub}</p>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        ))}
      </div>
    </div>
  )
}

// ── Root export ───────────────────────────────────────────────────────────────
export default function DeliveryPortal() {
  const [tab, setTab] = useState<DeliveryTab>('home')
  return (
    <div style={{ minHeight: '100vh' }}>
      {tab === 'home'     && <DeliveryHome onGoToOrders={() => setTab('orders')} />}
      {tab === 'orders'   && <AvailableOrdersTab />}
      {tab === 'earnings' && <EarningsTab />}
      {tab === 'profile'  && <DeliveryProfile />}
      <DeliveryNav tab={tab} onTab={setTab} />
    </div>
  )
}
