import React from 'react';
import {
  BookOpen,
  Bookmark,
  Lightbulb,
  AlertTriangle,
  Calculator,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export type AcademicBlockType =
  | 'definition'
  | 'remember'
  | 'example'
  | 'warning'
  | 'formula';

interface AcademicCalloutProps {
  type?: AcademicBlockType;
  title?: string;
  children: React.ReactNode;
}

const CONFIG: Record<
  AcademicBlockType,
  {
    defaultTitle: string;
    icon: React.ComponentType<{ className?: string }>;
    border: string;
    bg: string;
    iconColor: string;
    titleColor: string;
  }
> = {
  definition: {
    defaultTitle: 'Définition',
    icon: BookOpen,
    border: 'border-l-navy-600',
    bg: 'bg-navy-50',
    iconColor: 'text-navy-600',
    titleColor: 'text-navy-700',
  },
  remember: {
    defaultTitle: 'À retenir',
    icon: Bookmark,
    border: 'border-l-gold-500',
    bg: 'bg-gold-50',
    iconColor: 'text-gold-600',
    titleColor: 'text-gold-700',
  },
  example: {
    defaultTitle: 'Exemple',
    icon: Lightbulb,
    border: 'border-l-emerald-500',
    bg: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
    titleColor: 'text-emerald-700',
  },
  warning: {
    defaultTitle: 'Attention',
    icon: AlertTriangle,
    border: 'border-l-red-500',
    bg: 'bg-red-50',
    iconColor: 'text-red-500',
    titleColor: 'text-red-700',
  },
  formula: {
    defaultTitle: 'Formule',
    icon: Calculator,
    border: 'border-l-purple-500',
    bg: 'bg-purple-50',
    iconColor: 'text-purple-600',
    titleColor: 'text-purple-700',
  },
};

export function AcademicCallout({
  type = 'definition',
  title,
  children,
}: AcademicCalloutProps) {
  const config = CONFIG[type];
  const Icon = config.icon;

  return (
    <aside
      className={cn(
        'academic-callout my-6 rounded-r-lg border-l-4 p-5',
        config.border,
        config.bg
      )}
      role="note"
    >
      <div className="flex items-center gap-2 mb-2">
        <Icon className={cn('h-4 w-4 shrink-0', config.iconColor)} />
        <span
          className={cn(
            'text-xs font-semibold uppercase tracking-wider',
            config.titleColor
          )}
        >
          {title || config.defaultTitle}
        </span>
      </div>
      <div className="text-sm leading-relaxed text-gray-700 [&>:first-child]:mt-0 [&>:last-child]:mb-0">
        {children}
      </div>
    </aside>
  );
}

// Shorthand components for MDX mapping
export const Definition = (props: Omit<AcademicCalloutProps, 'type'>) => (
  <AcademicCallout type="definition" {...props} />
);
export const ARetenir = (props: Omit<AcademicCalloutProps, 'type'>) => (
  <AcademicCallout type="remember" {...props} />
);
export const Exemple = (props: Omit<AcademicCalloutProps, 'type'>) => (
  <AcademicCallout type="example" {...props} />
);
export const Attention = (props: Omit<AcademicCalloutProps, 'type'>) => (
  <AcademicCallout type="warning" {...props} />
);
export const Formule = (props: Omit<AcademicCalloutProps, 'type'>) => (
  <AcademicCallout type="formula" {...props} />
);
