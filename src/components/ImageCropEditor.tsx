"use client";

import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import ImageFilters, { FilterType, FILTERS } from './ImageFilters';

interface ImageCropEditorProps {
  imageUrl: string;
  aspectRatio: '1:1' | '4:5';
  onAspectRatioChange: (ratio: '1:1' | '4:5') => void;
  onClose: () => void;
}

export default function ImageCropEditor({
  imageUrl,
  aspectRatio,
  onAspectRatioChange,
  onClose
}: ImageCropEditorProps) {
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [currentFilter, setCurrentFilter] = useState<FilterType>('normal');
  const containerRef = useRef<HTMLDivElement>(null);

  // Reset position when aspect ratio changes
  useEffect(() => {
    setPosition({ x: 0, y: 0 });
    setZoom(1);
  }, [aspectRatio]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleZoomChange = (newZoom: number) => {
    setZoom(Math.max(1, Math.min(3, newZoom)));
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const resetTransform = () => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
    setRotation(0);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-black/50 backdrop-blur-sm">
        <button
          onClick={onClose}
          className="flex items-center space-x-2 text-white hover:text-gray-300 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          <span>Cancelar</span>
        </button>

        <h2 className="text-white font-semibold text-lg">Editar Imagen</h2>

        <button
          onClick={onClose}
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors font-medium"
        >
          Aplicar
        </button>
      </div>

      {/* Toolbar - Aspect Ratio Selector */}
      <div className="flex items-center justify-center space-x-2 p-4 bg-black/30">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => onAspectRatioChange('1:1')}
          className={`px-6 py-3 rounded-lg transition-all ${aspectRatio === '1:1'
            ? 'bg-white dark:bg-gray-900 dark:bg-gray-900 dark:bg-gray-900 text-black'
            : 'bg-white dark:bg-gray-900 dark:bg-gray-900/10 text-white hover:bg-white dark:bg-gray-900 dark:bg-gray-900/20'
            }`}
        >
          <div className="flex items-center space-x-2">
            <div className={`w-6 h-6 border-2 ${aspectRatio === '1:1' ? 'border-black' : 'border-white'
              }`} />
            <span className="font-medium">1:1</span>
          </div>
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => onAspectRatioChange('4:5')}
          className={`px-6 py-3 rounded-lg transition-all ${aspectRatio === '4:5'
            ? 'bg-white dark:bg-gray-900 dark:bg-gray-900 dark:bg-gray-900 text-black'
            : 'bg-white dark:bg-gray-900 dark:bg-gray-900/10 text-white hover:bg-white dark:bg-gray-900 dark:bg-gray-900/20'
            }`}
        >
          <div className="flex items-center space-x-2">
            <div className={`w-5 h-6 border-2 ${aspectRatio === '4:5' ? 'border-black' : 'border-white'
              }`} />
            <span className="font-medium">4:5</span>
          </div>
        </motion.button>
      </div>

      {/* Canvas Area */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div
          ref={containerRef}
          className={`relative ${aspectRatio === '1:1' ? 'aspect-square w-full max-w-md' : 'aspect-[4/5] w-full max-w-sm'
            } bg-black border-2 border-white/20 overflow-hidden cursor-move`}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <motion.img
            src={imageUrl}
            alt="Editar"
            className="absolute inset-0 w-full h-full object-contain"
            style={{
              filter: FILTERS[currentFilter].filter,
            }}
            animate={{
              scale: zoom,
              x: position.x,
              y: position.y,
              rotate: rotation
            }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            draggable={false}
          />

          {/* Reglas de guía */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/3 left-0 right-0 h-px bg-white dark:bg-gray-900 dark:bg-gray-900 dark:bg-gray-900/20" />
            <div className="absolute top-2/3 left-0 right-0 h-px bg-white dark:bg-gray-900 dark:bg-gray-900 dark:bg-gray-900/20" />
            <div className="absolute left-1/3 top-0 bottom-0 w-px bg-white dark:bg-gray-900 dark:bg-gray-900 dark:bg-gray-900/20" />
            <div className="absolute left-2/3 top-0 bottom-0 w-px bg-white dark:bg-gray-900 dark:bg-gray-900 dark:bg-gray-900/20" />
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="p-6 bg-black/50 backdrop-blur-sm space-y-4 max-h-[40vh] overflow-y-auto">
        {/* Filters */}
        <ImageFilters
          imageUrl={imageUrl}
          currentFilter={currentFilter}
          onFilterChange={setCurrentFilter}
        />

        {/* Zoom Control */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-white text-sm font-medium">Zoom</span>
            <span className="text-white/60 text-sm">{Math.round(zoom * 100)}%</span>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => handleZoomChange(zoom - 0.1)}
              disabled={zoom <= 1}
              className="p-2 bg-white dark:bg-gray-900 dark:bg-gray-900 dark:bg-gray-900/10 hover:bg-white dark:bg-gray-900/20 rounded-full transition-colors disabled:opacity-30"
            >
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
              </svg>
            </button>

            <input
              type="range"
              min="1"
              max="3"
              step="0.1"
              value={zoom}
              onChange={(e) => handleZoomChange(parseFloat(e.target.value))}
              className="flex-1 h-2 bg-white dark:bg-gray-900 dark:bg-gray-900 dark:bg-gray-900/20 rounded-full appearance-none cursor-pointer
  [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
            />

            <button
              onClick={() => handleZoomChange(zoom + 0.1)}
              disabled={zoom >= 3}
              className="p-2 bg-white dark:bg-gray-900 dark:bg-gray-900 dark:bg-gray-900/10 hover:bg-white dark:bg-gray-900/20 rounded-full transition-colors disabled:opacity-30"
            >
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-center space-x-4">
          <button
            onClick={handleRotate}
            className="flex items-center space-x-2 px-4 py-2 bg-white dark:bg-gray-900 dark:bg-gray-900 dark:bg-gray-900/10 hover:bg-white dark:bg-gray-900/20 rounded-lg transition-colors text-white"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Rotar</span>
          </button>

          <button
            onClick={resetTransform}
            className="flex items-center space-x-2 px-4 py-2 bg-white dark:bg-gray-900 dark:bg-gray-900 dark:bg-gray-900/10 hover:bg-white dark:bg-gray-900/20 rounded-lg transition-colors text-white"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Reset</span>
          </button>
        </div>
      </div>
    </div>
  );
}

