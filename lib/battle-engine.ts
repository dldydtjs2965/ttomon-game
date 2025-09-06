import type { Monster, Skill } from "./monsters";
import type { GameAction } from "./game-state";

export interface BattleResult {
	damage: number;
	healed: number;
	dodged: boolean;
	blocked: boolean;
	attacker: Monster;
	target: Monster;
	dodgeAttempted?: boolean; // 회피 시도가 있었는지
	blockAttempted?: boolean; // 막기 시도가 있었는지
}

export interface TurnResult {
	playerResult: BattleResult | null;
	enemyResult: BattleResult | null;
	gameOver: boolean;
	winner: "player" | "enemy" | null;
}

export function executeSkill(
	attacker: Monster,
	skill: Skill,
	target: Monster,
): BattleResult {
	let damage = 0;
	let healed = 0;
	let dodged = false;
	let blocked = false;
	let dodgeAttempted = false;
	let blockAttempted = false;

	if (skill.type === "heal") {
		// Self heal
		const healAmount = skill.healAmount || 50;
		const actualHeal = Math.min(healAmount, attacker.maxHp - attacker.hp);
		attacker.hp += actualHeal;
		healed = actualHeal;
	} else if (skill.type === "dodge") {
		// Dodge skill - set dodge flag and chance
		attacker.dodgeNextAttack = true;
		attacker.dodgeChance = skill.dodgeChance || 0.5; // Default 50% if not specified
	} else if (skill.type === "block") {
		// Block skill - set block flag and reduction
		attacker.blockNextAttack = true;
		attacker.blockReduction = skill.blockReduction || 0.5; // Default 50% reduction if not specified
	} else {
		// Attack skills
		damage = skill.damage || attacker.attack;
		console.log(
			`[v0] executeSkill: ${attacker.name} -> ${target.name}, 스킬: ${skill.name}, 초기 데미지: ${damage}, 막기 상태: ${target.blockNextAttack}, 회피 상태: ${target.dodgeNextAttack}`,
		);

		// Check for dodge
		if (target.dodgeNextAttack) {
			dodgeAttempted = true;
			console.log(
				`[v0] [${target.name}] 회피 시도 (스킬), 확률: ${target.dodgeChance || 0.5}`,
			);
			if (Math.random() < (target.dodgeChance || 0.5)) {
				dodged = true;
				damage = 0;
				console.log(`[v0] [${target.name}] 회피 성공 (스킬)!`);
			} else {
				console.log(`[v0] [${target.name}] 회피 실패 (스킬)`);
			}
			target.dodgeNextAttack = false; // 일회성 효과
			target.dodgeChance = undefined; // Reset chance
		}
		// Check for block
		else if (target.blockNextAttack) {
			blockAttempted = true;
			blocked = true;
			const reduction = target.blockReduction || 0.5;
			const originalDamage = damage;
			damage = Math.floor(damage * (1 - reduction));
			console.log(
				`[v0] [${target.name}] 막기 성공 (스킬)! 원래 데미지: ${originalDamage}, 감소 후: ${damage} (감소율: ${reduction * 100}%)`,
			);
			target.blockNextAttack = false; // 일회성 효과
			target.blockReduction = undefined; // Reset reduction
		} else {
			// Random dodge/block chances when not using skills
			if (Math.random() < 0.2) {
				dodged = true;
				damage = 0;
			}

			if (!dodged && Math.random() < 0.15) {
				blocked = true;
				damage = Math.floor(damage * 0.5);
			}
		}

		// Apply damage
		target.hp = Math.max(0, target.hp - damage);
	}

	return {
		damage,
		healed,
		dodged,
		blocked,
		attacker,
		target: skill.type === "heal" ? attacker : target,
		dodgeAttempted,
		blockAttempted,
	};
}

