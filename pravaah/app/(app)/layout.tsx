import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Shell } from "@/components/patterns/Shell";
import { decodeSession, SESSION_COOKIE, isExpired } from "@/lib/rbac/session";
import { getDataset } from "@/lib/seed";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = decodeSession((await cookies()).get(SESSION_COOKIE)?.value);
  if (!session) redirect("/login");
  if (isExpired(session, Date.now())) redirect("/login?reason=idle");

  const ds = getDataset();
  const unread = ds.notifications.filter((n) => n.userId === session.userId && !n.read).length;

  return (
    <Shell session={session} unread={unread}>
      {children}
    </Shell>
  );
}
