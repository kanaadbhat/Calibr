// next-auth.d.ts (create this file in your types folder or /src)
import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      _id: string;
      firstName: string;
      lastName: string;
      email: string;
      name: string;
      role: string; // Add role
      image?: string;
    };
  }

  interface User {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    name: string;
    role: string; // Add role
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    _id: string;
    firstName: string;
    lastName: string;
    role: string;
  }
}
