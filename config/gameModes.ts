export type PlayerMode = "Human vs Human" | "Human vs AI" | "AI vs AI";

export type AiDifficulty = "easy" | "medium" | "hard" | "expert";

export const DEFAULT_PLAYER_MODE: PlayerMode = "Human vs Human";
export const AI_PLAYER_MODE: PlayerMode = "Human vs AI";
export const AI_VS_AI_PLAYER_MODE: PlayerMode = "AI vs AI";

export const AI_DIFFICULTIES: ReadonlyArray<{ key: AiDifficulty; label: string }> = [
  { key: "easy", label: "Easy" },
  { key: "medium", label: "Medium" },
  { key: "hard", label: "Hard" },
  { key: "expert", label: "Expert" },
];
