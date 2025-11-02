'use client';

import Image from 'next/image';
import { type ReactElement } from 'react';

interface MediaFile {
  file: File;
  preview: string;
  type: 'image' | 'video';
}

interface MediaPreviewProps {
  readonly files: MediaFile[];
  readonly onRemove: (index: number) => void;
}

export function MediaPreview({ files, onRemove }: MediaPreviewProps): ReactElement {
  return (
    <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
      {files.map((media, index) => (
        <div key={index} className="group relative aspect-square overflow-hidden rounded-xl bg-slate-800">
          {media.type === 'image' ? (
            <Image src={media.preview} alt={`Preview ${index + 1}`} fill className="object-cover" />
          ) : (
            <video src={media.preview} className="h-full w-full object-cover" muted />
          )}
          <button
            type="button"
            onClick={() => {
              onRemove(index);
            }}
            className="absolute right-2 top-2 rounded-full bg-black/70 p-2 text-white opacity-0 transition hover:bg-black/90 group-hover:opacity-100"
          >
            <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
          {media.type === 'video' && (
            <div className="absolute bottom-2 left-2 rounded bg-black/70 px-2 py-1">
              <svg className="size-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

