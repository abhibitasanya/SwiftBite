import { useState, useSyncExternalStore, type FormEvent } from 'react'

export type ProfileRole = 'customer' | 'delivery' | 'restaurant'
export type VerificationStatus = 'Pending review' | 'Verified' | 'Changes requested'

export type DemoProfile = {
  accountId: string
  role: ProfileRole
  fullName: string
  phone: string
  address: string
  city: string
  postalCode: string
  serviceZone?: string
  vehicleType?: string
  proofType?: string
  mockProofSubmitted?: boolean
  businessName?: string
  cuisine?: string
  status: VerificationStatus
}

type ProfileDraft = {
  phone: string
  address: string
  city: string
  postalCode: string
  serviceZone: string
  vehicleType: string
  proofType: string
  mockProofSubmitted: boolean
  businessName: string
  cuisine: string
}
type TextProfileField = Exclude<keyof ProfileDraft, 'mockProofSubmitted'>

const listeners = new Set<() => void>()
let profiles: DemoProfile[] = []

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function getProfiles() {
  return profiles
}

function notifyProfileChange() {
  listeners.forEach(listener => listener())
}

export function useDemoProfiles() {
  return useSyncExternalStore(subscribe, getProfiles, getProfiles)
}

export function isProfileComplete(profile: DemoProfile | undefined) {
  if (!profile || !profile.fullName.trim() || !profile.phone.trim() || !profile.address.trim() || !profile.city.trim() || !profile.postalCode.trim()) return false
  if (profile.role === 'delivery') return Boolean(profile.serviceZone?.trim() && profile.vehicleType?.trim() && profile.proofType?.trim() && profile.mockProofSubmitted)
  if (profile.role === 'restaurant') return Boolean(profile.businessName?.trim() && profile.cuisine?.trim())
  return true
}

export function saveDemoProfile(profile: Omit<DemoProfile, 'status'>) {
  const nextProfile: DemoProfile = { ...profile, status: 'Pending review' }
  const exists = profiles.some(item => item.accountId === profile.accountId && item.role === profile.role)
  profiles = exists
    ? profiles.map(item => item.accountId === profile.accountId && item.role === profile.role ? nextProfile : item)
    : [...profiles, nextProfile]
  notifyProfileChange()
}

export function reviewDemoProfile(accountId: string, role: ProfileRole, status: VerificationStatus) {
  profiles = profiles.map(profile => profile.accountId === accountId && profile.role === role ? { ...profile, status } : profile)
  notifyProfileChange()
}

function getDraft(profile: DemoProfile | undefined, fullName: string): ProfileDraft {
  return {
    phone: profile?.phone || '',
    address: profile?.address || '',
    city: profile?.city || 'Bhubaneswar',
    postalCode: profile?.postalCode || '',
    serviceZone: profile?.serviceZone || '',
    vehicleType: profile?.vehicleType || '',
    proofType: profile?.proofType || '',
    mockProofSubmitted: profile?.mockProofSubmitted || false,
    businessName: profile?.businessName || (profile ? '' : fullName),
    cuisine: profile?.cuisine || '',
  }
}

