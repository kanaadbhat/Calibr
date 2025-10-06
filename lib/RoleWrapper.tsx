import React from 'react';
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";

interface RoleWrapperProps {
  children: React.ReactNode;
  role?: string | string[];
}

export default async function RoleWrapper({ children, role }: RoleWrapperProps) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login?toast=login_required");
  }

  const userRole = session.user?.role?.toLowerCase();

  if (role) {
    const allowedRoles = (Array.isArray(role) ? role : [role]).map(r => r.toLowerCase());
    if (!userRole || !allowedRoles.includes(userRole)) {
      const roleMessage = Array.isArray(role) ? role.join("_") : role;
      console.warn(`Redirecting user with role ${userRole} from ${roleMessage} page`);
      redirect(`/?toast=access_only_for_${roleMessage}`);
    }
  }

  return <>{children}</>;
}
