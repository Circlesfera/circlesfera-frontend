"use client";

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  alt?: string;
}

export default function ImageModal({ isOpen, onClose, imageUrl, alt = 'Imagen' }: ImageModalProps) {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [initialPinchDistance, setInitialPinchDistance] = useState<number | null>(null);
  const [initialScale, setInitialScale] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);

  // Reset zoom cuando se cierra
  useEffect(() => {
    if (!isOpen) {
      setScale(1);
      setPosition({ x: 0, y: 0 });
    }
  }, [isOpen]);

  // Manejar zoom con rueda del mouse
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY * -0.001;
    const newScale = Math.min(Math.max(1, scale + delta), 4);
    setScale(newScale);

    // Reset position si volvemos a scale 1
    if (newScale === 1) {
      setPosition({ x: 0, y: 0 });
    }
  };

  // Iniciar arrastre
  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale > 1) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
    }
  };

  // Manejar arrastre
  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && scale > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  // Finalizar arrastre
  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch handlers for mobile pinch zoom
  const getTouchDistance = (touch1: React.Touch, touch2: React.Touch) => {
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && e.touches[0] && e.touches[1]) {
      // Pinch gesture started
      const distance = getTouchDistance(e.touches[0], e.touches[1]);
      setInitialPinchDistance(distance);
      setInitialScale(scale);
    } else if (e.touches.length === 1 && e.touches[0] && scale > 1) {
      // Single touch for dragging
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - position.x,
        y: e.touches[0].clientY - position.y
      });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && e.touches[0] && e.touches[1] && initialPinchDistance) {
      // Pinch zoom
      e.preventDefault();
      const distance = getTouchDistance(e.touches[0], e.touches[1]);
      const scaleChange = distance / initialPinchDistance;
      const newScale = Math.min(Math.max(1, initialScale * scaleChange), 4);
      setScale(newScale);

      if (newScale === 1) {
        setPosition({ x: 0, y: 0 });
      }
    } else if (e.touches.length === 1 && e.touches[0] && isDragging && scale > 1) {
      // Single touch drag
      setPosition({
        x: e.touches[0].clientX - dragStart.x,
        y: e.touches[0].clientY - dragStart.y
      });
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (e.touches.length < 2) {
      setInitialPinchDistance(null);
    }
    if (e.touches.length === 0) {
      setIsDragging(false);
    }
  };

  // Zoom con botones
  const handleZoomIn = () => {
    const newScale = Math.min(scale + 0.5, 4);
    setScale(newScale);
  };

  const handleZoomOut = () => {
    const newScale = Math.max(scale - 0.5, 1);
    setScale(newScale);
    if (newScale === 1) {
      setPosition({ x: 0, y: 0 });
    }
  };

  // Cerrar con ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
        onClick={onClose}
      >
        <div
          ref={containerRef}
          className="relative w-full h-full flex items-center justify-center overflow-hidden"
          onClick={(e) => e.stopPropagation()}
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{
            cursor: isDragging ? 'grabbing' : scale > 1 ? 'grab' : 'default',
            touchAction: 'none'
          }}
        >
          {/* Imagen */}
          <motion.div
            animate={{
              scale,
              x: position.x,
              y: position.y
            }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="relative max-w-[90vw] max-h-[90vh] aspect-auto"
          >
            <Image
              src={imageUrl}
              alt={alt}
              width={1200}
              height={1200}
              className="object-contain max-w-full max-h-[90vh]"
              draggable={false}
            />
          </motion.div>

          {/* Botón cerrar */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors backdrop-blur-sm z-10"
          >
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Controles de zoom */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex items-center space-x-4 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
            <button
              onClick={handleZoomOut}
              disabled={scale <= 1}
              className="p-2 hover:bg-white/20 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
              </svg>
            </button>

            <span className="text-white text-sm font-medium min-w-[4rem] text-center">
              {Math.round(scale * 100)}%
            </span>

            <button
              onClick={handleZoomIn}
              disabled={scale >= 4}
              className="p-2 hover:bg-white/20 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>

          {/* Instrucciones */}
          <div className="absolute top-20 left-1/2 transform -translate-x-1/2 text-white/60 text-sm backdrop-blur-sm bg-black/20 px-4 py-2 rounded-full hidden sm:block">
            {scale > 1 ? 'Arrastra para mover' : 'Rueda del mouse para zoom'}
          </div>

          {/* Instrucciones Mobile */}
          <div className="absolute top-20 left-1/2 transform -translate-x-1/2 text-white/60 text-sm backdrop-blur-sm bg-black/20 px-4 py-2 rounded-full sm:hidden">
            {scale > 1 ? 'Arrastra para mover' : 'Pellizca para hacer zoom'}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

