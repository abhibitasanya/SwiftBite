import { useEffect, useState } from 'react'

export type HamburgerMenuItem = {
  label: string
  description?: string
  icon: string
  onSelect: () => void
  danger?: boolean
}

export default function HamburgerMenu({ role, items }: { role: string; items: HamburgerMenuItem[] }) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) return
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [open])

  return (
    <>
      <button
        type="button"
        aria-label={open ? 'Close menu' : 'Open menu'}
        aria-expanded={open}
        onClick={() => setOpen(value => !value)}
        style={{ position: 'fixed', top: 'max(10px, env(safe-area-inset-top))', right: 16, zIndex: 220, width: 42, height: 42, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 5, border: '1px solid #E5E7EB', borderRadius: 13, backgroundColor: 'rgba(255,255,255,0.96)', boxShadow: '0 4px 14px rgba(15,23,42,0.12)', cursor: 'pointer' }}
      >
        {[0, 1, 2].map(line => <span key={line} style={{ width: 18, height: 2, borderRadius: 2, backgroundColor: '#1F2937' }} />)}
      </button>
      {open && (
        <>
          <button type="button" aria-label="Close menu backdrop" onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 200, border: 0, padding: 0, backgroundColor: 'rgba(15,23,42,0.32)', cursor: 'default' }} />
          <aside role="dialog" aria-modal="true" aria-label={`${role} menu`} style={{ position: 'fixed', top: 0, right: 0, bottom: 0, zIndex: 210, width: 'min(340px, 88vw)', overflowY: 'auto', backgroundColor: 'white', boxShadow: '-12px 0 36px rgba(15,23,42,0.18)' }}>
            <div style={{ padding: 'calc(22px + env(safe-area-inset-top)) 20px 18px', borderBottom: '1px solid #E5E7EB' }}>
              <p style={{ margin: '0 0 4px', color: '#6B7280', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.7 }}>SwiftBite</p>
              <h2 style={{ margin: 0, color: '#111827', fontSize: 20 }}>{role}</h2>
            </div>
            <nav aria-label="Additional features" style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
              {items.map(item => (
                <button
                  type="button"
                  key={item.label}
                  onClick={() => { setOpen(false); item.onSelect() }}
                  style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', padding: '13px 12px', border: 0, borderRadius: 12, backgroundColor: item.danger ? '#FFF1F2' : 'white', color: item.danger ? '#BE123C' : '#1F2937', textAlign: 'left', cursor: 'pointer' }}
                >
                  <span aria-hidden="true" style={{ width: 30, textAlign: 'center', fontSize: 19 }}>{item.icon}</span>
                  <span style={{ flex: 1 }}>
                    <span style={{ display: 'block', fontSize: 14, fontWeight: 700 }}>{item.label}</span>
                    {item.description && <span style={{ display: 'block', marginTop: 3, color: '#6B7280', fontSize: 11, lineHeight: 1.4 }}>{item.description}</span>}
                  </span>
                  <span aria-hidden="true" style={{ color: '#9CA3AF', fontSize: 18 }}>›</span>
                </button>
              ))}
            </nav>
            <p style={{ margin: '8px 20px 24px', color: '#9CA3AF', fontSize: 11, lineHeight: 1.5 }}>Primary navigation remains available in the bottom bar.</p>
          </aside>
        </>
      )}
    </>
  )
}
