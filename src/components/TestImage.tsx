"use client";

import React from 'react';

interface TestImageProps {
  src: string;
  alt: string;
}

export default function TestImage({ src, alt }: TestImageProps) {
  return (
    <div className="w-full h-full">
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-cover"
        onLoad={() => console.log('✅ Image loaded successfully:', src)}
        onError={(e) => console.error('❌ Image failed to load:', src, e)}
        style={{ border: '2px solid red' }} // Para debug visual
      />
    </div>
  );
}
