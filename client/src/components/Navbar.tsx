import { observer } from "mobx-react-lite";
import { Link, useNavigate } from 'react-router-dom';
import { authStore } from "../stores/authStore";
import { ArrowRightEndOnRectangleIcon, UserIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import { ROUTES } from '../constants/routes';

const Navbar = observer(() => {
    const navigate = useNavigate();

    const handleLogout = async () => {
        await authStore.logout();
        toast.success('Вы вышли из аккаунта');
        navigate(ROUTES.signin);
    };

    return (
        <nav className="sticky top-0 z-50 bg-[var(--surface)]/95 backdrop-blur supports-[backdrop-filter]:bg-[var(--surface)]/80 border-b border-[var(--border)]">
            <div className="relative z-10">
                <div className="container mx-auto flex justify-between items-center p-4">
                    <Link to={ROUTES.home} className="text-2xl font-bold text-[var(--text)] transition duration-200 hover:opacity-80 flex items-center">
                        Yandex<span className="ml-2 inline-block h-3 w-3 rounded-sm bg-[var(--brand)]" />
                    </Link>

                    {authStore.isAuth ? (
                        <div className="flex items-center space-x-6">
                            <Link
                                to={ROUTES.profile}
                                className="text-xl font-medium text-[var(--text)] hover:opacity-80 transition duration-200 flex items-center"
                            >
                                <UserIcon className="h-8 w-8 mr-2" />
                                <p>{authStore.user.username}</p>
                            </Link>
                            {(authStore.user.roles || []).includes('admin') && (
                              <Link to={ROUTES.admin} className="text-lg font-medium text-[var(--text)] hover:opacity-80 transition duration-200">
                                Admin
                              </Link>
                            )}
                            <button
                                onClick={handleLogout}
                                className="bg-[#111111] hover:brightness-110 text-white py-2 px-6 rounded-lg transition duration-200 flex items-center"
                            >
                                <ArrowRightEndOnRectangleIcon className="h-6 w-6 mr-2" />
                                Выйти
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center space-x-6">
                            <Link
                                to={ROUTES.signin}
                                className="text-lg font-medium text-[var(--text)] hover:opacity-80 transition duration-200 flex items-center"
                            >
                                Вход
                            </Link>
                            <Link
                                to={ROUTES.register}
                                className="text-lg font-medium text-[var(--text)] hover:opacity-80 transition duration-200 flex items-center"
                            >
                                Регистрация
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
});

export default Navbar;


