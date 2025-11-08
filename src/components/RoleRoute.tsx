import { observer } from "mobx-react-lite";
import { Navigate, useLocation } from "react-router-dom";
import { authStore } from "../stores/authStore";
import { ROUTES } from '../constants/routes';

interface RoleRouteProps {
  roles: string[];
  children: React.ReactNode;
}

const RoleRoute = observer(({ roles, children }: RoleRouteProps) => {
  const location = useLocation();

  if (authStore.isLoading) {
    return null;
  }

  if (!authStore.isAuth) {
    return <Navigate to={ROUTES.signin} replace state={{ from: location.pathname }} />;
  }

  const userRoles = authStore.user.roles || [];
  const allowed = roles.some(r => userRoles.includes(r));

  if (!allowed) {
    return <Navigate to={ROUTES.home} replace />;
  }

  return children;
});

export default RoleRoute;


