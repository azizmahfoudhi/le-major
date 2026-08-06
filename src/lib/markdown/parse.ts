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
 * Parse and render Markdown/MDX content with full academic support.
 * Runs entirely server-side via next-mdx-remote/rsc — zero client JS.
 */
export async function renderMarkdown<T = ContentFrontmatter>(source: string) {
  const { content, frontmatter } = await compileMDX<T>({
    source,
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
  const { content } = await compileMDX({
    source,
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
