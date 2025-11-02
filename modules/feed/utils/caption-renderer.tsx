'use client';

import Link from 'next/link';
import { type ReactElement } from 'react';

/**
 * Renderiza un caption con hashtags y menciones como links clickeables.
 */
export function renderCaptionWithLinks(caption: string): ReactElement[] {
  if (!caption) {
    return [];
  }

  // Regex para encontrar hashtags y menciones
  // Hashtag: # seguido de letras, números, guiones bajos
  // Mención: @ seguido de letras, números, guiones bajos
  const parts = caption.split(/(#[\w]+|@[\w]+)/g);

  return parts.map((part, index) => {
    if (part.startsWith('#')) {
      const hashtag = part.slice(1);
      return (
        <Link
          key={`${part}-${index}`}
          href={`/hashtags/${hashtag}`}
          className="font-semibold text-primary-400 hover:text-primary-300 transition"
        >
          {part}
        </Link>
      );
    }
    if (part.startsWith('@')) {
      const handle = part.slice(1);
      return (
        <Link
          key={`${part}-${index}`}
          href={`/${handle}`}
          className="font-semibold text-primary-400 hover:text-primary-300 transition"
        >
          {part}
        </Link>
      );
    }
    return <span key={`${part}-${index}`}>{part}</span>;
  });
}

