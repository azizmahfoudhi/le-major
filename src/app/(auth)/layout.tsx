import Link from 'next/link';
import Image from 'next/image';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-navy-950 p-4 sm:p-8 relative overflow-hidden">
      {/* Subtle background gradient/pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-navy-900 to-navy-950 z-0" />
      <div className="absolute top-0 left-0 right-0 h-96 bg-gold-900/10 blur-3xl rounded-full translate-y-[-50%] z-0" />
      
      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex justify-center">
            <Image
              src="/logo.jpg"
              alt="Le Major"
              width={200}
              height={60}
              className="h-14 w-auto object-contain"
              priority
            />
          </Link>
          <p className="text-navy-200 mt-4 text-sm font-medium">L'excellence académique</p>
        </div>
        
        <div className="bg-white rounded-card shadow-2xl overflow-hidden border border-navy-100">
          <div className="p-8">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
