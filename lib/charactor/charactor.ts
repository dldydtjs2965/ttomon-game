import type{ Skill } from "../monsters";

export interface Charactor {
	id: string;
	name: string;
	image: string;
	type: string;
	rarity: string;
	hp: number;
	mp: number;
	atk: number;
	mpAtk: number;
	def: number;
	magicResistance: number;
	spd: number;
	crit: number;
	critDmgPercent: number;
	skills: Skill[];
}