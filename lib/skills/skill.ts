import type{ BuffStatus } from "../battles/buff-status";
import type { DebuffStatus } from "../battles/character-status";

interface Skill {
	// 이름
	name: string;
	// 설명
	description: string;
	// 데미지
	damage: number;
	// 쿨다운
	cooldown: number;
	// 디버프
	debuff: DebuffStatus;
	// 디버프 확률
	debuffChance: number;
	// 버프
	buff: BuffStatus;
	// 버프 확률
	buffChance: number;
}