export function ProfileForm({
  role,
  accountId,
  fullName,
  required = false,
  onSaved,
  onSignOut,
}: {
  role: ProfileRole
  accountId: string
  fullName: string
  required?: boolean
  onSaved?: () => void
  onSignOut?: () => void
}) {
  const savedProfile = useDemoProfiles().find(profile => profile.accountId === accountId && profile.role === role)
  const [draft, setDraft] = useState(() => getDraft(savedProfile, fullName))
  const [error, setError] = useState('')

  const updateDraft = <K extends keyof ProfileDraft>(key: K, value: ProfileDraft[K]) => {
    setDraft(previous => ({ ...previous, [key]: value }))
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const digits = draft.phone.replace(/\D/g, '')
    if (digits.length < 10 || digits.length > 15) {
      setError('Enter a valid phone number with 10 to 15 digits.')
      return
    }
    if (!/^\d{6}$/.test(draft.postalCode.trim())) {
      setError('Enter a valid 6-digit PIN code.')
      return
    }

    saveDemoProfile({
      accountId,
      role,
      fullName: fullName.trim(),
      phone: draft.phone.trim(),
      address: draft.address.trim(),
      city: draft.city.trim(),
      postalCode: draft.postalCode.trim(),
      ...(role === 'delivery' && {
        serviceZone: draft.serviceZone.trim(),
        vehicleType: draft.vehicleType.trim(),
        proofType: draft.proofType,
        mockProofSubmitted: draft.mockProofSubmitted,
      }),
      ...(role === 'restaurant' && {
        businessName: draft.businessName.trim(),
        cuisine: draft.cuisine.trim(),
      }),
    })
    setError('')
    onSaved?.()
  }

  const roleLabel = role === 'delivery' ? 'Delivery partner' : role === 'restaurant' ? 'Restaurant owner' : 'Customer'
  const inputStyle = { display: 'block', width: '100%', boxSizing: 'border-box' as const, marginTop: 5, padding: 11, border: '1px solid #D1D5DB', borderRadius: 10, color: '#1F2937', fontSize: 14, fontFamily: 'inherit' }
  const labelStyle = { display: 'block', marginBottom: 12, color: '#4B5563', fontSize: 12, fontWeight: 600 }

  const renderInput = (label: string, key: TextProfileField, options: { required?: boolean; type?: string; maxLength?: number; placeholder?: string } = {}) => (
    <label key={key} style={labelStyle}>
      {label}
      <input
        required={options.required !== false}
        type={options.type || 'text'}
        maxLength={options.maxLength}
        placeholder={options.placeholder}
        value={draft[key]}
        onChange={event => updateDraft(key, event.target.value)}
        style={inputStyle}
      />
    </label>
  )

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 620, margin: '0 auto', padding: 20, backgroundColor: 'white', border: '1px solid #E5E7EB', borderRadius: 18, boxShadow: '0 4px 16px rgba(15,23,42,0.06)' }}>
      <div style={{ marginBottom: 18 }}>
        <p style={{ margin: '0 0 4px', color: '#6B7280', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.6 }}>{roleLabel} profile</p>
        <h2 style={{ margin: 0, color: '#111827', fontSize: 20 }}>{required ? 'Complete your profile' : 'Profile details'}</h2>
        <p style={{ margin: '7px 0 0', color: '#6B7280', fontSize: 13, lineHeight: 1.5 }}>
          {required ? 'Complete these details before using your portal. Your submission will be marked pending admin review.' : 'Update your details and resubmit them for admin review.'}
        </p>
      </div>

      <label style={labelStyle}>
        Full name
        <input readOnly value={fullName} style={{ ...inputStyle, backgroundColor: '#F9FAFB' }} />
      </label>
      {role === 'restaurant' && renderInput('Restaurant name', 'businessName', { maxLength: 100 })}
      {renderInput('Phone number', 'phone', { type: 'tel', maxLength: 18, placeholder: '+91 98765 43210' })}
      {renderInput(role === 'restaurant' ? 'Restaurant street address / location' : 'Street address', 'address', { maxLength: 180 })}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {renderInput('City', 'city', { maxLength: 80 })}
        {renderInput('PIN code', 'postalCode', { type: 'text', maxLength: 6, placeholder: '751001' })}
      </div>

      {role === 'restaurant' && renderInput('Cuisine / food category', 'cuisine', { maxLength: 80 })}
      {role === 'delivery' && (
        <>
          {renderInput('Delivery service area', 'serviceZone', { maxLength: 100 })}
          <label style={labelStyle}>
            Vehicle type
            <select required value={draft.vehicleType} onChange={event => updateDraft('vehicleType', event.target.value)} style={{ ...inputStyle, backgroundColor: 'white' }}>
              <option value="">Select a vehicle</option>
              <option value="Bicycle">Bicycle</option>
              <option value="Motorcycle / scooter">Motorcycle / scooter</option>
              <option value="Car">Car</option>
            </select>
          </label>
          <label style={labelStyle}>
            ID proof type (demo)
            <select required value={draft.proofType} onChange={event => updateDraft('proofType', event.target.value)} style={{ ...inputStyle, backgroundColor: 'white' }}>
              <option value="">Select proof type</option>
              <option value="Driving licence">Driving licence</option>
              <option value="Voter ID">Voter ID</option>
              <option value="Other government ID">Other government ID</option>
            </select>
          </label>
          <div style={{ padding: 12, marginBottom: 12, backgroundColor: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 12 }}>
            <p style={{ margin: '0 0 8px', color: '#92400E', fontSize: 12, lineHeight: 1.5 }}>Demo only: do not enter an ID number or upload a real document. No identity document is collected.</p>
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: 8, color: '#78350F', fontSize: 12 }}>
              <input required type="checkbox" checked={draft.mockProofSubmitted} onChange={event => updateDraft('mockProofSubmitted', event.target.checked)} style={{ width: 16, height: 16, margin: '1px 0 0', accentColor: '#EA580C', appearance: 'auto', WebkitAppearance: 'checkbox', flexShrink: 0 }} />
              Mark mock ID proof as submitted for this demo
            </label>
          </div>
        </>
      )}

      {savedProfile && (
        <p style={{ margin: '0 0 12px', padding: 10, backgroundColor: savedProfile.status === 'Verified' ? '#F0FDF4' : '#FFFBEB', borderRadius: 10, color: savedProfile.status === 'Verified' ? '#166534' : '#92400E', fontSize: 12 }}>
          Verification status: <strong>{savedProfile.status}</strong>
        </p>
      )}
      {error && <p role="alert" style={{ margin: '0 0 12px', color: '#B91C1C', fontSize: 12 }}>{error}</p>}
      <button type="submit" style={{ width: '100%', padding: 12, border: 0, borderRadius: 11, backgroundColor: '#EA580C', color: 'white', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
        {savedProfile ? 'Save changes and resubmit' : 'Submit profile for review'}
      </button>
      {onSignOut && <button type="button" onClick={onSignOut} style={{ display: 'block', margin: '12px auto 0', padding: 6, border: 0, background: 'none', color: '#6B7280', fontSize: 12, cursor: 'pointer' }}>Sign out</button>}
      <p style={{ margin: '10px 0 0', textAlign: 'center', color: '#9CA3AF', fontSize: 11 }}>Demo profile data is held in memory only and clears when the app is refreshed.</p>
    </form>
  )
}
