"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { AuthDialog } from "@/components/auth/auth-dialog"
import { useAuth } from "@/components/auth/auth-provider"
import { LogIn, LogOut, User } from "lucide-react"

export function AuthButtons() {
  const { user, isAuthenticated, signOut } = useAuth()
  const [showAuthDialog, setShowAuthDialog] = useState(false)
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin')

  const handleSignIn = () => {
    setAuthMode('signin')
    setShowAuthDialog(true)
  }

  const handleSignUp = () => {
    setAuthMode('signup')
    setShowAuthDialog(true)
  }

  const handleSignOut = async () => {
    await signOut()
  }

  const handleAuthSuccess = () => {
    setShowAuthDialog(false)
  }

  return (
    <>
      <div className="flex gap-2">
        {isAuthenticated ? (
          <div className="flex items-center gap-3">
            <div className="text-sm text-muted-foreground">
              <User className="w-4 h-4 inline mr-1" />
              {user?.email}
            </div>
            <Button variant="outline" onClick={handleSignOut} size="sm">
              <LogOut className="w-4 h-4 mr-2" />
              로그아웃
            </Button>
          </div>
        ) : (
          <>
            <Button variant="outline" onClick={handleSignIn} size="sm">
              <LogIn className="w-4 h-4 mr-2" />
              로그인
            </Button>
            <Button onClick={handleSignUp} size="sm">
              <User className="w-4 h-4 mr-2" />
              회원가입
            </Button>
          </>
        )}
      </div>

      <AuthDialog
        isOpen={showAuthDialog}
        onClose={() => setShowAuthDialog(false)}
        initialMode={authMode}
        onAuthSuccess={handleAuthSuccess}
      />
    </>
  )
}
