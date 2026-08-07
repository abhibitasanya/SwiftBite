import { Restaurant, MenuItem, CartItem, Screen } from '../types';

const RESTAURANTS: Restaurant[] = [
  { id: 1, name: 'The Burger Lab', cuisine: 'American • Burgers • Fast Food', rating: 4.8, reviews: 2847, deliveryTime: 25, distance: '0.8 km', deliveryFee: 1.99, image: 'photo-1568901346375-23c9450c58cd', offer: '20% off orders above $25', tags: ['Trending', 'Top Rated'] },
  { id: 2, name: 'Sakura Garden', cuisine: 'Japanese • Sushi • Asian', rating: 4.6, reviews: 1923, deliveryTime: 35, distance: '1.2 km', deliveryFee: 2.49, image: 'photo-1553621042-f6e147245754', offer: 'Free delivery on first order', tags: ['Popular'] },
  { id: 3, name: 'Spice Route', cuisine: 'Indian • Curry • Biryani', rating: 4.7, reviews: 3124, deliveryTime: 30, distance: '1.5 km', deliveryFee: 1.49, image: 'photo-1585937421612-70a008356fbe', offer: 'Buy 2 get 1 free on curries', tags: ["Editor's Pick"] },
  { id: 4, name: 'Pizza Piazza', cuisine: 'Italian • Pizza • Pasta', rating: 4.5, reviews: 1456, deliveryTime: 20, distance: '0.5 km', deliveryFee: 0.99, image: 'photo-1565299624946-b28f40a0ae38', tags: ['Nearby', 'Fast Delivery'] },
  { id: 5, name: 'Green Bowl', cuisine: 'Healthy • Salads • Bowls', rating: 4.9, reviews: 987, deliveryTime: 40, distance: '2.1 km', deliveryFee: 2.99, image: 'photo-1512621776951-a57141f2eefd', offer: '10% off for new users', tags: ['Healthy'] },
  { id: 6, name: 'Wok & Roll', cuisine: 'Chinese • Thai • Asian Fusion', rating: 4.4, reviews: 2103, deliveryTime: 28, distance: '0.9 km', deliveryFee: 1.99, image: 'photo-1569050467447-ce54b3bbc37d', tags: ['Popular'] },
]

const MENU_ITEMS: MenuItem[] = [
  { id: 1, name: 'Classic Smash Burger', description: 'Two smashed beef patties, American cheese, pickles, caramelised onions, and our secret smoky sauce on a toasted brioche bun.', price: 12.99, image: 'photo-1568901346375-23c9450c58cd', rating: 4.8, isVeg: false, isBestseller: true },
  { id: 2, name: 'Double Cheese Deluxe', description: 'Double beef patty stacked with aged cheddar, crispy bacon, caramelised onions, arugula, and truffle aioli.', price: 14.99, image: 'photo-1586816001966-79b736744398', rating: 4.7, isVeg: false },
  { id: 3, name: 'Crispy Chicken Sandwich', description: 'Buttermilk-brined fried chicken thigh, tangy coleslaw, dill pickles, and house sriracha mayo on a toasted bun.', price: 11.99, image: 'photo-1567234669003-dce7a7a88821', rating: 4.6, isVeg: false, isBestseller: true },
  { id: 4, name: 'Truffle Parmesan Fries', description: 'Golden shoestring fries tossed in black truffle oil, aged parmesan, and fresh chives. A crowd favourite.', price: 5.99, image: 'photo-1518013431117-eb1465fa5afa', rating: 4.9, isVeg: true },
  { id: 5, name: 'Garden Impossible Burger', description: '100% plant-based smash patty with avocado, heirloom tomato, mixed greens, and vegan chipotle sauce.', price: 13.99, image: 'photo-1525059696034-4967a8e1dca2', rating: 4.5, isVeg: true },
]

const CATEGORIES = [
  { id: 1, name: 'Burgers', emoji: '🍔', bg: '#FFF3E0' },
  { id: 2, name: 'Pizza', emoji: '🍕', bg: '#FCE4EC' },
  { id: 3, name: 'Sushi', emoji: '🍱', bg: '#E3F2FD' },
  { id: 4, name: 'Indian', emoji: '🍛', bg: '#FFF8E1' },
  { id: 5, name: 'Healthy', emoji: '🥗', bg: '#E8F5E9' },
  { id: 6, name: 'Chinese', emoji: '🥡', bg: '#F3E5F5' },
  { id: 7, name: 'Desserts', emoji: '🧁', bg: '#FCE4EC' },
  { id: 8, name: 'Drinks', emoji: '🥤', bg: '#E0F7FA' },
]

const ONBOARDING = [
  { title: 'Discover Amazing Food', body: 'Explore hundreds of restaurants and thousands of dishes from around the world, all delivered to your door.', emoji: '🍽️', bg: '#FFF3E0' },
  { title: 'Lightning Fast Delivery', body: 'Real-time tracking, trusted delivery partners, and your food arrives hot and fresh — every single time.', emoji: '⚡', bg: '#FCE4EC' },
  { title: 'Exclusive Deals Daily', body: 'Save more with personalised offers, loyalty rewards, and flash deals from your favourite spots.', emoji: '🎉', bg: '#E8F5E9' },
]


export { RESTAURANTS, MENU_ITEMS, CATEGORIES, ONBOARDING };
