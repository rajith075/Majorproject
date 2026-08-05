import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-slate-50">

      <Sidebar />

      <main className="flex flex-1 flex-col overflow-hidden">

        <Topbar />

        <section className="flex-1 overflow-y-auto p-8">

          <div className="mx-auto w-full max-w-7xl">

            {children}

          </div>

        </section>

      </main>

    </div>
  );
}