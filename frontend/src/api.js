const API_URL = import.meta.env.VITE_API_URL || ''

export async function api(path, options = {}) {
  const headers = new Headers(options.headers || {})
  const token = localStorage.getItem('turfly.token')
  if (token) headers.set('Authorization', `Bearer ${token}`)
  if (options.body && !(options.body instanceof FormData)) headers.set('Content-Type', 'application/json')

  let response
  try {
    response = await fetch(`${API_URL}${path}`, { ...options, headers })
  } catch {
    throw new Error('The Turfly server is unavailable. Please try again shortly.')
  }

  const contentType = response.headers.get('content-type') || ''
  if (!response.ok) {
    const error = contentType.includes('application/json') ? await response.json() : null
    throw new Error(error?.message || 'Something went wrong')
  }
  if (response.status === 204) return null
  return contentType.includes('application/json') ? response.json() : response.text()
}
