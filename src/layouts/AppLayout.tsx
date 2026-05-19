import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import type { ReactNode } from "react";

interface AppLayoutProps {
  children: ReactNode;
}

function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="flex h-screen overflow-hidden bg-zinc-950">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <Topbar />
        <main className="bg-(--color-bg-secondary) flex-1  overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}

export default AppLayout;
