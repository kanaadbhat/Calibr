import React from 'react'
import RoleWrapper from "@/lib/RoleWrapper";

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleWrapper role="candidate">
      {children}
    </RoleWrapper>
  );
}
