"use client";
import { useEffect } from "react";
import { assignRole } from "../login/actions";

export default function SignupRedirectHandler() {
  useEffect(() => {
    // After redirect, user is authenticated
    assignRole("candidate").catch(console.error);
  }, []);

  return <p>Completing signup...</p>;
}
