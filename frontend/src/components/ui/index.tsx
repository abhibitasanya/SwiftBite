import React from 'react';
import C from '../../theme/colors';
import Icon from '../icons';
import { Restaurant, CartItem } from '../../types';

function SectionHeader({ title, subtitle, onSeeAll }: { title: string; subtitle?: string; onSeeAll?: () => void }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 14 }}>
      <div>
        <h2 style={{ fontSize: 17, fontWeight: 800, color: C.text, margin: 0, letterSpacing: -0.3 }}>{title}</h2>
        {subtitle && <p style={{ fontSize: 12, color: C.muted, margin: '3px 0 0' }}>{subtitle}</p>}
      </div>
      {onSeeAll && (
        <button onClick={onSeeAll} className="btn-press" style={{ color: C.red, fontSize: 13, fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
          See all
        </button>
      )}
    </div>
  )
}

function RestaurantCard({ restaurant: r, onClick, isFav, onFav }: { restaurant: Restaurant; onClick: () => void; isFav: boolean; onFav: () => void }) {
  return (
    <div className="card-hover" onClick={onClick} style={{ backgroundColor: C.surface, borderRadius: 20, overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', cursor: 'pointer' }}>
      <div style={{ position: 'relative', height: 180 }}>
        <img src={`https://images.unsplash.com/${r.image}?w=800&h=360&fit=crop&auto=format`} alt={r.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.45) 0%, transparent 55%)' }} />
        {r.offer && (
          <div style={{ position: 'absolute', top: 12, left: 12, backgroundColor: C.green, color: 'white', padding: '4px 10px', borderRadius: 8, fontSize: 10, fontWeight: 700 }}>
            {r.offer.length > 22 ? r.offer.slice(0, 22) + '…' : r.offer}
          </div>
        )}
        {r.tags.slice(0, 1).map(t => (
          <div key={t} style={{ position: 'absolute', top: r.offer ? 38 : 12, left: 12, backgroundColor: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)', color: 'white', padding: '3px 8px', borderRadius: 6, fontSize: 10, fontWeight: 600 }}>{t}</div>
        ))}
        <button onClick={e => { e.stopPropagation(); onFav() }} className="btn-press" style={{ position: 'absolute', top: 12, right: 12, width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.92)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon.Heart filled={isFav} size={18} />
        </button>
        <div style={{ position: 'absolute', bottom: 12, right: 12, backgroundColor: 'rgba(255,255,255,0.95)', padding: '4px 8px', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
          <Icon.Star />
          <span style={{ fontSize: 12, fontWeight: 700, color: C.text }}>{r.rating}</span>
          <span style={{ fontSize: 11, color: C.muted }}>({(r.reviews / 1000).toFixed(1)}k)</span>
        </div>
      </div>
      <div style={{ padding: '14px 16px' }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: C.text, margin: '0 0 3px', letterSpacing: -0.2 }}>{r.name}</h3>
        <p style={{ fontSize: 12, color: C.muted, margin: '0 0 10px' }}>{r.cuisine}</p>
        <div style={{ display: 'flex', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Icon.Clock /><span style={{ fontSize: 12, color: C.muted, fontWeight: 500 }}>{r.deliveryTime} min</span></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={C.muted} strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>
            <span style={{ fontSize: 12, color: C.muted, fontWeight: 500 }}>{r.distance}</span>
          </div>
          <span style={{ fontSize: 12, color: r.deliveryFee === 0 ? C.green : C.muted, fontWeight: r.deliveryFee === 0 ? 600 : 400 }}>
            {r.deliveryFee === 0 ? 'Free delivery' : `$${r.deliveryFee.toFixed(2)} delivery`}
          </span>
        </div>
      </div>
    </div>
  )
}

function CartFAB({ count, total, onClick, animating }: { count: number; total: number; onClick: () => void; animating: boolean }) {
  if (count === 0) return null
  return (
    <div style={{ position: 'fixed', bottom: 90, left: '50%', transform: 'translateX(-50%)', zIndex: 99, width: 'min(calc(100% - 40px), 760px)' }}>
      <button onClick={onClick} className={`btn-press ${animating ? 'animate-swift-cart-pop' : ''}`} style={{
        width: '100%', padding: '15px 20px', backgroundColor: C.red, color: 'white',
        border: 'none', borderRadius: 16, cursor: 'pointer', display: 'flex',
        justifyContent: 'space-between', alignItems: 'center',
        boxShadow: '0 8px 28px rgba(226,55,68,0.45)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ backgroundColor: 'rgba(255,255,255,0.22)', borderRadius: 8, padding: '3px 9px', fontSize: 13, fontWeight: 700 }}>{count}</div>
          <span style={{ fontSize: 15, fontWeight: 700 }}>View Cart</span>
        </div>
        <span style={{ fontSize: 15, fontWeight: 700 }}>${total.toFixed(2)}</span>
      </button>
    </div>
  )
}

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} className="btn-press" style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: C.surface, border: `1px solid ${C.border}`, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <Icon.Back />
    </button>
  )
}


export { SectionHeader, RestaurantCard, CartFAB, BackButton };
