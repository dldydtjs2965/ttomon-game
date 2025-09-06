"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { User } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase/client"
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
  const supabase = createClient()
  const { loadMonstersFromSupabase, loadUserMonsters, loadDemoCollection } = useGameStore()

  useEffect(() => {
    // Load master monster data on app start
    loadMonstersFromSupabase().then(() => {
      // After loading master data, check if user is logged in
      supabase.auth.getSession().then(({ data: { session } }) => {
        setUser(session?.user ?? null)
        setIsLoading(false)
        
        if (session?.user) {
          // Load user monsters if authenticated
          loadUserMonsters()
        } else {
          // Load demo collection for non-authenticated users
          loadDemoCollection().catch(console.error)
        }
      })
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setIsLoading(false)
      
      if (session?.user) {
        // Load user monsters when user logs in
        loadUserMonsters()
      } else {
        // Load demo collection when user logs out
        loadDemoCollection().catch(console.error)
      }
    })

    return () => subscription.unsubscribe()
  }, [supabase, loadMonstersFromSupabase, loadUserMonsters, loadDemoCollection])

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