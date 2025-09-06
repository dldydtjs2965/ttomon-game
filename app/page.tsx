"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { GachaSystem } from "@/components/gacha-system"
import { PetCollection } from "@/components/pet-collection"
import { AuthDialog } from "@/components/auth/auth-dialog"
import { useAuth } from "@/components/auth/auth-provider"
import { useGameStore } from "@/hooks/use-game-store"
import type { Monster } from "@/lib/monsters"
import { Swords, Trophy, Sparkles, LogIn, LogOut, User, Construction } from "lucide-react"

export default function HomePage() {
  const { collection } = useGameStore()
  const { user, isAuthenticated, isLoading, signOut } = useAuth()
  const [selectedMonsters, setSelectedMonsters] = useState<Monster[]>([])
  const [showAuthDialog, setShowAuthDialog] = useState(false)
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin')

  const handleMonstersSelected = (monsters: Monster[]) => {
    setSelectedMonsters(monsters)
  }

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


  // Home phase
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10">
      <div className="container mx-auto px-4 py-8">
        {/* Header with Auth */}
        <div className="flex justify-between items-center mb-8">
          <div className="text-center flex-1">
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              또몬 배틀 게임
            </h1>
            <p className="text-muted-foreground">또몬을 수집하고 컬렉션을 완성하세요!</p>
          </div>

          {/* Auth Buttons */}
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
        </div>

        {/* Demo Mode Alert */}
        {!isAuthenticated && collection.length > 0 && (
          <Alert className="max-w-6xl mx-auto mb-6 border-amber-200 bg-amber-50 dark:bg-amber-950/20">
            <Sparkles className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800 dark:text-amber-200">
              <strong>데모 모드</strong> - 현재 샘플 몬스터로 게임을 체험 중입니다. 
              로그인하면 실제 몬스터를 수집하고 저장할 수 있습니다!
            </AlertDescription>
          </Alert>
        )}

        <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Left Column - Gacha & Collection */}
          <div className="space-y-6">
            {isAuthenticated ? (
              <>
                <GachaSystem />
                <PetCollection />
              </>
            ) : (
              <>
                {/* 비로그인 시 데모 컬렉션 표시 */}
                <PetCollection />
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5" />
                      또몬 수집하기
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-center space-y-4">
                    <p className="text-muted-foreground">
                    로그인하여 또몬을 수집하고 컬렉션을 관리하세요!
                  </p>
                  <Button onClick={handleSignIn} className="w-full">
                    <LogIn className="w-4 h-4 mr-2" />
                    로그인하여 시작하기
                  </Button>
                </CardContent>
              </Card>
              </>
            )}
          </div>

          {/* Right Column - Battle Setup (Disabled) & Stats */}
          <div className="space-y-6">
            {/* Battle Section - Disabled */}
            <Card className="opacity-60">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Construction className="w-5 h-5" />
                  배틀 시스템
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <Construction className="h-4 w-4" />
                  <AlertDescription>
                    배틀 시스템은 현재 개발 중입니다. 곧 만나보실 수 있습니다!
                  </AlertDescription>
                </Alert>
                
                <div className="text-sm text-muted-foreground">
                  <p>• 1대1 턴제 배틀</p>
                  <p>• 스킬 시스템 및 쿨다운</p>
                  <p>• 회피 및 방어 시스템</p>
                  <p>• 야생 또몬과의 대전</p>
                </div>

                <Button disabled className="w-full" size="lg">
                  <Swords className="w-4 h-4 mr-2" />
                  배틀 준비 중...
                </Button>
              </CardContent>
            </Card>

            {/* Game Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5" />
                  컬렉션 통계
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isAuthenticated ? (
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold text-primary">{collection.length}</p>
                      <p className="text-sm text-muted-foreground">보유 또몬</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-accent">
                        {collection.filter((m) => m?.rarity === "rare").length}
                      </p>
                      <p className="text-sm text-muted-foreground">희귀 또몬</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-purple-500">
                        {collection.filter((m) => m?.rarity === "unique").length}
                      </p>
                      <p className="text-sm text-muted-foreground">유니크 또몬</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground">
                    <p>로그인하여 컬렉션 통계를 확인하세요</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Coming Soon Features */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">업데이트 예정</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>🔥 배틀 시스템 (턴제 전략 배틀)</p>
                <p>🏆 랭킹 시스템 (전국 랭킹)</p>
                <p>🎮 PvP 대전 (실시간 대전)</p>
                <p>🌟 또몬 진화 시스템</p>
                <p>🎁 일일 미션 및 보상</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Auth Dialog */}
      <AuthDialog
        isOpen={showAuthDialog}
        onClose={() => setShowAuthDialog(false)}
        initialMode={authMode}
        onAuthSuccess={handleAuthSuccess}
      />
    </div>
  )
}