import GithubSlugger from 'github-slugger';

export interface TocItem {
  id: string;
  title: string;
  level: number;
}

/**
 * Extracts h2 (##) and h3 (###) headings from markdown content
 * and generates a Table of Contents (TOC) array using github-slugger
 * to perfectly match rehype-slug output.
 */
export function extractTableOfContents(markdown: string): TocItem[] {
  const toc: TocItem[] = [];
  const slugger = new GithubSlugger();
  
  // Match lines that start with ## or ###
  // Group 1: heading level (hashes)
  // Group 2: heading text
  const headingRegex = /^(#{2,3})\s+(.+)$/gm;
  
  let match;
  while ((match = headingRegex.exec(markdown)) !== null) {
    const level = match[1].length; // 2 or 3
    // Remove Markdown formatting like **bold** or *italic* from the title for display
    const rawTitle = match[2].trim();
    const title = rawTitle.replace(/[*_~`]/g, '');
    
    // Generate the ID exactly as rehype-slug will
    const id = slugger.slug(rawTitle);
      
    toc.push({ id, title, level });
  }
  
  return toc;
}
