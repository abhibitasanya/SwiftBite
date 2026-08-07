import React, { useState, useEffect } from 'react';
import C from '../theme/colors';
import Icon from '../components/icons';
import { SectionHeader, RestaurantCard, CartFAB, BackButton } from '../components/ui';
import { RESTAURANTS, MENU_ITEMS, CATEGORIES, ONBOARDING } from '../data/mockData';
import { Restaurant, MenuItem, CartItem, Screen } from '../types';

function SplashScreen() {
  return (
    <div style={{ height: '100vh', background: `linear-gradient(145deg, ${C.red} 0%, #C42F3B 100%)`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20 }}>
      <div className="animate-swift-pulse" style={{ width: 88, height: 88, backgroundColor: 'white', borderRadius: 26, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 44, boxShadow: '0 12px 40px rgba(0,0,0,0.25)' }}>
        ⚡
      </div>
      <div className="animate-swift-fade-in" style={{ textAlign: 'center' }}>
        <h1 style={{ color: 'white', fontSize: 34, fontWeight: 800, letterSpacing: -0.8, margin: '0 0 6px' }}>SwiftBite</h1>
        <p style={{ color: 'rgba(255,255,255,0.72)', fontSize: 14, fontWeight: 500, margin: 0 }}>Food, delivered with love</p>
      </div>
      <div style={{ position: 'absolute', bottom: 48 }}>
        <div style={{ display: 'flex', gap: 6 }}>
          {[0, 1, 2].map(i => (
            <div key={i} className="animate-swift-pulse" style={{ width: 6, height: 6, backgroundColor: 'rgba(255,255,255,0.5)', borderRadius: 3, animationDelay: `${i * 0.2}s` }} />
          ))}
        </div>
      </div>
    </div>
  )
}

function OnboardingScreen({ step, onNext, onSkip }: { step: number; onNext: () => void; onSkip: () => void }) {
  const slide = ONBOARDING[step]
  const isLast = step === 2
  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'white' }}>
      <div style={{ padding: '56px 24px 0', display: 'flex', justifyContent: 'flex-end', minHeight: 80 }}>
        {!isLast && <button onClick={onSkip} style={{ color: C.muted, fontSize: 14, fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}>Skip</button>}
      </div>
      <div className="animate-swift-fade-in" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 32 }}>
        <div style={{ width: 220, height: 220, backgroundColor: slide.bg, borderRadius: 110, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 100 }}>
          {slide.emoji}
        </div>
      </div>
      <div className="animate-swift-slide-up" style={{ padding: '0 32px 52px' }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: C.text, margin: '0 0 12px', letterSpacing: -0.6, lineHeight: 1.2 }}>{slide.title}</h1>
        <p style={{ fontSize: 15, color: C.muted, margin: '0 0 28px', lineHeight: 1.65 }}>{slide.body}</p>
        <div style={{ display: 'flex', gap: 7, marginBottom: 28 }}>
          {ONBOARDING.map((_, i) => (
            <div key={i} style={{ height: 5, width: i === step ? 26 : 5, borderRadius: 3, backgroundColor: i === step ? C.red : C.border, transition: 'all 0.35s ease' }} />
          ))}
        </div>
        <button onClick={onNext} className="btn-press" style={{ width: '100%', padding: 18, backgroundColor: C.red, color: 'white', fontSize: 16, fontWeight: 700, border: 'none', borderRadius: 16, cursor: 'pointer', letterSpacing: -0.2, boxShadow: '0 8px 24px rgba(226,55,68,0.3)' }}>
          {isLast ? "Let's Get Started!" : 'Next'}
        </button>
      </div>
    </div>
  )
}

