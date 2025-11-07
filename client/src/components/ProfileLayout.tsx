import { Outlet } from "react-router-dom";
import { ReactNode } from "react";
import AppShell from "./layout/AppShell";

interface Props { children?: ReactNode }

const ProfileLayout = ({ children }: Props) => {
  return (
    <AppShell>
      {children ?? <Outlet />}
    </AppShell>
  );
};

export default ProfileLayout;


