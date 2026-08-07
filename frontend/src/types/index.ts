export type Screen =
  | 'landing' | 'splash' | 'onboarding'
  | 'auth-login' | 'auth-signup' | 'auth-forgot' | 'auth-otp' | 'auth-reset'
  | 'home' | 'restaurants' | 'restaurant-detail'
  | 'food-detail' | 'cart' | 'checkout' | 'tracking' | 'success'
  | 'history' | 'favorites' | 'notifications' | 'profile' | 'settings'

export type NavTab = 'home' | 'explore' | 'orders' | 'profile'

export interface CartItem { id: number; name: string; price: number; quantity: number; image: string; restaurant: string }
export interface Restaurant { id: number; name: string; cuisine: string; rating: number; reviews: number; deliveryTime: number; distance: string; deliveryFee: number; image: string; offer?: string; tags: string[] }
export interface MenuItem { id: number; name: string; description: string; price: number; image: string; rating: number; isVeg: boolean; isBestseller?: boolean }
