import Sidebar from "@/components/Sidebar";
import AuthGate from "@/components/AuthGate";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGate>
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex-1 flex flex-col">{children}</div>
      </div>
    </AuthGate>
  );
}
