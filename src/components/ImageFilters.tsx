"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

export const FILTERS = {
  normal: {
    name: 'Normal',
    filter: 'none',
  },
  clarendon: {
    name: 'Clarendon',
    filter: 'contrast(1.2) saturate(1.35)',
  },
  gingham: {
    name: 'Gingham',
    filter: 'brightness(1.05) hue-rotate(-10deg)',
  },
  juno: {
    name: 'Juno',
    filter: 'sepia(0.35) contrast(1.15) brightness(1.15) saturate(1.8)',
  },
  lark: {
    name: 'Lark',
    filter: 'contrast(0.9) brightness(1.2) saturate(0.9)',
  },
  ludwig: {
    name: 'Ludwig',
    filter: 'brightness(1.05) saturate(2)',
  },
  slumber: {
    name: 'Slumber',
    filter: 'saturate(0.66) brightness(1.05)',
  },
  aden: {
    name: 'Aden',
    filter: 'hue-rotate(-20deg) contrast(0.9) saturate(0.85) brightness(1.2)',
  },
  perpetua: {
    name: 'Perpetua',
    filter: 'contrast(1.1) brightness(1.25) saturate(1.1)',
  },
  valencia: {
    name: 'Valencia',
    filter: 'sepia(0.08) contrast(1.1) brightness(1.08) saturate(1.25)',
  },
  willow: {
    name: 'Willow',
    filter: 'grayscale(0.5) contrast(0.95) brightness(0.9)',
  },
  lofi: {
    name: 'Lo-Fi',
    filter: 'saturate(1.1) contrast(1.5)',
  },
} as const;

export type FilterType = keyof typeof FILTERS;

interface ImageFiltersProps {
  imageUrl: string;
  currentFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
}

export default function ImageFilters({ imageUrl, currentFilter, onFilterChange }: ImageFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="w-full">
      {/* Toggle Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-900/5 hover:bg-white dark:bg-gray-900/10 rounded-lg transition-colors text-white"
      >
        <div className="flex items-center space-x-3">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
          </svg>
          <span className="font-medium">
            {isExpanded ? 'Ocultar Filtros' : 'Filtros'}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-white/60">{FILTERS[currentFilter].name}</span>
          <svg
            className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Filters Grid */}
      {isExpanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2 }}
          className="mt-3 overflow-x-auto"
        >
          <div className="flex space-x-3 pb-3">
            {(Object.keys(FILTERS) as FilterType[]).map((filterKey) => (
              <motion.button
                key={filterKey}
                whileTap={{ scale: 0.95 }}
                onClick={() => onFilterChange(filterKey)}
                className={`flex-shrink-0 relative ${currentFilter === filterKey
                  ? 'ring-2 ring-white ring-offset-2 ring-offset-black'
                  : ''
                  }`}
              >
                <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-800 relative">
                  <Image
                    src={imageUrl}
                    alt={FILTERS[filterKey].name}
                    fill
                    className="object-cover"
                    style={{
                      filter: FILTERS[filterKey].filter,
                    }}
                    sizes="80px"
                  />
                </div>
                <p className="text-white text-xs mt-1 text-center font-medium">
                  {FILTERS[filterKey].name}
                </p>
                {currentFilter === filterKey && (
                  <motion.div
                    layoutId="filter-indicator"
                    className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center"
                  >
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </motion.div>
                )}
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}

