import { observer } from "mobx-react-lite";
import { authStore } from "../stores/authStore";
import { UserIcon, AtSymbolIcon, ShieldCheckIcon, ClockIcon } from "@heroicons/react/24/outline";
import { Card } from "../components/ui/Card";

const resolveAvatarUrl = (value?: string | null) => {
  if (!value) {
    return null;
  }

  let candidate = typeof value === 'string' && value.trim ? value.trim() : value;

  if (!candidate) {
    return null;
  }

  if (!/^https?:\/\//i.test(candidate)) {
    candidate = `https://avatars.mds.yandex.net/get-yapic/${candidate}/islands-200`;
  }

  try {
    const parsed = new URL(candidate);
    if (!parsed.hostname.includes('yandex') || !parsed.pathname.includes('/get-yapic/')) {
      return candidate;
    }

    const segments = parsed.pathname.split('/').filter(Boolean);
    const getYapicIndex = segments.indexOf('get-yapic');

    if (getYapicIndex === -1 || segments.length - getYapicIndex < 3) {
      return candidate;
    }

    const group = segments[getYapicIndex + 1];
    const identifierSegments = segments.slice(getYapicIndex + 2, segments.length - 1);
    const identifier = identifierSegments.join('/') || segments[getYapicIndex + 2];
    const sizeSegment = segments[segments.length - 1] || 'islands-200';
    const normalizedSize = sizeSegment.replace(/^islands-retina-/, 'islands-') || 'islands-200';

    return `https://avatars.mds.yandex.net/get-yapic/${group}/${identifier}/${normalizedSize}`;
  } catch (error) {
    console.warn('Failed to normalize avatar url', error);
    return candidate;
  }
};

const Profile = observer(() => {
  const avatarUrl = resolveAvatarUrl(authStore.user?.avatarUrl);

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
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Avatar"
                  className="w-16 h-16 rounded-full object-cover"
                  onError={(event) => {
                    (event.currentTarget as HTMLImageElement).src = '/images/default-avatar.svg';
                  }}
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-[var(--border)] flex items-center justify-center text-[var(--text-muted)]">
                  <UserIcon className="h-8 w-8" />
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
});

export default Profile;
