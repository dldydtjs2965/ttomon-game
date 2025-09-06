import { createClient } from "@/lib/supabase/client";
import type {
	DbMonster,
	DbMonsterStats,
	DbUserMonster,
	DbUserProfile,
	MonsterWithStats,
	UserMonsterWithDetails,
} from "@/lib/types/database";

/**
 * 모든 몬스터와 스탯 정보를 가져옵니다 (마스터 데이터)
 */
export async function getAllMonstersWithStats(): Promise<MonsterWithStats[]> {
	const supabase = createClient();

	try {
		// monsters 테이블과 monster_stats 테이블을 조인
		const { data: monsters, error: monstersError } = await supabase
			.from("monsters")
			.select("*")
			.order("id");

		if (monstersError) {
			console.error("Error fetching monsters:", monstersError);
			throw monstersError;
		}

		const { data: stats, error: statsError } = await supabase
			.from("monster_stats")
			.select("*");

		if (statsError) {
			console.error("Error fetching monster stats:", statsError);
			throw statsError;
		}

		// 몬스터와 스탯을 매칭
		const monstersWithStats: MonsterWithStats[] = (monsters || []).map(
			(monster) => {
				const monsterStats =
					stats?.find((s) => s.monster_id === monster.id) || null;
				return {
					monster,
					stats: monsterStats,
				};
			},
		);

		return monstersWithStats;
	} catch (error) {
		console.error("Failed to fetch monsters with stats:", error);
		return [];
	}
}

/**
 * 특정 몬스터의 정보를 가져옵니다
 */
export async function getMonsterById(
	monsterId: number,
): Promise<MonsterWithStats | null> {
	const supabase = createClient();

	try {
		const { data: monster, error: monsterError } = await supabase
			.from("monsters")
			.select("*")
			.eq("id", monsterId)
			.single();

		if (monsterError) {
			console.error("Error fetching monster:", monsterError);
			return null;
		}

		const { data: stats, error: statsError } = await supabase
			.from("monster_stats")
			.select("*")
			.eq("monster_id", monsterId)
			.single();

		if (statsError && statsError.code !== "PGRST116") {
			// PGRST116: no rows found
			console.error("Error fetching monster stats:", statsError);
		}

		return {
			monster,
			stats: stats || null,
		};
	} catch (error) {
		console.error("Failed to fetch monster by id:", error);
		return null;
	}
}

/**
 * 현재 인증된 사용자가 보유한 몬스터 목록을 가져옵니다
 */
export async function getCurrentUserMonsters(): Promise<
	UserMonsterWithDetails[]
> {
	const supabase = createClient();

	try {
		// 현재 인증된 사용자 확인
		const {
			data: { user },
			error: authError,
		} = await supabase.auth.getUser();

		if (authError || !user) {
			console.log("User not authenticated");
			return [];
		}

		// 사용자 프로필 조회
		const { data: profile, error: profileError } = await supabase
			.from("user_profiles")
			.select("id")
			.eq("uid", user.id)
			.maybeSingle();

		if (profileError || !profile) {
			console.error("Error fetching user profile:", profileError);
			return [];
		}

		// user_monsters 조회 (RLS 정책에 의해 자동 필터링)
		const { data: userMonsters, error: userMonstersError } = await supabase
			.from("user_monsters")
			.select("*")
			.eq("user_id", profile.id);

		if (userMonstersError) {
			console.error("Error fetching user monsters:", userMonstersError);
			throw userMonstersError;
		}

		if (!userMonsters || userMonsters.length === 0) {
			return [];
		}

		// 관련 몬스터 ID 수집
		const monsterIds = [
			...new Set(
				userMonsters.map((um) => um.monster_id).filter((id) => id !== null),
			),
		];

		// 몬스터 정보 조회
		const { data: monsters, error: monstersError } = await supabase
			.from("monsters")
			.select("*")
			.in("id", monsterIds);

		if (monstersError) {
			console.error("Error fetching monsters:", monstersError);
			throw monstersError;
		}

		// 몬스터 스탯 조회
		const { data: stats, error: statsError } = await supabase
			.from("monster_stats")
			.select("*")
			.in("monster_id", monsterIds);

		if (statsError) {
			console.error("Error fetching monster stats:", statsError);
			throw statsError;
		}

		// 데이터 조합
		const result: UserMonsterWithDetails[] = userMonsters
			.filter((um) => um.monster_id !== null)
			.map((userMonster) => {
				const monster =
					monsters?.find((m) => m.id === userMonster.monster_id) || null;
				const monsterStats =
					stats?.find((s) => s.monster_id === userMonster.monster_id) || null;

				if (!monster) {
					return null;
				}

				return {
					userMonster,
					monster,
					stats: monsterStats,
				};
			})
			.filter((item): item is UserMonsterWithDetails => item !== null);

		return result;
	} catch (error) {
		console.error("Failed to fetch user monsters:", error);
		return [];
	}
}

