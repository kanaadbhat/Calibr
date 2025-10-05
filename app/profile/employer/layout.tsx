import React from 'react';
import RoleWrapper from "@/lib/RoleWrapper";

export default function EmployerProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleWrapper role="employer">
      {children}
    </RoleWrapper>
  );
}
