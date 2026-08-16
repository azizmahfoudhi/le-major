'use client';

import React from 'react';

export function TocLink({ id, title, level, isFirstH2 }: { id: string; title: string; level: number; isFirstH2: boolean }) {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      // Offset for sticky nav (adjust if needed)
      const offset = 80;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
      
      // Update URL without a full reload
      window.history.pushState(null, '', `#${id}`);
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
