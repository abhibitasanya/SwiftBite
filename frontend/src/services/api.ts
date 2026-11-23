const configuredApiUrl = (import.meta.env.VITE_API_URL as string | undefined)?.trim().replace(/\/$/, '')

function renderBackendUrl() {
  if (typeof window === 'undefined') return ''
  const host = window.location.hostname
  if (host === 'localhost' || host === '127.0.0.1') return ''
  return 'https://swiftbite-backend-f3do.onrender.com'
}

export const API_BASE = configuredApiUrl || renderBackendUrl()
