'use client';

import React from 'react';

export function TocLink({ id, title, level, isFirstH2 }: { id: string; title: string; level: number; isFirstH2: boolean }) {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const element = document.getElementById(id);
    
    console.log('[TocLink] clicking:', id, '-> found element:', element);
    
    if (element) {
      const navHeight = 80; // fixed nav height
      const top = element.getBoundingClientRect().top + window.scrollY - navHeight;
      window.scrollTo({ top, behavior: 'smooth' });
      window.history.pushState(null, '', `#${id}`);
    } else {
      // Fallback: log all heading IDs on the page so we can debug
      const allHeadings = document.querySelectorAll('h1, h2, h3, h4');
      console.warn('[TocLink] Element not found for id:', id);
      console.log('[TocLink] All heading IDs on page:', Array.from(allHeadings).map(h => ({ tag: h.tagName, id: h.id, text: h.textContent?.slice(0, 40) })));
    }
  };

  return (
    <a 
      href={`#${id}`} 
      onClick={handleClick}
      className={`text-sm hover:text-gold-600 transition-colors ${
        isFirstH2 ? 'text-gold-600 font-medium' : 'text-gray-600'
      }`}
    >
      {title}
    </a>
  );
}
