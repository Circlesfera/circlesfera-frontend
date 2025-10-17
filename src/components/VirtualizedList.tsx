"use client";

import React, { memo, useCallback } from 'react';
import { useVirtualization } from '@/hooks/useVirtualization';

interface VirtualizedListProps<T> {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  className?: string;
  overscan?: number;
  onScroll?: (scrollTop: number) => void;
}

/**
 * Componente de lista virtualizada para optimizar el rendimiento
 * Solo renderiza los elementos visibles en el viewport
 */
const VirtualizedList = memo(<T,>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  className = '',
  overscan = 5,
  onScroll
}: VirtualizedListProps<T>) => {
  const {
    visibleItems,
    totalHeight,
    offsetY,
    containerRef
  } = useVirtualization(items.length, {
    itemHeight,
    containerHeight,
    overscan
  });

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = e.currentTarget.scrollTop;
    onScroll?.(scrollTop);
  }, [onScroll]);

  return (
    <div
      ref={containerRef}
      className={`overflow-auto ${className}`}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div
          style={{
            transform: `translateY(${offsetY}px)`,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0
          }}
        >
          {visibleItems.map((index) => (
            <div
              key={index}
              style={{ height: itemHeight }}
            >
              {renderItem(items[index], index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}) as <T>(props: VirtualizedListProps<T>) => React.ReactElement;

VirtualizedList.displayName = 'VirtualizedList';

export default VirtualizedList;
