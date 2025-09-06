import type { BattleStatus } from "./battle-status";
import type { DebuffStatus } from "./character-status";
import type { Charactor } from "../charactor/charactor";
import type { BuffStatus } from "./buff-status";
import type { Skill } from "../monsters";
import type { Attack } from "./attack";
import type { SkillAttack } from "./skill-attack";
import { SkillType } from "../skills/skill-type";

export class BattleMonster implements BattleStatus {
	id: string;
	name: string;
	hp: number;
	maxHp: number;
	mp: number;
	maxMp: number;
	atk: number;
	mpAtk: number;
	def: number;
	magicResistance: number;
	spd: number;
	crit: number;
	critDmgPercent: number;
	debuffs: DebuffStatus[];
	buffs: BuffStatus[];
	skills: Skill[];

	public constructor(charactor: Charactor) {
		this.id = charactor.id;
		this.name = charactor.name;
		this.hp = charactor.hp;
		this.maxHp = charactor.hp;
		this.mp = charactor.mp;
		this.maxMp = charactor.mp;
		this.atk = charactor.atk;
		this.mpAtk = charactor.mpAtk;
		this.def = charactor.def;
		this.magicResistance = charactor.magicResistance;
		this.spd = charactor.spd;
		this.crit = charactor.crit;
		this.critDmgPercent = charactor.critDmgPercent;
		this.debuffs = [];
		this.buffs = [];
		this.skills = charactor.skills;
	}

	// 공격 당했을 때 데미지 처리
	public receiveDamage(attack: Attack): string[] {
		const messages: string[] = [];
		const damage = attack.isCrit() ? attack.getMaxDamage() : attack.getDamage();

		this.applyDamage(damage);

		if (attack.isCrit()) {
			messages.push(
				`${this.name}는 치명타 공격으로 ${damage}의 데미지를 입었습니다.`,
			);
		} else {
			messages.push(
				`${this.name}는 일반 공격으로 ${damage}의 데미지를 입었습니다.`,
			);
		}

		return messages;
	}

	public receiveSkill(skill: SkillAttack): string[] {
		const messages: string[] = [];

		// 회피 체크
		if (this.isDodge(skill)) {
			messages.push(`${this.name}는 ${skill.getName()}를 회피했습니다.`);
			return messages;
		}

		// 스킬 타입별 처리
		switch (skill.getSkillType()) {
			case SkillType.DEBUFF:
				return this.handleDebuffSkill(skill, messages);
			case SkillType.PHYSICAL:
				return this.handlePhysicalSkill(skill, messages);
			case SkillType.MAGIC:
				return this.handleMagicSkill(skill, messages);
			default:
				messages.push(`${this.name}는 알 수 없는 스킬을 받았습니다.`);
				return messages;
		}
	}

	private isDodge(skill: SkillAttack): boolean {
		return Math.random() * 100 < this.spd;
	}

	private handleDebuffSkill(skill: SkillAttack, messages: string[]): string[] {
		this.debuffs.push(skill.getDebuff());
		messages.push(
			`${this.name}는 ${skill.getDebuff().status} 상태가 되었습니다.`,
		);
		return messages;
	}

	private handlePhysicalSkill(
		skill: SkillAttack,
		messages: string[],
	): string[] {
		const damage = this.calculatePhysicalDamage(skill);
		this.applyDamage(damage);
		messages.push(
			`${this.name}는 ${skill.getName()}로 ${Math.round(damage)}의 데미지를 입었습니다.`,
		);
		return messages;
	}

	private handleMagicSkill(skill: SkillAttack, messages: string[]): string[] {
		const damage = this.calculateMagicDamage(skill);
		this.applyDamage(damage);
		messages.push(
			`${this.name}는 ${skill.getName()}로 ${Math.round(damage)}의 데미지를 입었습니다.`,
		);
		return messages;
	}

	private calculatePhysicalDamage(skill: SkillAttack): number {
		const baseDamage = skill.isCrit()
			? skill.getMaxDamage()
			: skill.getDamage();
		return this.applyDefenseReduction(baseDamage, this.def);
	}

	private calculateMagicDamage(skill: SkillAttack): number {
		const baseDamage = skill.isCrit()
			? skill.getMaxDamage()
			: skill.getDamage();
		return this.applyDefenseReduction(baseDamage, this.magicResistance);
	}

	private applyDefenseReduction(damage: number, resistance: number): number {
		return damage * (1 - resistance / 100);
	}

	private applyDamage(damage: number): void {
		this.hp = Math.max(0, this.hp - damage);
	}

	// 몬스터가 살아있는지 확인
	public isAlive(): boolean {
		return this.hp > 0;
	}

	// HP 백분율 계산
	public getHpPercentage(): number {
		return (this.hp / this.maxHp) * 100;
	}

	// MP 백분율 계산
	public getMpPercentage(): number {
		return (this.mp / this.maxMp) * 100;
	}

	// HP 회복
	public heal(amount: number): void {
		this.hp = Math.min(this.maxHp, this.hp + amount);
	}

	// MP 회복
	public restoreMp(amount: number): void {
		this.mp = Math.min(this.maxMp, this.mp + amount);
	}

	// 디버프 제거
	public removeDebuff(debuffIndex: number): void {
		if (debuffIndex >= 0 && debuffIndex < this.debuffs.length) {
			this.debuffs.splice(debuffIndex, 1);
		}
	}

	// 버프 제거
	public removeBuff(buffIndex: number): void {
		if (buffIndex >= 0 && buffIndex < this.buffs.length) {
			this.buffs.splice(buffIndex, 1);
		}
	}
}
