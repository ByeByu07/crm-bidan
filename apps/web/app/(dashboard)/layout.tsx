import { redirect } from "next/navigation";
import { requireAuth } from "@repo/auth/session";
import { BottomNav } from "@/components/dashboard/BottomNav";
import { OfflineBanner } from "@/components/dashboard/OfflineBanner";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAuth();

  return (
    <div className="bidan-dashboard min-h-screen pb-20">
      <OfflineBanner />
      <main className="mx-auto max-w-[430px] px-5 py-6">{children}</main>
      <BottomNav />
    </div>
  );
}
