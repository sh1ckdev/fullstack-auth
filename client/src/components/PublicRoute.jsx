// components/PublicRoute.js
import { observer } from "mobx-react-lite";
import { Navigate } from "react-router-dom";
import { authStore } from "../stores/authStore";

const PublicRoute = observer(({ children }) => {
  if (authStore.isAuth) {
    return <Navigate to="/profile" replace />; 
  }

  return children; 
});

export default PublicRoute;