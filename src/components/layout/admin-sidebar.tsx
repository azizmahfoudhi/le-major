'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ADMIN_NAV } from '@/lib/constants';
import { cn } from '@/lib/utils/cn';
import {
  LayoutDashboard,
  Building2,
  FileText,
  FolderOpen,
  PenTool,
  Layers,
  ClipboardList,
  Package,
  Key,
  Users,
  BarChart3,
  Settings,
  ChevronLeft
} from 'lucide-react';
import { useState } from 'react';

const iconMap: Record<string, React.ElementType> = {
  LayoutDashboard,
  Building2,
  FileText,
  FolderOpen,
  PenTool,
  Layers,
  ClipboardList,
  Package,
  Key,
  Users,
  BarChart3,
  Settings,
};

export default function AdminSidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <>
      <div 
        className={cn(
          "hidden md:flex flex-col bg-navy-950 border-r border-navy-800 transition-all duration-300 h-screen sticky top-0",
          isCollapsed ? "w-20" : "w-64"
        )}
      >
        <div className="h-16 flex items-center justify-between px-4 border-b border-navy-800">
          {!isCollapsed && (
            <div className="flex flex-col">
              <span className="text-gold-500 font-display text-xl font-bold leading-none">LE MAJOR</span>
              <span className="text-xs font-medium text-navy-400 tracking-wider">ADMIN</span>
            </div>
          )}
          {isCollapsed && (
            <span className="text-gold-500 font-display text-xl font-bold mx-auto">LM</span>
          )}
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-navy-400 hover:text-white absolute -right-3 top-5 bg-navy-800 rounded-full border border-navy-700 hidden lg:flex"
          >
            <ChevronLeft className={cn("w-5 h-5 transition-transform", isCollapsed && "rotate-180")} />
          </button>
        </div>

        <div className="flex-1 py-6 overflow-y-auto overflow-x-hidden">
          <div className="flex flex-col gap-6 px-3">
            {ADMIN_NAV.map((group) => (
              <div key={group.section} className="flex flex-col gap-1">
                {!isCollapsed && (
                  <span className="px-3 text-xs font-semibold text-navy-400 uppercase tracking-wider mb-1">
                    {group.section}
                  </span>
                )}
                {group.items.map((item) => {
                  const Icon = iconMap[item.icon];
                  const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      title={isCollapsed ? item.label : undefined}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors group",
                        isActive ? "bg-navy-800 text-white" : "text-navy-300 hover:bg-navy-800/50 hover:text-white"
                      )}
                    >
                      {Icon && <Icon className={cn("w-5 h-5 flex-shrink-0", isActive ? "text-gold-500" : "text-navy-400 group-hover:text-navy-200")} />}
                      {!isCollapsed && <span>{item.label}</span>}
                    </Link>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile top bar for admin */}
      <div className="md:hidden flex items-center justify-between h-16 bg-navy-950 px-4 border-b border-navy-800">
        <div className="flex flex-col">
          <span className="text-gold-500 font-display text-xl font-bold leading-none">LE MAJOR</span>
          <span className="text-xs font-medium text-navy-400 tracking-wider">ADMIN</span>
        </div>
        {/* We would typically put a mobile drawer here for admin, but for now we'll just have the top bar */}
      </div>
    </>
  );
}
