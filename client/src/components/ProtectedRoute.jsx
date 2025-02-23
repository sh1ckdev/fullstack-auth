// components/ProtectedRoute.js
import { observer } from "mobx-react-lite";
import { authStore } from "../stores/authStore";
import { Navigate } from "react-router-dom";

const ProtectedRoute = observer(({ children }) => {
    console.log(authStore.isAuth);
  if (authStore.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-300">Проверка аутентификации...</p>
        </div>
      </div>
    );
  }

  if (!authStore.isAuth) {
    return <Navigate to="/login" replace />;
  }

  return children;
});

export default ProtectedRoute;