'use client';

import Image from 'next/image';
import Link from 'next/link';
import { type ReactElement, useEffect, useState } from 'react';

import type { FeedTag } from '@/services/api/types/feed';

interface ImageTagsProps {
  readonly tags: FeedTag[];
  readonly imageWidth: number;
  readonly imageHeight: number;
  readonly containerRef?: React.RefObject<HTMLDivElement | null>;
}

export function ImageTags({ tags, imageWidth, imageHeight, containerRef }: ImageTagsProps): ReactElement | null {
  const [hoveredTagId, setHoveredTagId] = useState<string | null>(null);
  const [containerDimensions, setContainerDimensions] = useState<{ width: number; height: number } | null>(null);

  useEffect(() => {
    if (!containerRef?.current) {
      return;
    }

    const updateDimensions = (): void => {
      if (containerRef.current) {
        setContainerDimensions({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);

    return () => {
      window.removeEventListener('resize', updateDimensions);
    };
  }, [containerRef]);

  if (!tags || tags.length === 0) {
    return null;
  }

  // Usar dimensiones del contenedor si están disponibles, si no, usar las originales
  const displayWidth = containerDimensions?.width ?? imageWidth;
  const displayHeight = containerDimensions?.height ?? imageHeight;

  return (
    <>
      {tags.map((tag) => {
        // Calcular posición en píxeles basado en el tamaño de visualización
        let x: number;
        let y: number;

        if (tag.isNormalized) {
          // Coordenadas normalizadas (0-1) -> convertir a píxeles del contenedor
          x = tag.x * displayWidth;
          y = tag.y * displayHeight;
        } else {
          // Coordenadas absolutas -> escalar proporcionalmente
          const scaleX = displayWidth / imageWidth;
          const scaleY = displayHeight / imageHeight;
          x = tag.x * scaleX;
          y = tag.y * scaleY;
        }

        const isHovered = hoveredTagId === tag.id;

        return (
          <div
            key={tag.id}
            className="absolute z-10"
            style={{
              left: `${x}px`,
              top: `${y}px`,
              transform: 'translate(-50%, -50%)'
            }}
            onMouseEnter={() => {
              setHoveredTagId(tag.id);
            }}
            onMouseLeave={() => {
              setHoveredTagId(null);
            }}
          >
            {/* Punto indicador */}
            <div className="relative">
              <div
                className={`size-6 rounded-full border-2 transition ${
                  isHovered ? 'border-white bg-primary-500/80' : 'border-white bg-primary-500/60'
                }`}
              />
              
              {/* Tooltip con información del usuario */}
              {isHovered && (
                <div className="absolute bottom-full left-1/2 mb-2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-black/90 px-3 py-2 shadow-lg">
                  <Link
                    href={`/${tag.user.handle}`}
                    className="flex items-center gap-2"
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                  >
                    <div className="relative size-6">
                      <Image
                        src={tag.user.avatarUrl || '/default-avatar.png'}
                        alt={tag.user.displayName}
                        fill
                        className="rounded-full object-cover"
                      />
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-semibold text-white">{tag.user.displayName}</span>
                    </div>
                  </Link>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </>
  );
}

