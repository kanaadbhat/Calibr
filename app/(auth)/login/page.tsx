import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Login from "./_components/Login";

export default async function LoginPage() {
  const session = await getServerSession();
  if (session) {
    redirect("/");
  }
  return <Login />;
}