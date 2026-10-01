import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/admin-session";
import AdminSignOutButton from "./sign-out-button";

export const dynamic = "force-dynamic";

/**
 * Layout-level auth wall for every route under /admin/* that is not the login
 * page. Unauthenticated requests are sent back to /admin.
 */
export default async function AdminSectionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieHeader = (await cookies()).toString();
  const session = await getSession(cookieHeader);

  if (!session) {
    redirect("/admin");
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4 sm:px-8">
          <Link
            href="/admin/dashboard"
            className="text-sm font-semibold tracking-tight"
          >
            <span className="gold-text">{"//"}</span> admin
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground">
              {session.email}
            </span>
            <AdminSignOutButton />
          </div>
        </div>
      </header>
      {children}
    </div>
  );
}
