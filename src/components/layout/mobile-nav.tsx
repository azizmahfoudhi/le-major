'use client';

import { X } from 'lucide-react';
import Link from 'next/link';
import { STUDENT_NAV } from '@/lib/constants';
import { cn } from '@/lib/utils/cn';
import Image from 'next/image';

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
  currentPath: string;
}

export default function MobileNav({ isOpen, onClose, currentPath }: MobileNavProps) {
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
            <Image
              src="/logo_horizontal_navy.png"
              alt="Le Major"
              width={120}
              height={36}
              className="h-8 w-auto object-contain"
            />
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
              return (
                <Link
                  key={item.href}
                  href={item.href}
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
      </div>
    </div>
  );
}
