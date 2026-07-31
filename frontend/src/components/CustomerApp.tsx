"use client";

import { useState } from 'react'

type Screen = 'home' | 'search' | 'restaurant' | 'cart' | 'tracking' | 'orders' | 'profile'

const restaurants = [
  { id: 1, name: 'Olive Garden Bistro', cuisine: 'Italian · Mediterranean', rating: 4.8, reviews: 2341, time: '22–28 min', delivery: '₹25', image: 'https://images.unsplash.com/photo-1577106263724-2c8e03bfe9cf?w=400&h=240&fit=crop&auto=format', tags: ['Top Rated', 'Pure Veg'], discount: '30% OFF up to ₹75', open: true },
  { id: 2, name: 'The Burger Collective', cuisine: 'American · Burgers', rating: 4.6, reviews: 1872, time: '18–24 min', delivery: '₹0', image: 'https://images.unsplash.com/photo-1586816001966-79b736744398?w=400&h=240&fit=crop&auto=format', tags: ['Free Delivery'], discount: null, open: true },
  { id: 3, name: 'Sakura Sushi House', cuisine: 'Japanese · Sushi', rating: 4.9, reviews: 3210, time: '30–40 min', delivery: '₹49', image: 'https://images.unsplash.com/photo-1750943084792-487a0e68def8?w=400&h=240&fit=crop&auto=format', tags: ['Premium'], discount: '20% OFF', open: true },
  { id: 4, name: 'Spice Route Kitchen', cuisine: 'Indian · Curries', rating: 4.5, reviews: 987, time: '20–30 min', delivery: '₹15', image: 'https://images.unsplash.com/photo-1780275832803-1edcd35c39d2?w=400&h=240&fit=crop&auto=format', tags: ['Bestseller'], discount: null, open: false },
]

const menuItems = [
  { id: 1, name: 'Truffle Mushroom Risotto', desc: 'Arborio rice, wild mushrooms, aged parmesan, truffle oil', price: 485, image: 'https://images.unsplash.com/photo-1661163081367-d4c17da3e259?w=300&h=200&fit=crop&auto=format', veg: true, popular: true, rating: 4.9 },
  { id: 2, name: 'Grilled Salmon Fillet', desc: 'Atlantic salmon, lemon butter sauce, seasonal vegetables', price: 620, image: 'https://images.unsplash.com/photo-1576866206724-c696f4c9fa06?w=300&h=200&fit=crop&auto=format', veg: false, popular: true, rating: 4.7 },
  { id: 3, name: 'Margherita Pizza', desc: 'San Marzano tomato, buffalo mozzarella, fresh basil', price: 345, image: 'https://images.unsplash.com/photo-1632641736062-29327b7182d2?w=300&h=200&fit=crop&auto=format', veg: true, popular: false, rating: 4.6 },
  { id: 4, name: 'Classic Beef Burger', desc: 'Grass-fed beef patty, aged cheddar, brioche bun', price: 395, image: 'https://images.unsplash.com/photo-1586816001966-79b736744398?w=300&h=200&fit=crop&auto=format', veg: false, popular: true, rating: 4.8 },
]

const categories = [
  { icon: '🍕', label: 'Pizza' },
  { icon: '🍔', label: 'Burgers' },
  { icon: '🍱', label: 'Asian' },
  { icon: '🥗', label: 'Healthy' },
  { icon: '🌮', label: 'Mexican' },
  { icon: '🍜', label: 'Noodles' },
  { icon: '🍦', label: 'Desserts' },
  { icon: '☕', label: 'Cafe' },
]

interface CartItem { id: number; name: string; price: number; qty: number }

