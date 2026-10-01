import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/admin-session";
import AdminLoginForm from "./login-form";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const cookieHeader = (await cookies()).toString();
  const session = await getSession(cookieHeader);

  if (session) {
    redirect("/admin/dashboard");
  }

  return <AdminLoginForm />;
}
