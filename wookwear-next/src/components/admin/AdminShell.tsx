import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

export function AdminShell({
  children,
  userEmail,
}: {
  children: React.ReactNode;
  userEmail: string;
}) {
  return (
    <div className="min-h-screen bg-ww-black">
      <Sidebar />
      <div className="lg:ml-60">
        <Topbar userEmail={userEmail} />
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
