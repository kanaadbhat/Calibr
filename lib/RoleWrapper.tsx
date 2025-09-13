import React from 'react'
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

  const userRole = session.user?.role;

  if (role) {
    const allowedRoles = Array.isArray(role) ? role : [role];
    if (!allowedRoles.includes(userRole)) {
      const roleMessage = Array.isArray(role) ? role.join("_") : role;
      console.log(`Redirecting user with role ${userRole} from ${roleMessage} page`); // Add logging
      redirect(`/?toast=${roleMessage}_cannot_access`);
    }
  }

  return <>{children}</>;
}
