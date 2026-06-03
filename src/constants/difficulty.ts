export const difficultySizes = {
  easy: 5,
  medium: 8,
  hard: 12,
} as const;

export type Difficulty = keyof typeof difficultySizes;
