// App.js
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { authStore } from "./stores/authStore";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import AuthForm from "./components/LoginForm";
import ProtectedRoute from "./components/ProtectedRoute";
import ProfileLayout from "./components/ProfileLayout";
import RegisterForm from "./components/RegisterForm";
import PublicRoute from "./components/PublicRoute";


function App() {
    useEffect(() => {
        authStore.checkAuth();
    }, []);

    return (
        <Router>
            <Navbar />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route
                    path="/login"
                    element={
                        <PublicRoute>
                            <AuthForm type="login" />
                        </PublicRoute>
                    }
                />
                <Route
                    path="/register"
                    element={
                        <PublicRoute>
                            <RegisterForm type="register" />
                        </PublicRoute>
                    }
                />
                <Route
                    path="/profile"
                    element={
                        <ProtectedRoute>
                            <ProfileLayout />
                        </ProtectedRoute>
                    }
                >
                    <Route index element={<Profile />} />
                </Route>
            </Routes>
        </Router>
    );
}

export default App;
