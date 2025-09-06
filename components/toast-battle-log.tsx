"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"

interface ToastMessage {
  id: string
  message: string
  timestamp: number
  opacity: number
}

interface ToastBattleLogProps {
  messages: string[]
}

export function ToastBattleLog({ messages }: ToastBattleLogProps) {
  const [toasts, setToasts] = useState<ToastMessage[]>([])
  const [lastMessageIndex, setLastMessageIndex] = useState(-1)

  useEffect(() => {    
    if (messages.length === 0 || messages.length <= lastMessageIndex + 1) return

    const latestMessage = messages[messages.length - 1]
    console.log('[Toast] Showing:', latestMessage)
    
    const newToast: ToastMessage = {
      id: `toast-${Date.now()}`,
      message: latestMessage,
      timestamp: Date.now(),
      opacity: 1,
    }

    setToasts((prev) => [...prev, newToast])
    setLastMessageIndex(messages.length - 1)

    const fadeTimer = setTimeout(() => {
      const fadeInterval = setInterval(() => {
        setToasts((prev) =>
          prev.map((toast) =>
            toast.id === newToast.id ? { ...toast, opacity: Math.max(0, toast.opacity - 0.1) } : toast,
          ),
        )
      }, 50) // 더 빠른 페이드 아웃

      setTimeout(() => {
        clearInterval(fadeInterval)
        setToasts((prev) => prev.filter((toast) => toast.id !== newToast.id))
      }, 500) // 페이드 아웃 시간 단축
    }, 1500) // 전체 표시 시간을 3초에서 1.5초로 단축

    return () => clearTimeout(fadeTimer)
  }, [messages])

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {toasts.map((toast) => (
        <Card
          key={toast.id}
          className="p-3 bg-purple-100 border-purple-300 shadow-lg animate-in slide-in-from-right-full duration-300 transition-opacity"
          style={{ opacity: toast.opacity }}
        >
          <p className="text-sm text-purple-800 font-medium">{toast.message}</p>
        </Card>
      ))}
    </div>
  )
}
