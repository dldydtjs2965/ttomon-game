import type { DebuffStatus } from "./character-status";

export class Attack {
	defaultDamage: number;
	crit: number;
	maxDamage: number;


	constructor(atk: number, crit: number, critDmgPercent: number, debuff: DebuffStatus, debuffChance: number) {
		this.defaultDamage = atk;
		this.crit = crit;
		this.maxDamage = atk * (1 + critDmgPercent / 100);
	}
	
	// 크리티컬 확률 체크
	public isCrit() {
		return Math.random() * 100 < this.crit;
	}

	public getDamage() {
		return this.defaultDamage;
	}

	public getMaxDamage() {
		return this.maxDamage;
	}
}