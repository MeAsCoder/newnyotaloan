import { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(false)

  const login = async (phone, password) => {
    setLoading(true)
    // Replace with real API call
    await new Promise(r => setTimeout(r, 1200))
    setCurrentUser({ phone, name: 'Demo User' })
    setLoading(false)
    return true
  }

  const register = async (data) => {
    setLoading(true)
    await new Promise(r => setTimeout(r, 1200))
    setCurrentUser({ phone: data.phone, name: data.firstName })
    setLoading(false)
    return true
  }

  const logout = () => setCurrentUser(null)

  return (
    <AuthContext.Provider value={{ currentUser, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
