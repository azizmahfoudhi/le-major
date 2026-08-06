export interface TocItem {
  id: string;
  title: string;
  level: number;
}

/**
 * Extracts h2 (##) and h3 (###) headings from markdown content
 * and generates a Table of Contents (TOC) array.
 */
export function extractTableOfContents(markdown: string): TocItem[] {
  const toc: TocItem[] = [];
  
  // Match lines that start with ## or ###
  // Group 1: heading level (hashes)
  // Group 2: heading text
  const headingRegex = /^(#{2,3})\s+(.+)$/gm;
  
  let match;
  while ((match = headingRegex.exec(markdown)) !== null) {
    const level = match[1].length; // 2 or 3
    const title = match[2].trim();
    
    // Generate a URL-friendly ID from the title
    const id = title
      .toLowerCase()
      .normalize('NFD') // Decompose accented characters
      .replace(/[\u0300-\u036f]/g, '') // Remove accents
      .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with hyphen
      .replace(/(^-|-$)+/g, ''); // Trim hyphens
      
    toc.push({ id, title, level });
  }
  
  return toc;
}

/**
 * Helper to inject the generated IDs into the Markdown string before rendering,
 * so the TOC anchor links actually work.
 */
export function injectHeadingIds(markdown: string): string {
  return markdown.replace(/^(#{2,3})\s+(.+)$/gm, (match, hashes, title) => {
    const id = title
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
      
    // In MDX / generic markdown, we can inject an anchor span or use custom properties.
    // A standard way in React-Markdown/MDX without a rehype plugin is to just emit raw HTML
    // for the heading, or inject an anchor right before it.
    // The safest way without breaking MDX parsing is to insert an empty anchor above it:
    return `<a id="${id}"></a>\n${match}`;
  });
}
