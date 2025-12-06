import { createBrowserSupabase } from "@/lib/supabase/browser"
import type { DbUserProfile } from "@/lib/types/database"

/**
 * 현재 로그인한 유저의 프로필 조회
 */
export async function getCurrentUserProfile(): Promise<DbUserProfile | null> {
  const supabase = createBrowserSupabase()

  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    console.warn("User not authenticated")
    return null
  }

  const { data: profile, error: profileError } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("uid", user.id)
    .single()

  if (profileError || !profile) {
    console.warn("User profile not found:", profileError?.message)
    return null
  }

  return profile as DbUserProfile
}

/**
 * Auth UID로 유저 프로필 ID 조회
 */
export async function getUserProfileId(authUid: string): Promise<number | null> {
  const supabase = createBrowserSupabase()

  const { data: profile, error } = await supabase
    .from("user_profiles")
    .select("id")
    .eq("uid", authUid)
    .single()

  if (error || !profile) {
    console.warn("User profile not found for UID:", authUid)
    return null
  }

  return profile.id
}
