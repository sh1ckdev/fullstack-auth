// src/models/response/AuthResponse.ts
import { IUser } from '../IUser';

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: IUser;
}