export function executeNormalAttack(
	attacker: Monster,
	target: Monster,
): BattleResult {
	let damage = attacker.attack;
	let dodged = false;
	let blocked = false;
	let dodgeAttempted = false;
	let blockAttempted = false;

	console.log(
		`[v0] executeNormalAttack: ${attacker.name} -> ${target.name}, 초기 데미지: ${damage}, 막기 상태: ${target.blockNextAttack}, 회피 상태: ${target.dodgeNextAttack}`,
	);

	// Check for dodge
	if (target.dodgeNextAttack) {
		dodgeAttempted = true;
		console.log(
			`[v0] [${target.name}] 회피 시도, 확률: ${target.dodgeChance || 0.5}`,
		);
		if (Math.random() < (target.dodgeChance || 0.5)) {
			dodged = true;
			damage = 0;
			console.log(`[v0] [${target.name}] 회피 성공!`);
		} else {
			console.log(`[v0] [${target.name}] 회피 실패`);
		}
		target.dodgeNextAttack = false; // 일회성 효과
		target.dodgeChance = undefined; // Reset chance
	}
	// Check for block
	else if (target.blockNextAttack) {
		blockAttempted = true;
		blocked = true;
		const reduction = target.blockReduction || 0.5;
		const originalDamage = damage;
		damage = Math.floor(damage * (1 - reduction));
		console.log(
			`[v0] [${target.name}] 막기 성공! 원래 데미지: ${originalDamage}, 감소 후: ${damage} (감소율: ${reduction * 100}%)`,
		);
		target.blockNextAttack = false; // 일회성 효과
		target.blockReduction = undefined; // Reset reduction
	} else {
		// Random dodge/block chances when not using skills
		if (Math.random() < 0.15) {
			dodged = true;
			damage = 0;
		}

		if (!dodged && Math.random() < 0.1) {
			blocked = true;
			damage = Math.floor(damage * 0.6);
		}
	}

	// Apply damage
	target.hp = Math.max(0, target.hp - damage);

	return {
		damage,
		healed: 0,
		dodged,
		blocked,
		attacker,
		target,
		dodgeAttempted,
		blockAttempted,
	};
}

export function generateEnemyAction(
	enemy: Monster,
	player: Monster,
): GameAction & { skillIndex?: number } {
	// 사용 가능한 스킬 찾기
	const availableSkills = enemy.skills
		.map((skill, index) => ({ skill, index }))
		.filter(({ index }) => enemy.skillCooldowns[index] === 0);

	if (availableSkills.length > 0) {
		// 체력이 낮으면 힐 스킬 우선, 아니면 랜덤
		if (enemy.hp < enemy.maxHp * 0.3) {
			const healSkill = availableSkills.find(
				({ skill }) => skill.type === "heal",
			);
			if (healSkill) {
				return {
					monsterId: enemy.id,
					type: "skill",
					skillIndex: healSkill.index,
				};
			}
		}

		// 70% 확률로 스킬 사용
		if (Math.random() < 0.7) {
			const randomSkill =
				availableSkills[Math.floor(Math.random() * availableSkills.length)];
			return {
				monsterId: enemy.id,
				type: "skill",
				skillIndex: randomSkill.index,
			};
		}
	}

	return {
		monsterId: enemy.id,
		type: "attack",
	};
}

// New interface for action execution results without immediate state changes
export interface ActionExecutionResult {
	result: BattleResult;
	hpChanges: {
		target: Monster;
		newHp: number;
		originalHp: number;
	};
	cooldownUpdates: {
		monster: Monster;
		skillIndex: number;
		newCooldown: number;
	}[];
}

