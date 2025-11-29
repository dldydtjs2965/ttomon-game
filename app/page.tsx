"use client"

import { useAuth } from "@/components/auth/auth-provider"
import { Header } from "@/components/layout/header"
import { VerificationDashboard } from "@/components/verification"

export default function HomePage() {
  const { isLoading, isAuthenticated } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">로딩 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10">
      <div className="container mx-auto px-4 py-8">
        <Header />

        {/* 인증 대시보드 - 로그인한 사용자만 표시 */}
        {isAuthenticated && (
          <div className="mt-8">
            <VerificationDashboard />
          </div>
        )}

        {/* 비로그인 사용자 안내 */}
        {!isAuthenticated && (
          <div className="mt-8 text-center">
            <p className="text-muted-foreground">
              로그인하면 인증 현황을 확인할 수 있습니다.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}