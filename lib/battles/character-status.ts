export class DebuffStatus {
	status: string;
	description: string;
	isTurnable: boolean;
	dotDamage: number;
	remainTurn: number;

	constructor(status: string, description: string, isTurnable: boolean, dotDamage: number, remainTurn: number) {
		this.status = status;
		this.description = description;
		this.isTurnable = isTurnable;
		this.dotDamage = dotDamage;
		this.remainTurn = remainTurn;
	}

	// 턴 감소
	decreaseTurn() {
		this.remainTurn--;
	}

	// 턴 지속
	resetTurn(status: DebuffStatus) {
		this.remainTurn = status.remainTurn;
		this.dotDamage = status.dotDamage;
		this.isTurnable = status.isTurnable;
		this.status = status.status;
		this.description = status.description;
	}
}

export const CharacterStatuses = {
	NORMAL: new DebuffStatus("NORMAL", "정상", true, 0, 0),
	// 출혈
	BLOODING: new DebuffStatus("BLOODING", "출혈", true, 10, 3),
	// 중독
	POISONED: new DebuffStatus("POISONED", "중독", true, 10, 3),
	// 화상
	SCORCHED: new DebuffStatus("SCORCHED", "화상", true, 10, 3),
	// 마비
	PARALYSIS: new DebuffStatus("PARALYSIS", "마비", true, 0, 2),
	// 기절
	STUNNED: new DebuffStatus("STUNNED", "기절", true, 0, 2),
};