// Execute a single action without applying state changes
export function executeActionDry(
	action: GameAction & { skillIndex?: number },
	attacker: Monster,
	target: Monster,
): ActionExecutionResult | null {
	let result: BattleResult;
	let hpChanges = { target, newHp: target.hp, originalHp: target.hp };
	let cooldownUpdates: {
		monster: Monster;
		skillIndex: number;
		newCooldown: number;
	}[] = [];

	// Create deep copies to avoid mutating original monsters
	const attackerCopy = {
		...attacker,
		skillCooldowns: [...attacker.skillCooldowns],
		// 중요: 방어 상태도 복사
		dodgeNextAttack: attacker.dodgeNextAttack,
		blockNextAttack: attacker.blockNextAttack,
		dodgeChance: attacker.dodgeChance,
		blockReduction: attacker.blockReduction,
	};
	const targetCopy = {
		...target,
		// 중요: 방어 상태도 복사
		dodgeNextAttack: target.dodgeNextAttack,
		blockNextAttack: target.blockNextAttack,
		dodgeChance: target.dodgeChance,
		blockReduction: target.blockReduction,
	};

	console.log(`[executeActionDry] 몬스터 복사 완료:`);
	console.log(
		`  - Attacker: ${attackerCopy.name}, HP: ${attackerCopy.hp}, Block: ${attackerCopy.blockNextAttack}, Dodge: ${attackerCopy.dodgeNextAttack}`,
	);
	console.log(
		`  - Target: ${targetCopy.name}, HP: ${targetCopy.hp}, Block: ${targetCopy.blockNextAttack}, Dodge: ${targetCopy.dodgeNextAttack}`,
	);

	if (action.type === "skill" && typeof action.skillIndex === "number") {
		const skillIndex = action.skillIndex;
		if (attackerCopy.skillCooldowns[skillIndex] === 0) {
			const skill = attackerCopy.skills[skillIndex];
			result = executeSkill(attackerCopy, skill, targetCopy);
			cooldownUpdates.push({
				monster: attacker,
				skillIndex,
				newCooldown: skill.cooldown,
			});
		} else {
			return null; // Skill on cooldown
		}
	} else if (action.type === "attack") {
		result = executeNormalAttack(attackerCopy, targetCopy);
	} else if (action.type === "dodge") {
		// 회피 액션 - 다음 공격을 회피할 플래그 설정
		attackerCopy.dodgeNextAttack = true;
		attackerCopy.dodgeChance = 0.5; // 기본 50% 확률
		console.log(
			`[v0] [${attacker.name}] 회피 액션 설정: dodgeNextAttack=${attackerCopy.dodgeNextAttack}, chance=${attackerCopy.dodgeChance}`,
		);
		result = {
			damage: 0,
			healed: 0,
			dodged: false,
			blocked: false,
			attacker: attackerCopy,
			target: attackerCopy,
		};
	} else if (action.type === "block") {
		// 막기 액션 - 다음 공격을 막을 플래그 설정
		attackerCopy.blockNextAttack = true;
		attackerCopy.blockReduction = 0.5; // 기본 50% 데미지 감소
		console.log(
			`[v0] [${attacker.name}] 막기 액션 설정: blockNextAttack=${attackerCopy.blockNextAttack}, reduction=${attackerCopy.blockReduction}`,
		);
		result = {
			damage: 0,
			healed: 0,
			dodged: false,
			blocked: false,
			attacker: attackerCopy,
			target: attackerCopy,
		};
	} else {
		return null;
	}

	// 🔥 핵심 수정: HP 변경사항을 올바르게 계산
	console.log(`[executeActionDry] HP 변경사항 계산:`);
	console.log(`  - Action: ${action.type}`);
	console.log(`  - Result damage: ${result.damage}, healed: ${result.healed}`);
	console.log(
		`  - Target HP before: ${target.hp}, Target HP after: ${targetCopy.hp}`,
	);
	console.log(
		`  - Attacker HP before: ${attacker.hp}, Attacker HP after: ${attackerCopy.hp}`,
	);

	// Handle hpChanges based on action type and skill type
	if (result.healed && result.healed > 0) {
		// 힐링의 경우 - result.target이 실제로 힐링받은 대상
		// executeSkill에서 heal 타입일 때 result.target이 attacker로 설정됨
		const healedMonster = result.target === attackerCopy ? attacker : target;
		const healedCopy =
			result.target === attackerCopy ? attackerCopy : targetCopy;
		hpChanges = {
			target: healedMonster, // 힐링받은 원본 몬스터
			newHp: healedCopy.hp, // 힐링 후 HP
			originalHp: healedMonster.hp, // 원본 HP
		};
	} else if (action.type === "dodge" || action.type === "block") {
		// 방어 행동의 경우 HP는 변경되지 않음
		hpChanges = {
			target: attacker,
			newHp: attacker.hp, // HP 변경 없음
			originalHp: attacker.hp,
		};
	} else if (result.damage && result.damage > 0) {
		// 공격 행동의 경우 target의 HP가 변경됨
		hpChanges = {
			target: target, // 원본 몬스터 참조
			newHp: targetCopy.hp, // 변경된 HP
			originalHp: target.hp, // 원본 HP
		};
	} else {
		// 기타 (데미지도 힐도 없는 경우)
		hpChanges = {
			target: target,
			newHp: target.hp,
			originalHp: target.hp,
		};
	}

	console.log(`[executeActionDry] 최종 HP 변경사항:`);
	console.log(`  - Target: ${hpChanges.target.name}`);
	console.log(
		`  - Original HP: ${hpChanges.originalHp} -> New HP: ${hpChanges.newHp}`,
	);

	return {
		result,
		hpChanges,
		cooldownUpdates,
	};
}