export default function CustomerApp({ onBack }: { onBack: () => void }) {
  const [screen, setScreen] = useState<Screen>('home')
  const [cart, setCart] = useState<CartItem[]>([])
  const [liked, setLiked] = useState<Set<number>>(new Set())
  const [selectedRest, setSelectedRest] = useState(restaurants[0])
  const [searchQuery, setSearchQuery] = useState('')
  const [orderPlaced, setOrderPlaced] = useState(false)

  const totalItems = cart.reduce((s, i) => s + i.qty, 0)
  const totalPrice = cart.reduce((s, i) => s + i.price * i.qty, 0)

  const addToCart = (item: typeof menuItems[0]) => {
    setCart(prev => {
      const existing = prev.find(c => c.id === item.id)
      if (existing) return prev.map(c => c.id === item.id ? { ...c, qty: c.qty + 1 } : c)
      return [...prev, { id: item.id, name: item.name, price: item.price, qty: 1 }]
    })
  }

  const removeFromCart = (id: number) => {
    setCart(prev => {
      const existing = prev.find(c => c.id === id)
      if (existing && existing.qty > 1) return prev.map(c => c.id === id ? { ...c, qty: c.qty - 1 } : c)
      return prev.filter(c => c.id !== id)
    })
  }

  const getQty = (id: number) => cart.find(c => c.id === id)?.qty ?? 0

  const placeOrder = () => {
    setOrderPlaced(true)
    setCart([])
    setScreen('tracking')
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#f4f2ea', fontFamily: 'Manrope, sans-serif' }}>
      <header className="sticky top-0 z-40 px-4 py-3 flex items-center gap-3" style={{ background: 'white', borderBottom: '1px solid #e8e4d4' }}>
        <button onClick={onBack} className="w-9 h-9 flex items-center justify-center rounded-xl" style={{ background: '#f4f2ea' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6b7c2a" strokeWidth="2.5" strokeLinecap="round">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6b7c2a" strokeWidth="2.5" strokeLinecap="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
            <span className="text-xs font-semibold" style={{ color: '#6b7c2a' }}>Delivering to</span>
          </div>
          <p className="font-bold text-sm truncate" style={{ color: '#1a1a16' }}>42, Greenwood Avenue, Bangalore</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="w-9 h-9 flex items-center justify-center rounded-xl relative" style={{ background: '#f4f2ea' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6b7c2a" strokeWidth="2" strokeLinecap="round">
              <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"/>
            </svg>
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full text-white text-[10px] flex items-center justify-center font-bold" style={{ background: '#6b7c2a' }}>3</span>
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto pb-24">
        {screen === 'home' && (
          <div className="animate-fade-in">
            <div className="px-4 pt-4 pb-2">
              <button onClick={() => setScreen('search')} className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl" style={{ background: 'white', border: '1.5px solid #e8e4d4' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round">
                  <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
                </svg>
                <span style={{ color: '#9ca3af', fontSize: '0.9375rem' }}>Search restaurants, dishes...</span>
              </button>
            </div>

            <div className="px-4 py-3">
              <div className="rounded-2xl p-5 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #6b7c2a 0%, #2d5016 100%)' }}>
                <div className="absolute right-0 top-0 w-32 h-full opacity-20">
                  <svg viewBox="0 0 100 100" className="w-full h-full"><circle cx="80" cy="20" r="40" fill="white"/></svg>
                </div>
                <div className="badge mb-3" style={{ background: '#e8c244', color: '#1a1a16' }}>🔥 Limited Time</div>
                <h3 className="text-white font-bold text-xl mb-1">50% OFF your first order</h3>
                <p className="text-white/70 text-sm mb-4">Use code <span className="font-bold text-white">SWIFT50</span> at checkout</p>
                <button className="btn-secondary text-sm px-4 py-2.5" style={{ background: 'white', color: '#6b7c2a', border: 'none' }}>
                  Order Now →
                </button>
              </div>
            </div>

            <div className="px-4 py-2">
              <h2 className="font-bold text-lg mb-3" style={{ color: '#1a1a16' }}>What are you craving?</h2>
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide" style={{ scrollbarWidth: 'none' }}>
                {categories.map(cat => (
                  <button key={cat.label} className="flex flex-col items-center gap-2 min-w-fit">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl card-hover" style={{ background: 'white', border: '1.5px solid #e8e4d4' }}>
                      {cat.icon}
                    </div>
                    <span className="text-xs font-semibold" style={{ color: '#6b7a44' }}>{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="px-4 py-3">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-bold text-lg" style={{ color: '#1a1a16' }}>Restaurants Near You</h2>
                <button className="text-sm font-semibold" style={{ color: '#6b7c2a' }}>See all</button>
              </div>
              <div className="grid gap-4">
                {restaurants.map(r => (
                  <button
                    key={r.id}
                    onClick={() => { setSelectedRest(r); setScreen('restaurant') }}
                    className="rounded-2xl overflow-hidden card-hover text-left w-full"
                    style={{ background: 'white', border: '1px solid #e8e4d4', opacity: r.open ? 1 : 0.6 }}
                  >
                    <div className="relative h-44">
                      <img src={r.image} alt={r.name} className="w-full h-full object-cover" />
                      {!r.open && (
                        <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.5)' }}>
                          <span className="text-white font-bold">Currently Closed</span>
                        </div>
                      )}
                      {r.discount && (
                        <div className="absolute bottom-3 left-3">
                          <span className="badge" style={{ background: '#6b7c2a', color: 'white', fontSize: '0.7rem' }}>{r.discount}</span>
                        </div>
                      )}
                      <button
                        onClick={e => { e.stopPropagation(); setLiked(prev => { const n = new Set(prev); n.has(r.id) ? n.delete(r.id) : n.add(r.id); return n }) }}
                        className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center"
                        style={{ background: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill={liked.has(r.id) ? '#e74c3c' : 'none'} stroke={liked.has(r.id) ? '#e74c3c' : '#9ca3af'} strokeWidth="2" strokeLinecap="round">
                          <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
                        </svg>
                      </button>
                    </div>
                    <div className="p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-bold text-base" style={{ color: '#1a1a16' }}>{r.name}</h3>
                          <p className="text-sm mt-0.5" style={{ color: '#6b7a5a' }}>{r.cuisine}</p>
                        </div>
                        <div className="flex items-center gap-1 px-2 py-1 rounded-lg" style={{ background: '#f0f4e8' }}>
                          <span className="text-sm font-bold" style={{ color: '#6b7c2a' }}>★ {r.rating}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 mt-3">
                        <span className="text-xs font-medium" style={{ color: '#6b7a5a' }}>⏱ {r.time}</span>
                        <span className="text-xs" style={{ color: '#d0da9f' }}>•</span>
                        <span className="text-xs font-medium" style={{ color: '#6b7a5a' }}>{r.delivery === '₹0' ? '🚚 Free delivery' : `🚚 ${r.delivery}`}</span>
                        <span className="text-xs" style={{ color: '#d0da9f' }}>•</span>
                        <span className="text-xs font-medium" style={{ color: '#6b7a5a' }}>{r.reviews.toLocaleString()} ratings</span>
                      </div>
                      {r.tags.length > 0 && (
                        <div className="flex gap-2 mt-2">
                          {r.tags.map(tag => (
                            <span key={tag} className="badge text-xs" style={{ background: '#f0f4e8', color: '#6b7c2a' }}>{tag}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {screen === 'search' && (
          <div className="px-4 pt-4 animate-fade-in">
            <div className="flex items-center gap-3 mb-4">
              <button onClick={() => setScreen('home')} className="w-9 h-9 flex items-center justify-center rounded-xl" style={{ background: '#f0f4e8' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b7c2a" strokeWidth="2.5" strokeLinecap="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
              </button>
              <input
                autoFocus
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="input-field flex-1"
                placeholder="Search for restaurants, dishes..."
              />
            </div>
            {!searchQuery && (
              <>
                <p className="text-xs font-semibold mb-3" style={{ color: '#9ca3af' }}>POPULAR SEARCHES</p>
                <div className="flex flex-wrap gap-2 mb-6">
                  {['Biryani', 'Pizza', 'Sushi', 'Burger', 'Pasta', 'Desserts', 'Coffee'].map(t => (
                    <button key={t} onClick={() => setSearchQuery(t)} className="px-4 py-2 rounded-xl text-sm font-medium" style={{ background: 'white', border: '1.5px solid #e8e4d4', color: '#6b7a5a' }}>
                      {t}
                    </button>
                  ))}
                </div>
              </>
            )}
            {searchQuery && (
              <div className="grid gap-3">
                {restaurants.filter(r => r.name.toLowerCase().includes(searchQuery.toLowerCase()) || r.cuisine.toLowerCase().includes(searchQuery.toLowerCase())).map(r => (
                  <button key={r.id} onClick={() => { setSelectedRest(r); setScreen('restaurant') }} className="flex gap-3 p-3 rounded-2xl card-hover text-left" style={{ background: 'white', border: '1px solid #e8e4d4' }}>
                    <img src={r.image} alt={r.name} className="w-16 h-16 rounded-xl object-cover" />
                    <div>
                      <h4 className="font-bold text-sm" style={{ color: '#1a1a16' }}>{r.name}</h4>
                      <p className="text-xs mt-0.5" style={{ color: '#6b7a5a' }}>{r.cuisine}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs font-semibold" style={{ color: '#6b7c2a' }}>★ {r.rating}</span>
                        <span className="text-xs" style={{ color: '#9ca3af' }}>• {r.time}</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {screen === 'restaurant' && (
          <div className="animate-fade-in">
            <div className="relative">
              <img src={selectedRest.image} alt={selectedRest.name} className="w-full h-56 object-cover" />
              <button onClick={() => setScreen('home')} className="absolute top-4 left-4 w-9 h-9 flex items-center justify-center rounded-xl" style={{ background: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1a1a16" strokeWidth="2.5" strokeLinecap="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
              </button>
            </div>
            <div className="px-4 py-4">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="font-bold text-xl" style={{ color: '#1a1a16' }}>{selectedRest.name}</h2>
                  <p className="text-sm mt-1" style={{ color: '#6b7a5a' }}>{selectedRest.cuisine}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <div className="flex items-center gap-1 px-2 py-1 rounded-lg" style={{ background: '#f0f4e8' }}>
                    <span className="text-sm font-bold" style={{ color: '#6b7c2a' }}>★ {selectedRest.rating}</span>
                  </div>
                  <span className="text-xs" style={{ color: '#9ca3af' }}>{selectedRest.reviews.toLocaleString()} ratings</span>
                </div>
              </div>
              <div className="flex gap-4 mt-3 py-3 border-t border-b" style={{ borderColor: '#e8e4d4' }}>
                <div className="text-center flex-1">
                  <p className="font-bold text-sm" style={{ color: '#1a1a16' }}>{selectedRest.time}</p>
                  <p className="text-xs mt-0.5" style={{ color: '#9ca3af' }}>Delivery time</p>
                </div>
                <div className="text-center flex-1">
                  <p className="font-bold text-sm" style={{ color: '#1a1a16' }}>{selectedRest.delivery === '₹0' ? 'Free' : selectedRest.delivery}</p>
                  <p className="text-xs mt-0.5" style={{ color: '#9ca3af' }}>Delivery fee</p>
                </div>
                <div className="text-center flex-1">
                  <p className="font-bold text-sm" style={{ color: '#1a1a16' }}>₹150</p>
                  <p className="text-xs mt-0.5" style={{ color: '#9ca3af' }}>Min order</p>
                </div>
              </div>

              <h3 className="font-bold text-base mt-4 mb-3" style={{ color: '#1a1a16' }}>Menu</h3>
              <div className="grid gap-4">
                {menuItems.map(item => (
                  <div key={item.id} className="flex gap-3 p-4 rounded-2xl" style={{ background: 'white', border: '1px solid #e8e4d4' }}>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-4 h-4 rounded-sm border-2 flex items-center justify-center" style={{ borderColor: item.veg ? '#22c55e' : '#ef4444' }}>
                          <div className="w-2 h-2 rounded-full" style={{ background: item.veg ? '#22c55e' : '#ef4444' }} />
                        </div>
                        {item.popular && <span className="badge text-[10px]" style={{ background: '#fef3c7', color: '#92400e' }}>🔥 Bestseller</span>}
                      </div>
                      <h4 className="font-bold text-sm" style={{ color: '#1a1a16' }}>{item.name}</h4>
                      <p className="text-xs mt-1 leading-relaxed" style={{ color: '#9ca3af' }}>{item.desc}</p>
                      <p className="font-bold mt-2" style={{ color: '#1a1a16' }}>₹{item.price}</p>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <img src={item.image} alt={item.name} className="w-24 h-20 rounded-xl object-cover" />
                      {getQty(item.id) === 0 ? (
                        <button onClick={() => addToCart(item)} className="w-24 py-1.5 rounded-xl font-bold text-sm" style={{ background: '#f0f4e8', color: '#6b7c2a', border: '1.5px solid #b3c26a' }}>
                          ADD
                        </button>
                      ) : (
                        <div className="flex items-center gap-2">
                          <button onClick={() => removeFromCart(item.id)} className="w-7 h-7 rounded-full flex items-center justify-center font-bold" style={{ background: '#6b7c2a', color: 'white' }}>−</button>
                          <span className="font-bold text-sm w-4 text-center" style={{ color: '#1a1a16' }}>{getQty(item.id)}</span>
                          <button onClick={() => addToCart(item)} className="w-7 h-7 rounded-full flex items-center justify-center font-bold" style={{ background: '#6b7c2a', color: 'white' }}>+</button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {screen === 'cart' && (
          <div className="px-4 pt-4 animate-fade-in">
            <button onClick={() => setScreen('restaurant')} className="flex items-center gap-2 mb-4">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b7c2a" strokeWidth="2.5" strokeLinecap="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
              <span className="font-semibold text-sm" style={{ color: '#6b7c2a' }}>Back to menu</span>
            </button>
            <h2 className="font-bold text-xl mb-4" style={{ color: '#1a1a16' }}>Your Cart</h2>
            {cart.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-5xl mb-4">🛒</div>
                <h3 className="font-bold text-lg mb-2" style={{ color: '#1a1a16' }}>Your cart is empty</h3>
                <p className="text-sm mb-6" style={{ color: '#9ca3af' }}>Add items from a restaurant to get started</p>
                <button onClick={() => setScreen('home')} className="btn-primary">Browse Restaurants</button>
              </div>
            ) : (
              <>
                <div className="rounded-2xl overflow-hidden mb-4" style={{ background: 'white', border: '1px solid #e8e4d4' }}>
                  {cart.map((item, i) => (
                    <div key={item.id} className={`flex items-center justify-between p-4 ${i < cart.length - 1 ? 'border-b' : ''}`} style={{ borderColor: '#f4f2ea' }}>
                      <div>
                        <p className="font-semibold text-sm" style={{ color: '#1a1a16' }}>{item.name}</p>
                        <p className="text-sm mt-0.5" style={{ color: '#6b7c2a' }}>₹{item.price} × {item.qty}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => removeFromCart(item.id)} className="w-7 h-7 rounded-full flex items-center justify-center font-bold" style={{ background: '#f0f4e8', color: '#6b7c2a' }}>−</button>
                        <span className="font-bold text-sm w-4 text-center">{item.qty}</span>
                        <button onClick={() => addToCart(menuItems.find(m => m.id === item.id)!)} className="w-7 h-7 rounded-full flex items-center justify-center font-bold" style={{ background: '#6b7c2a', color: 'white' }}>+</button>
                        <span className="font-bold ml-2" style={{ color: '#1a1a16' }}>₹{item.price * item.qty}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2 mb-4">
                  <input className="input-field flex-1" placeholder="Apply coupon code" />
                  <button className="btn-secondary px-4 py-3">Apply</button>
                </div>

                <div className="rounded-2xl p-4 mb-4" style={{ background: 'white', border: '1px solid #e8e4d4' }}>
                  <h3 className="font-bold text-sm mb-3" style={{ color: '#1a1a16' }}>Bill Details</h3>
                  {[
                    { label: 'Item total', value: `₹${totalPrice}` },
                    { label: 'Delivery fee', value: '₹25' },
                    { label: 'Platform fee', value: '₹5' },
                    { label: 'GST', value: `₹${Math.round(totalPrice * 0.05)}` },
                  ].map(row => (
                    <div key={row.label} className="flex justify-between py-1.5">
                      <span className="text-sm" style={{ color: '#6b7a5a' }}>{row.label}</span>
                      <span className="text-sm font-medium" style={{ color: '#1a1a16' }}>{row.value}</span>
                    </div>
                  ))}
                  <div className="border-t mt-2 pt-2 flex justify-between" style={{ borderColor: '#e8e4d4' }}>
                    <span className="font-bold" style={{ color: '#1a1a16' }}>To Pay</span>
                    <span className="font-bold" style={{ color: '#6b7c2a' }}>₹{totalPrice + 30 + Math.round(totalPrice * 0.05)}</span>
                  </div>
                </div>

                <button onClick={placeOrder} className="btn-primary w-full py-4 text-base">
                  Proceed to Payment  •  ₹{totalPrice + 30 + Math.round(totalPrice * 0.05)}
                </button>
              </>
            )}
          </div>
        )}

        {screen === 'tracking' && (
          <div className="px-4 pt-4 animate-fade-in">
            {orderPlaced && (
              <div className="rounded-2xl p-5 mb-4 text-center animate-scale-in" style={{ background: '#f0f4e8', border: '1.5px solid #b3c26a' }}>
                <div className="text-4xl mb-2">🎉</div>
                <h3 className="font-bold text-lg" style={{ color: '#1a1a16' }}>Order Confirmed!</h3>
                <p className="text-sm mt-1" style={{ color: '#6b7a5a' }}>Order #SB2024071823 placed successfully</p>
              </div>
            )}
            <div className="rounded-2xl overflow-hidden mb-4" style={{ background: '#e8edcf', height: 220, position: 'relative' }}>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-4xl mb-2">🗺️</div>
                  <p className="font-semibold text-sm" style={{ color: '#556322' }}>Live Tracking Map</p>
                </div>
              </div>
              <div className="absolute bottom-4 left-4 right-4">
                <div className="rounded-xl p-3 flex items-center gap-3" style={{ background: 'white', boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }}>
                  <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                    <img src="https://images.unsplash.com/photo-1629407119384-d42320c3e576?w=80&h=80&fit=crop&auto=format" alt="Delivery partner" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-sm" style={{ color: '#1a1a16' }}>Arjun Sharma</p>
                    <p className="text-xs" style={{ color: '#9ca3af' }}>Your delivery partner • ★ 4.9</p>
                  </div>
                  <button className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: '#f0f4e8' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b7c2a" strokeWidth="2" strokeLinecap="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 014.5 10.5a19.79 19.79 0 01-3.07-8.67A2 2 0 013.44 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L7.91 9.91a16 16 0 006.72 6.72l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>
                  </button>
                </div>
              </div>
            </div>

            <div className="rounded-2xl p-5" style={{ background: 'white', border: '1px solid #e8e4d4' }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold" style={{ color: '#1a1a16' }}>Order Status</h3>
                <span className="badge" style={{ background: '#f0f4e8', color: '#6b7c2a' }}>~22 min</span>
              </div>
              {[
                { step: 'Order Confirmed', done: true, time: '7:41 PM' },
                { step: 'Being Prepared', done: true, time: '7:45 PM' },
                { step: 'Out for Delivery', done: false, time: '—' },
                { step: 'Delivered', done: false, time: '—' },
              ].map((s, i) => (
                <div key={i} className="flex items-start gap-3 mb-4 last:mb-0">
                  <div className="flex flex-col items-center">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: s.done ? '#6b7c2a' : '#e8e4d4' }}>
                      {s.done ? <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                        : <div className="w-2 h-2 rounded-full" style={{ background: '#9ca3af' }} />}
                    </div>
                    {i < 3 && <div className="w-0.5 h-6 mt-1" style={{ background: s.done ? '#6b7c2a' : '#e8e4d4' }} />}
                  </div>
                  <div className="flex-1 flex justify-between">
                    <span className="text-sm font-medium" style={{ color: s.done ? '#1a1a16' : '#9ca3af' }}>{s.step}</span>
                    <span className="text-xs" style={{ color: '#9ca3af' }}>{s.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {screen === 'orders' && (
          <div className="px-4 pt-4 animate-fade-in">
            <h2 className="font-bold text-xl mb-4" style={{ color: '#1a1a16' }}>Order History</h2>
            {[
              { id: 'SB2024071823', rest: 'Olive Garden Bistro', items: 'Truffle Mushroom Risotto', amount: 540, date: 'Today, 7:41 PM', status: 'Delivered', image: restaurants[0].image },
              { id: 'SB2024071712', rest: 'The Burger Collective', items: 'Classic Beef Burger, Fries', amount: 445, date: 'Yesterday, 1:12 PM', status: 'Delivered', image: restaurants[1].image },
            ].map(order => (
              <div key={order.id} className="rounded-2xl overflow-hidden mb-4 card-hover" style={{ background: 'white', border: '1px solid #e8e4d4' }}>
                <div className="flex gap-3 p-4">
                  <img src={order.image} alt={order.rest} className="w-16 h-16 rounded-xl object-cover" />
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <h4 className="font-bold text-sm" style={{ color: '#1a1a16' }}>{order.rest}</h4>
                      <span className="badge" style={{ background: '#f0f4e8', color: '#6b7c2a', fontSize: '0.7rem' }}>{order.status}</span>
                    </div>
                    <p className="text-xs mt-0.5" style={{ color: '#9ca3af' }}>{order.items}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs" style={{ color: '#9ca3af' }}>{order.date}</span>
                      <span className="font-bold text-sm" style={{ color: '#1a1a16' }}>₹{order.amount}</span>
                    </div>
                  </div>
                </div>
                <div className="px-4 pb-4">
                  <button className="btn-primary w-full py-3 text-sm">Reorder</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {screen === 'profile' && (
          <div className="px-4 pt-4 animate-fade-in">
            <div className="rounded-2xl p-5 mb-4 flex items-center gap-4" style={{ background: 'white', border: '1px solid #e8e4d4' }}>
              <div className="w-16 h-16 rounded-2xl overflow-hidden">
                <img src="https://images.unsplash.com/photo-1629407119384-d42320c3e576?w=80&h=80&fit=crop&auto=format" alt="Profile" className="w-full h-full object-cover" />
              </div>
              <div>
                <h3 className="font-bold text-lg" style={{ color: '#1a1a16' }}>Rahul Mehta</h3>
                <p className="text-sm" style={{ color: '#6b7a5a' }}>rahul.mehta@email.com</p>
                <p className="text-xs mt-0.5" style={{ color: '#9ca3af' }}>+91 98765 43210</p>
              </div>
            </div>

            {[
              { icon: '📍', label: 'Saved Addresses', sub: '2 addresses' },
              { icon: '💳', label: 'Payment Methods', sub: 'UPI, Cards' },
              { icon: '🎁', label: 'Refer & Earn', sub: 'Earn ₹100 per referral' },
              { icon: '💎', label: 'SwiftBite Plus', sub: 'Free delivery on every order' },
              { icon: '⭐', label: 'Rate the App', sub: '' },
              { icon: '🔒', label: 'Privacy & Security', sub: '' },
              { icon: '❓', label: 'Help Centre', sub: '' },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-3 p-4 rounded-2xl mb-2 card-hover" style={{ background: 'white', border: '1px solid #e8e4d4' }}>
                <span className="text-xl">{item.icon}</span>
                <div className="flex-1">
                  <p className="font-semibold text-sm" style={{ color: '#1a1a16' }}>{item.label}</p>
                  {item.sub && <p className="text-xs mt-0.5" style={{ color: '#9ca3af' }}>{item.sub}</p>}
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg>
              </div>
            ))}

            <button onClick={onBack} className="btn-secondary w-full py-3 mt-2">
              Sign Out
            </button>
          </div>
        )}
      </main>

      <nav className="bottom-nav">
        {([
          { screen: 'home', icon: 'M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z', label: 'Home' },
          { screen: 'search', icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z', label: 'Search' },
          { screen: 'cart', icon: 'M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0', label: 'Cart', badge: totalItems },
          { screen: 'orders', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2', label: 'Orders' },
          { screen: 'profile', icon: 'M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z', label: 'Profile' },
        ] as Array<{ screen: Screen; icon: string; label: string; badge?: number }>).map(item => (
          <button key={item.screen} onClick={() => setScreen(item.screen)} className="flex flex-col items-center gap-1 relative px-3">
            <div className="relative">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={screen === item.screen ? '#6b7c2a' : '#9ca3af'} strokeWidth={screen === item.screen ? '2.5' : '1.8'} strokeLinecap="round" strokeLinejoin="round">
                <path d={item.icon} />
              </svg>
              {item.badge ? (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full text-white text-[9px] font-bold flex items-center justify-center" style={{ background: '#6b7c2a' }}>{item.badge}</span>
              ) : null}
            </div>
            <span className="text-[10px] font-semibold" style={{ color: screen === item.screen ? '#6b7c2a' : '#9ca3af' }}>{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}
