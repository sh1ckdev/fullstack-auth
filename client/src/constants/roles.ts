export const ROLES = {
  ADMIN: 'admin',
  USER: 'user',
} as const;

export type AppRole = typeof ROLES[keyof typeof ROLES];


