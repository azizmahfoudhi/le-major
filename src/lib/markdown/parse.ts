import { compileMDX } from 'next-mdx-remote/rsc';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import remarkDirective from 'remark-directive';
import rehypeKatex from 'rehype-katex';
import { remarkAcademicCallouts } from './plugins/remark-academic-callouts';
import { mdxComponents } from './components';

export interface ContentFrontmatter {
  title?: string;
  type?: 'lesson' | 'summary' | 'resource';
  matiere?: string;
  chapitre?: string;
  difficulte?: 'easy' | 'intermediate' | 'hard';
  points?: number;
  duree?: number;
  edition?: string;
  statut?: 'draft' | 'published' | 'archived';
}

/**
 * Pre-processes raw MDX to prevent SSR crashes from common formatting errors:
 * - Replaces LaTeX {,} with , (crashes MDX parsing outside math blocks)
 * - Converts standalone [ and ] on their own lines to $$ for math blocks
 */
export function preprocessMDX(source: string): string {
  if (!source) return '';
  let processed = source;
  
  // Replace standalone [ and ] on their own lines with $$
  processed = processed.replace(/^\[\s*$/gm, '$$$$');
  processed = processed.replace(/^\]\s*$/gm, '$$$$');
  
  // Replace \[ and \] with $$
  processed = processed.replace(/\\\[/g, '$$$$');
  processed = processed.replace(/\\\]/g, '$$$$');
  
  // Replace {,} with , to prevent MDX from crashing (interpreting it as an invalid JS expression)
  processed = processed.replace(/\{,\}/g, ',');
  
  return processed;
}

/**
 * Parse and render Markdown/MDX content with full academic support.
 * Runs entirely server-side via next-mdx-remote/rsc — zero client JS.
 */
export async function renderMarkdown<T = ContentFrontmatter>(source: string) {
  const safeSource = preprocessMDX(source);
  const { content, frontmatter } = await compileMDX<T>({
    source: safeSource,
    options: {
      parseFrontmatter: true,
      mdxOptions: {
        remarkPlugins: [
          remarkGfm,
          remarkMath,
          remarkDirective,
          remarkAcademicCallouts,
        ],
        rehypePlugins: [
          [rehypeKatex, { strict: false, throwOnError: false }],
        ],
      },
    },
    components: mdxComponents,
  });

  return { content, frontmatter };
}

/**
 * Render plain Markdown without frontmatter parsing.
 * Used for exercise statements, corrections, etc.
 */
export async function renderMarkdownBody(source: string) {
  const safeSource = preprocessMDX(source);
  const { content } = await compileMDX({
    source: safeSource,
    options: {
      parseFrontmatter: false,
      mdxOptions: {
        remarkPlugins: [
          remarkGfm,
          remarkMath,
          remarkDirective,
          remarkAcademicCallouts,
        ],
        rehypePlugins: [
          [rehypeKatex, { strict: false, throwOnError: false }],
        ],
      },
    },
    components: mdxComponents,
  });

  return content;
}
