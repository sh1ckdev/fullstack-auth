import { $api } from '../http';
import { IUser } from '../models/IUser';

export class UserService {
  static async getMe() {
    const res = await $api.get<IUser>('/me', { withCredentials: true });
    return res.data;
  }

  static async updateMe(fields: Partial<Pick<IUser, 'username' | 'email'>> & { password?: string }) {
    const res = await $api.patch<{ message: string; user: IUser }>('/me', fields, { withCredentials: true });
    return res.data;
  }
}