/**
 * 현재 인증된 사용자의 프로필을 가져옵니다
 */
export async function getCurrentUserProfile(): Promise<DbUserProfile | null> {
	const supabase = createClient();

	try {
		// 현재 인증된 사용자 확인
		const {
			data: { user },
			error: authError,
		} = await supabase.auth.getUser();

		if (authError || !user) {
			console.log("User not authenticated");
			return null;
		}

		console.log("Authenticated user ID:", user.id);

		// 사용자 프로필 조회 (RLS 정책에 의해 자동 필터링)
		// maybeSingle()을 사용하여 데이터가 없어도 에러가 발생하지 않도록 함
		const { data, error } = await supabase
			.from("user_profiles")
			.select("*")
			.eq("uid", user.id)
			.maybeSingle();

		if (error) {
			console.error("Error fetching user profile:", error);
			console.error("Error details:", {
				code: error.code,
				message: error.message,
				details: error.details,
				hint: error.hint,
			});
			return null;
		}

		if (!data) {
			console.log("No user profile found for user ID:", user.id);
			return null;
		}

		console.log("User profile found:", data);
		return data;
	} catch (error) {
		console.error("Failed to fetch current user profile:", error);
		return null;
	}
}

/**
 * 디버깅용: 사용자 프로필 존재 여부를 확인합니다
 */
export async function debugUserProfile(): Promise<{
	isAuthenticated: boolean;
	userId: string | null;
	profileExists: boolean;
	profileData: DbUserProfile | null;
	error: string | null;
}> {
	const supabase = createClient();

	try {
		// 인증 상태 확인
		const {
			data: { user },
			error: authError,
		} = await supabase.auth.getUser();

		if (authError) {
			return {
				isAuthenticated: false,
				userId: null,
				profileExists: false,
				profileData: null,
				error: `Auth error: ${authError.message}`,
			};
		}

		if (!user) {
			return {
				isAuthenticated: false,
				userId: null,
				profileExists: false,
				profileData: null,
				error: "No authenticated user",
			};
		}

		// 프로필 존재 여부 확인 (maybeSingle 사용)
		const { data: profile, error: profileError } = await supabase
			.from("user_profiles")
			.select("*")
			.eq("uid", user.id)
			.maybeSingle();

		if (profileError) {
			return {
				isAuthenticated: true,
				userId: user.id,
				profileExists: false,
				profileData: null,
				error: `Profile error: ${profileError.message} (Code: ${profileError.code})`,
			};
		}

		return {
			isAuthenticated: true,
			userId: user.id,
			profileExists: !!profile,
			profileData: profile,
			error: null,
		};
	} catch (error) {
		return {
			isAuthenticated: false,
			userId: null,
			profileExists: false,
			profileData: null,
			error: `Unexpected error: ${
				error instanceof Error ? error.message : "Unknown error"
			}`,
		};
	}
}
