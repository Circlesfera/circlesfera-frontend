"use client";

import React, { Suspense, lazy, ComponentType } from 'react';
import { motion } from 'framer-motion';

interface LazyComponentProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  minHeight?: string;
  className?: string;
}

const DefaultFallback: React.FC<{ minHeight?: string; className?: string }> = ({
  minHeight = '200px',
  className = ''
}) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className={`flex items-center justify-center ${className}`}
    style={{ minHeight }}
  >
    <div className="text-center">
      <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-gray-500 text-sm">Cargando...</p>
    </div>
  </motion.div>
);

const LazyComponent: React.FC<LazyComponentProps> = ({
  children,
  fallback,
  minHeight,
  className,
}) => {
  return (
    <Suspense fallback={fallback || <DefaultFallback {...(minHeight && { minHeight })} {...(className && { className })} />}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={className}
      >
        {children}
      </motion.div>
    </Suspense>
  );
};

// Función helper para crear componentes lazy
export const createLazyComponent = <P extends object>(
  importFunc: () => Promise<{ default: ComponentType<P> }>,
  fallback?: React.ReactNode
) => {
  const LazyComponent = lazy(importFunc);

  const ForwardedComponent = React.forwardRef<HTMLElement, P>((props, ref) => (
    <Suspense fallback={fallback || <DefaultFallback />}>
      <LazyComponent {...props} ref={ref} />
    </Suspense>
  ));

  ForwardedComponent.displayName = `LazyComponent(Component)`;

  return ForwardedComponent;
};

// Componentes lazy predefinidos
export const LazyPostCard = createLazyComponent(
  () => import('./PostCard'),
  <DefaultFallback minHeight="400px" />
);

export const LazyUserSuggestions = createLazyComponent(
  () => import('./UserSuggestions'),
  <DefaultFallback minHeight="200px" />
);

export const LazyNotificationList = createLazyComponent(
  () => import('./NotificationList'),
  <DefaultFallback minHeight="300px" />
);

export const LazyChatWindow = createLazyComponent(
  () => import('./ChatWindow'),
  <DefaultFallback minHeight="500px" />
);

export default LazyComponent;
