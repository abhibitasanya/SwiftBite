// Role selector — demo entry point for the different stakeholder portals.
// In a real product each role would be gated behind its own authenticated login.

export type Role = 'customer' | 'admin' | 'delivery' | 'restaurant'

interface Props {
  current: Role
  onSelect: (role: Role) => void
  onClose: () => void
}

const ROLES: { id: Role; label: string; sub: string; emoji: string; accent: string; bg: string }[] = [
  { id: 'customer',    label: 'Customer',          sub: 'Browse & order food',        emoji: '🛍️',  accent: '#E23744', bg: '#FFF5F5' },
  { id: 'admin',       label: 'Admin',             sub: 'Manage the entire platform', emoji: '🛠️',  accent: '#7C3AED', bg: '#F5F3FF' },
  { id: 'delivery',    label: 'Delivery Partner',  sub: 'Pick up & deliver orders',   emoji: '🛵',  accent: '#2563EB', bg: '#EFF6FF' },
  { id: 'restaurant',  label: 'Restaurant Owner',  sub: 'Manage your restaurant',     emoji: '🍽️',  accent: '#EA580C', bg: '#FFF7ED' },
]

export default function RoleSelector({ current, onSelect, onClose }: Props) {
  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.58)', backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)', zIndex: 200, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', padding: '16px 0 0' }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: 430, background: 'linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(255,255,255,0.96) 100%)', borderRadius: '28px 28px 0 0', padding: '10px 0 calc(40px + env(safe-area-inset-bottom))', boxShadow: '0 -24px 60px rgba(15, 23, 42, 0.28)', border: '1px solid rgba(255,255,255,0.35)' }}>
        {/* Handle */}
        <div style={{ width: 44, height: 4, backgroundColor: '#D1D5DB', borderRadius: 999, margin: '10px auto 18px' }} />

        <div style={{ padding: '0 20px 4px' }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: '#1F2937', margin: '0 0 4px', letterSpacing: -0.4 }}>Switch Portal</h2>
          <p style={{ fontSize: 13, color: '#6B7280', margin: '0 0 18px', lineHeight: 1.55 }}>
            This is a <strong>demo mode</strong> for prototyping purposes. In production, each portal requires its own authenticated login.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {ROLES.map(role => (
              <button
                key={role.id}
                onClick={() => onSelect(role.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: '14px 16px', borderRadius: 18,
                  backgroundColor: current === role.id ? 'white' : '#F9FAFB',
                  border: `1.5px solid ${current === role.id ? role.accent : '#E5E7EB'}`,
                  boxShadow: current === role.id ? '0 10px 22px rgba(0,0,0,0.06)' : '0 1px 0 rgba(255,255,255,0.8) inset',
                  cursor: 'pointer', textAlign: 'left', width: '100%',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
                }}
              >
                <div style={{ width: 48, height: 48, borderRadius: 16, backgroundColor: current === role.id ? role.bg : 'white', border: `1.5px solid ${current === role.id ? role.accent : '#E5E7EB'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0, boxShadow: '0 4px 10px rgba(15, 23, 42, 0.04)' }}>
                  {role.emoji}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 14, fontWeight: 700, color: current === role.id ? role.accent : '#1F2937', margin: 0 }}>{role.label}</p>
                  <p style={{ fontSize: 12, color: '#6B7280', margin: '2px 0 0' }}>{role.sub}</p>
                </div>
                {current === role.id && (
                  <div style={{ width: 20, height: 20, borderRadius: '50%', backgroundColor: role.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: `0 6px 16px ${role.accent}33` }}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                  </div>
                )}
              </button>
            ))}
          </div>

          <div style={{ marginTop: 16, padding: '10px 14px', backgroundColor: '#FFFBEB', borderRadius: 14, border: '1px solid #FDE68A', display: 'flex', gap: 8, alignItems: 'flex-start', boxShadow: '0 8px 18px rgba(250, 204, 21, 0.12)' }}>
            <span style={{ fontSize: 14, flexShrink: 0 }}>⚠️</span>
            <p style={{ fontSize: 11, color: '#92400E', margin: 0, lineHeight: 1.5 }}>
              These portals are demonstration views only. Real admin/delivery/restaurant access requires server-side authentication and role-based access control.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
