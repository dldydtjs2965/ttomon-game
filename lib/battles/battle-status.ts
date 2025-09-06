import type { Skill } from "../monsters";
import type { BuffStatus } from "./buff-status";
import type { DebuffStatus } from "./character-status";

export interface BattleStatus {
	id: string;
	// 이름
	name: string;
	// 체력
	hp: number;
	// 최대 체력
	maxHp: number;
	// 마나
	mp: number;
	// 최대 마나
	maxMp: number;
	// 공격력
	atk: number;
	// 주문력
	mpAtk: number;
	// 방어력
	def: number;
	// 마법 저항력
	magicResistance: number;
	// 스피드
	spd: number;
	// 크리티컬 확률
	crit: number;
	// 크리티컬 데미지 퍼센트
	critDmgPercent: number;
	// 상태
	debuffs: DebuffStatus[];
	// 버프
	buffs: BuffStatus[];
	// 스킬
	skills: Skill[];
}