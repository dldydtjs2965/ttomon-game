export class BuffStatus {
	status: string;
	description: string;
	upValue: number;
	remainTurn: number;
	statType: StatType;

	constructor(status: string, description: string, upValue: number, remainTurn: number, statType: StatType) {
		this.status = status;
		this.description = description;
		this.upValue = upValue;
		this.remainTurn = remainTurn;
		this.statType = statType;
	}

	// 턴 감소
	decreaseTurn() {
		this.remainTurn--;
	}

	// 턴 지속
	resetTurn(status: BuffStatus) {
		this.remainTurn = status.remainTurn;
		this.upValue = status.upValue;
		this.status = status.status;
		this.description = status.description;
	}
}

enum StatType {
	NORMAL = "NORMAL",
	ATK = "ATK",
	DEF = "DEF",
	MP_ATK = "MP_ATK",
	MAGIC_RESISTANCE = "MAGIC_RESISTANCE",
	SPD = "SPD",
	CRIT = "CRIT",
	CRIT_DMG = "CRIT_DMG",
}

export const BuffStatuses = {
	// 공격력 증가
	ATK_UP: new BuffStatus("ATK_UP", "공격력 증가", 10, 3, StatType.ATK),
	// 방어력 증가
	DEF_UP: new BuffStatus("DEF_UP", "방어력 증가", 10, 3, StatType.DEF),
	// 주문력 증가
	MP_ATK_UP: new BuffStatus("MP_ATK_UP", "주문력 증가", 10, 3, StatType.MP_ATK),
	// 마법 저항력 증가
	MAGIC_RESISTANCE_UP: new BuffStatus("MAGIC_RESISTANCE_UP", "마법 저항력 증가", 10, 3, StatType.MAGIC_RESISTANCE),
	// 스피드 증가
	SPD_UP: new BuffStatus("SPD_UP", "스피드 증가", 10, 3, StatType.SPD),
	// 크리티컬 확률 증가
	CRIT_UP: new BuffStatus("CRIT_UP", "크리티컬 확률 증가", 10, 3, StatType.CRIT),
	// 크리티컬 데미지 증가
	CRIT_DMG_UP: new BuffStatus("CRIT_DMG_UP", "크리티컬 데미지 증가", 10, 3, StatType.CRIT_DMG)
};