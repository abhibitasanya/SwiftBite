import React from 'react';
import C from '../theme/colors';
import Icon from '../components/icons';

export function LandingPageScreen({ onGetStarted }: { onGetStarted: () => void }) {
  return (
    <div className="min-h-screen w-full bg-white relative overflow-x-hidden font-sans">
      {/* Background gradients */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-[600px] h-[600px] bg-red-50 rounded-full blur-3xl opacity-50 -z-10"></div>
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-[500px] h-[500px] bg-orange-50 rounded-full blur-3xl opacity-50 -z-10"></div>

      {/* Navbar */}
      <nav className="absolute top-0 w-full flex items-center justify-between px-6 py-6 md:px-12 z-20">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-red-600 rounded-2xl flex items-center justify-center text-white text-2xl shadow-lg shadow-red-500/30">
            ⚡
          </div>
          <span className="text-2xl font-extrabold text-gray-900 tracking-tight">SwiftBite</span>
        </div>
        <div className="hidden md:flex items-center gap-10 text-sm font-bold text-gray-600">
          <button onClick={onGetStarted} className="hover:text-red-600 transition bg-transparent border-none cursor-pointer">Features</button>
          <button onClick={onGetStarted} className="hover:text-red-600 transition bg-transparent border-none cursor-pointer">Restaurants</button>
          <button onClick={onGetStarted} className="hover:text-red-600 transition bg-transparent border-none cursor-pointer">About Us</button>
        </div>
        <button 
          onClick={onGetStarted}
          className="hidden md:block bg-gray-900 hover:bg-gray-800 text-white px-7 py-3 rounded-xl font-bold transition shadow-xl border-none cursor-pointer"
        >
          Sign In
        </button>
      </nav>

      {/* Hero Section */}
      <div className="relative pt-36 pb-20 lg:pt-48 lg:pb-32 px-6 md:px-12 max-w-[1400px] mx-auto flex flex-col-reverse lg:flex-row items-center justify-between gap-16">
        <div className="flex-1 text-center lg:text-left z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-50 border border-red-100 text-red-600 font-bold text-xs uppercase tracking-widest mb-8 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
            Now delivering in your city
          </div>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-gray-900 leading-[1.1] tracking-tight mb-6">
            The food you love, <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-orange-500">
              delivered fast.
            </span>
          </h1>
          <p className="text-lg md:text-xl text-gray-500 mb-10 mx-auto lg:mx-0 leading-relaxed font-medium">
            Discover the best local restaurants and get your favorite meals delivered blazing fast right to your doorstep. Satisfy your cravings with SwiftBite.
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
            <button 
              onClick={onGetStarted}
              className="w-full sm:w-auto px-8 py-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-bold text-lg shadow-2xl shadow-red-500/40 transition-all hover:-translate-y-1 active:translate-y-0 flex items-center justify-center gap-3 border-none cursor-pointer"
            >
              Let's Get Started <div className="bg-white/20 rounded-full p-1 flex items-center justify-center"><Icon.Chevron dir="right" color="white" /></div>
            </button>
            <button 
              onClick={onGetStarted}
              className="w-full sm:w-auto px-8 py-4 bg-white text-gray-900 border-2 border-gray-100 hover:border-gray-200 rounded-2xl font-bold text-lg shadow-sm transition-all hover:bg-gray-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              Explore Menu
            </button>
          </div>
          
          <div className="mt-14 flex flex-col sm:flex-row items-center gap-6 justify-center lg:justify-start">
            <div className="flex -space-x-3">
              {[1,2,3,4].map(i => (
                <img key={i} src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="user" className="w-12 h-12 rounded-full border-4 border-white shadow-sm" />
              ))}
            </div>
            <div className="text-sm text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start text-orange-500 mb-1">
                <Icon.Star size={16} /><Icon.Star size={16} /><Icon.Star size={16} /><Icon.Star size={16} /><Icon.Star size={16} />
              </div>
              <p className="font-bold text-gray-700 m-0"><span className="text-gray-900 font-extrabold text-base">4.9/5</span> from 10,000+ reviews</p>
            </div>
          </div>
        </div>
        
        <div className="flex-1 relative w-full max-w-lg lg:max-w-none">
          <div className="absolute inset-0 bg-gradient-to-tr from-red-100 to-orange-100 rounded-[3rem] transform rotate-3 scale-[1.02] -z-10"></div>
          <img 
            src="/hero_food_platter.jpg" 
            alt="Delicious food" 
            className="w-full h-auto object-cover rounded-[3rem] shadow-2xl shadow-gray-300/50 border-4 border-white"
          />
          
          {/* Floating badge 1 */}
          <div className="absolute -bottom-8 -left-8 bg-white p-5 rounded-3xl shadow-xl flex items-center gap-4 border border-gray-50 animate-[swiftBounce_3s_ease-in-out_infinite]">
            <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center text-3xl">
              🛵
            </div>
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1 mt-0">Delivery Time</p>
              <p className="text-xl font-extrabold text-gray-900 m-0">15-25 min</p>
            </div>
          </div>

          {/* Floating badge 2 */}
          <div className="absolute -top-6 -right-6 bg-white p-4 rounded-3xl shadow-xl flex items-center gap-3 border border-gray-50 animate-[swiftBounce_4s_ease-in-out_infinite]">
            <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center text-2xl">
              🔥
            </div>
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-0.5 mt-0">Hot Deals</p>
              <p className="text-base font-extrabold text-gray-900 m-0">30% OFF</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