// Execute sequential turn with results that can be applied later
export function executeSequentialTurn(
	playerAction: GameAction & { skillIndex?: number },
	enemyAction: GameAction & { skillIndex?: number },
	playerMonster: Monster,
	enemyMonster: Monster,
	playerFirst: boolean = Math.random() < 0.5,
): {
	sequence: Array<{
		actor: "player" | "enemy";
		result: ActionExecutionResult | null;
	}>;
	gameOverAfter?: "player" | "enemy";
	winner?: "player" | "enemy" | null;
} {
	const sequence: Array<{
		actor: "player" | "enemy";
		result: ActionExecutionResult | null;
	}> = [];

	let currentPlayerHp = playerMonster.hp;
	let currentEnemyHp = enemyMonster.hp;

	if (playerFirst) {
		// Player action first
		const playerResult = executeActionDry(
			playerAction,
			playerMonster,
			enemyMonster,
		);
		sequence.push({ actor: "player", result: playerResult });

		if (playerResult) {
			currentEnemyHp = playerResult.hpChanges.newHp;
		}

		// Check if enemy is defeated
		if (currentEnemyHp <= 0) {
			return {
				sequence,
				gameOverAfter: "player",
				winner: "player",
			};
		}

		// Enemy action second
		const enemyResult = executeActionDry(
			enemyAction,
			enemyMonster,
			playerMonster,
		);
		sequence.push({ actor: "enemy", result: enemyResult });

		if (enemyResult) {
			currentPlayerHp = enemyResult.hpChanges.newHp;
		}
	} else {
		// Enemy action first
		const enemyResult = executeActionDry(
			enemyAction,
			enemyMonster,
			playerMonster,
		);
		sequence.push({ actor: "enemy", result: enemyResult });

		if (enemyResult) {
			currentPlayerHp = enemyResult.hpChanges.newHp;
		}

		// Check if player is defeated
		if (currentPlayerHp <= 0) {
			return {
				sequence,
				gameOverAfter: "enemy",
				winner: "enemy",
			};
		}

		// Player action second
		const playerResult = executeActionDry(
			playerAction,
			playerMonster,
			enemyMonster,
		);
		sequence.push({ actor: "player", result: playerResult });

		if (playerResult) {
			currentEnemyHp = playerResult.hpChanges.newHp;
		}
	}

	// Check for game over after both actions
	let winner: "player" | "enemy" | null = null;
	if (currentPlayerHp <= 0 && currentEnemyHp <= 0) {
		winner = null; // Draw
	} else if (currentPlayerHp <= 0) {
		winner = "enemy";
	} else if (currentEnemyHp <= 0) {
		winner = "player";
	}

	return {
		sequence,
		gameOverAfter: winner
			? currentPlayerHp <= 0
				? "enemy"
				: "player"
			: undefined,
		winner,
	};
}

