import { observer } from "mobx-react-lite";
import { authStore } from "../stores/authStore";
import { UserIcon, AtSymbolIcon, ShieldCheckIcon, ClockIcon } from "@heroicons/react/24/outline";
import { Card } from "../components/ui/Card";

const Profile = observer(() => {
  const roles = authStore.user?.roles || [];
  const isAdmin = roles.includes('admin');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[var(--text)] mb-2">Профиль</h1>
        <p className="text-[var(--text-muted)]">Управление личной информацией и настройками аккаунта</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card title="Личная информация" className="md:col-span-2">
          <div className="space-y-4">
            <div className="flex items-start gap-4 p-4 rounded-lg bg-[var(--bg-page)] border border-[var(--border)]">
              <div className="p-2 rounded-lg bg-[var(--brand)]/20">
                <UserIcon className="h-6 w-6 text-[var(--brand)]" />
              </div>
              <div className="flex-1">
                <div className="text-sm text-[var(--text-muted)] mb-1">Имя пользователя</div>
                <div className="text-lg font-semibold text-[var(--text)]">{authStore.user?.username || '—'}</div>
              </div>
            </div>
            <div className="flex items-start gap-4 p-4 rounded-lg bg-[var(--bg-page)] border border-[var(--border)]">
              <div className="p-2 rounded-lg bg-[var(--brand)]/20">
                <AtSymbolIcon className="h-6 w-6 text-[var(--brand)]" />
              </div>
              <div className="flex-1">
                <div className="text-sm text-[var(--text-muted)] mb-1">Email</div>
                <div className="text-lg font-semibold text-[var(--text)]">{authStore.user?.email || '—'}</div>
              </div>
            </div>
          </div>
        </Card>

        <Card title="Статус аккаунта">
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 rounded-lg bg-[var(--bg-page)] border border-[var(--border)]">
              <ShieldCheckIcon className="h-5 w-5 text-green-500" />
              <div>
                <div className="text-sm text-[var(--text-muted)]">Статус</div>
                <div className="font-semibold text-[var(--text)]">Активен</div>
              </div>
            </div>
            {isAdmin && (
              <div className="flex items-center gap-3 p-4 rounded-lg bg-[var(--brand)]/10 border border-[var(--brand)]/30">
                <ShieldCheckIcon className="h-5 w-5 text-[var(--brand)]" />
                <div>
                  <div className="text-sm text-[var(--text-muted)]">Роль</div>
                  <div className="font-semibold text-[var(--text)]">Администратор</div>
                </div>
              </div>
            )}
            <div className="flex items-center gap-3 p-4 rounded-lg bg-[var(--bg-page)] border border-[var(--border)]">
              <ClockIcon className="h-5 w-5 text-[var(--text-muted)]" />
              <div>
                <div className="text-sm text-[var(--text-muted)]">Сессия</div>
                <div className="font-semibold text-[var(--text)]">{authStore.isAuth ? 'Авторизован' : 'Гость'}</div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
});

export default Profile;
