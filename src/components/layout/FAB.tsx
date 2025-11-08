import { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  ArrowRightEndOnRectangleIcon, 
  Cog6ToothIcon, 
  UserIcon,
  XMarkIcon,
  Bars3Icon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import { authStore } from '../../stores/authStore';
import { observer } from 'mobx-react-lite';
import { ROUTES } from '../../constants/routes';
import { ROLES } from '../../constants/roles';

interface MenuItem {
  icon: React.ReactNode;
  label: string;
  path?: string;
  onClick?: () => void;
  show?: boolean;
}

const FAB = observer(() => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const fabRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Закрываем меню при клике вне его
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const isClickInsideFab = fabRef.current?.contains(target);
      const isClickInsideSidebar = sidebarRef.current?.contains(target);
      
      if (!isClickInsideFab && !isClickInsideSidebar) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Закрываем меню при навигации
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  const menuItems: MenuItem[] = [
    {
      icon: <UserIcon className="h-5 w-5" />,
      label: 'Профиль',
      path: ROUTES.profile,
      show: true,
    },
    {
      icon: <Cog6ToothIcon className="h-5 w-5" />,
      label: 'Настройки',
      path: ROUTES.profileSettings,
      show: true,
    },
    {
      icon: <ShieldCheckIcon className="h-5 w-5" />,
      label: 'Админ-панель',
      path: ROUTES.admin,
      show: authStore.user?.roles?.includes(ROLES.ADMIN) || false,
    },
    {
      icon: <ArrowRightEndOnRectangleIcon className="h-5 w-5" />,
      label: 'Выйти',
      onClick: () => {
        authStore.logout();
        navigate(ROUTES.home);
      },
      show: true,
    },
  ].filter(item => item.show);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleItemClick = (item: MenuItem) => {
    if (item.onClick) {
      item.onClick();
    }
    setIsOpen(false);
  };

  const isActive = (path?: string) => {
    if (!path) return false;
    return location.pathname === path;
  };

  return (
    <>
      {/* Затемнение фона при открытом меню */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Боковая панель слева */}
      <div
        ref={sidebarRef}
        className={`fixed left-0 top-0 h-full w-20 bg-[var(--surface)] border-r border-[var(--border)] shadow-xl z-50 transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col items-center py-4 gap-3 h-full">
          {/* Логотип */}
          <div 
            className={`transition-all duration-300 ${
              isOpen 
                ? 'opacity-100 translate-x-0' 
                : 'opacity-0 -translate-x-4'
            }`}
            style={{
              transitionDelay: isOpen ? '0ms' : '0ms',
            }}
          >
            <div className="flex items-center justify-center h-12 w-12">
              <span className="text-2xl font-bold text-[var(--text)] tracking-tight">xtra</span>
            </div>
          </div>

          {/* Разделитель */}
          <div 
            className={`w-8 h-px bg-[var(--border)] transition-all duration-300 ${
              isOpen 
                ? 'opacity-100 translate-x-0' 
                : 'opacity-0 -translate-x-4'
            }`}
            style={{
              transitionDelay: isOpen ? '50ms' : '0ms',
            }}
          />

          {/* Элементы меню */}
          <div className="flex flex-col gap-3 flex-1">
            {menuItems.map((item, index) => {
              const delay = 100 + (index * 50); // Начинаем после логотипа и divider

              return (
                <div
                  key={item.label}
                  className={`relative group transition-all duration-300 ${
                    isOpen 
                      ? 'opacity-100 translate-x-0' 
                      : 'opacity-0 -translate-x-4'
                  }`}
                  style={{
                    transitionDelay: isOpen ? `${delay}ms` : '0ms',
                  }}
                >
                  {item.path ? (
                    <Link
                      to={item.path}
                      onClick={() => handleItemClick(item)}
                      className={`flex items-center justify-center h-12 w-12 rounded-lg transition-all duration-200 ${
                        isActive(item.path)
                          ? 'bg-[var(--brand)] border-2 border-[var(--brand)]'
                          : 'bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--brand)] hover:scale-110'
                      }`}
                      aria-label={item.label}
                    >
                      <div className={`${isActive(item.path) ? 'text-[var(--surface)]' : 'text-[var(--text)]'}`}>
                        {item.icon}
                      </div>
                    </Link>
                  ) : (
                    <button
                      onClick={() => handleItemClick(item)}
                      className="flex items-center justify-center h-12 w-12 rounded-lg bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--brand)] hover:scale-110 transition-all duration-200"
                      aria-label={item.label}
                    >
                      <div className="text-[var(--text)]">
                        {item.icon}
                      </div>
                    </button>
                  )}
                  {/* Tooltip справа */}
                  <div className="pointer-events-none absolute left-full ml-3 top-1/2 -translate-y-1/2 hidden group-hover:block z-50">
                    <div className="px-2 py-1 rounded-[var(--radius-sm)] bg-[var(--surface)] border border-[var(--border)] text-sm text-[var(--text)] shadow-sm whitespace-nowrap">
                      {item.label}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Главная кнопка FAB - перемещается при открытии панели */}
      <div 
        ref={fabRef} 
        className={`fixed top-6 z-50 transition-all duration-300 ease-out ${
          isOpen ? 'left-[88px]' : 'left-6'
        }`}
      >
        <button
          onClick={toggleMenu}
          className={`h-14 w-14 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl ${
            isOpen
              ? 'bg-[var(--brand)] rotate-90'
              : 'bg-[var(--brand)] hover:scale-110 hover:brightness-110'
          }`}
          aria-label={isOpen ? 'Закрыть меню' : 'Открыть меню'}
          aria-expanded={isOpen}
        >
          {isOpen ? (
            <XMarkIcon className="h-6 w-6 text-[var(--surface)] transition-transform duration-300" />
          ) : (
            <Bars3Icon className="h-6 w-6 text-[var(--surface)] transition-transform duration-300" />
          )}
        </button>
      </div>
    </>
  );
});

export default FAB;

