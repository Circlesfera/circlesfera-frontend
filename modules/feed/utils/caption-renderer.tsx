'use client';

import Link from 'next/link';
import { type ReactElement } from 'react';

/**
 * Sanitiza una cadena de texto removiendo HTML/JS para prevenir XSS.
 * Función simple que no requiere DOMPurify en el cliente.
 */
function sanitizeText(text: string): string {
  // Remover cualquier tag HTML y caracteres peligrosos
  return text
    .replace(/<[^>]*>/g, '') // Remover tags HTML
    .replace(/javascript:/gi, '') // Remover javascript:
    .replace(/on\w+\s*=/gi, ''); // Remover event handlers
}

/**
 * Renderiza un caption con hashtags y menciones como links clickeables.
 * Sanitiza el input para prevenir XSS attacks.
 */
export function renderCaptionWithLinks(caption: string): ReactElement[] {
  if (!caption) {
    return [];
  }

  // Sanitizar el caption para prevenir XSS (elimina todo HTML/JS)
  const sanitized = sanitizeText(caption);

  // Regex para encontrar hashtags y menciones
  // Hashtag: # seguido de letras, números, guiones bajos
  // Mención: @ seguido de letras, números, guiones bajos
  const parts = sanitized.split(/(#[\w]+|@[\w]+)/g);

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

