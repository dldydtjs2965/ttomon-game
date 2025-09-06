"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { createClient } from "@/lib/supabase/client"
import { Loader2, Mail, Lock, User, Check, X } from "lucide-react"

interface SignUpFormProps {
  onSuccess?: () => void
  onSwitchToSignIn?: () => void
}

export function SignUpForm({ onSuccess, onSwitchToSignIn }: SignUpFormProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [name, setName] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // 실명 인증 관련 상태
  const [isNameVerifying, setIsNameVerifying] = useState(false)
  const [isNameVerified, setIsNameVerified] = useState(false)
  const [nameVerificationError, setNameVerificationError] = useState<string | null>(null)
  const [verifiedProfileId, setVerifiedProfileId] = useState<number | null>(null)

  const handleNameVerification = async () => {
    if (!name.trim()) {
      setNameVerificationError("이름을 입력해주세요.")
      return
    }

    if (name.trim().length < 2) {
      setNameVerificationError("이름은 2글자 이상 입력해주세요.")
      return
    }

    setIsNameVerifying(true)
    setNameVerificationError(null)

    try {
      const response = await fetch('/api/auth/verify-name', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: name.trim() }),
      })

      const data = await response.json()

      if (!response.ok) {
        setNameVerificationError(data.error || '실명 인증에 실패했습니다.')
        return
      }

      setIsNameVerified(true)
      setVerifiedProfileId(data.profileId)
      setNameVerificationError(null)
    } catch (error) {
      setNameVerificationError('네트워크 오류가 발생했습니다.')
    } finally {
      setIsNameVerifying(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!isNameVerified) {
      setError("실명 인증을 완료해주세요.")
      return
    }

    setIsLoading(true)
    setError(null)

    if (password !== confirmPassword) {
      setError("비밀번호가 일치하지 않습니다.")
      setIsLoading(false)
      return
    }

    if (password.length < 6) {
      setError("비밀번호는 최소 6자 이상이어야 합니다.")
      setIsLoading(false)
      return
    }

    try {
      // 클라이언트에서 직접 회원가입 처리 (자동 로그인을 위해)
      const supabase = createClient()
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: undefined, // 이메일 인증 비활성화
        }
      })

      if (signUpError) {
        setError(signUpError.message)
        return
      }

      // 회원가입 성공 후 user_profiles 업데이트 (서비스 키로 API 호출)
      if (authData.user && verifiedProfileId) {
        const updateResponse = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: authData.user.id,
            profileId: verifiedProfileId
          }),
        })

        const updateResult = await updateResponse.json()

        if (!updateResponse.ok) {
          console.error('Profile update failed:', updateResult)
          setError(updateResult.error || '프로필 업데이트에 실패했습니다.')
          return
        }

        console.log('Profile updated successfully:', updateResult)
      }

      onSuccess?.()
    } catch (err) {
      setError("회원가입 중 오류가 발생했습니다.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="name">실명</Label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="name"
              type="text"
              placeholder="실명을 입력하세요"
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                // 이름이 변경되면 인증 상태 초기화
                if (isNameVerified) {
                  setIsNameVerified(false)
                  setVerifiedProfileId(null)
                  setNameVerificationError(null)
                }
              }}
              className="pl-10"
              required
              disabled={isLoading || isNameVerifying || isNameVerified}
            />
            {isNameVerified && (
              <Check className="absolute right-3 top-3 h-4 w-4 text-green-500" />
            )}
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={handleNameVerification}
            disabled={!name.trim() || isLoading || isNameVerifying || isNameVerified}
            className="shrink-0"
          >
            {isNameVerifying ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                인증 중
              </>
            ) : isNameVerified ? (
              <>
                <Check className="mr-2 h-4 w-4" />
                인증완료
              </>
            ) : (
              "인증하기"
            )}
          </Button>
        </div>
        {nameVerificationError && (
          <p className="text-sm text-red-500 flex items-center gap-1">
            <X className="h-3 w-3" />
            {nameVerificationError}
          </p>
        )}
        {isNameVerified && (
          <p className="text-sm text-green-500 flex items-center gap-1">
            <Check className="h-3 w-3" />
            실명 인증이 완료되었습니다.
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">이메일</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            id="email"
            type="email"
            placeholder="이메일을 입력하세요"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="pl-10"
            required
            disabled={isLoading}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">비밀번호</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            id="password"
            type="password"
            placeholder="비밀번호를 입력하세요 (최소 6자)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="pl-10"
            required
            disabled={isLoading}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">비밀번호 확인</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            id="confirmPassword"
            type="password"
            placeholder="비밀번호를 다시 입력하세요"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="pl-10"
            required
            disabled={isLoading}
          />
        </div>
      </div>

      <Button 
        type="submit" 
        className="w-full" 
        disabled={isLoading || !isNameVerified}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            회원가입 중...
          </>
        ) : !isNameVerified ? (
          "실명 인증을 완료해주세요"
        ) : (
          "회원가입"
        )}
      </Button>

      <div className="text-center">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onSwitchToSignIn}
          disabled={isLoading}
        >
          이미 계정이 있으신가요? 로그인
        </Button>
      </div>
    </form>
  )
}