function HomeScreen({ onRestaurantClick, onSearch, cartTotal, cartCount, onCartClick, favorites, onFav, cartAnimating }: any) {
  const [selCat, setSelCat] = useState<number | null>(null)
  return (
    <div style={{ backgroundColor: C.bg, overflowY: 'auto', minHeight: 'calc(100vh - 80px)' }}>
      {/* Header */}
      <div style={{ backgroundColor: C.surface, padding: '56px 20px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div>
            <p style={{ fontSize: 13, color: C.muted, margin: '0 0 2px', fontWeight: 500 }}>Good afternoon 👋</p>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: C.text, margin: 0, letterSpacing: -0.4 }}>Alex Johnson</h1>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: C.redLight, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
              <Icon.Bell />
              <div style={{ position: 'absolute', top: 9, right: 9, width: 7, height: 7, backgroundColor: C.red, borderRadius: '50%', border: '1.5px solid white' }} />
            </button>
            <div style={{ width: 40, height: 40, borderRadius: 12, overflow: 'hidden', border: `2px solid ${C.border}` }}>
              <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop" alt="Alex" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 16 }}>
          <Icon.Pin />
          <span style={{ fontSize: 13, color: C.text, fontWeight: 600 }}>123 Main St, San Francisco</span>
          <Icon.Chevron dir="down" color={C.muted} />
        </div>
        <button onClick={onSearch} style={{ width: '100%', padding: '13px 16px', backgroundColor: C.bgGray, border: `1.5px solid ${C.border}`, borderRadius: 14, display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', textAlign: 'left' }}>
          <Icon.Search color={C.muted} />
          <span style={{ color: C.subtle, fontSize: 14 }}>Search restaurants, dishes...</span>
        </button>
      </div>

      {/* Promo banner */}
      <div style={{ padding: '16px 20px' }}>
        <div style={{ background: `linear-gradient(130deg, ${C.red} 0%, ${C.orange} 100%)`, borderRadius: 20, padding: 20, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', right: -8, top: -8, fontSize: 84, opacity: 0.12, lineHeight: 1 }}>🎉</div>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 11, fontWeight: 700, margin: '0 0 4px', letterSpacing: 1, textTransform: 'uppercase' }}>Limited Time</p>
          <h3 style={{ color: 'white', fontSize: 22, fontWeight: 800, margin: '0 0 4px', letterSpacing: -0.4 }}>Get 30% off</h3>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13, margin: '0 0 16px' }}>On your first 3 orders with SwiftBite</p>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, backgroundColor: 'white', color: C.red, padding: '7px 14px', borderRadius: 10, fontSize: 12, fontWeight: 800, letterSpacing: 0.5 }}>
            🎟️ SWIFT30
          </div>
        </div>
      </div>

      {/* Categories */}
      <div style={{ padding: '0 20px 16px' }}>
        <SectionHeader title="What's on your mind?" />
        <div style={{ display: 'flex', gap: 10, overflowX: 'auto', scrollbarWidth: 'none', paddingBottom: 4 }}>
          {CATEGORIES.map(cat => (
            <button key={cat.id} onClick={() => setSelCat(selCat === cat.id ? null : cat.id)} className="btn-press" style={{
              flex: '0 0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
              padding: '12px 14px', backgroundColor: selCat === cat.id ? C.redLight : C.surface,
              border: `1.5px solid ${selCat === cat.id ? C.red : C.border}`,
              borderRadius: 16, cursor: 'pointer', transition: 'all 0.2s',
            }}>
              <span style={{ fontSize: 26 }}>{cat.emoji}</span>
              <span style={{ fontSize: 11, fontWeight: 600, color: selCat === cat.id ? C.red : C.muted, whiteSpace: 'nowrap' }}>{cat.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Trending */}
      <div style={{ padding: '0 20px 16px' }}>
        <SectionHeader title="Trending Near You" subtitle="Top picks right now" onSeeAll={() => {}} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {RESTAURANTS.slice(0, 3).map(r => (
            <RestaurantCard key={r.id} restaurant={r} onClick={() => onRestaurantClick(r)} isFav={favorites.has(r.id)} onFav={() => onFav(r.id)} />
          ))}
        </div>
      </div>

      {/* Popular dishes */}
      <div style={{ padding: '0 0 16px' }}>
        <div style={{ padding: '0 20px' }}><SectionHeader title="Popular Dishes" subtitle="Loved by thousands" onSeeAll={() => {}} /></div>
        <div style={{ display: 'flex', gap: 12, overflowX: 'auto', padding: '4px 20px', scrollbarWidth: 'none' }}>
          {MENU_ITEMS.map(item => (
            <div key={item.id} className="card-hover" style={{ flex: '0 0 155px', backgroundColor: C.surface, borderRadius: 16, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', cursor: 'pointer' }}>
              <div style={{ height: 110, overflow: 'hidden', backgroundColor: C.bgGray }}>
                <img src={`https://images.unsplash.com/${item.image}?w=310&h=220&fit=crop&auto=format`} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div style={{ padding: '10px 12px 12px' }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: C.text, margin: '0 0 4px', lineHeight: 1.3 }}>{item.name}</p>
                <p style={{ fontSize: 13, fontWeight: 800, color: C.red, margin: 0 }}>${item.price.toFixed(2)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* More restaurants */}
      <div style={{ padding: '0 20px 24px' }}>
        <SectionHeader title="All Restaurants" onSeeAll={() => {}} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {RESTAURANTS.slice(3).map(r => (
            <RestaurantCard key={r.id} restaurant={r} onClick={() => onRestaurantClick(r)} isFav={favorites.has(r.id)} onFav={() => onFav(r.id)} />
          ))}
        </div>
      </div>

      <CartFAB count={cartCount} total={cartTotal} onClick={onCartClick} animating={cartAnimating} />
    </div>
  )
}

function RestaurantListScreen({ onBack, onRestaurantClick, favorites, onFav }: any) {
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('All')
  const filters = ['All', 'Top Rated', 'Fast Delivery', 'Veg Friendly', 'Offer', 'New']
  const filtered = RESTAURANTS.filter(r =>
    r.name.toLowerCase().includes(query.toLowerCase()) ||
    r.cuisine.toLowerCase().includes(query.toLowerCase())
  )
  return (
    <div style={{ backgroundColor: C.bg, minHeight: '100vh' }}>
      <div style={{ backgroundColor: C.surface, padding: '56px 20px 16px' }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 16 }}>
          <BackButton onClick={onBack} />
          <h1 style={{ fontSize: 20, fontWeight: 800, color: C.text, margin: 0, flex: 1 }}>Explore</h1>
        </div>
        <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 10, backgroundColor: C.bgGray, border: `1.5px solid ${C.border}`, borderRadius: 14, padding: '12px 14px' }}>
            <Icon.Search color={C.muted} />
            <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Restaurants or cuisines…" style={{ flex: 1, border: 'none', backgroundColor: 'transparent', fontSize: 14, color: C.text, outline: 'none' }} />
          </div>
          <button className="btn-press" style={{ width: 48, height: 48, backgroundColor: C.redLight, border: `1.5px solid ${C.redBorder}`, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <Icon.Filter />
          </button>
        </div>
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', scrollbarWidth: 'none', paddingBottom: 4 }}>
          {filters.map(f => (
            <button key={f} onClick={() => setFilter(f)} className="btn-press" style={{ flex: '0 0 auto', padding: '8px 16px', backgroundColor: filter === f ? C.red : C.surface, color: filter === f ? 'white' : C.muted, border: `1.5px solid ${filter === f ? C.red : C.border}`, borderRadius: 100, fontSize: 12, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.2s' }}>
              {f}
            </button>
          ))}
        </div>
      </div>
      <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        <p style={{ fontSize: 13, color: C.muted, margin: 0, fontWeight: 500 }}>{filtered.length} restaurants found</p>
        {filtered.map(r => (
          <RestaurantCard key={r.id} restaurant={r} onClick={() => onRestaurantClick(r)} isFav={favorites.has(r.id)} onFav={() => onFav(r.id)} />
        ))}
      </div>
    </div>
  )
}

function RestaurantDetailScreen({ restaurant: r, onBack, onFoodClick, onAddToCart, cart: _cart, cartTotal, cartCount, onCartClick, favorites, onFav }: any) {
  const [activeTab, setActiveTab] = useState('Popular')
  const tabs = ['Popular', 'Burgers', 'Sides', 'Drinks', 'Desserts']
  const getCount = (id: number) => (_cart.find((c: CartItem) => c.id === id)?.quantity || 0)

  return (
    <div style={{ backgroundColor: C.bg, minHeight: '100vh' }}>
      <div style={{ position: 'relative', height: 270 }}>
        <img src={`https://images.unsplash.com/${r.image}?w=860&h=540&fit=crop&auto=format`} alt={r.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.05) 55%)' }} />
        <button onClick={onBack} className="btn-press" style={{ position: 'absolute', top: 52, left: 16, width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.92)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(6px)' }}>
          <Icon.Back />
        </button>
        <button onClick={() => onFav(r.id)} className="btn-press" style={{ position: 'absolute', top: 52, right: 16, width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.92)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(6px)' }}>
          <Icon.Heart filled={favorites.has(r.id)} />
        </button>
        <div style={{ position: 'absolute', bottom: 16, left: 16, right: 16 }}>
          <h1 style={{ color: 'white', fontSize: 24, fontWeight: 800, margin: '0 0 4px', letterSpacing: -0.4 }}>{r.name}</h1>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13, margin: 0 }}>{r.cuisine}</p>
        </div>
      </div>

      {/* Info chips */}
      <div style={{ backgroundColor: C.surface, padding: '14px 20px' }}>
        <div style={{ display: 'flex', gap: 10, overflowX: 'auto', scrollbarWidth: 'none', marginBottom: 12 }}>
          {[
            { icon: '⭐', label: `${r.rating} (${(r.reviews / 1000).toFixed(1)}k)`, bg: '#FFF8E1' },
            { icon: '⏱️', label: `${r.deliveryTime} min`, bg: '#F0FDF4' },
            { icon: '📍', label: r.distance, bg: C.redLight },
            { icon: '🛵', label: r.deliveryFee === 0 ? 'Free delivery' : `$${r.deliveryFee.toFixed(2)}`, bg: '#EFF6FF' },
          ].map(chip => (
            <div key={chip.label} style={{ flex: '0 0 auto', backgroundColor: chip.bg, borderRadius: 12, padding: '9px 14px', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 13 }}>{chip.icon}</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: C.text, whiteSpace: 'nowrap' }}>{chip.label}</span>
            </div>
          ))}
        </div>
        {r.offer && (
          <div style={{ backgroundColor: '#F0FDF4', borderRadius: 12, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 16 }}>🎁</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: C.green }}>{r.offer}</span>
          </div>
        )}
      </div>

      {/* Sticky tab bar */}
      <div style={{ position: 'sticky', top: 0, backgroundColor: C.surface, borderBottom: `1px solid ${C.border}`, zIndex: 10 }}>
        <div style={{ display: 'flex', overflowX: 'auto', scrollbarWidth: 'none', padding: '0 20px' }}>
          {tabs.map(t => (
            <button key={t} onClick={() => setActiveTab(t)} style={{ flex: '0 0 auto', padding: '14px 16px', backgroundColor: 'transparent', border: 'none', borderBottom: activeTab === t ? `2.5px solid ${C.red}` : '2.5px solid transparent', fontSize: 13, fontWeight: activeTab === t ? 700 : 500, color: activeTab === t ? C.red : C.muted, cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.2s' }}>
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Menu items */}
      <div style={{ padding: '14px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {MENU_ITEMS.map(item => {
          const count = getCount(item.id)
          return (
            <div key={item.id} onClick={() => onFoodClick(item)} className="card-hover" style={{ backgroundColor: C.surface, borderRadius: 18, padding: 14, display: 'flex', gap: 12, cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
                  <div style={{ width: 12, height: 12, borderRadius: 2, border: `2px solid ${item.isVeg ? C.green : C.red}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <div style={{ width: 5, height: 5, borderRadius: '50%', backgroundColor: item.isVeg ? C.green : C.red }} />
                  </div>
                  {item.isBestseller && <span style={{ fontSize: 9, fontWeight: 800, color: C.orange, backgroundColor: '#FFF3E0', padding: '2px 6px', borderRadius: 4, letterSpacing: 0.3 }}>BESTSELLER</span>}
                </div>
                <h4 style={{ fontSize: 14, fontWeight: 700, color: C.text, margin: '0 0 4px', letterSpacing: -0.1 }}>{item.name}</h4>
                <p style={{ fontSize: 12, color: C.muted, margin: '0 0 8px', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{item.description}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 15, fontWeight: 800, color: C.text }}>${item.price.toFixed(2)}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}><Icon.Star size={10} /><span style={{ fontSize: 11, fontWeight: 600, color: C.muted }}>{item.rating}</span></div>
                </div>
              </div>
              <div style={{ position: 'relative', width: 96, flexShrink: 0 }}>
                <img src={`https://images.unsplash.com/${item.image}?w=192&h=192&fit=crop&auto=format`} alt={item.name} style={{ width: 96, height: 96, objectFit: 'cover', borderRadius: 12, display: 'block' }} />
                <div onClick={e => { e.stopPropagation(); onAddToCart(item) }} style={{ position: 'absolute', bottom: -2, right: -2 }}>
                  {count === 0 ? (
                    <div className="btn-press" style={{ backgroundColor: C.red, borderRadius: 10, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 3px 10px rgba(226,55,68,0.4)', cursor: 'pointer' }}>
                      <Icon.Plus />
                    </div>
                  ) : (
                    <div style={{ backgroundColor: C.surface, borderRadius: 10, display: 'flex', alignItems: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.15)', border: `1px solid ${C.border}` }}>
                      <button onClick={e => { e.stopPropagation() }} style={{ width: 28, height: 28, border: 'none', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, color: C.red, fontWeight: 700 }}>−</button>
                      <span style={{ fontSize: 13, fontWeight: 700, color: C.red, minWidth: 16, textAlign: 'center' }}>{count}</span>
                      <button onClick={e => { e.stopPropagation(); onAddToCart(item) }} style={{ width: 28, height: 28, border: 'none', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ backgroundColor: C.red, borderRadius: 7, width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon.Plus /></div>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div style={{ height: 80 }} />
      {cartCount > 0 && (
        <div style={{ position: 'fixed', bottom: 20, left: '50%', transform: 'translateX(-50%)', zIndex: 99, width: 'calc(100% - 40px)', maxWidth: 390 }}>
          <button onClick={onCartClick} className="btn-press" style={{ width: '100%', padding: '15px 20px', backgroundColor: C.red, color: 'white', border: 'none', borderRadius: 16, cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 8px 28px rgba(226,55,68,0.45)', fontSize: 15, fontWeight: 700 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ backgroundColor: 'rgba(255,255,255,0.22)', borderRadius: 8, padding: '3px 9px', fontSize: 13, fontWeight: 700 }}>{cartCount}</div>
              View Cart
            </div>
            <span>${cartTotal.toFixed(2)}</span>
          </button>
        </div>
      )}
    </div>
  )
}

function FoodDetailScreen({ food, restaurant, onBack, onAddToCart }: any) {
  const [qty, setQty] = useState(1)
  const [customs, setCustoms] = useState<string[]>([])
  const options = ['Extra Cheese  +$1.50', 'Extra Patty  +$3.00', 'No Onions', 'Extra Sauce  +$0.50', 'Gluten-Free Bun  +$2.00']
  return (
    <div style={{ backgroundColor: C.surface, minHeight: '100vh' }}>
      <div style={{ position: 'relative', height: 320 }}>
        <img src={`https://images.unsplash.com/${food.image}?w=860&h=640&fit=crop&auto=format`} alt={food.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 50%)' }} />
        <button onClick={onBack} className="btn-press" style={{ position: 'absolute', top: 52, left: 16, width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.92)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon.Back />
        </button>
      </div>
      <div style={{ padding: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: C.text, margin: 0, flex: 1, letterSpacing: -0.4, lineHeight: 1.2 }}>{food.name}</h1>
          <span style={{ fontSize: 22, fontWeight: 800, color: C.red, marginLeft: 12 }}>${food.price.toFixed(2)}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Icon.Star /><span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{food.rating}</span></div>
          <span style={{ color: C.border }}>•</span>
          <span style={{ fontSize: 13, color: C.muted }}>from {restaurant}</span>
          <div style={{ marginLeft: 'auto', width: 12, height: 12, borderRadius: 2, border: `2px solid ${food.isVeg ? C.green : C.red}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 5, height: 5, borderRadius: '50%', backgroundColor: food.isVeg ? C.green : C.red }} />
          </div>
        </div>
        <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.7, marginBottom: 22 }}>{food.description}</p>

        <h3 style={{ fontSize: 16, fontWeight: 700, color: C.text, margin: '0 0 12px' }}>Customise your order</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 26 }}>
          {options.map(o => (
            <button key={o} onClick={() => setCustoms(p => p.includes(o) ? p.filter(x => x !== o) : [...p, o])} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', backgroundColor: customs.includes(o) ? C.redLight : C.bgGray, border: `1.5px solid ${customs.includes(o) ? C.red : C.border}`, borderRadius: 12, cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s' }}>
              <span style={{ fontSize: 13, fontWeight: 500, color: C.text }}>{o}</span>
              <div style={{ width: 20, height: 20, borderRadius: 6, backgroundColor: customs.includes(o) ? C.red : 'transparent', border: `2px solid ${customs.includes(o) ? C.red : C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.2s' }}>
                {customs.includes(o) && <Icon.Check />}
              </div>
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', backgroundColor: C.bgGray, border: `1.5px solid ${C.border}`, borderRadius: 14, padding: 4 }}>
            <button onClick={() => setQty(q => Math.max(1, q - 1))} style={{ width: 40, height: 40, border: 'none', background: 'none', cursor: 'pointer', fontSize: 20, color: C.red, fontWeight: 700 }}>−</button>
            <span style={{ width: 32, textAlign: 'center', fontSize: 16, fontWeight: 700, color: C.text }}>{qty}</span>
            <button onClick={() => setQty(q => q + 1)} style={{ width: 40, height: 40, border: 'none', background: 'none', cursor: 'pointer', fontSize: 20, color: C.red, fontWeight: 700 }}>+</button>
          </div>
          <button onClick={onAddToCart} className="btn-press" style={{ flex: 1, padding: '16px', backgroundColor: C.red, color: 'white', border: 'none', borderRadius: 14, fontSize: 15, fontWeight: 700, cursor: 'pointer', boxShadow: '0 8px 24px rgba(226,55,68,0.3)' }}>
            Add to Cart — ${(food.price * qty).toFixed(2)}
          </button>
        </div>
      </div>
    </div>
  )
}

function CartScreen({ cart, onBack, onAddItem, onRemoveItem, onCheckout, cartTotal }: any) {
  const [coupon, setCoupon] = useState('')
  const [couponOk, setCouponOk] = useState(false)
  const fee = 1.99, tax = cartTotal * 0.08
  const discount = couponOk ? (cartTotal + fee + tax) * 0.1 : 0
  const total = cartTotal + fee + tax - discount

  if (cart.length === 0) return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: C.surface, padding: 40, textAlign: 'center' }}>
      <div style={{ fontSize: 80, marginBottom: 20 }}>🛒</div>
      <h2 style={{ fontSize: 22, fontWeight: 800, color: C.text, margin: '0 0 8px' }}>Your cart is empty</h2>
      <p style={{ fontSize: 14, color: C.muted, margin: '0 0 32px', lineHeight: 1.6 }}>Add some delicious items from restaurants near you</p>
      <button onClick={onBack} className="btn-press" style={{ padding: '16px 32px', backgroundColor: C.red, color: 'white', border: 'none', borderRadius: 14, fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>Explore Restaurants</button>
    </div>
  )

  return (
    <div style={{ backgroundColor: C.bg, minHeight: '100vh' }}>
      <div style={{ backgroundColor: C.surface, padding: '56px 20px 16px' }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <BackButton onClick={onBack} />
          <h1 style={{ fontSize: 20, fontWeight: 800, color: C.text, margin: 0 }}>Your Cart</h1>
          <span style={{ fontSize: 13, color: C.muted, fontWeight: 500 }}>({cart.reduce((s: number, i: CartItem) => s + i.quantity, 0)} items)</span>
        </div>
      </div>
      <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* Items */}
        <div style={{ backgroundColor: C.surface, borderRadius: 20, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          {cart.map((item: CartItem, i: number) => (
            <div key={item.id}>
              <div style={{ padding: 16, display: 'flex', gap: 12, alignItems: 'center' }}>
                <img src={`https://images.unsplash.com/${item.image}?w=120&h=120&fit=crop&auto=format`} alt={item.name} style={{ width: 60, height: 60, borderRadius: 12, objectFit: 'cover', flexShrink: 0, backgroundColor: C.bgGray }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 14, fontWeight: 700, color: C.text, margin: '0 0 3px' }}>{item.name}</p>
                  <p style={{ fontSize: 12, color: C.muted, margin: '0 0 6px' }}>{item.restaurant}</p>
                  <p style={{ fontSize: 14, fontWeight: 800, color: C.red, margin: 0 }}>${(item.price * item.quantity).toFixed(2)}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', backgroundColor: C.bgGray, border: `1.5px solid ${C.border}`, borderRadius: 10 }}>
                  <button onClick={() => onRemoveItem(item.id)} style={{ width: 32, height: 32, border: 'none', background: 'none', cursor: 'pointer', color: C.red, fontWeight: 700, fontSize: 18 }}>−</button>
                  <span style={{ width: 24, textAlign: 'center', fontSize: 14, fontWeight: 700, color: C.text }}>{item.quantity}</span>
                  <button onClick={() => onAddItem(item.id)} style={{ width: 32, height: 32, border: 'none', background: 'none', cursor: 'pointer', color: C.red, fontWeight: 700, fontSize: 18 }}>+</button>
                </div>
              </div>
              {i < cart.length - 1 && <div style={{ height: 1, backgroundColor: '#F3F4F6', margin: '0 16px' }} />}
            </div>
          ))}
        </div>

        {/* Coupon */}
        <div style={{ backgroundColor: C.surface, borderRadius: 16, padding: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, backgroundColor: C.bgGray, border: `1.5px solid ${C.border}`, borderRadius: 12, padding: '11px 14px' }}>
              <span style={{ fontSize: 16 }}>🎟️</span>
              <input value={coupon} onChange={e => setCoupon(e.target.value.toUpperCase())} placeholder="Enter promo code" style={{ flex: 1, border: 'none', background: 'transparent', fontSize: 13, color: C.text, outline: 'none', fontWeight: 500 }} />
            </div>
            <button onClick={() => coupon.length > 0 && setCouponOk(true)} className="btn-press" style={{ padding: '0 18px', backgroundColor: couponOk ? C.green : C.red, color: 'white', border: 'none', borderRadius: 12, fontSize: 13, fontWeight: 700, cursor: 'pointer', transition: 'background 0.2s' }}>
              {couponOk ? '✓ Applied' : 'Apply'}
            </button>
          </div>
          {couponOk && <p style={{ fontSize: 12, color: C.green, margin: '8px 0 0', fontWeight: 600 }}>🎉 10% discount applied successfully!</p>}
        </div>

        {/* Bill */}
        <div style={{ backgroundColor: C.surface, borderRadius: 16, padding: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: C.text, margin: '0 0 14px' }}>Bill Details</h3>
          {[
            { label: 'Item Total', val: cartTotal, neg: false },
            { label: 'Delivery Fee', val: fee, neg: false },
            { label: 'Taxes & Charges', val: tax, neg: false },
            ...(couponOk ? [{ label: 'Promo Discount', val: discount, neg: true }] : []),
          ].map(row => (
            <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
              <span style={{ fontSize: 13, color: C.muted }}>{row.label}</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: row.neg ? C.green : C.text }}>{row.neg ? '-' : ''}${row.val.toFixed(2)}</span>
            </div>
          ))}
          <div style={{ height: 1, backgroundColor: C.border, margin: '12px 0' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 15, fontWeight: 800, color: C.text }}>Total</span>
            <span style={{ fontSize: 15, fontWeight: 800, color: C.red }}>${total.toFixed(2)}</span>
          </div>
        </div>

        {/* Address */}
        <div style={{ backgroundColor: C.surface, borderRadius: 16, padding: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <div style={{ width: 36, height: 36, backgroundColor: C.redLight, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon.Pin /></div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 11, color: C.muted, margin: '0 0 2px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>Delivering to</p>
            <p style={{ fontSize: 14, fontWeight: 700, color: C.text, margin: 0 }}>123 Main Street, Apt 4B</p>
            <p style={{ fontSize: 12, color: C.muted, margin: '2px 0 0' }}>San Francisco, CA 94105</p>
          </div>
          <button style={{ color: C.red, fontSize: 13, fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}>Change</button>
        </div>
      </div>
      <div style={{ padding: '0 20px 36px' }}>
        <button onClick={onCheckout} className="btn-press" style={{ width: '100%', padding: 18, backgroundColor: C.red, color: 'white', border: 'none', borderRadius: 16, fontSize: 16, fontWeight: 700, cursor: 'pointer', boxShadow: '0 8px 28px rgba(226,55,68,0.35)' }}>
          Proceed to Checkout — ${total.toFixed(2)}
        </button>
      </div>
    </div>
  )
}

function CheckoutScreen({ onBack, onPlaceOrder, cartTotal }: any) {
  const [payment, setPayment] = useState('card')
  const [instructions, setInstructions] = useState('')
  const fee = 1.99, tax = cartTotal * 0.08, total = cartTotal + fee + tax
  const methods = [
    { id: 'card', label: 'Credit / Debit Card', icon: '💳', sub: 'Visa ending in 4242' },
    { id: 'apple', label: 'Apple Pay', icon: '🍎', sub: 'Touch ID to pay' },
    { id: 'google', label: 'Google Pay', icon: '🟢', sub: 'Pay with Google' },
    { id: 'cash', label: 'Cash on Delivery', icon: '💵', sub: 'Pay when delivered' },
  ]
  return (
    <div style={{ backgroundColor: C.bg, minHeight: '100vh' }}>
      <div style={{ backgroundColor: C.surface, padding: '56px 20px 16px' }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <BackButton onClick={onBack} />
          <h1 style={{ fontSize: 20, fontWeight: 800, color: C.text, margin: 0 }}>Checkout</h1>
        </div>
      </div>
      <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* Address */}
        <div style={{ backgroundColor: C.surface, borderRadius: 16, padding: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: C.muted, margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: 0.8 }}>Delivery Address</p>
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            <div style={{ width: 36, height: 36, backgroundColor: C.redLight, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon.Pin /></div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 14, fontWeight: 700, color: C.text, margin: '0 0 2px' }}>Home</p>
              <p style={{ fontSize: 13, color: C.muted, margin: 0, lineHeight: 1.5 }}>123 Main Street, Apt 4B, San Francisco, CA 94105</p>
            </div>
            <button style={{ color: C.red, fontSize: 13, fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', flexShrink: 0 }}>Change</button>
          </div>
        </div>
        {/* ETA */}
        <div style={{ backgroundColor: '#FFF8E1', borderRadius: 16, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 26 }}>⚡</span>
          <div>
            <p style={{ fontSize: 13, fontWeight: 700, color: C.text, margin: 0 }}>Estimated arrival: 25–35 min</p>
            <p style={{ fontSize: 12, color: C.muted, margin: '3px 0 0' }}>Your food will arrive hot and fresh</p>
          </div>
        </div>
        {/* Instructions */}
        <div style={{ backgroundColor: C.surface, borderRadius: 16, padding: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: C.muted, margin: '0 0 10px', textTransform: 'uppercase', letterSpacing: 0.8 }}>Delivery Instructions</p>
          <textarea value={instructions} onChange={e => setInstructions(e.target.value)} placeholder="e.g. Ring doorbell twice, leave at door…" style={{ width: '100%', border: `1.5px solid ${C.border}`, borderRadius: 12, padding: 12, fontSize: 13, color: C.text, outline: 'none', resize: 'none', height: 72, backgroundColor: C.bgGray, boxSizing: 'border-box', lineHeight: 1.5 }} />
        </div>
        {/* Payment */}
        <div style={{ backgroundColor: C.surface, borderRadius: 16, padding: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: C.muted, margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: 0.8 }}>Payment Method</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {methods.map(m => (
              <button key={m.id} onClick={() => setPayment(m.id)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', backgroundColor: payment === m.id ? C.redLight : C.bgGray, border: `1.5px solid ${payment === m.id ? C.red : C.border}`, borderRadius: 12, cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s' }}>
                <span style={{ fontSize: 20 }}>{m.icon}</span>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: C.text, margin: 0 }}>{m.label}</p>
                  <p style={{ fontSize: 11, color: C.muted, margin: '2px 0 0' }}>{m.sub}</p>
                </div>
                <div style={{ width: 18, height: 18, borderRadius: '50%', border: `2px solid ${payment === m.id ? C.red : C.border}`, backgroundColor: payment === m.id ? C.red : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.2s' }}>
                  {payment === m.id && <div style={{ width: 6, height: 6, backgroundColor: 'white', borderRadius: '50%' }} />}
                </div>
              </button>
            ))}
          </div>
        </div>
        {/* Summary */}
        <div style={{ backgroundColor: C.surface, borderRadius: 16, padding: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          {[{ l: 'Item Total', v: cartTotal }, { l: 'Delivery Fee', v: fee }, { l: 'Taxes & Charges', v: tax }].map(r => (
            <div key={r.l} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
              <span style={{ fontSize: 13, color: C.muted }}>{r.l}</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: C.text }}>${r.v.toFixed(2)}</span>
            </div>
          ))}
          <div style={{ height: 1, backgroundColor: C.border, margin: '12px 0' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 15, fontWeight: 800, color: C.text }}>Total</span>
            <span style={{ fontSize: 15, fontWeight: 800, color: C.red }}>${total.toFixed(2)}</span>
          </div>
        </div>
      </div>
      <div style={{ padding: '0 20px 36px' }}>
        <button onClick={onPlaceOrder} className="btn-press" style={{ width: '100%', padding: 18, backgroundColor: C.red, color: 'white', border: 'none', borderRadius: 16, fontSize: 16, fontWeight: 700, cursor: 'pointer', boxShadow: '0 8px 28px rgba(226,55,68,0.35)' }}>
          Place Order — ${total.toFixed(2)}
        </button>
      </div>
    </div>
  )
}

function OrderTrackingScreen({ onBack, onViewSuccess }: any) {
  const [step, setStep] = useState(1)
  useEffect(() => {
    const t1 = setTimeout(() => setStep(2), 2000)
    const t2 = setTimeout(() => setStep(3), 4500)
    const t3 = setTimeout(() => setStep(4), 7500)
    const t4 = setTimeout(onViewSuccess, 8800)
    return () => [t1, t2, t3, t4].forEach(clearTimeout)
  }, [])

  const steps = [
    { label: 'Order Confirmed', desc: 'Your order has been received', time: '2:30 PM' },
    { label: 'Being Prepared', desc: 'Chef is crafting your meal', time: '2:33 PM' },
    { label: 'Out for Delivery', desc: 'Marcus is heading your way', time: '2:45 PM' },
    { label: 'Delivered!', desc: 'Enjoy your meal 🎉', time: '2:58 PM' },
  ]

  return (
    <div style={{ backgroundColor: C.surface, minHeight: '100vh' }}>
      <div style={{ padding: '56px 20px 16px', borderBottom: `1px solid ${C.border}` }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 2 }}>
          <BackButton onClick={onBack} />
          <h1 style={{ fontSize: 20, fontWeight: 800, color: C.text, margin: 0 }}>Live Tracking</h1>
        </div>
        <p style={{ fontSize: 13, color: C.muted, margin: '4px 0 0 52px' }}>Order #SWB-20847</p>
      </div>

      {/* Map mockup */}
      <div style={{ height: 220, background: 'linear-gradient(135deg, #E8F4FD 0%, #FFF3E0 50%, #F0FDF4 100%)', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.18 }} viewBox="0 0 430 220" fill="none">
          {[40, 80, 120, 160, 200].map(y => <line key={y} x1="0" y1={y} x2="430" y2={y} stroke="#9CA3AF" strokeWidth="1"/>)}
          {[60, 120, 180, 240, 300, 360].map(x => <line key={x} x1={x} y1="0" x2={x} y2="220" stroke="#9CA3AF" strokeWidth="1"/>)}
        </svg>
        <div style={{ textAlign: 'center', zIndex: 1 }}>
          <div className={step >= 3 ? 'animate-swift-bounce' : ''} style={{ fontSize: 52, marginBottom: 10 }}>
            {step >= 4 ? '🏠' : step >= 3 ? '🛵' : step >= 2 ? '👨‍🍳' : '✅'}
          </div>
          <div style={{ backgroundColor: C.surface, borderRadius: 14, padding: '10px 20px', boxShadow: '0 4px 16px rgba(0,0,0,0.14)' }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: C.text, margin: 0 }}>{steps[Math.min(step - 1, 3)].label}</p>
            <p style={{ fontSize: 11, color: C.muted, margin: '3px 0 0' }}>ETA: {step < 4 ? '25 min' : 'Arrived!'}</p>
          </div>
        </div>
      </div>

      {/* Delivery partner */}
      <div style={{ padding: '14px 20px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: 12 }}>
        <img src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=80&h=80&fit=crop" alt="Marcus" style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover', border: `2px solid ${C.border}` }} />
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: C.text, margin: '0 0 3px' }}>Marcus Chen</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Icon.Star /><span style={{ fontSize: 12, color: C.muted, fontWeight: 500 }}>4.9 · Delivery Partner</span></div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {[{ bg: '#F0FDF4', border: '#BBF7D0', icon: '📞' }, { bg: '#EFF6FF', border: '#BFDBFE', icon: '💬' }].map(b => (
            <button key={b.icon} style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: b.bg, border: `1.5px solid ${b.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 18 }}>{b.icon}</button>
          ))}
        </div>
      </div>

      {/* Timeline */}
      <div style={{ padding: 20 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: C.text, margin: '0 0 18px' }}>Order Timeline</h3>
        {steps.map((s, i) => (
          <div key={i} style={{ display: 'flex', gap: 16 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', backgroundColor: i < step ? C.red : C.bgGray, border: `2px solid ${i < step ? C.red : C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.5s ease' }}>
                {i < step && <Icon.Check size={14} />}
              </div>
              {i < steps.length - 1 && <div style={{ width: 2, height: 40, backgroundColor: i < step - 1 ? C.red : C.border, transition: 'background-color 0.5s ease' }} />}
            </div>
            <div style={{ paddingBottom: i < steps.length - 1 ? 24 : 0, paddingTop: 4 }}>
              <p style={{ fontSize: 14, fontWeight: 700, color: i < step ? C.text : C.subtle, margin: '0 0 2px', transition: 'color 0.5s' }}>{s.label}</p>
              <p style={{ fontSize: 12, color: C.muted, margin: '0 0 2px' }}>{s.desc}</p>
              {i < step && <p style={{ fontSize: 11, color: C.red, margin: 0, fontWeight: 600 }}>{s.time}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function OrderSuccessScreen({ onDone, onTrack }: any) {
  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: C.surface, padding: 40, textAlign: 'center' }}>
      <div className="animate-swift-success" style={{ width: 80, height: 80, backgroundColor: C.green, borderRadius: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24, boxShadow: '0 12px 32px rgba(22,163,74,0.3)' }}>
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      </div>
      <h1 style={{ fontSize: 28, fontWeight: 800, color: C.text, margin: '0 0 10px', letterSpacing: -0.5 }}>Order Placed!</h1>
      <p style={{ fontSize: 15, color: C.muted, margin: '0 0 6px', lineHeight: 1.6 }}>Your food is being prepared and will arrive in</p>
      <p style={{ fontSize: 36, fontWeight: 800, color: C.red, margin: '0 0 10px', letterSpacing: -0.8 }}>25–35 min</p>
      <p style={{ fontSize: 13, color: C.muted, margin: '0 0 36px' }}>Order #SWB-20847</p>
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <button onClick={onTrack} className="btn-press" style={{ width: '100%', padding: 17, backgroundColor: C.red, color: 'white', border: 'none', borderRadius: 15, fontSize: 15, fontWeight: 700, cursor: 'pointer', boxShadow: '0 8px 24px rgba(226,55,68,0.3)' }}>Track My Order</button>
        <button onClick={onDone} className="btn-press" style={{ width: '100%', padding: 17, backgroundColor: C.bgGray, color: C.muted, border: `1.5px solid ${C.border}`, borderRadius: 15, fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>Back to Home</button>
      </div>
    </div>
  )
}

function OrderHistoryScreen() {
  const orders = [
    { id: 'SWB-20847', restaurant: 'The Burger Lab', items: ['Classic Smash Burger', 'Truffle Fries'], total: 18.98, status: 'Delivered', date: 'Today, 2:58 PM', image: 'photo-1568901346375-23c9450c58cd' },
    { id: 'SWB-20831', restaurant: 'Sakura Garden', items: ['Spicy Tuna Roll', 'Miso Soup'], total: 21.98, status: 'Delivered', date: 'Yesterday, 7:30 PM', image: 'photo-1553621042-f6e147245754' },
    { id: 'SWB-20814', restaurant: 'Spice Route', items: ['Butter Chicken', 'Garlic Naan ×2'], total: 19.97, status: 'Delivered', date: 'Jul 25, 1:15 PM', image: 'photo-1585937421612-70a008356fbe' },
    { id: 'SWB-20798', restaurant: 'Green Bowl', items: ['Power Bowl', 'Kombucha'], total: 17.48, status: 'Delivered', date: 'Jul 23, 12:00 PM', image: 'photo-1512621776951-a57141f2eefd' },
  ]
  return (
    <div style={{ backgroundColor: C.bg, minHeight: '100vh' }}>
      <div style={{ backgroundColor: C.surface, padding: '56px 20px 16px', borderBottom: `1px solid ${C.border}` }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: C.text, margin: 0 }}>Your Orders</h1>
      </div>
      <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {orders.map(o => (
          <div key={o.id} style={{ backgroundColor: C.surface, borderRadius: 20, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <div style={{ padding: 16, display: 'flex', gap: 12 }}>
              <img src={`https://images.unsplash.com/${o.image}?w=120&h=120&fit=crop&auto=format`} alt={o.restaurant} style={{ width: 64, height: 64, borderRadius: 14, objectFit: 'cover', flexShrink: 0, backgroundColor: C.bgGray }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: C.text, margin: 0 }}>{o.restaurant}</h3>
                  <span style={{ fontSize: 10, fontWeight: 700, color: C.green, backgroundColor: C.greenLight, padding: '3px 8px', borderRadius: 6 }}>{o.status}</span>
                </div>
                <p style={{ fontSize: 12, color: C.muted, margin: '0 0 4px', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{o.items.join(' · ')}</p>
                <p style={{ fontSize: 12, color: C.subtle, margin: 0 }}>{o.date}</p>
              </div>
            </div>
            <div style={{ borderTop: `1px solid #F3F4F6`, padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 15, fontWeight: 800, color: C.text }}>${o.total.toFixed(2)}</span>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn-press" style={{ padding: '8px 14px', color: C.muted, fontSize: 12, fontWeight: 600, background: 'none', border: `1.5px solid ${C.border}`, borderRadius: 10, cursor: 'pointer' }}>Rate Order</button>
                <button className="btn-press" style={{ padding: '8px 14px', color: C.red, fontSize: 12, fontWeight: 700, background: C.redLight, border: `1.5px solid ${C.redBorder}`, borderRadius: 10, cursor: 'pointer' }}>Reorder</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function FavoritesScreen({ favorites, onRestaurantClick, onFav }: any) {
  const favs = RESTAURANTS.filter(r => favorites.has(r.id))
  return (
    <div style={{ backgroundColor: C.bg, minHeight: '100vh' }}>
      <div style={{ backgroundColor: C.surface, padding: '56px 20px 16px', borderBottom: `1px solid ${C.border}` }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: C.text, margin: 0 }}>Favourites</h1>
      </div>
      <div style={{ padding: '16px 20px' }}>
        {favs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>❤️</div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: C.text, margin: '0 0 8px' }}>No favourites yet</h2>
            <p style={{ fontSize: 14, color: C.muted }}>Tap the heart on any restaurant to save it here</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {favs.map(r => <RestaurantCard key={r.id} restaurant={r} onClick={() => onRestaurantClick(r)} isFav onFav={() => onFav(r.id)} />)}
          </div>
        )}
      </div>
    </div>
  )
}

function NotificationsScreen() {
  const notes = [
    { id: 1, title: 'Order Delivered! 🎉', body: 'Your order from The Burger Lab has been delivered. Enjoy your meal!', time: '2 min ago', type: 'order', unread: true },
    { id: 2, title: 'Special offer just for you', body: 'Get 25% off at Sakura Garden. Valid today only — use code SAK25!', time: '1 hour ago', type: 'offer', unread: true },
    { id: 3, title: 'Your order is on its way', body: 'Marcus is heading to your location. ETA: 10 minutes.', time: '2 hours ago', type: 'order', unread: false },
    { id: 4, title: 'New restaurant nearby!', body: 'Green Bowl just opened near you. Check out their healthy menu!', time: 'Yesterday', type: 'discover', unread: false },
  ]
  const bg: Record<string, string> = { order: C.redLight, offer: '#FFF8E1', discover: C.greenLight }
  const em: Record<string, string> = { order: '📦', offer: '🎁', discover: '🌟' }
  return (
    <div style={{ backgroundColor: C.bg, minHeight: '100vh' }}>
      <div style={{ backgroundColor: C.surface, padding: '56px 20px 16px', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: C.text, margin: 0 }}>Notifications</h1>
        <button style={{ color: C.red, fontSize: 13, fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}>Mark all read</button>
      </div>
      <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {notes.map(n => (
          <div key={n.id} style={{ backgroundColor: C.surface, borderRadius: 16, padding: '14px 16px', display: 'flex', gap: 12, alignItems: 'flex-start', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', borderLeft: n.unread ? `3px solid ${C.red}` : 'none', marginLeft: n.unread ? 0 : 3 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: bg[n.type], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>{em[n.type]}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: C.text, margin: '0 0 4px' }}>{n.title}</p>
              <p style={{ fontSize: 12, color: C.muted, margin: '0 0 5px', lineHeight: 1.5 }}>{n.body}</p>
              <p style={{ fontSize: 11, color: C.subtle, margin: 0, fontWeight: 500 }}>{n.time}</p>
            </div>
            {n.unread && <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: C.red, flexShrink: 0, marginTop: 4 }} />}
          </div>
        ))}
      </div>
    </div>
  )
}

function ProfileScreen({ onSwitchRole, onSettings }: { onSwitchRole: () => void; onSettings: () => void }) {
  const rows = [
    { icon: '📍', label: 'Saved Addresses', sub: '3 addresses saved' },
    { icon: '💳', label: 'Payment Methods', sub: 'Visa, Apple Pay' },
    { icon: '❤️', label: 'Favourite Restaurants', sub: '2 restaurants' },
    { icon: '📦', label: 'Order History', sub: 'View past orders' },
    { icon: '🎁', label: 'Refer & Earn', sub: 'Get $10 per referral' },
    { icon: '🎧', label: 'Help Centre', sub: 'FAQs and support' },
    { icon: '⚙️', label: 'Settings', sub: 'Notifications, privacy…' },
    { icon: '🚪', label: 'Sign Out', sub: '', danger: true },
  ]
  return (
    <div style={{ backgroundColor: C.bg, minHeight: '100vh' }}>
      <div style={{ backgroundColor: C.surface, padding: '56px 20px 22px', borderBottom: `1px solid ${C.border}` }}>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 20 }}>
          <div style={{ position: 'relative' }}>
            <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=160&h=160&fit=crop" alt="Alex" style={{ width: 72, height: 72, borderRadius: 22, objectFit: 'cover', border: `3px solid ${C.border}` }} />
            <div style={{ position: 'absolute', bottom: -2, right: -2, width: 22, height: 22, backgroundColor: C.red, borderRadius: '50%', border: '2px solid white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10 }}>✏️</div>
          </div>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: C.text, margin: '0 0 4px' }}>Alex Johnson</h2>
            <p style={{ fontSize: 13, color: C.muted, margin: '0 0 5px' }}>alex.johnson@gmail.com</p>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, backgroundColor: '#FFF8E1', padding: '3px 10px', borderRadius: 8 }}>
              <Icon.Star /><span style={{ fontSize: 12, fontWeight: 700, color: C.orange }}>Gold Member</span>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', backgroundColor: C.bgGray, borderRadius: 16, overflow: 'hidden', border: `1px solid ${C.border}` }}>
          {[{ v: '47', l: 'Orders' }, { v: '$284', l: 'Saved' }, { v: '4.9★', l: 'Rating' }].map((s, i) => (
            <div key={s.l} style={{ flex: 1, padding: '13px 0', textAlign: 'center', borderRight: i < 2 ? `1px solid ${C.border}` : 'none' }}>
              <p style={{ fontSize: 18, fontWeight: 800, color: C.red, margin: '0 0 2px' }}>{s.v}</p>
              <p style={{ fontSize: 11, color: C.muted, margin: 0, fontWeight: 500 }}>{s.l}</p>
            </div>
          ))}
        </div>
      </div>
      <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {rows.map((r) => (
          <button key={r.label} onClick={r.label === 'Settings' ? onSettings : undefined} className="btn-press" style={{ backgroundColor: C.surface, borderRadius: 16, padding: '14px 16px', display: 'flex', gap: 12, alignItems: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', border: 'none', cursor: 'pointer', textAlign: 'left', width: '100%' }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: (r as any).danger ? C.redLight : C.bgGray, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>{r.icon}</div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 14, fontWeight: 700, color: (r as any).danger ? C.red : C.text, margin: 0 }}>{r.label}</p>
              {r.sub && <p style={{ fontSize: 12, color: C.subtle, margin: '2px 0 0' }}>{r.sub}</p>}
            </div>
            {!(r as any).danger && <Icon.Chevron />}
          </button>
        ))}
      </div>
      {/* Switch Portal — demo mode */}
      <div style={{ padding: '0 20px 8px' }}>
        <button onClick={onSwitchRole} style={{ width: '100%', padding: '14px 16px', backgroundColor: '#F5F3FF', border: '1.5px solid #DDD6FE', borderRadius: 16, display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', textAlign: 'left' }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: '#EDE9FE', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>⇄</div>
          <div>
            <p style={{ fontSize: 14, fontWeight: 700, color: '#7C3AED', margin: 0 }}>Switch Portal</p>
            <p style={{ fontSize: 12, color: '#6B7280', margin: '2px 0 0' }}>Admin · Delivery Partner · Restaurant Owner</p>
          </div>
          <div style={{ marginLeft: 'auto', fontSize: 10, fontWeight: 700, color: '#7C3AED', backgroundColor: '#EDE9FE', padding: '3px 8px', borderRadius: 6 }}>DEMO</div>
        </button>
      </div>

      <p style={{ textAlign: 'center', fontSize: 12, color: C.subtle, padding: '6px 0 36px' }}>SwiftBite v1.0.0 · Made with ❤️</p>
    </div>
  )
}

// ── Auth: Shared helpers ──────────────────────────────────────────────────────

function AuthHeader({ title, subtitle, onBack }: { title: string; subtitle: string; onBack?: () => void }) {
  return (
    <div style={{ padding: '56px 24px 0' }}>
      {onBack && (
        <button onClick={onBack} className="btn-press" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: C.muted, fontSize: 14, fontWeight: 600, marginBottom: 24, padding: 0 }}>
          <Icon.Back /> Back
        </button>
      )}
      <h1 style={{ fontSize: 28, fontWeight: 800, color: C.text, margin: '0 0 8px', letterSpacing: -0.6, lineHeight: 1.2 }}>{title}</h1>
      <p style={{ fontSize: 15, color: C.muted, margin: '0 0 32px', lineHeight: 1.6 }}>{subtitle}</p>
    </div>
  )
}

function AuthInput({ label, type = 'text', placeholder, value, onChange, icon, right }: { label: string; type?: string; placeholder: string; value: string; onChange: (v: string) => void; icon: string; right?: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ fontSize: 13, fontWeight: 700, color: C.text, display: 'block', marginBottom: 8 }}>{label}</label>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, backgroundColor: C.bgGray, border: `1.5px solid ${C.border}`, borderRadius: 14, padding: '14px 16px' }}>
        <span style={{ fontSize: 18, flexShrink: 0 }}>{icon}</span>
        <input
          type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
          style={{ flex: 1, border: 'none', background: 'transparent', fontSize: 15, color: C.text, outline: 'none' }}
        />
        {right}
      </div>
    </div>
  )
}

function SocialLogin() {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '24px 0' }}>
        <div style={{ flex: 1, height: 1, backgroundColor: C.border }} />
        <span style={{ fontSize: 12, color: C.muted, fontWeight: 600 }}>or continue with</span>
        <div style={{ flex: 1, height: 1, backgroundColor: C.border }} />
      </div>
      <div style={{ display: 'flex', gap: 12 }}>
        {[
          { icon: '🍎', label: 'Apple', bg: '#000', color: 'white' },
          { icon: '🟢', label: 'Google', bg: 'white', color: C.text },
          { icon: '📘', label: 'Facebook', bg: '#1877F2', color: 'white' },
        ].map(s => (
          <button key={s.label} className="btn-press" style={{ flex: 1, padding: '13px 0', backgroundColor: s.bg, color: s.color, border: `1.5px solid ${s.bg === 'white' ? C.border : s.bg}`, borderRadius: 14, fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <span style={{ fontSize: 16 }}>{s.icon}</span> {s.label}
          </button>
        ))}
      </div>
    </div>
  )
}

// ── Auth: Login ───────────────────────────────────────────────────────────────
function LoginScreen({ onLogin, onSignUp, onForgot }: { onLogin: () => void; onSignUp: () => void; onForgot: () => void }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = () => {
    if (!email || !password) { setError("Please fill in your email and password."); return }
    setError(''); setLoading(true)
    setTimeout(() => { setLoading(false); onLogin() }, 1200)
  }

  return (
    <div style={{ backgroundColor: 'white', minHeight: '100vh' }}>
      {/* Top accent */}
      <div style={{ height: 6, background: `linear-gradient(90deg, ${C.red}, ${C.orange})` }} />

      <div style={{ padding: '40px 24px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 8 }}>
        <div style={{ width: 64, height: 64, backgroundColor: C.redLight, borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, marginBottom: 16 }}>⚡</div>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: C.text, margin: '0 0 6px', letterSpacing: -0.6 }}>Welcome back!</h1>
        <p style={{ fontSize: 14, color: C.muted, margin: 0, textAlign: 'center' }}>Sign in to continue ordering your favourites</p>
      </div>

      <div style={{ padding: '24px 24px 0' }}>
        <AuthInput label="Email address" type="email" placeholder="alex@example.com" value={email} onChange={setEmail} icon="✉️" />
        <AuthInput
          label="Password" type={showPw ? 'text' : 'password'} placeholder="Your password" value={password} onChange={setPassword} icon="🔒"
          right={
            <button onClick={() => setShowPw(!showPw)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, padding: 0, color: C.muted }}>{showPw ? '🙈' : '👁️'}</button>
          }
        />

        {error && (
          <div style={{ backgroundColor: C.redLight, border: `1px solid ${C.redBorder}`, borderRadius: 12, padding: '10px 14px', marginBottom: 16 }}>
            <p style={{ fontSize: 13, color: C.red, margin: 0, fontWeight: 500 }}>⚠️ {error}</p>
          </div>
        )}

        <div style={{ textAlign: 'right', marginBottom: 24 }}>
          <button onClick={onForgot} style={{ background: 'none', border: 'none', color: C.red, fontSize: 13, fontWeight: 600, cursor: 'pointer', padding: 0 }}>Forgot password?</button>
        </div>

        <button onClick={handleLogin} disabled={loading} className="btn-press" style={{ width: '100%', padding: 18, backgroundColor: loading ? '#F9FAFB' : C.red, color: loading ? C.muted : 'white', border: `1.5px solid ${loading ? C.border : C.red}`, borderRadius: 16, fontSize: 16, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', boxShadow: loading ? 'none' : '0 8px 24px rgba(226,55,68,0.3)', transition: 'all 0.2s' }}>
          {loading ? 'Signing you in…' : 'Sign In'}
        </button>

        <SocialLogin />

        <p style={{ textAlign: 'center', fontSize: 14, color: C.muted, margin: '24px 0 40px' }}>
          Don't have an account?{' '}
          <button onClick={onSignUp} style={{ background: 'none', border: 'none', color: C.red, fontWeight: 700, cursor: 'pointer', fontSize: 14, padding: 0 }}>Sign up</button>
        </p>
      </div>
    </div>
  )
}

// ── Auth: Sign Up ─────────────────────────────────────────────────────────────
function SignUpScreen({ onSignUp, onLogin }: { onSignUp: () => void; onLogin: () => void }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [agreed, setAgreed] = useState(false)
  const [loading, setLoading] = useState(false)

  const strength = password.length === 0 ? 0 : password.length < 6 ? 1 : password.length < 10 ? 2 : 3
  const strengthColors = ['', C.red, C.orange, C.green]
  const strengthLabels = ['', 'Weak', 'Good', 'Strong']

  const handle = () => {
    setLoading(true)
    setTimeout(() => { setLoading(false); onSignUp() }, 1200)
  }

  return (
    <div style={{ backgroundColor: 'white', minHeight: '100vh', overflowY: 'auto' }}>
      <div style={{ height: 6, background: `linear-gradient(90deg, ${C.red}, ${C.orange})` }} />
      <AuthHeader title="Create account" subtitle="Join SwiftBite and start ordering amazing food today." />
      <div style={{ padding: '0 24px 40px' }}>
        <AuthInput label="Full name" placeholder="Alex Johnson" value={name} onChange={setName} icon="👤" />
        <AuthInput label="Email address" type="email" placeholder="alex@example.com" value={email} onChange={setEmail} icon="✉️" />
        <AuthInput label="Phone number" type="tel" placeholder="+1 (555) 000-0000" value={phone} onChange={setPhone} icon="📱" />
        <AuthInput
          label="Password" type={showPw ? 'text' : 'password'} placeholder="Create a strong password" value={password} onChange={setPassword} icon="🔒"
          right={<button onClick={() => setShowPw(!showPw)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, padding: 0 }}>{showPw ? '🙈' : '👁️'}</button>}
        />

        {/* Password strength */}
        {password.length > 0 && (
          <div style={{ marginBottom: 16, marginTop: -8 }}>
            <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
              {[1, 2, 3].map(i => (
                <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, backgroundColor: i <= strength ? strengthColors[strength] : C.border, transition: 'background 0.3s' }} />
              ))}
            </div>
            <p style={{ fontSize: 11, color: strengthColors[strength], fontWeight: 600, margin: 0 }}>{strengthLabels[strength]} password</p>
          </div>
        )}

        {/* T&C */}
        <button onClick={() => setAgreed(!agreed)} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', padding: '0 0 20px', width: '100%' }}>
          <div style={{ width: 22, height: 22, borderRadius: 7, border: `2px solid ${agreed ? C.red : C.border}`, backgroundColor: agreed ? C.red : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1, transition: 'all 0.2s' }}>
            {agreed && <Icon.Check size={12} />}
          </div>
          <span style={{ fontSize: 13, color: C.muted, lineHeight: 1.5 }}>
            I agree to SwiftBite's <span style={{ color: C.red, fontWeight: 600 }}>Terms of Service</span> and <span style={{ color: C.red, fontWeight: 600 }}>Privacy Policy</span>
          </span>
        </button>

        <button onClick={handle} disabled={loading || !agreed} className="btn-press" style={{ width: '100%', padding: 18, backgroundColor: !agreed || loading ? '#F9FAFB' : C.red, color: !agreed || loading ? C.muted : 'white', border: `1.5px solid ${!agreed || loading ? C.border : C.red}`, borderRadius: 16, fontSize: 16, fontWeight: 700, cursor: !agreed || loading ? 'not-allowed' : 'pointer', boxShadow: !agreed || loading ? 'none' : '0 8px 24px rgba(226,55,68,0.3)', transition: 'all 0.2s' }}>
          {loading ? 'Creating your account…' : 'Create Account'}
        </button>

        <SocialLogin />

        <p style={{ textAlign: 'center', fontSize: 14, color: C.muted, margin: '24px 0' }}>
          Already have an account?{' '}
          <button onClick={onLogin} style={{ background: 'none', border: 'none', color: C.red, fontWeight: 700, cursor: 'pointer', fontSize: 14, padding: 0 }}>Sign in</button>
        </p>
      </div>
    </div>
  )
}

// ── Auth: Forgot Password ─────────────────────────────────────────────────────
function ForgotScreen({ onSend, onBack }: { onSend: () => void; onBack: () => void }) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  const handle = () => {
    setLoading(true)
    setTimeout(() => { setLoading(false); onSend() }, 1200)
  }

  return (
    <div style={{ backgroundColor: 'white', minHeight: '100vh' }}>
      <div style={{ height: 6, background: `linear-gradient(90deg, ${C.red}, ${C.orange})` }} />
      <AuthHeader title="Forgot password?" subtitle="No worries! Enter your email and we'll send you a reset code right away." onBack={onBack} />
      <div style={{ padding: '0 24px' }}>
        <div style={{ width: 80, height: 80, backgroundColor: C.redLight, borderRadius: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40, marginBottom: 28 }}>🔑</div>
        <AuthInput label="Email address" type="email" placeholder="alex@example.com" value={email} onChange={setEmail} icon="✉️" />
        <p style={{ fontSize: 13, color: C.muted, margin: '4px 0 24px', lineHeight: 1.6 }}>We'll send a 6-digit verification code to this email. Check your spam folder if you don't see it.</p>
        <button onClick={handle} disabled={!email || loading} className="btn-press" style={{ width: '100%', padding: 18, backgroundColor: !email || loading ? '#F9FAFB' : C.red, color: !email || loading ? C.muted : 'white', border: `1.5px solid ${!email || loading ? C.border : C.red}`, borderRadius: 16, fontSize: 16, fontWeight: 700, cursor: !email || loading ? 'not-allowed' : 'pointer', transition: 'all 0.2s', boxShadow: !email || loading ? 'none' : '0 8px 24px rgba(226,55,68,0.3)' }}>
          {loading ? 'Sending code…' : 'Send Reset Code'}
        </button>
      </div>
    </div>
  )
}

// ── Auth: OTP Verification ────────────────────────────────────────────────────
function OTPScreen({ onVerify, onBack, onResend }: { onVerify: () => void; onBack: () => void; onResend: () => void }) {
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [countdown, setCountdown] = useState(30)

  useEffect(() => {
    if (countdown > 0) { const t = setTimeout(() => setCountdown(c => c - 1), 1000); return () => clearTimeout(t) }
  }, [countdown])

  const handleChange = (i: number, v: string) => {
    if (!/^\d?$/.test(v)) return
    const next = [...otp]; next[i] = v; setOtp(next)
    if (v && i < 5) (document.getElementById(`otp-${i + 1}`) as HTMLInputElement)?.focus()
  }

  const handleKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) (document.getElementById(`otp-${i - 1}`) as HTMLInputElement)?.focus()
  }

  const filled = otp.every(d => d !== '')

  const handle = () => {
    setLoading(true)
    setTimeout(() => { setLoading(false); onVerify() }, 1000)
  }

  return (
    <div style={{ backgroundColor: 'white', minHeight: '100vh' }}>
      <div style={{ height: 6, background: `linear-gradient(90deg, ${C.red}, ${C.orange})` }} />
      <AuthHeader title="Enter the code" subtitle="We sent a 6-digit verification code to alex@example.com" onBack={onBack} />
      <div style={{ padding: '0 24px' }}>
        {/* OTP boxes */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
          {otp.map((d, i) => (
            <input
              key={i} id={`otp-${i}`} type="text" inputMode="numeric" maxLength={1} value={d}
              onChange={e => handleChange(i, e.target.value)}
              onKeyDown={e => handleKeyDown(i, e)}
              style={{ flex: 1, height: 56, textAlign: 'center', fontSize: 22, fontWeight: 800, color: C.text, backgroundColor: d ? C.redLight : C.bgGray, border: `2px solid ${d ? C.red : C.border}`, borderRadius: 14, outline: 'none', transition: 'all 0.2s' }}
            />
          ))}
        </div>

        {/* Countdown */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          {countdown > 0 ? (
            <p style={{ fontSize: 14, color: C.muted, margin: 0 }}>Resend code in <strong style={{ color: C.text }}>{countdown}s</strong></p>
          ) : (
            <button onClick={() => { onResend(); setCountdown(30) }} style={{ background: 'none', border: 'none', color: C.red, fontSize: 14, fontWeight: 700, cursor: 'pointer', padding: 0 }}>Resend code</button>
          )}
        </div>

        <button onClick={handle} disabled={!filled || loading} className="btn-press" style={{ width: '100%', padding: 18, backgroundColor: !filled || loading ? '#F9FAFB' : C.red, color: !filled || loading ? C.muted : 'white', border: `1.5px solid ${!filled || loading ? C.border : C.red}`, borderRadius: 16, fontSize: 16, fontWeight: 700, cursor: !filled || loading ? 'not-allowed' : 'pointer', transition: 'all 0.2s', boxShadow: !filled || loading ? 'none' : '0 8px 24px rgba(226,55,68,0.3)' }}>
          {loading ? 'Verifying…' : 'Verify Code'}
        </button>
      </div>
    </div>
  )
}

// ── Auth: Password Reset ──────────────────────────────────────────────────────
function ResetScreen({ onReset, onBack }: { onReset: () => void; onBack: () => void }) {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)

  const match = password && confirm && password === confirm
  const mismatch = confirm && password !== confirm

  const handle = () => {
    setLoading(true)
    setTimeout(() => { setLoading(false); onReset() }, 1200)
  }

  return (
    <div style={{ backgroundColor: 'white', minHeight: '100vh' }}>
      <div style={{ height: 6, background: `linear-gradient(90deg, ${C.red}, ${C.orange})` }} />
      <AuthHeader title="Set new password" subtitle="Your new password must be different from your previous password." onBack={onBack} />
      <div style={{ padding: '0 24px' }}>
        <div style={{ width: 80, height: 80, backgroundColor: C.greenLight, borderRadius: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40, marginBottom: 28 }}>🔐</div>
        <AuthInput
          label="New password" type={showPw ? 'text' : 'password'} placeholder="Create a strong password" value={password} onChange={setPassword} icon="🔒"
          right={<button onClick={() => setShowPw(!showPw)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, padding: 0 }}>{showPw ? '🙈' : '👁️'}</button>}
        />
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 13, fontWeight: 700, color: C.text, display: 'block', marginBottom: 8 }}>Confirm password</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, backgroundColor: C.bgGray, border: `1.5px solid ${mismatch ? C.red : match ? C.green : C.border}`, borderRadius: 14, padding: '14px 16px', transition: 'border-color 0.2s' }}>
            <span style={{ fontSize: 18 }}>🔒</span>
            <input type={showPw ? 'text' : 'password'} value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Repeat your password" style={{ flex: 1, border: 'none', background: 'transparent', fontSize: 15, color: C.text, outline: 'none' }} />
            {match && <span style={{ fontSize: 16 }}>✅</span>}
            {mismatch && <span style={{ fontSize: 16 }}>❌</span>}
          </div>
          {mismatch && <p style={{ fontSize: 12, color: C.red, margin: '6px 0 0', fontWeight: 500 }}>Passwords don't match</p>}
        </div>

        {/* Requirements */}
        <div style={{ backgroundColor: C.bgGray, borderRadius: 12, padding: '12px 14px', marginBottom: 24 }}>
          {[
            { label: 'At least 8 characters', met: password.length >= 8 },
            { label: 'One uppercase letter', met: /[A-Z]/.test(password) },
            { label: 'One number', met: /\d/.test(password) },
          ].map(req => (
            <div key={req.label} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <div style={{ width: 16, height: 16, borderRadius: '50%', backgroundColor: req.met ? C.green : C.border, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'background 0.2s' }}>
                {req.met && <Icon.Check size={10} />}
              </div>
              <span style={{ fontSize: 12, color: req.met ? C.green : C.muted, fontWeight: req.met ? 600 : 400, transition: 'color 0.2s' }}>{req.label}</span>
            </div>
          ))}
        </div>

        <button onClick={handle} disabled={!match || loading} className="btn-press" style={{ width: '100%', padding: 18, backgroundColor: !match || loading ? '#F9FAFB' : C.red, color: !match || loading ? C.muted : 'white', border: `1.5px solid ${!match || loading ? C.border : C.red}`, borderRadius: 16, fontSize: 16, fontWeight: 700, cursor: !match || loading ? 'not-allowed' : 'pointer', transition: 'all 0.2s', boxShadow: !match || loading ? 'none' : '0 8px 24px rgba(226,55,68,0.3)' }}>
          {loading ? 'Resetting password…' : 'Reset Password'}
        </button>
      </div>
    </div>
  )
}

// ── Settings Screen ───────────────────────────────────────────────────────────
function SettingsScreen({ onBack }: { onBack: () => void }) {
  const [notifications, setNotifications] = useState({ orders: true, offers: true, news: false, sms: true })
  const [language, setLanguage] = useState('English')
  const [theme, setTheme] = useState('Light')

  function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
    return (
      <button onClick={onToggle} style={{ width: 44, height: 24, borderRadius: 12, backgroundColor: on ? C.red : '#D1D5DB', border: 'none', cursor: 'pointer', position: 'relative', flexShrink: 0, transition: 'background 0.25s' }}>
        <div style={{ width: 18, height: 18, borderRadius: '50%', backgroundColor: 'white', position: 'absolute', top: 3, left: on ? 23 : 3, transition: 'left 0.25s', boxShadow: '0 1px 4px rgba(0,0,0,0.25)' }} />
      </button>
    )
  }

  function SectionLabel({ title }: { title: string }) {
    return <p style={{ fontSize: 11, fontWeight: 700, color: C.muted, margin: '20px 0 8px', textTransform: 'uppercase', letterSpacing: 0.8 }}>{title}</p>
  }

  function Row({ icon, label, sub, right }: { icon: string; label: string; sub?: string; right: React.ReactNode }) {
    return (
      <div style={{ backgroundColor: 'white', borderRadius: 14, padding: '13px 16px', display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8, boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
        <div style={{ width: 36, height: 36, backgroundColor: C.bgGray, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, flexShrink: 0 }}>{icon}</div>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 14, fontWeight: 600, color: C.text, margin: 0 }}>{label}</p>
          {sub && <p style={{ fontSize: 11, color: C.muted, margin: '2px 0 0' }}>{sub}</p>}
        </div>
        {right}
      </div>
    )
  }

  return (
    <div style={{ backgroundColor: C.bg, minHeight: '100vh', paddingBottom: 40 }}>
      <div style={{ backgroundColor: 'white', padding: '56px 20px 16px', borderBottom: `1px solid ${C.border}` }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <BackButton onClick={onBack} />
          <h1 style={{ fontSize: 20, fontWeight: 800, color: C.text, margin: 0 }}>Settings</h1>
        </div>
      </div>

      <div style={{ padding: '4px 20px' }}>
        <SectionLabel title="Appearance" />
        <div style={{ backgroundColor: 'white', borderRadius: 14, padding: '4px', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', marginBottom: 8 }}>
          {(['Light', 'Dark', 'System'] as const).map(t => (
            <button key={t} onClick={() => setTheme(t)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '11px 12px', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', borderRadius: 10, textAlign: 'left' }}>
              <span style={{ fontSize: 18 }}>{t === 'Light' ? '☀️' : t === 'Dark' ? '🌙' : '⚙️'}</span>
              <span style={{ flex: 1, fontSize: 14, fontWeight: 600, color: C.text }}>{t}</span>
              <div style={{ width: 18, height: 18, borderRadius: '50%', border: `2px solid ${theme === t ? C.red : C.border}`, backgroundColor: theme === t ? C.red : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}>
                {theme === t && <div style={{ width: 6, height: 6, backgroundColor: 'white', borderRadius: '50%' }} />}
              </div>
            </button>
          ))}
        </div>

        <SectionLabel title="Notifications" />
        <Row icon="📦" label="Order Updates" sub="Delivery status and confirmations" right={<Toggle on={notifications.orders} onToggle={() => setNotifications(p => ({ ...p, orders: !p.orders }))} />} />
        <Row icon="🎁" label="Offers & Deals" sub="Personalised discounts and promos" right={<Toggle on={notifications.offers} onToggle={() => setNotifications(p => ({ ...p, offers: !p.offers }))} />} />
        <Row icon="📰" label="News & Updates" sub="New restaurants and features" right={<Toggle on={notifications.news} onToggle={() => setNotifications(p => ({ ...p, news: !p.news }))} />} />
        <Row icon="💬" label="SMS Notifications" sub="Text messages for orders" right={<Toggle on={notifications.sms} onToggle={() => setNotifications(p => ({ ...p, sms: !p.sms }))} />} />

        <SectionLabel title="Language & Region" />
        <div style={{ backgroundColor: 'white', borderRadius: 14, padding: '4px', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', marginBottom: 8 }}>
          {[{ code: 'English', flag: '🇺🇸' }, { code: 'Spanish', flag: '🇪🇸' }, { code: 'French', flag: '🇫🇷' }, { code: 'Hindi', flag: '🇮🇳' }].map(l => (
            <button key={l.code} onClick={() => setLanguage(l.code)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '11px 12px', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', borderRadius: 10, textAlign: 'left' }}>
              <span style={{ fontSize: 20 }}>{l.flag}</span>
              <span style={{ flex: 1, fontSize: 14, fontWeight: 600, color: C.text }}>{l.code}</span>
              {language === l.code && <Icon.Check color={C.red} size={16} />}
            </button>
          ))}
        </div>

        <SectionLabel title="Privacy & Security" />
        {[
          { icon: '🔒', label: 'Change Password', sub: 'Update your account password' },
          { icon: '📍', label: 'Location Permissions', sub: 'Manage location access' },
          { icon: '🛡️', label: 'Two-Factor Authentication', sub: 'Extra security for your account' },
          { icon: '📋', label: 'Privacy Policy', sub: 'How we use your data' },
          { icon: '📜', label: 'Terms of Service', sub: 'App usage terms' },
        ].map(row => (
          <Row key={row.label} icon={row.icon} label={row.label} sub={row.sub} right={<Icon.Chevron />} />
        ))}

        <SectionLabel title="About" />
        {[
          { icon: '⭐', label: 'Rate SwiftBite', sub: 'Share your feedback on the App Store' },
          { icon: '📤', label: 'Share with Friends', sub: 'Invite friends and earn rewards' },
          { icon: 'ℹ️', label: 'App Version', sub: 'SwiftBite v1.0.0 (Build 42)' },
        ].map(row => (
          <Row key={row.label} icon={row.icon} label={row.label} sub={row.sub} right={row.label === 'App Version' ? <span style={{ fontSize: 12, color: C.muted }}>Latest</span> : <Icon.Chevron />} />
        ))}

        <button className="btn-press" style={{ width: '100%', padding: '14px', backgroundColor: C.redLight, color: C.red, border: `1.5px solid ${C.redBorder}`, borderRadius: 14, fontSize: 15, fontWeight: 700, cursor: 'pointer', marginTop: 8 }}>
          🚪 Sign Out
        </button>
        <button className="btn-press" style={{ width: '100%', padding: '14px', backgroundColor: 'transparent', color: C.muted, border: `1.5px solid ${C.border}`, borderRadius: 14, fontSize: 14, fontWeight: 600, cursor: 'pointer', marginTop: 8 }}>
          Delete Account
        </button>
      </div>
    </div>
  )
}

// ── Bottom Navigation ─────────────────────────────────────────────────────────

const TABS: { id: NavTab; label: string; IconComp: (p: { active?: boolean }) => ReactNode }[] = [
  { id: 'home', label: 'Home', IconComp: Icon.Home },
  { id: 'explore', label: 'Explore', IconComp: ({ active }) => <Icon.Search active={active} /> },
  { id: 'orders', label: 'Orders', IconComp: Icon.Bag },
  { id: 'profile', label: 'Profile', IconComp: Icon.User },
]

const TAB_SCREEN: Record<NavTab, Screen> = { home: 'home', explore: 'restaurants', orders: 'history', profile: 'profile' }
const SCREEN_TAB: Partial<Record<Screen, NavTab>> = { home: 'home', restaurants: 'explore', 'restaurant-detail': 'explore', 'food-detail': 'explore', history: 'orders', favorites: 'profile', notifications: 'profile', profile: 'profile' }

// Floating pill shown in non-customer portals so user can always switch back
function SwitchRoleButton({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} style={{ position: 'fixed', bottom: 96, right: 16, zIndex: 150, background: 'rgba(17, 24, 39, 0.92)', color: 'white', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 999, padding: '10px 16px', fontSize: 12, fontWeight: 700, cursor: 'pointer', boxShadow: '0 14px 30px rgba(15,23,42,0.28)', display: 'flex', alignItems: 'center', gap: 6, backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)' }}>
      <span style={{ fontSize: 14 }}>⇄</span> Switch Role
    </button>
  )
}

// ── Root App ──────────────────────────────────────────────────────────────────

import { LandingPageScreen } from './LandingPageScreen';

export { LandingPageScreen, SplashScreen, OnboardingScreen, HomeScreen, RestaurantListScreen, RestaurantDetailScreen, FoodDetailScreen, CartScreen, OrderTrackingScreen, OrderSuccessScreen, OrderHistoryScreen, FavoritesScreen, NotificationsScreen, ProfileScreen, LoginScreen, SignUpScreen, ForgotScreen, OTPScreen, ResetScreen, SettingsScreen };
