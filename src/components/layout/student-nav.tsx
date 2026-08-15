'use client';

import Link from 'next/link';
import { usePathname, useParams } from 'next/navigation';
import { STUDENT_NAV } from '@/lib/constants';
import { cn } from '@/lib/utils/cn';
import { Menu, User } from 'lucide-react';
import { useState } from 'react';
import MobileNav from './mobile-nav';
import Logo from '@/components/ui/logo';

export default function StudentNav() {
  const pathname = usePathname();
  const params = useParams();
  const slug = params?.slug as string | undefined;
  
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 h-16 bg-navy-900 z-40 px-4 md:px-8 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/accueil" className="flex items-center">
            <Logo variant="light" showText className="h-14 w-auto" />
          </Link>
          <div className="hidden md:flex items-center gap-6">
            {STUDENT_NAV.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/accueil' && pathname.startsWith(item.href));
              const targetHref = (item.href === '/mode-examen' && slug) ? `${item.href}?subject=${slug}` : item.href;
              
              return (
                <Link
                  key={item.href}
                  href={targetHref}
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-white",
                    isActive ? "text-white" : "text-navy-200"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/profil"
            className="hidden md:flex items-center justify-center w-8 h-8 rounded-full bg-navy-800 text-navy-200 hover:text-white hover:bg-navy-700 transition-colors"
            title="Mon profil"
          >
            <User className="w-4 h-4" />
          </Link>
          
          <button 
            className="md:hidden text-navy-200 hover:text-white"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </nav>
      
      <MobileNav 
        isOpen={mobileOpen} 
        onClose={() => setMobileOpen(false)} 
        currentPath={pathname}
      />
    </>
  );
}
