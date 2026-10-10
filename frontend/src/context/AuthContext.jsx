import { createContext, useContext, useEffect, useState } from 'react'
import { api } from '../api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!localStorage.getItem('turfly.token')) {
      setLoading(false)
      return
    }
    api('/api/auth/me').then(setUser).catch(logout).finally(() => setLoading(false))
  }, [])

  function saveAuth(data) {
    localStorage.setItem('turfly.token', data.token)
    setUser(data.user)
  }

  function logout() {
    localStorage.removeItem('turfly.token')
    setUser(null)
  }

  return <AuthContext.Provider value={{ user, loading, saveAuth, logout, setUser }}>
    {children}
  </AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
