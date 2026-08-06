import StudentNav from '@/components/layout/student-nav';

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-academic-bg">
      <StudentNav />
      <main className="flex-1 pt-16 flex flex-col">
        {/* pt-16 because of the fixed 4rem (h-16) nav */}
        {children}
      </main>
    </div>
  );
}
