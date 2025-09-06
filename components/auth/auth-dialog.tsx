"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { SignInForm } from "./sign-in-form"
import { SignUpForm } from "./sign-up-form"

interface AuthDialogProps {
  isOpen: boolean
  onClose: () => void
  initialMode?: "signin" | "signup"
  onAuthSuccess?: () => void
}

export function AuthDialog({
  isOpen,
  onClose,
  initialMode = "signin",
  onAuthSuccess,
}: AuthDialogProps) {
  const [mode, setMode] = useState<"signin" | "signup">(initialMode)

  const handleAuthSuccess = () => {
    onAuthSuccess?.()
    onClose()
  }

  const handleSwitchMode = () => {
    setMode(mode === "signin" ? "signup" : "signin")
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === "signin" ? "로그인" : "회원가입"}
          </DialogTitle>
          <DialogDescription>
            {mode === "signin"
              ? "계정에 로그인하여 또몬을 수집해보세요!"
              : "새 계정을 만들어 또몬 수집을 시작해보세요!"}
          </DialogDescription>
        </DialogHeader>

        {mode === "signin" ? (
          <SignInForm
            onSuccess={handleAuthSuccess}
            onSwitchToSignUp={handleSwitchMode}
          />
        ) : (
          <SignUpForm
            onSuccess={handleAuthSuccess}
            onSwitchToSignIn={handleSwitchMode}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}