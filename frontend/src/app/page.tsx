"use client";

import { useState } from 'react'
import CustomerApp from '../components/CustomerApp'
import RestaurantApp from '../components/RestaurantApp'
import DeliveryApp from '../components/DeliveryApp'
import AdminDashboard from '../components/AdminDashboard'

type Role = 'landing' | 'customer' | 'restaurant' | 'delivery' | 'admin'

export default function App() {
  const [role, setRole] = useState<Role>('landing')

  if (role === 'customer') return <CustomerApp onBack={() => setRole('landing')} />
  if (role === 'restaurant') return <RestaurantApp onBack={() => setRole('landing')} />
  if (role === 'delivery') return <DeliveryApp onBack={() => setRole('landing')} />
  if (role === 'admin') return <AdminDashboard onBack={() => setRole('landing')} />

  return (
    <div className="min-h-screen" style={{ background: '#f4f2ea' }}>
      {/* Hero */}
      <div className="relative overflow-hidden" style={{ minHeight: '100vh' }}>
        {/* Background image with overlay */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1557499305-0af888c3d8ec?w=1600&h=900&fit=crop&auto=format"
            alt="Premium food"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(22,25,8,0.88) 0%, rgba(45,80,22,0.72) 50%, rgba(22,25,8,0.60) 100%)' }} />
        </div>

        {/* Nav */}
        <nav className="relative z-10 flex items-center justify-between px-8 py-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: '#6b7c2a' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                <path d="M2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
            </div>
            <span className="text-white font-bold text-xl tracking-tight">SwiftBite</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-white/70 text-sm font-medium">Fast. Fresh. Delivered.</span>
          </div>
        </nav>

        {/* Hero Content */}
        <div className="relative z-10 flex flex-col items-center justify-center text-center px-6 pt-24 pb-32">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 animate-fade-in" style={{ background: 'rgba(107,124,42,0.3)', border: '1px solid rgba(107,124,42,0.5)' }}>
            <div className="w-2 h-2 rounded-full animate-pulse-soft" style={{ background: '#96aa3e' }} />
            <span className="text-sm font-semibold" style={{ color: '#d0da9f' }}>Now live in 50+ cities</span>
          </div>

          <h1 className="font-display text-white mb-6 leading-tight animate-fade-up" style={{ fontSize: 'clamp(2.5rem, 6vw, 5rem)', fontWeight: 400, maxWidth: 720 }}>
            Food that arrives<br />
            <span style={{ fontStyle: 'italic', color: '#d0da9f' }}>exactly</span> when you want it
          </h1>
          <p className="text-white/70 mb-12 animate-fade-up delay-100" style={{ fontSize: '1.125rem', maxWidth: 500, lineHeight: 1.7 }}>
            SwiftBite connects you with the best restaurants in your city. Order in seconds, track in real-time, enjoy every bite.
          </p>

          {/* Role selector cards */}
          <div className="grid grid-cols-2 gap-4 w-full max-w-2xl animate-fade-up delay-200 md:grid-cols-4">
            {[
              { label: 'Order Food', sub: 'Customer App', role: 'customer' as Role, icon: '🍽️', color: '#6b7c2a' },
              { label: 'Manage Orders', sub: 'Restaurant Portal', role: 'restaurant' as Role, icon: '🏪', color: '#2d5016' },
              { label: 'Deliver', sub: 'Driver App', role: 'delivery' as Role, icon: '🛵', color: '#404a1a' },
              { label: 'Administrate', sub: 'Admin Dashboard', role: 'admin' as Role, icon: '📊', color: '#556322' },
            ].map(item => (
              <button
                key={item.role}
                onClick={() => setRole(item.role)}
                className="flex flex-col items-center gap-3 p-5 rounded-2xl card-hover text-white"
                style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.15)' }}
              >
                <span className="text-2xl">{item.icon}</span>
                <div>
                  <div className="font-semibold text-sm">{item.label}</div>
                  <div className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.55)' }}>{item.sub}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Bottom decorative stats */}
        <div className="relative z-10 border-t border-white/10 px-8 py-6">
          <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-center gap-12">
            {[
              { value: '2.4M+', label: 'Orders Delivered' },
              { value: '12K+', label: 'Restaurant Partners' },
              { value: '4.8★', label: 'Average Rating' },
              { value: '18 min', label: 'Avg Delivery Time' },
            ].map(s => (
              <div key={s.label} className="text-center">
                <div className="text-white font-bold text-2xl">{s.value}</div>
                <div className="text-white/50 text-sm mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
