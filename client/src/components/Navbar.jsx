import { observer } from "mobx-react-lite";
import { Link, useNavigate } from 'react-router-dom';
import { authStore } from "../stores/authStore";
import { ArrowRightEndOnRectangleIcon, UserIcon } from '@heroicons/react/24/outline';

const Navbar = observer(() => {
    const navigate = useNavigate();

    const handleLogout = () => {
        authStore.logout();
        navigate('/login');
    };

    return (
        <nav className="sticky top-0 z-50">
            {/* Фоновое размытие */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 to-purple-900 min-h-[64px]"></div>
            <div className="relative z-10 bg-white/20 backdrop-blur-lg shadow-md">
                <div className="container mx-auto flex justify-between items-center p-4">
                    {/* Логотип */}
                    <Link to="/" className="text-2xl font-bold text-white transition duration-300 hover:text-gray-300 flex items-center">
                        sh1ckdev
                    </Link>

                    {/* Аутентифицированный пользователь */}
                    {authStore.isAuth ? (
                        <div className="flex items-center space-x-6">
                            <Link
                                to="/profile"
                                className="text-xl font-medium text-blue-400 hover:text-blue-300 transition duration-300 flex items-center"
                            >
                                <UserIcon className="h-8 w-8 mr-2" />
                                <p>{authStore.user.username}</p>
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="bg-red-500/70 hover:bg-red-600/70 text-white py-2 px-6 rounded-lg shadow-md hover:shadow-lg transition duration-300 flex items-center"
                            >
                                <ArrowRightEndOnRectangleIcon className="h-6 w-6 mr-2" />
                                Выйти
                            </button>
                        </div>
                    ) : (
                        // Неаутентифицированный пользователь
                        <div className="flex items-center space-x-6">
                            <Link
                                to="/login"
                                className="text-lg font-medium text-white hover:text-gray-300 transition duration-300 flex items-center"
                            >
                                Вход
                            </Link>
                            <Link
                                to="/register"
                                className="text-lg font-medium text-white hover:text-gray-300 transition duration-300 flex items-center"
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