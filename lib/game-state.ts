import type { Monster } from "./monsters";

export type GamePhase = "setup" | "battle" | "result";
export type ActionType = "attack" | "skill" | "dodge" | "block";

export interface GameAction {
	monsterId: string;
	type: ActionType;
	targetPosition?: { x: number; y: number };
}

export interface GameState {
	phase: GamePhase;
	playerMonsters: (Monster | null)[][]; // 3x3 grid
	enemyMonsters: (Monster | null)[][]; // 3x3 grid
	playerTurn: boolean;
	turnCount: number;
	playerActions: GameAction[];
	enemyActions: GameAction[];
	winner: "player" | "enemy" | null;
	collection: Monster[]; // Player's monster collection
}

export const INITIAL_GAME_STATE: GameState = {
	phase: "setup",
	playerMonsters: Array(3)
		.fill(null)
		.map(() => Array(3).fill(null)),
	enemyMonsters: Array(3)
		.fill(null)
		.map(() => Array(3).fill(null)),
	playerTurn: true,
	turnCount: 1,
	playerActions: [],
	enemyActions: [],
	winner: null,
	collection: [],
};

// Helper functions for game state management
export function isValidPosition(x: number, y: number): boolean {
	return x >= 0 && x < 3 && y >= 0 && y < 3;
}

export function getMonsterAt(
	grid: (Monster | null)[][],
	x: number,
	y: number,
): Monster | null {
	if (!isValidPosition(x, y)) return null;
	return grid[y][x];
}

export function setMonsterAt(
	grid: (Monster | null)[][],
	x: number,
	y: number,
	monster: Monster | null,
): void {
	if (isValidPosition(x, y)) {
		grid[y][x] = monster;
		if (monster) {
			monster.position = { x, y };
		}
	}
}

export function getAliveMonsters(grid: (Monster | null)[][]): Monster[] {
	const alive: Monster[] = [];
	for (let y = 0; y < 3; y++) {
		for (let x = 0; x < 3; x++) {
			const monster = grid[y][x];
			if (monster && monster.hp > 0) {
				alive.push(monster);
			}
		}
	}
	return alive;
}

export function isGameOver(
	playerGrid: (Monster | null)[][],
	enemyGrid: (Monster | null)[][],
): "player" | "enemy" | null {
	const playerAlive = getAliveMonsters(playerGrid).length > 0;
	const enemyAlive = getAliveMonsters(enemyGrid).length > 0;

	if (!playerAlive && !enemyAlive) return null; // Draw
	if (!playerAlive) return "enemy";
	if (!enemyAlive) return "player";
	return null;
}
