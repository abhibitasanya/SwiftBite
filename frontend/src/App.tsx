import { useState, useEffect, type ReactNode } from 'react'
import RoleSelector, { type Role } from './portals/RoleSelector'
import AdminPortal from './portals/AdminPortal'
import DeliveryPortal from './portals/DeliveryPortal'
import RestaurantPortal from './portals/RestaurantPortal'

import { SplashScreen, OnboardingScreen, HomeScreen, RestaurantListScreen, RestaurantDetailScreen, FoodDetailScreen, CartScreen, OrderTrackingScreen, OrderSuccessScreen, OrderHistoryScreen, FavoritesScreen, NotificationsScreen, ProfileScreen, LoginScreen, SignUpScreen, ForgotScreen, OTPScreen, ResetScreen, SettingsScreen, TABS, TAB_SCREEN, SCREEN_TAB, SwitchRoleButton, LandingPageScreen } from './screens';
import { Restaurant, MenuItem, CartItem, Screen, type NavTab } from './types';
export default function App() {
  const [role, setRole] = useState<Role>('customer')
  const [showRoleSelector, setShowRoleSelector] = useState(false)
  const [screen, setScreen] = useState<Screen>('landing')
  const [history, setHistory] = useState<Screen[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [selRestaurant, setSelRestaurant] = useState<Restaurant | null>(null)
  const [selFood, setSelFood] = useState<MenuItem | null>(null)
  const [favorites, setFavorites] = useState<Set<number>>(new Set([1, 3]))
  const [onboStep, setOnboStep] = useState(0)
  const [cartAnim, setCartAnim] = useState(false)

  useEffect(() => {
    if (screen === 'splash') {
      const t = setTimeout(() => goto('onboarding'), 2600)
      return () => clearTimeout(t)
    }
  }, [screen])

  const goto = (s: Screen) => { setHistory(h => [...h, screen]); setScreen(s) }
  const goBack = () => { const prev = history[history.length - 1] || 'home'; setHistory(h => h.slice(0, -1)); setScreen(prev) }

  const addToCart = (item: MenuItem, restaurant: string) => {
    setCartAnim(true); setTimeout(() => setCartAnim(false), 500)
    setCart(prev => {
      const ex = prev.find(c => c.id === item.id)
      return ex ? prev.map(c => c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c)
        : [...prev, { id: item.id, name: item.name, price: item.price, quantity: 1, image: item.image, restaurant }]
    })
  }

  const removeFromCart = (id: number) => setCart(prev => {
    const ex = prev.find(c => c.id === id)
    return ex && ex.quantity > 1 ? prev.map(c => c.id === id ? { ...c, quantity: c.quantity - 1 } : c) : prev.filter(c => c.id !== id)
  })

  const toggleFav = (id: number) => setFavorites(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s })

  const cartCount = cart.reduce((s, i) => s + i.quantity, 0)
  const cartTotal = cart.reduce((s, i) => s + i.price * i.quantity, 0)

  const activeTab = SCREEN_TAB[screen] || 'home'
  const showNav = !['splash', 'onboarding', 'auth-login', 'auth-signup', 'auth-forgot', 'auth-otp', 'auth-reset', 'cart', 'checkout', 'tracking', 'success', 'food-detail', 'settings'].includes(screen)

  const handleTab = (tab: NavTab) => goto(TAB_SCREEN[tab])

  // Non-customer portals render full-screen (they have their own nav)
  if (role === 'admin')      return <><AdminPortal />{showRoleSelector && <RoleSelector current={role} onSelect={r => { setRole(r); setShowRoleSelector(false) }} onClose={() => setShowRoleSelector(false)} />}<SwitchRoleButton onClick={() => setShowRoleSelector(true)} /></>
  if (role === 'delivery')   return <><DeliveryPortal />{showRoleSelector && <RoleSelector current={role} onSelect={r => { setRole(r); setShowRoleSelector(false) }} onClose={() => setShowRoleSelector(false)} />}<SwitchRoleButton onClick={() => setShowRoleSelector(true)} /></>
  if (role === 'restaurant') return <><RestaurantPortal />{showRoleSelector && <RoleSelector current={role} onSelect={r => { setRole(r); setShowRoleSelector(false) }} onClose={() => setShowRoleSelector(false)} />}<SwitchRoleButton onClick={() => setShowRoleSelector(true)} /></>

  if (screen === 'landing') {
    return <LandingPageScreen onGetStarted={() => goto('splash')} />
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', position: 'relative', overflow: 'hidden', padding: '14px 0' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 15% 15%, rgba(226, 55, 68, 0.10), transparent 26%), radial-gradient(circle at 85% 0%, rgba(255, 122, 0, 0.10), transparent 24%), radial-gradient(circle at 50% 100%, rgba(22, 163, 74, 0.08), transparent 28%)' }} />
      {showRoleSelector && <RoleSelector current={role} onSelect={r => { setRole(r); setShowRoleSelector(false) }} onClose={() => setShowRoleSelector(false)} />}
      <div style={{ width: '100%', maxWidth: 430, minHeight: 'calc(100vh - 28px)', background: 'linear-gradient(180deg, #FFFFFF 0%, #FAFAFA 100%)', position: 'relative', overflow: 'hidden', boxShadow: '0 24px 80px rgba(15,23,42,0.18)', border: '1px solid rgba(255,255,255,0.65)', borderRadius: 32, zIndex: 1 }}>
        <div className="screen-enter" key={screen} style={{ paddingBottom: showNav ? 92 : 0 }}>
          {screen === 'splash' && <SplashScreen />}
          {screen === 'onboarding' && <OnboardingScreen step={onboStep} onNext={() => onboStep < 2 ? setOnboStep(s => s + 1) : goto('auth-login')} onSkip={() => goto('auth-login')} />}
          {screen === 'home' && <HomeScreen onRestaurantClick={(r: Restaurant) => { setSelRestaurant(r); goto('restaurant-detail') }} onSearch={() => goto('restaurants')} cart={cart} cartTotal={cartTotal} cartCount={cartCount} onCartClick={() => goto('cart')} favorites={favorites} onFav={toggleFav} cartAnimating={cartAnim} />}
          {screen === 'restaurants' && <RestaurantListScreen onBack={goBack} onRestaurantClick={(r: Restaurant) => { setSelRestaurant(r); goto('restaurant-detail') }} favorites={favorites} onFav={toggleFav} />}
          {screen === 'restaurant-detail' && selRestaurant && <RestaurantDetailScreen restaurant={selRestaurant} onBack={goBack} onFoodClick={(f: MenuItem) => { setSelFood(f); goto('food-detail') }} onAddToCart={(f: MenuItem) => addToCart(f, selRestaurant.name)} cart={cart} cartTotal={cartTotal} cartCount={cartCount} onCartClick={() => goto('cart')} favorites={favorites} onFav={toggleFav} />}
          {screen === 'food-detail' && selFood && <FoodDetailScreen food={selFood} restaurant={selRestaurant?.name || ''} onBack={goBack} onAddToCart={() => { addToCart(selFood, selRestaurant?.name || ''); goBack() }} />}
          {screen === 'cart' && <CartScreen cart={cart} onBack={goBack} onAddItem={(id: number) => { const it = MENU_ITEMS.find(m => m.id === id); if (it) addToCart(it, selRestaurant?.name || '') }} onRemoveItem={removeFromCart} onCheckout={() => goto('checkout')} cartTotal={cartTotal} />}
          {screen === 'checkout' && <CheckoutScreen onBack={goBack} onPlaceOrder={() => goto('tracking')} cartTotal={cartTotal} />}
          {screen === 'tracking' && <OrderTrackingScreen onBack={() => { setCart([]); goto('home') }} onViewSuccess={() => goto('success')} />}
          {screen === 'success' && <OrderSuccessScreen onDone={() => { setCart([]); goto('home') }} onTrack={() => goto('tracking')} />}
          {screen === 'auth-login'  && <LoginScreen  onLogin={() => goto('home')} onSignUp={() => goto('auth-signup')} onForgot={() => goto('auth-forgot')} />}
          {screen === 'auth-signup' && <SignUpScreen  onSignUp={() => goto('auth-otp')} onLogin={() => goto('auth-login')} />}
          {screen === 'auth-forgot' && <ForgotScreen  onSend={() => goto('auth-otp')} onBack={() => goto('auth-login')} />}
          {screen === 'auth-otp'   && <OTPScreen     onVerify={() => goto('auth-reset')} onBack={goBack} onResend={() => {}} />}
          {screen === 'auth-reset' && <ResetScreen   onReset={() => goto('auth-login')} onBack={() => goto('auth-forgot')} />}
          {screen === 'history' && <OrderHistoryScreen />}
          {screen === 'favorites' && <FavoritesScreen favorites={favorites} onRestaurantClick={(r: Restaurant) => { setSelRestaurant(r); goto('restaurant-detail') }} onFav={toggleFav} />}
          {screen === 'notifications' && <NotificationsScreen />}
          {screen === 'profile' && <ProfileScreen onSwitchRole={() => setShowRoleSelector(true)} onSettings={() => goto('settings')} />}
          {screen === 'settings' && <SettingsScreen onBack={goBack} />}
        </div>

        {/* Bottom nav */}
        {showNav && (
          <nav style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 430, backgroundColor: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', borderTop: `1px solid rgba(229,231,235,0.9)`, padding: '10px 0 calc(18px + env(safe-area-inset-bottom))', display: 'flex', justifyContent: 'space-around', zIndex: 100, boxShadow: '0 -12px 32px rgba(15,23,42,0.08)' }}>
            {TABS.map(({ id, label, IconComp }) => (
              <button key={id} onClick={() => handleTab(id)} className="btn-press" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, background: 'none', border: 'none', cursor: 'pointer', padding: '0 20px', position: 'relative' }}>
                <IconComp active={activeTab === id} />
                <span style={{ fontSize: 10, fontWeight: activeTab === id ? 700 : 500, color: activeTab === id ? C.red : C.muted, letterSpacing: 0.1 }}>{label}</span>
                {activeTab === id && <div style={{ position: 'absolute', bottom: -10, width: 4, height: 4, borderRadius: 2, backgroundColor: C.red }} />}
                {id === 'orders' && cartCount > 0 && (
                  <div style={{ position: 'absolute', top: -2, right: 12, width: 16, height: 16, backgroundColor: C.red, borderRadius: '50%', border: '2px solid white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, color: 'white' }}>{cartCount}</div>
                )}
              </button>
            ))}
          </nav>
        )}
      </div>
    </div>
  )
}
