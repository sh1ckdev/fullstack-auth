import { observer } from 'mobx-react-lite';
import { authStore } from '../stores/authStore';
import { themeStore } from '../stores/themeStore';
import { useEffect, useMemo, useState } from 'react';
import { z } from 'zod';
import { FormField } from '../components/ui/FormField';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { toast } from 'react-hot-toast';

const schema = z.object({
  username: z.string().min(1, 'Обязательное поле').min(3, 'Минимум 3 символа'),
  email: z.string().min(1, 'Обязательное поле').email('Некорректный email'),
  password: z.string().min(6, 'Минимум 6 символов').optional().or(z.literal('')),
});

const ProfileSettings = observer(() => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<{ username?: boolean; email?: boolean; password?: boolean }>({});
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!authStore.user?.username) authStore.fetchMe();
  }, []);

  useEffect(() => {
    setUsername(authStore.user?.username || '');
    setEmail(authStore.user?.email || '');
  }, [authStore.user?.username, authStore.user?.email]);

  const isValid = useMemo(() => {
    const result = schema.safeParse({ username, email, password });
    if (result.success) {
      if (submitted || touched.username || touched.email || touched.password) setErrors({});
      return true;
    }
    if (submitted || touched.username || touched.email || touched.password) {
      const next: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const key = issue.path[0];
        if (typeof key === 'string' && !next[key]) {
          if ((key === 'username' && touched.username) || 
              (key === 'email' && touched.email) || 
              (key === 'password' && touched.password)) {
            next[key] = issue.message;
          }
        }
      }
      setErrors(next);
    }
    return false;
  }, [username, email, password, touched, submitted]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTouched({ username: true, email: true, password: true });
    if (!isValid) return;
    const fields: { username?: string; email?: string; password?: string } = { username, email };
    if (password) fields.password = password;
    await authStore.updateMe(fields);
    if (authStore.message) toast.success(authStore.message);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-8">
      <div>
        <h1 className="text-4xl font-bold text-[var(--text)] mb-3">Настройки</h1>
        <p className="text-[var(--text-muted)] text-lg">Управление настройками аккаунта и предпочтениями</p>
      </div>

      <div className="space-y-6">
        <Card title="Внешний вид" extra={
          <button
            type="button"
            onClick={() => themeStore.toggleTheme()}
            className="px-4 py-2 rounded-lg bg-[var(--brand)] text-[var(--surface)] hover:brightness-95 transition font-medium"
          >
            {themeStore.theme === 'dark' ? '🌙 Темная' : '☀️ Светлая'}
          </button>
        }>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[var(--text)] font-medium mb-1">Цветовая схема</p>
              <p className="text-sm text-[var(--text-muted)]">Выберите предпочитаемую тему оформления</p>
            </div>
          </div>
        </Card>

        <Card title="Личная информация">
          <form onSubmit={onSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField label="Имя пользователя" htmlFor="set-username">
                <Input id="set-username" value={username} onChange={(e) => setUsername(e.target.value)} 
                       onBlur={() => setTouched(prev => ({ ...prev, username: true }))}
                       error={errors.username} />
              </FormField>

              <FormField label="Email" htmlFor="set-email">
                <Input id="set-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} 
                       onBlur={() => setTouched(prev => ({ ...prev, email: true }))}
                       error={errors.email} />
              </FormField>
            </div>

            <FormField label="Новый пароль (необязательно)" htmlFor="set-password">
              <Input id="set-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} 
                     onBlur={() => setTouched(prev => ({ ...prev, password: true }))}
                     error={errors.password} />
            </FormField>

            <div className="flex justify-end pt-4 border-t border-[var(--border)]">
              <Button type="submit" loading={authStore.isLoading} disabled={!isValid}>Сохранить изменения</Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
});

export default ProfileSettings;
