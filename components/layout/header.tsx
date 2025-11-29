"use client"

import { AuthButtons } from "@/components/auth/auth-buttons"

export function Header() {
  return (
    <div className="flex justify-between items-center mb-8">
      <div className="text-left">
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          하루 한 줄
        </h1>
        <p className="text-primary/90">한 줄이 모여 하나의 이야기가 되는 </p>
      </div>

      <AuthButtons />
    </div>
  )
}
