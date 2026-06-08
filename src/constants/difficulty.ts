export const difficultySizes = {
  easy: 6,
  medium: 9,
  hard: 12,
} as const;

export type Difficulty = keyof typeof difficultySizes;
