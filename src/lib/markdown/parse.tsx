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
  
  // Strip auto-generated HTML anchor tags (e.g. <a id="..."></a>) that crash the MDX
  // JSX parser due to special characters like \text in the id attribute value.
  processed = processed.replace(/<a\s+id="[^"]*"><\/a>/g, '');

  // Also normalize \r\n to \n to ensure consistent line processing on all platforms
  processed = processed.replace(/\r\n/g, '\n');

  // Replace standalone [ and ] on their own lines with $$
  processed = processed.replace(/^\[\s*$/gm, '$$$$');
  processed = processed.replace(/^\]\s*$/gm, '$$$$');
  
  // Replace \[ and \] with $$ — but only when NOT preceded by another \
  // (\\[ is a LaTeX line-break with spacing like \\[-2pt], not a math delimiter)
  processed = processed.replace(/(?<!\\)\\\[/g, '$$$$');
  processed = processed.replace(/(?<!\\)\\\]/g, '$$$$');
  
  // Replace {,} with , to prevent MDX from crashing (interpreting it as an invalid JS expression)
  processed = processed.replace(/\{,\}/g, ',');

  // Escape % signs to prevent KaTeX from treating them as comments (which breaks \boxed etc.)
  // Only escape if not already escaped
  processed = processed.replace(/(?<!\\)%/g, '\\%');

  // Wrap \begin{...}...\end{...} environments that are outside $$ in display math.
  // Split on existing $$ delimiters, process only non-math segments.
  {
    const parts = processed.split('$$');
    const wrapped = parts.map((part, idx) => {
      if (idx % 2 === 1) return part; // inside existing $$ block, leave untouched
      // Wrap any LaTeX environments in this non-math segment
      return part.replace(
        /(\\begin\{[a-zA-Z*]+\}[\s\S]*?\\end\{[a-zA-Z*]+\})/g,
        '\n$$\n$1\n$$\n'
      );
    });
    processed = wrapped.join('$$');
    // Clean up any accidental $$$$ sequences from adjacent wrapped blocks
    processed = processed.replace(/\$\$\s*\$\$/g, '$$');
  }

  // Convert lines of 2+ "=" signs to a single "=" (accounting formula separator).
  // Setext headings (===) or visual separators are not valid LaTeX and should just be "=".
  // Use global multiline regex — handles both inside and outside math blocks.
  processed = processed.replace(/^={2,}\s*$/gm, '=');

  // Similarly, convert lines of 2+ "-" signs that act as setext h2 underlines into "—"
  // but only if they're not already an HR (3+ dashes with nothing else).
  processed = processed.replace(/^-{2,}\s*$/gm, (match) => {
    return match.trim().length >= 3 ? '—' : match;
  });

  // Strip "## " prefix from lines that are actually LaTeX (contain \text, \frac, etc.)
  // These come from markdown generators that add headings around formulas.
  processed = processed.replace(/^#{1,3}\s+([\(\\\$])/gm, '$1');

  // Wrap lines that look like bare LaTeX commands (e.g. \text{...}) outside math blocks
  // so they get rendered by KaTeX instead of treated as plain text.
  const lines = processed.split('\n');
  let inMathBlock = false;
  const fixed: string[] = [];
  for (const line of lines) {
    if (line.trim() === '$$') { inMathBlock = !inMathBlock; fixed.push(line); continue; }
    if (
      !inMathBlock &&
      /^\\[a-zA-Z]/.test(line.trim()) &&
      !line.trim().startsWith('\\\\') &&
      !line.trim().startsWith('\\[') &&
      !line.trim().startsWith('\\]')
    ) {
      // Strip any stray $ signs from the line, which would break the math block
      const cleanLine = line.trim().replace(/\$/g, '  ');
      fixed.push('$$');
      fixed.push(cleanLine);
      fixed.push('$$');
    } else {
      fixed.push(line);
    }
  }
  processed = fixed.join('\n');
  
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
