import { SkillType } from "../skills/skill-type";
import type { DebuffStatus } from "./character-status";

export abstract class SkillAttack {
	protected name: string;
	protected defaultDamage: number;
	protected crit: number;
	protected maxDamage: number;
	protected debuff: DebuffStatus;
	protected debuffChance: number;
	protected skillType: SkillType;

	constructor(
		name: string,
		skillType: SkillType,
		damage: number,
		crit: number,
		critDmgPercent: number,
		debuff: DebuffStatus,
		debuffChance: number,
	) {
		this.name = name;
		this.defaultDamage = damage;
		this.crit = crit;
		this.maxDamage = damage * (1 + critDmgPercent / 100);
		this.debuff = debuff;
		this.skillType = skillType;
		this.debuffChance = debuffChance;
	}

	// Getter 메서드들
	getDamage(): number {
		return this.defaultDamage;
	}

	getCrit(): number {
		return this.crit;
	}

	getMaxDamage(): number {
		return this.maxDamage;
	}

	getDebuff(): DebuffStatus {
		return this.debuff;
	}

	getSkillType(): SkillType {
		return this.skillType;
	}

	getName(): string {
		return this.name;
	}

	isCrit(): boolean {
		return Math.random() * 100 < this.crit;
	}
}

export class PhysicalAttack extends SkillAttack {
	constructor(name: string, atk: number, crit: number, critDmgPercent: number, debuff: DebuffStatus, debuffChance: number) {
		super(name, SkillType.PHYSICAL, atk, crit, critDmgPercent, debuff, debuffChance);
	}
}

export class MagicAttack extends SkillAttack {
	constructor(name: string, damage: number, crit: number, critDmgPercent: number, debuff: DebuffStatus, debuffChance: number) {
		super(name, SkillType.MAGIC, damage, crit, critDmgPercent, debuff, debuffChance);
	}
}

export class DebuffAttack extends SkillAttack {
	constructor(name: string, debuff: DebuffStatus, debuffChance: number) {
		super(name, SkillType.DEBUFF, 0, 0, 0, debuff, debuffChance);
	}
}