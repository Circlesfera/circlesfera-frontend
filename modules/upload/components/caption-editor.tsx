'use client';

import { useState, useEffect, useRef, type ReactElement } from 'react';

interface CaptionEditorProps {
  readonly value: string;
  readonly onChange: (value: string) => void;
}

const HASHTAG_REGEX = /#[\w]+/g;

export function CaptionEditor({ value, onChange }: CaptionEditorProps): ReactElement {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [hashtags, setHashtags] = useState<string[]>([]);

  useEffect(() => {
    const matches = value.match(HASHTAG_REGEX);
    setHashtags(matches ? Array.from(new Set(matches)) : []);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>): void => {
    onChange(e.target.value);
  };

  return (
    <div className="space-y-4">
      <label htmlFor="caption" className="block text-sm font-medium text-slate-300">
        Descripción
      </label>
      <textarea
        ref={textareaRef}
        id="caption"
        value={value}
        onChange={handleChange}
        placeholder="Escribe una descripción para tu publicación... (usa #hashtag para etiquetas)"
        rows={6}
        maxLength={2200}
        className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white placeholder:text-slate-500 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
      />
      <div className="flex items-center justify-between text-xs text-slate-500">
        <div>
          {hashtags.length > 0 && (
            <span className="text-slate-400">
              {hashtags.length} hashtag{hashtags.length > 1 ? 's' : ''}:{' '}
              {hashtags.slice(0, 5).join(', ')}
              {hashtags.length > 5 && '...'}
            </span>
          )}
        </div>
        <span>
          {value.length} / 2,200
        </span>
      </div>
    </div>
  );
}

