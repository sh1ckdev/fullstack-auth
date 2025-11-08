// src/models/IUser.ts
export interface IUser {
    id: string;
    username: string;
    email: string;
    roles?: string[];
    avatarUrl?: string | null;
    yandexId?: string | null;
  }