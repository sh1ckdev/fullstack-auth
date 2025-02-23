import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authStore } from '../stores/authStore';
import { observer } from "mobx-react-lite";

const RegisterForm = observer(() => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (authStore.isAuth) {
      navigate('/profile');
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await authStore.registration(username, email, password);
    if (authStore.isAuth) {
      navigate('/profile');
    }
  };

  return (
    <div className="relative bg-gradient-to-br from-indigo-900 to-purple-900 min-h-screen flex items-center justify-center">
      {/* Фоновое размытие */}
      <div className="absolute inset-0 bg-white/10 backdrop-blur-lg"></div>

      <form
        onSubmit={handleSubmit}
        className="relative z-10 bg-white/20 backdrop-blur-lg p-8 rounded-2xl shadow-xl max-w-md w-full border border-white/30"
      >
        <h2 className="text-3xl text-white text-center mb-8 font-semibold">Регистрация</h2>

        {/* Поле для имени пользователя */}
        <div className="mb-6 relative">
          <label className="block text-white text-sm font-medium mb-2" htmlFor="username">
            Имя пользователя
          </label>
          <input
            className="w-full bg-white/10 text-white rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-300"
            id="username"
            type="text"
            placeholder="Введите имя пользователя"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          {/* Визуальный эффект при фокусе */}
        </div>

        {/* Поле для email */}
        <div className="mb-6 relative">
          <label className="block text-white text-sm font-medium mb-2" htmlFor="email">
            Электронная почта
          </label>
          <input
            className="w-full bg-white/10 text-white rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-300"
            id="email"
            type="email"
            placeholder="Введите ваш email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          {/* Визуальный эффект при фокусе */}
        </div>

        {/* Поле для пароля */}
        <div className="mb-8 relative">
          <label className="block text-white text-sm font-medium mb-2" htmlFor="password">
            Пароль
          </label>
          <input
            className="w-full bg-white/10 text-white rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-300"
            id="password"
            type="password"
            placeholder="Введите пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {/* Визуальный эффект при фокусе */}
        </div>

        <button
          className="w-full bg-blue-500/70 text-white py-3 px-4 rounded-lg hover:bg-blue-600/70 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/50 flex items-center justify-center"
          type="submit"
          disabled={authStore.isLoading}
        >
          {authStore.isLoading ? (
            <div className="flex items-center">
              <div className="h-5 w-5 border-3 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
              <span className="ml-2">Загрузка...</span>
            </div>
          ) : (
            'Зарегистрироваться'
          )}
        </button>
      </form>
    </div>
  );
});

export default RegisterForm;