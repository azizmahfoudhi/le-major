import AdminSidebar from '@/components/layout/admin-sidebar';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-academic-bg">
      <AdminSidebar />
      <main className="flex-1 flex flex-col min-h-0 overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}