// Legacy function for backward compatibility
export function executeTurn(
	playerAction: GameAction & { skillIndex?: number },
	enemyAction: GameAction & { skillIndex?: number },
	playerMonster: Monster,
	enemyMonster: Monster,
): TurnResult {
	let playerResult: BattleResult | null = null;
	let enemyResult: BattleResult | null = null;

	// Determine turn order (random for now, could be based on speed)
	const playerFirst = Math.random() < 0.5;

	const executePlayerAction = () => {
		if (
			playerAction.type === "skill" &&
			typeof playerAction.skillIndex === "number"
		) {
			const skillIndex = playerAction.skillIndex;
			if (playerMonster.skillCooldowns[skillIndex] === 0) {
				const skill = playerMonster.skills[skillIndex];
				playerResult = executeSkill(playerMonster, skill, enemyMonster);
				playerMonster.skillCooldowns[skillIndex] = skill.cooldown;
			}
		} else if (playerAction.type === "attack") {
			playerResult = executeNormalAttack(playerMonster, enemyMonster);
		} else if (playerAction.type === "dodge") {
			// 회피 액션 - 다음 적의 공격을 높은 확률로 회피
			playerMonster.dodgeNextAttack = true;
			playerResult = {
				damage: 0,
				healed: 0,
				dodged: false,
				blocked: false,
				attacker: playerMonster,
				target: playerMonster,
			};
		} else if (playerAction.type === "block") {
			// 막기 액션 - 다음 적의 공격 데미지를 크게 감소
			playerMonster.blockNextAttack = true;
			playerResult = {
				damage: 0,
				healed: 0,
				dodged: false,
				blocked: false,
				attacker: playerMonster,
				target: playerMonster,
			};
		}
	};

	const executeEnemyAction = () => {
		if (enemyMonster.hp <= 0) return; // Skip if enemy is already defeated

		if (
			enemyAction.type === "skill" &&
			typeof enemyAction.skillIndex === "number"
		) {
			const skillIndex = enemyAction.skillIndex;
			if (enemyMonster.skillCooldowns[skillIndex] === 0) {
				const skill = enemyMonster.skills[skillIndex];
				enemyResult = executeSkill(enemyMonster, skill, playerMonster);
				enemyMonster.skillCooldowns[skillIndex] = skill.cooldown;
			}
		} else if (enemyAction.type === "attack") {
			enemyResult = executeNormalAttack(enemyMonster, playerMonster);
		}
	};

	// Execute actions in order
	if (playerFirst) {
		executePlayerAction();
		executeEnemyAction();
	} else {
		executeEnemyAction();
		executePlayerAction();
	}

	// Update cooldowns for all skills
	for (let i = 0; i < playerMonster.skillCooldowns.length; i++) {
		if (playerMonster.skillCooldowns[i] > 0) {
			playerMonster.skillCooldowns[i]--;
		}
	}
	for (let i = 0; i < enemyMonster.skillCooldowns.length; i++) {
		if (enemyMonster.skillCooldowns[i] > 0) {
			enemyMonster.skillCooldowns[i]--;
		}
	}

	// Check for game over
	const playerAlive = playerMonster.hp > 0;
	const enemyAlive = enemyMonster.hp > 0;

	let winner: "player" | "enemy" | null = null;
	let gameOver = false;

	if (!playerAlive && !enemyAlive) {
		gameOver = true;
		winner = null; // Draw
	} else if (!playerAlive) {
		gameOver = true;
		winner = "enemy";
	} else if (!enemyAlive) {
		gameOver = true;
		winner = "player";
	}

	return {
		playerResult,
		enemyResult,
		gameOver,
		winner,
	};
}

export function generateEnemyMonster(playerMonster: Monster): Monster {
	// Generate enemy with similar strength
	const enemyHp = Math.floor(playerMonster.maxHp * (0.9 + Math.random() * 0.2));
	const enemyAttack = Math.floor(
		playerMonster.attack * (0.9 + Math.random() * 0.2),
	);

	const enemy: Monster = {
		id: `enemy_${Date.now()}`,
		name: `야생 또몬`,
		image: "/enemy-monster.png",
		type: "enemy",
		rarity: "common",
		hp: enemyHp,
		maxHp: enemyHp,
		attack: enemyAttack,
		skills: [
			{
				id: "enemy_skill_1",
				name: "야생 공격",
				type: "strong_attack",
				damage: enemyAttack + 15,
				range: 1,
				cooldown: 3,
				description: "강력한 야생 공격을 가합니다.",
			},
			{
				id: "enemy_skill_2",
				name: "야생 치유",
				type: "heal",
				healAmount: 40,
				range: 1,
				cooldown: 4,
				description: "자신의 체력을 회복합니다.",
			},
			{
				id: "enemy_skill_3",
				name: "야생 돌진",
				type: "wide_attack",
				damage: enemyAttack + 10,
				range: 3,
				cooldown: 3,
				description: "넓은 범위 공격을 가합니다.",
			},
			{
				id: "enemy_skill_4",
				name: "야생 방어",
				type: "block",
				range: 1,
				cooldown: 3,
				description: "다음 공격의 데미지를 감소시킵니다.",
			},
		],
		skillCooldowns: [0, 0, 0, 0],
		dodgeNextAttack: false,
		blockNextAttack: false,
	};

	return enemy;
}
