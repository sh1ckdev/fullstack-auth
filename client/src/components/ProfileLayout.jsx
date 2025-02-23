import { Link, Outlet, useLocation } from "react-router-dom";

const ProfileLayout = () => {
  const location = useLocation();

  return (
    <div className="relative bg-gradient-to-br from-indigo-900 to-purple-900 min-h-screen flex items-center justify-center">
      {/* Фоновое размытие */}
      <div className="absolute inset-0 bg-white/10 backdrop-blur-lg"></div>

      <div className="relative z-10 container mx-auto p-6">
        <h1 className="text-4xl font-bold text-white mb-8 text-center">Профиль пользователя</h1>

        {/* Навигация */}
        <div className="flex justify-center space-x-6 mb-8">
          {/* <Link
            to="/profile"
            className={`py-2 px-4 rounded-lg transition-all duration-300 ${
              location.pathname === "/profile"
                ? "bg-blue-500/70 text-white"
                : "text-gray-300 hover:bg-blue-500/50 hover:text-white"
            }`}
          >
            Профиль
          </Link> */}
        </div>

        {/* Вывод дочерних компонентов */}
        <Outlet />
      </div>
    </div>
  );
};

export default ProfileLayout;