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
 * Pre-processes raw MDX to prevent SSR crashes and rendering bugs:
 * - Replaces LaTeX {,} with , (crashes MDX parsing outside math blocks)
 * - Converts standalone [ and ] on their own lines to $$ for math blocks
 * - Escapes % signs (treated as comments in KaTeX)
 * - Escapes setext heading underlines (lines of ===/ ---) to prevent them from
 *   eating the line above or rendering as long = strings
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

  // Escape % signs to prevent KaTeX from treating them as comments (which breaks \boxed etc.)
  // Only escape if not already escaped
  processed = processed.replace(/(?<!\\)%/g, '\\%');

  // Fix setext heading issue: a line consisting only of '=' or '-' right after a text line
  // is interpreted by remark-gfm as an H1/H2 heading underline.
  // This causes the '===' line to disappear (the text above becomes a heading).
  // We break this by prefixing such lines with a backslash so they render literally.
  // We skip lines that are already inside $$ math blocks.
  const lines = processed.split('\n');
  let inMathBlock = false;
  const fixed: string[] = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.trim() === '$$') {
      inMathBlock = !inMathBlock;
      fixed.push(line);
      continue;
    }
    // Detect setext heading underlines (lines of only = or only -)
    // These are NOT markdown headings here — they represent "=" in accounting formulas.
    // Replace them with a single "=" on its own line so they render correctly.
    if (!inMathBlock && /^={2,}\s*$/.test(line)) {
      fixed.push('=');
    } else if (!inMathBlock && /^-{2,}\s*$/.test(line) && i > 0 && fixed[fixed.length - 1].trim() !== '') {
      // Only convert --- that would form a setext heading (non-empty line above)
      // Keep it as a plain "—" dash separator
      fixed.push('—');
    } else {
      fixed.push(line);
    }
  }
  processed = fixed.join('\n');

  // Wrap lines that look like bare LaTeX commands (e.g. \text{...}) outside math blocks
  // so they get rendered by KaTeX instead of treated as plain text.
  const lines2 = processed.split('\n');
  let inMath2 = false;
  const fixed2: string[] = [];
  for (const line of lines2) {
    if (line.trim() === '$$') { inMath2 = !inMath2; fixed2.push(line); continue; }
    // If line starts with a LaTeX command and is not already wrapped in $ or $$
    if (
      !inMath2 &&
      /^\\[a-zA-Z]/.test(line.trim()) &&
      !line.trim().startsWith('\\\\') &&
      !line.trim().startsWith('\\[') &&
      !line.trim().startsWith('\\]')
    ) {
      fixed2.push('$' + line.trim() + '$');
    } else {
      fixed2.push(line);
    }
  }
  processed = fixed2.join('\n');
  
  return processed;
}

/**
 * Parse and render Markdown/MDX content with full academic support.
 * Runs entirely server-side via next-mdx-remote/rsc — zero client JS.
 */
export async function renderMarkdown<T = ContentFrontmatter>(source: string) {
  const safeSource = preprocessMDX(source);
  
  try {
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
  } catch (error: unknown) {
    const err = error as Error;
    console.error('MDX Compilation Error in full content:', err.message);
    
    const content = (
      <div className="p-6 border border-rose-200 bg-rose-50 rounded-lg text-rose-800 my-8">
        <h2 className="text-xl font-semibold mb-2 text-rose-900">Erreur de syntaxe MDX</h2>
        <p className="mb-4">Ce cours contient une erreur de formatage qui empêche son affichage normal. Le contenu brut est affiché ci-dessous :</p>
        <pre className="whitespace-pre-wrap font-mono text-sm bg-white p-4 rounded border border-rose-200 overflow-x-auto text-gray-800">
          {source}
        </pre>
      </div>
    );
    
    return { content, frontmatter: {} as T };
  }
}

/**
 * Render plain Markdown without frontmatter parsing.
 * Used for exercise statements, corrections, etc.
 */
export async function renderMarkdownBody(source: string) {
  const safeSource = preprocessMDX(source);
  
  try {
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
  } catch (error: unknown) {
    const err = error as Error;
    console.error('MDX Compilation Error:', err.message);
    
    // Return a safe fallback UI so the page doesn't crash
    return (
      <div className="p-4 border border-rose-200 bg-rose-50 rounded-lg text-rose-800">
        <p className="font-semibold mb-2 flex items-center">
          <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          Erreur d'affichage (Syntaxe invalide)
        </p>
        <p className="text-sm opacity-90 mb-4">
          Le contenu contient des caractères non reconnus (ex: accolades non fermées ou balises mal formées). Voici le contenu brut :
        </p>
        <pre className="whitespace-pre-wrap font-mono text-xs bg-white/50 p-3 rounded border border-rose-100 overflow-x-auto">
          {source}
        </pre>
      </div>
    );
  }
}
