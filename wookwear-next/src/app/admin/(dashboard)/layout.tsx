import { requireAdmin } from "@/lib/admin-auth";
import { AdminShell } from "@/components/admin/AdminShell";
import "./admin.css";

export const metadata = {
  title: "Admin | Wook Wear",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAdmin();

  return <AdminShell userEmail={user.email || "admin"}>{children}</AdminShell>;
}
