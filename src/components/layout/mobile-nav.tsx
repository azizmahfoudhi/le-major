'use client';

import { X, User, LogOut } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { STUDENT_NAV } from '@/lib/constants';
import { cn } from '@/lib/utils/cn';
import Logo from '@/components/ui/logo';
import { signOut } from '@/app/(auth)/signout/actions';

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
  currentPath: string;
}

export default function MobileNav({ isOpen, onClose, currentPath }: MobileNavProps) {
  const params = useParams();
  const slug = params?.slug as string | undefined;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-navy-950/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className="relative w-64 max-w-xs flex flex-col bg-navy-900 border-r border-navy-800 shadow-xl h-full animate-slide-right">
        <div className="flex items-center justify-between h-16 px-4 border-b border-navy-800">
          <Link href="/accueil" onClick={onClose}>
            <Logo variant="light" showText className="h-14 w-auto" />
          </Link>
          <button 
            onClick={onClose}
            className="text-navy-200 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex-1 py-4 overflow-y-auto">
          <nav className="flex flex-col gap-2 px-2">
            {STUDENT_NAV.map((item) => {
              const isActive = currentPath === item.href || (item.href !== '/accueil' && currentPath.startsWith(item.href));
              const targetHref = (item.href === '/mode-examen' && slug) ? `${item.href}?subject=${slug}` : item.href;

              return (
                <Link
                  key={item.href}
                  href={targetHref}
                  onClick={onClose}
                  className={cn(
                    "flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors",
                    isActive ? "bg-navy-800 text-white" : "text-navy-200 hover:bg-navy-800/50 hover:text-white"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer: Profile + Logout */}
        <div className="border-t border-navy-800 p-4 flex flex-col gap-2">
          <Link
            href="/profil"
            onClick={onClose}
            className="flex items-center gap-3 px-4 py-2 rounded-md text-sm font-medium text-navy-200 hover:bg-navy-800/50 hover:text-white transition-colors"
          >
            <User className="w-4 h-4" />
            Mon Profil
          </Link>
          <form action={signOut}>
            <button
              type="submit"
              className="w-full flex items-center gap-3 px-4 py-2 rounded-md text-sm font-medium text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Se déconnecter
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
