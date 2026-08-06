import type { MDXComponents } from 'mdx/types';
import Image from 'next/image';
import Link from 'next/link';
import {
  AcademicCallout,
  Definition,
  ARetenir,
  Exemple,
  Attention,
  Formule,
} from '@/components/academic/academic-callout';

/**
 * Component map for MDX rendering.
 * Maps HTML elements to styled React components and provides
 * academic callout components for directive syntax.
 */
export const mdxComponents: MDXComponents = {
  // Academic callout components
  AcademicCallout,
  Definition,
  ARetenir,
  Exemple,
  Attention,
  Formule,

  // Override default HTML elements with styled versions
  h1: ({ children, ...props }) => (
    <h1
      className="text-reader-h1 font-display font-bold text-navy-900 mt-10 mb-4"
      {...props}
    >
      {children}
    </h1>
  ),
  h2: ({ children, ...props }) => (
    <h2
      className="text-reader-h2 font-display font-semibold text-navy-900 mt-8 mb-3 pb-2 border-b border-gray-100"
      {...props}
    >
      {children}
    </h2>
  ),
  h3: ({ children, ...props }) => (
    <h3
      className="text-reader-h3 font-semibold text-navy-800 mt-6 mb-2"
      {...props}
    >
      {children}
    </h3>
  ),
  p: ({ children, ...props }) => (
    <p className="mb-4 leading-relaxed" {...props}>
      {children}
    </p>
  ),
  ul: ({ children, ...props }) => (
    <ul className="mb-4 pl-6 list-disc space-y-1" {...props}>
      {children}
    </ul>
  ),
  ol: ({ children, ...props }) => (
    <ol className="mb-4 pl-6 list-decimal space-y-1" {...props}>
      {children}
    </ol>
  ),
  blockquote: ({ children, ...props }) => (
    <blockquote
      className="border-l-4 border-navy-200 pl-4 italic text-gray-500 my-4"
      {...props}
    >
      {children}
    </blockquote>
  ),
  table: ({ children, ...props }) => (
    <div className="overflow-x-auto my-6 rounded-lg border border-gray-200">
      <table className="w-full text-sm border-collapse" {...props}>
        {children}
      </table>
    </div>
  ),
  thead: ({ children, ...props }) => (
    <thead className="bg-navy-50" {...props}>
      {children}
    </thead>
  ),
  th: ({ children, ...props }) => (
    <th
      className="text-left font-semibold text-navy-900 px-4 py-2.5 border-b border-gray-200"
      {...props}
    >
      {children}
    </th>
  ),
  td: ({ children, ...props }) => (
    <td className="px-4 py-2.5 border-b border-gray-100" {...props}>
      {children}
    </td>
  ),
  a: ({ href, children, ...props }) => {
    if (href?.startsWith('/')) {
      return (
        <Link
          href={href}
          className="text-navy-600 underline underline-offset-2 hover:text-navy-800 transition-colors"
          {...props}
        >
          {children}
        </Link>
      );
    }
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-navy-600 underline underline-offset-2 hover:text-navy-800 transition-colors"
        {...props}
      >
        {children}
      </a>
    );
  },
  img: ({ src, alt, width: _width, height: _height, ...props }: React.ImgHTMLAttributes<HTMLImageElement>) => {
    if (!src) return null;
    // For Supabase storage images, use next/image
    if (typeof src === 'string' && src.includes('supabase')) {
      return (
        <Image
          src={src}
          alt={alt || ''}
          width={800}
          height={400}
          className="rounded-lg my-6 mx-auto max-w-full h-auto"
          {...props}
        />
      );
    }
    // For SVGs and other images
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt || ''}
        className="rounded-lg my-6 mx-auto max-w-full h-auto"
        {...props}
      />
    );
  },
  code: ({ children, className, ...props }: React.HTMLAttributes<HTMLElement>) => {
    // Inline code (not inside pre)
    if (!className) {
      return (
        <code
          className="bg-gray-100 text-navy-800 px-1.5 py-0.5 rounded text-sm font-mono"
          {...props}
        >
          {children}
        </code>
      );
    }
    // Code blocks (handled by pre)
    return (
      <code className={className} {...props}>
        {children}
      </code>
    );
  },
  pre: ({ children, ...props }) => (
    <pre
      className="bg-navy-950 text-gray-100 rounded-lg p-4 overflow-x-auto my-6 text-sm leading-relaxed"
      {...props}
    >
      {children}
    </pre>
  ),
  hr: () => <hr className="my-8 border-gray-200" />,
  strong: ({ children, ...props }) => (
    <strong className="font-semibold text-navy-900" {...props}>
      {children}
    </strong>
  ),
};
