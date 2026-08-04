import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import pb from '@/lib/pocketbase/client'

interface AuthContextType {
  user: any
  isAuthenticated: boolean
  isAdmin: boolean
  signUp: (username: string, password: string, executiveName?: string) => Promise<{ error: any }>
  signIn: (usernameOrEmail: string, password: string) => Promise<{ error: any }>
  signOut: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<any>(pb.authStore.isValid ? pb.authStore.record : null)
  const [isAuthenticated, setIsAuthenticated] = useState(pb.authStore.isValid)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = pb.authStore.onChange((_token, record) => {
      setUser(pb.authStore.isValid ? record : null)
      setIsAuthenticated(pb.authStore.isValid)
    })

    if (pb.authStore.isValid) {
      pb.collection('users')
        .authRefresh()
        .catch(() => pb.authStore.clear())
        .finally(() => setLoading(false))
    } else {
      if (pb.authStore.record) pb.authStore.clear()
      setLoading(false)
    }
    return () => {
      unsubscribe()
    }
  }, [])

  const signUp = async (username: string, password: string, executiveName?: string) => {
    try {
      const cleanUsername = username.trim()
      const firstName = executiveName ? executiveName.trim().split(/\s+/)[0].toUpperCase() : ''
      const placeholderEmail = `${cleanUsername.toLowerCase()}@local`

      const userData: Record<string, unknown> = {
        email: placeholderEmail,
        password,
        passwordConfirm: password,
        role: 'executive',
        username: cleanUsername,
      }
      if (executiveName) {
        userData.name = executiveName.trim()
        userData.executive_name = firstName
      }

      await pb.collection('users').create(userData)
      await pb.collection('users').authWithPassword(cleanUsername, password)
      return { error: null }
    } catch (error) {
      return { error }
    }
  }

  const signIn = async (usernameOrEmail: string, password: string) => {
    try {
      await pb.collection('users').authWithPassword(usernameOrEmail.trim(), password)
      return { error: null }
    } catch (error) {
      return { error }
    }
  }

  const signOut = () => {
    pb.authStore.clear()
  }

  const isAdmin = user?.role === 'admin'

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated, isAdmin, signUp, signIn, signOut, loading }}
    >
      {children}
    </AuthContext.Provider>
  )
}
