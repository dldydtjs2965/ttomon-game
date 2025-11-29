"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { User } from "@supabase/supabase-js"
import { createBrowserSupabase } from "@/lib/supabase/browser"
import { useGameStore } from "@/hooks/use-game-store"

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createBrowserSupabase()
  const { loadCollection } = useGameStore()

  useEffect(() => {
    // Check session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setIsLoading(false)

      if (session?.user) {
        // Load user collection if authenticated
        loadCollection()
      }
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setIsLoading(false)

      if (session?.user) {
        // Load user collection when user logs in
        loadCollection()
      } else {
        // Clear collection or handle logout state if needed
        // For now, we just let the store handle it (it might need a clear action, but loadCollection handles fetch)
      }
    })

    return () => subscription.unsubscribe()
  }, [supabase, loadCollection])

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}