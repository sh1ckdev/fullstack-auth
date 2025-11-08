import { z } from 'zod';

export const loginSchema = z.object({
  username: z.string().min(1, 'Обязательное поле').min(3, 'Минимум 3 символа'),
  password: z.string().min(1, 'Обязательное поле').min(6, 'Минимум 6 символов'),
});

export const registerSchema = z.object({
  username: z.string().min(1, 'Обязательное поле').min(3, 'Минимум 3 символа'),
  email: z.string().min(1, 'Обязательное поле').email('Некорректный email'),
  password: z.string().min(1, 'Обязательное поле').min(6, 'Минимум 6 символов'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().min(1, 'Обязательное поле').email('Некорректный email'),
});

export const resetPasswordSchema = z.object({
  password: z.string().min(1, 'Обязательное поле').min(6, 'Минимум 6 символов'),
  confirmPassword: z.string().min(1, 'Обязательное поле'),
}).refine((data: { password: string; confirmPassword: string }) => data.password === data.confirmPassword, {
  message: 'Пароли не совпадают',
  path: ['confirmPassword'],
});

// Типы форм можно определить отдельно при необходимости


