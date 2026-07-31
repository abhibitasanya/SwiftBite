import { useState } from 'react'

type Screen = 'home' | 'order' | 'navigate' | 'earnings' | 'profile'

const availableOrders = [
  { id: 'ORD-2847', restaurant: 'Olive Garden Bistro', customer: 'Priya Sharma', pickup: '45 Koramangala 5th Block', dropoff: '42 Green Avenue, Indiranagar', distance: '3.2 km', earning: 85, items: 3, time: '8 min pickup' },
  { id: 'ORD-2848', restaurant: 'The Burger Collective', customer: 'Aditya Kumar', pickup: '12 Jayanagar 4th Block', dropoff: '8 Rajajinagar Main Rd', distance: '5.7 km', earning: 120, items: 2, time: '5 min pickup' },
]

const earningsWeek = [
  { day: 'Mon', amount: 680 },
  { day: 'Tue', amount: 920 },
  { day: 'Wed', amount: 750 },
  { day: 'Thu', amount: 1100 },
  { day: 'Fri', amount: 1340 },
  { day: 'Sat', amount: 1680 },
  { day: 'Sun', amount: 0 },
]
const maxEarning = Math.max(...earningsWeek.map(e => e.amount))

export default function DeliveryApp({ onBack }: { onBack: () => void }) {
  const [screen, setScreen] = useState<Screen>('home')
  const [online, setOnline] = useState(true)
  const [activeOrder, setActiveOrder] = useState<typeof availableOrders[0] | null>(null)
  const [deliveryStep, setDeliveryStep] = useState(0)

  const acceptOrder = (order: typeof availableOrders[0]) => {
    setActiveOrder(order)
    setDeliveryStep(0)
    setScreen('navigate')
  }

  const nextStep = () => {
    if (deliveryStep < 2) {
      setDeliveryStep(s => s + 1)
    } else {
      setActiveOrder(null)
      setDeliveryStep(0)
      setScreen('home')
    }
  }

  const steps = ['Head to Restaurant', 'Pick Up Order', 'Deliver to Customer']
  const stepIcons = ['🏪', '📦', '🏠']

  return (
    <div className="min-h-screen flex flex-col max-w-sm mx-auto" style={{ background: '#f4f2ea', fontFamily: 'Manrope, sans-serif' }}>
      {/* Header */}
      <header className="px-4 py-4 flex items-center justify-between sticky top-0 z-40" style={{ background: 'white', borderBottom: '1px solid #e8e4d4' }}>
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="w-8 h-8 flex items-center justify-center rounded-lg" style={{ background: '#f0f4e8' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6b7c2a" strokeWidth="2.5" strokeLinecap="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
          </button>
          <div>
            <p className="font-bold text-sm" style={{ color: '#1a1a16' }}>Arjun Sharma</p>
            <p className="text-xs" style={{ color: '#9ca3af' }}>Delivery Partner</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold" style={{ color: online ? '#22c55e' : '#9ca3af' }}>{online ? 'Online' : 'Offline'}</span>
          <button
            onClick={() => setOnline(!online)}
            className="w-12 h-6 rounded-full relative transition-colors"
            style={{ background: online ? '#22c55e' : '#e8e4d4' }}
          >
            <div className="w-4 h-4 bg-white rounded-full absolute top-1 transition-all" style={{ left: online ? '28px' : '4px', boxShadow: '0 1px 4px rgba(0,0,0,0.2)' }} />
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto pb-24">
        {screen === 'home' && (
          <div className="animate-fade-in">
            {/* Today's earnings summary */}
            <div className="m-4 rounded-2xl p-5 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #1a1a16 0%, #2d5016 100%)' }}>
              <p className="text-sm mb-1" style={{ color: 'rgba(255,255,255,0.6)' }}>Today's Earnings</p>
              <p className="text-white font-bold text-3xl">₹1,340</p>
              <div className="flex gap-4 mt-4">
                <div>
                  <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>Deliveries</p>
                  <p className="font-bold text-white">12</p>
                </div>
                <div>
                  <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>Distance</p>
                  <p className="font-bold text-white">38.4 km</p>
                </div>
                <div>
                  <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>Rating</p>
                  <p className="font-bold text-white">4.9 ★</p>
                </div>
              </div>
              <div className="absolute -right-6 -top-6 w-28 h-28 rounded-full opacity-10" style={{ background: '#6b7c2a' }} />
            </div>

            {/* Performance badges */}
            <div className="mx-4 mb-4 grid grid-cols-3 gap-3">
              {[
                { label: 'Completion Rate', value: '98%', icon: '✅' },
                { label: 'On-Time Rate', value: '94%', icon: '⏱' },
                { label: 'Acceptance Rate', value: '87%', icon: '📈' },
              ].map(b => (
                <div key={b.label} className="rounded-xl p-3 text-center" style={{ background: 'white', border: '1px solid #e8e4d4' }}>
                  <div className="text-xl mb-1">{b.icon}</div>
                  <p className="font-bold text-sm" style={{ color: '#6b7c2a' }}>{b.value}</p>
                  <p className="text-[10px] mt-0.5 leading-tight" style={{ color: '#9ca3af' }}>{b.label}</p>
                </div>
              ))}
            </div>

            {online ? (
              <div className="px-4">
                <h3 className="font-bold mb-3" style={{ color: '#1a1a16' }}>Available Orders Nearby</h3>
                {availableOrders.map(order => (
                  <div key={order.id} className="rounded-2xl p-5 mb-3" style={{ background: 'white', border: '1px solid #e8e4d4' }}>
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-bold" style={{ color: '#1a1a16' }}>{order.restaurant}</p>
                        <p className="text-xs mt-0.5" style={{ color: '#9ca3af' }}>{order.items} items · {order.time}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg" style={{ color: '#6b7c2a' }}>₹{order.earning}</p>
                        <p className="text-xs" style={{ color: '#9ca3af' }}>{order.distance}</p>
                      </div>
                    </div>
                    <div className="space-y-2 mb-4">
                      <div className="flex items-start gap-2">
                        <div className="w-5 h-5 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0" style={{ background: '#e8edcf' }}>
                          <span className="text-[10px]">🏪</span>
                        </div>
                        <p className="text-xs" style={{ color: '#6b7a5a' }}>{order.pickup}</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="w-5 h-5 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0" style={{ background: '#f0f4e8' }}>
                          <span className="text-[10px]">📍</span>
                        </div>
                        <p className="text-xs" style={{ color: '#6b7a5a' }}>{order.dropoff}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => acceptOrder(order)} className="btn-primary flex-1 py-3 text-sm">Accept</button>
                      <button className="btn-secondary flex-1 py-3 text-sm">Skip</button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="px-4 py-8 text-center">
                <div className="text-5xl mb-4">😴</div>
                <h3 className="font-bold text-lg mb-2" style={{ color: '#1a1a16' }}>You're Offline</h3>
                <p className="text-sm mb-6" style={{ color: '#9ca3af' }}>Go online to start receiving orders and earning</p>
                <button onClick={() => setOnline(true)} className="btn-primary px-8 py-3">Go Online</button>
              </div>
            )}
          </div>
        )}

        {screen === 'navigate' && activeOrder && (
          <div className="animate-fade-in">
            {/* Map placeholder */}
            <div className="relative" style={{ height: 280, background: '#e8edcf' }}>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-5xl mb-2">🗺️</div>
                  <p className="font-semibold text-sm" style={{ color: '#556322' }}>Navigation Active</p>
                  <p className="text-xs mt-1" style={{ color: '#6b7c2a' }}>3.2 km · ~12 min</p>
                </div>
              </div>
              {/* Route dots */}
              <div className="absolute bottom-4 left-4 right-4">
                <div className="flex justify-between">
                  <div className="w-4 h-4 rounded-full border-4" style={{ borderColor: '#6b7c2a', background: 'white' }} />
                  <div className="flex-1 mx-2 border-t-2 border-dashed self-center" style={{ borderColor: '#6b7c2a' }} />
                  <div className="w-4 h-4 rounded-full" style={{ background: '#6b7c2a' }} />
                </div>
              </div>
            </div>

            <div className="px-4 py-4">
              {/* Steps */}
              <div className="flex items-center gap-2 mb-4">
                {steps.map((step, i) => (
                  <div key={step} className="flex items-center gap-2">
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm" style={{ background: i === deliveryStep ? '#6b7c2a' : i < deliveryStep ? '#b3c26a' : '#e8e4d4' }}>
                        {i < deliveryStep ? '✓' : stepIcons[i]}
                      </div>
                    </div>
                    {i < steps.length - 1 && <div className="flex-1 h-0.5 w-6" style={{ background: i < deliveryStep ? '#6b7c2a' : '#e8e4d4' }} />}
                  </div>
                ))}
              </div>

              {/* Current step */}
              <div className="rounded-2xl p-5 mb-4" style={{ background: 'white', border: '1px solid #e8e4d4' }}>
                <p className="text-xs font-semibold mb-1" style={{ color: '#9ca3af' }}>STEP {deliveryStep + 1} OF 3</p>
                <h3 className="font-bold text-xl mb-3" style={{ color: '#1a1a16' }}>{steps[deliveryStep]}</h3>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-3">
                    <span>🏪</span>
                    <div>
                      <p className="font-semibold text-sm" style={{ color: '#1a1a16' }}>{activeOrder.restaurant}</p>
                      <p className="text-xs" style={{ color: '#9ca3af' }}>{activeOrder.pickup}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span>📍</span>
                    <div>
                      <p className="font-semibold text-sm" style={{ color: '#1a1a16' }}>{activeOrder.customer}</p>
                      <p className="text-xs" style={{ color: '#9ca3af' }}>{activeOrder.dropoff}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between py-3 border-t" style={{ borderColor: '#f4f2ea' }}>
                  <div>
                    <p className="text-xs" style={{ color: '#9ca3af' }}>Order ID</p>
                    <p className="font-bold text-sm" style={{ color: '#1a1a16' }}>#{activeOrder.id}</p>
                  </div>
                  <div>
                    <p className="text-xs" style={{ color: '#9ca3af' }}>Earning</p>
                    <p className="font-bold text-sm" style={{ color: '#6b7c2a' }}>₹{activeOrder.earning}</p>
                  </div>
                  <div>
                    <p className="text-xs" style={{ color: '#9ca3af' }}>Items</p>
                    <p className="font-bold text-sm" style={{ color: '#1a1a16' }}>{activeOrder.items}</p>
                  </div>
                </div>
              </div>

              <button onClick={nextStep} className="btn-primary w-full py-4">
                {deliveryStep === 0 && 'Arrived at Restaurant'}
                {deliveryStep === 1 && 'Order Picked Up'}
                {deliveryStep === 2 && 'Order Delivered ✓'}
              </button>
            </div>
          </div>
        )}

        {screen === 'earnings' && (
          <div className="px-4 pt-4 animate-fade-in">
            <h2 className="font-bold text-xl mb-4" style={{ color: '#1a1a16' }}>Earnings</h2>

            {/* Period tabs */}
            <div className="flex gap-2 mb-4">
              {['Today', 'This Week', 'This Month'].map((tab, i) => (
                <button key={tab} className="px-4 py-2 rounded-xl text-sm font-semibold" style={{ background: i === 1 ? '#6b7c2a' : 'white', color: i === 1 ? 'white' : '#9ca3af', border: i === 1 ? 'none' : '1px solid #e8e4d4' }}>
                  {tab}
                </button>
              ))}
            </div>

            <div className="rounded-2xl p-5 mb-4" style={{ background: 'linear-gradient(135deg, #6b7c2a 0%, #2d5016 100%)' }}>
              <p className="text-sm mb-1" style={{ color: 'rgba(255,255,255,0.7)' }}>This Week's Total</p>
              <p className="text-white font-bold text-3xl">₹6,470</p>
              <p className="text-sm mt-2" style={{ color: 'rgba(255,255,255,0.6)' }}>78 deliveries completed</p>
            </div>

            {/* Chart */}
            <div className="rounded-2xl p-5 mb-4" style={{ background: 'white', border: '1px solid #e8e4d4' }}>
              <h3 className="font-bold mb-4" style={{ color: '#1a1a16' }}>Daily Breakdown</h3>
              <div className="flex items-end gap-2 h-32">
                {earningsWeek.map(d => (
                  <div key={d.day} className="flex flex-col items-center gap-1 flex-1">
                    <div
                      className="w-full rounded-t-lg"
                      style={{
                        height: d.amount > 0 ? `${(d.amount / maxEarning) * 100}px` : '4px',
                        background: d.day === 'Sat' ? '#6b7c2a' : d.amount > 0 ? '#d0da9f' : '#e8e4d4',
                        minHeight: 4,
                      }}
                    />
                    <span className="text-[10px]" style={{ color: '#9ca3af' }}>{d.day}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Withdraw */}
            <div className="rounded-2xl p-5" style={{ background: 'white', border: '1px solid #e8e4d4' }}>
              <div className="flex justify-between items-center mb-4">
                <div>
                  <p className="text-xs" style={{ color: '#9ca3af' }}>Available Balance</p>
                  <p className="font-bold text-xl" style={{ color: '#1a1a16' }}>₹4,820</p>
                </div>
                <button className="btn-primary py-2.5 px-5 text-sm">Withdraw</button>
              </div>
              <p className="text-xs" style={{ color: '#9ca3af' }}>Transfers to your bank account within 2–4 hours</p>
            </div>
          </div>
        )}

        {screen === 'profile' && (
          <div className="px-4 pt-4 animate-fade-in">
            <div className="rounded-2xl p-5 mb-4 text-center" style={{ background: 'white', border: '1px solid #e8e4d4' }}>
              <div className="w-20 h-20 rounded-full mx-auto mb-3 overflow-hidden">
                <img src="https://images.unsplash.com/photo-1629407119384-d42320c3e576?w=80&h=80&fit=crop&auto=format" alt="Profile" className="w-full h-full object-cover" />
              </div>
              <h3 className="font-bold text-lg" style={{ color: '#1a1a16' }}>Arjun Sharma</h3>
              <p className="text-sm" style={{ color: '#9ca3af' }}>Delivery Partner since Jan 2024</p>
              <div className="flex justify-center gap-6 mt-4">
                <div className="text-center">
                  <p className="font-bold" style={{ color: '#6b7c2a' }}>4.9</p>
                  <p className="text-xs" style={{ color: '#9ca3af' }}>Rating</p>
                </div>
                <div className="text-center">
                  <p className="font-bold" style={{ color: '#6b7c2a' }}>847</p>
                  <p className="text-xs" style={{ color: '#9ca3af' }}>Deliveries</p>
                </div>
                <div className="text-center">
                  <p className="font-bold" style={{ color: '#6b7c2a' }}>98%</p>
                  <p className="text-xs" style={{ color: '#9ca3af' }}>Completion</p>
                </div>
              </div>
            </div>

            {[
              { icon: '🏍️', label: 'Vehicle Details', sub: 'Honda Activa · MH-12 AB 1234' },
              { icon: '💳', label: 'Bank Account', sub: 'HDFC Bank ending 4521' },
              { icon: '📄', label: 'Documents', sub: 'All verified ✓' },
              { icon: '🔔', label: 'Notifications', sub: '' },
              { icon: '❓', label: 'Support', sub: '' },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-3 p-4 rounded-2xl mb-2" style={{ background: 'white', border: '1px solid #e8e4d4' }}>
                <span className="text-xl">{item.icon}</span>
                <div className="flex-1">
                  <p className="font-semibold text-sm" style={{ color: '#1a1a16' }}>{item.label}</p>
                  {item.sub && <p className="text-xs mt-0.5" style={{ color: '#9ca3af' }}>{item.sub}</p>}
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg>
              </div>
            ))}

            <button onClick={onBack} className="btn-secondary w-full py-3 mt-2">Sign Out</button>
          </div>
        )}
      </main>

      {/* Bottom nav */}
      <nav className="bottom-nav">
        {([
          { s: 'home', label: 'Home', icon: 'M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z' },
          { s: 'navigate', label: 'Navigate', icon: 'M3 11l19-9-9 19-2-8-8-2z' },
          { s: 'earnings', label: 'Earnings', icon: 'M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6' },
          { s: 'profile', label: 'Profile', icon: 'M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z' },
        ] as Array<{ s: Screen; label: string; icon: string }>).map(item => (
          <button key={item.s} onClick={() => setScreen(item.s)} className="flex flex-col items-center gap-1">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={screen === item.s ? '#6b7c2a' : '#9ca3af'} strokeWidth={screen === item.s ? '2.5' : '1.8'} strokeLinecap="round" strokeLinejoin="round">
              <path d={item.icon} />
            </svg>
            <span className="text-[10px] font-semibold" style={{ color: screen === item.s ? '#6b7c2a' : '#9ca3af' }}>{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}
