import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import SignupPage from "./_components/Signup";

export default async function LoginPage() {
  const session = await getServerSession();
  if (session) {
    redirect("/");
  }
  return <SignupPage />;
}