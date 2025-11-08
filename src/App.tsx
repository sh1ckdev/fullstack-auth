import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { authStore } from "./stores/authStore";
import { Toaster } from 'react-hot-toast';
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import Admin from "./pages/Admin";
import AuthForm from "./components/LoginForm";
import ProtectedRoute from "./components/ProtectedRoute";
import ProfileLayout from "./components/ProfileLayout";
import RegisterForm from "./components/RegisterForm";
import PublicRoute from "./components/PublicRoute";
import { ErrorBoundary } from './components/ErrorBoundary';
import { ROUTES } from './constants/routes';
import RoleRoute from './components/RoleRoute';
import ProfileSettings from './pages/ProfileSettings';
import Maintenance from './pages/Maintenance';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import { appStore } from './stores/appStore';
import { themeStore } from './stores/themeStore';
import { observer } from 'mobx-react-lite';
import PublicLayout from './components/layout/PublicLayout';

const App = observer(() => {
    useEffect(() => {
        themeStore.loadTheme();
        appStore.checkHealth();
        authStore.checkAuth(true); // При первой загрузке делаем force проверку
        // Убрали автоматические проверки при фокусе - они вызывали лишние 401
    }, []);

    if (appStore.isCheckingHealth) {
        return (
<div className="min-h-screen flex items-center justify-center bg-[var(--bg-page)]">
  <div className="text-center text-[var(--text)]">
    <div className="relative w-12 h-12 mx-auto">
      <div className="absolute inset-0 rounded-full border-4 border-[var(--brand)] animate-ping"></div>
      <div className="absolute inset-0 rounded-full border-4 border-[var(--brand)]"></div>
    </div>
    <p className="mt-4 opacity-80">Проверка соединения...</p>
  </div>
</div>

        );
    }

    if (appStore.isBackendHealthy === false) {
        return <Maintenance />;
    }

    return (
        <Router>
            <Toaster position="top-right" />
            <ErrorBoundary>
            <Routes>
                <Route path={ROUTES.home} element={<PublicLayout><Home /></PublicLayout>} />
                <Route
                    path={ROUTES.signin}
                    element={
                        <PublicRoute>
                            <AuthForm type="signin" />
                        </PublicRoute>
                    }
                />
                <Route
                    path={ROUTES.register}
                    element={
                        <PublicRoute>
                            <RegisterForm type="register" />
                        </PublicRoute>
                    }
                />
                <Route
                    path={ROUTES.forgotPassword}
                    element={
                        <PublicRoute>
                            <ForgotPassword />
                        </PublicRoute>
                    }
                />
                <Route
                    path={ROUTES.resetPassword}
                    element={
                        <PublicRoute>
                            <ResetPassword />
                        </PublicRoute>
                    }
                />
                <Route
                    path={ROUTES.profile}
                    element={
                        <ProtectedRoute>
                            <ProfileLayout />
                        </ProtectedRoute>
                    }
                >
                    <Route index element={<Profile />} />
                    <Route path="settings" element={<ProfileSettings />} />
                </Route>
                <Route
                    path={ROUTES.admin}
                    element={
                        <RoleRoute roles={["admin"]}>
                            <ProfileLayout>
                                <Admin />
                            </ProfileLayout>
                        </RoleRoute>
                    }
                />
            </Routes>
            </ErrorBoundary>
        </Router>
    );
});

export default App;


