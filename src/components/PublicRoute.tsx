import { observer } from "mobx-react-lite";
import { Navigate, useLocation } from "react-router-dom";
import { authStore } from "../stores/authStore";
import { ReactNode } from "react";

interface PublicRouteProps {
  children: ReactNode;
}

const PublicRoute = observer(({ children }: PublicRouteProps) => {
  const location = useLocation();
  if (authStore.isAuth) {
    const from = (location.state as any)?.from || '/profile';
    return <Navigate to={from} replace />;
  }

  return children;
});

export default PublicRoute;


