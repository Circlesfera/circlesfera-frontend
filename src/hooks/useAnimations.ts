"use client";

import { useInView } from 'framer-motion';
import { useRef } from 'react';

// Animaciones predefinidas
export const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.3, ease: 'easeOut' }
};

export const fadeInDown = {
  initial: { opacity: 0, y: -20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 20 },
  transition: { duration: 0.3, ease: 'easeOut' }
};

export const fadeInLeft = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 },
  transition: { duration: 0.3, ease: 'easeOut' }
};

export const fadeInRight = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
  transition: { duration: 0.3, ease: 'easeOut' }
};

export const scaleIn = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.9 },
  transition: { duration: 0.2, ease: 'easeOut' }
};

export const slideInFromBottom = {
  initial: { opacity: 0, y: 100 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 100 },
  transition: { duration: 0.4, ease: 'easeOut' }
};

export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export const staggerItem = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3, ease: 'easeOut' }
};

// Hook para animaciones cuando el elemento entra en vista
export const useInViewAnimation = (threshold = 0.1) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { 
    once: true, 
    threshold,
    margin: '0px 0px -100px 0px'
  });

  return { ref, isInView };
};

// Hook para animaciones de hover
export const useHoverAnimation = () => {
  return {
    whileHover: { scale: 1.02 },
    whileTap: { scale: 0.98 },
    transition: { duration: 0.2, ease: 'easeInOut' }
  };
};

// Hook para animaciones de botones
export const useButtonAnimation = () => {
  return {
    whileHover: { 
      scale: 1.05,
      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
    },
    whileTap: { scale: 0.95 },
    transition: { duration: 0.2, ease: 'easeInOut' }
  };
};

// Hook para animaciones de cards
export const useCardAnimation = () => {
  return {
    whileHover: { 
      y: -5,
      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)'
    },
    transition: { duration: 0.3, ease: 'easeOut' }
  };
};

// Hook para animaciones de lista
export const useListAnimation = () => {
  return {
    initial: 'hidden',
    animate: 'visible',
    variants: {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          staggerChildren: 0.1
        }
      }
    }
  };
};

// Hook para animaciones de modal
export const useModalAnimation = () => {
  return {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.9 },
    transition: { duration: 0.2, ease: 'easeOut' }
  };
};

// Hook para animaciones de notificación
export const useNotificationAnimation = () => {
  return {
    initial: { opacity: 0, x: 300, scale: 0.8 },
    animate: { opacity: 1, x: 0, scale: 1 },
    exit: { opacity: 0, x: 300, scale: 0.8 },
    transition: { duration: 0.3, ease: 'easeOut' }
  };
};

// Hook para animaciones de loading
export const useLoadingAnimation = () => {
  return {
    animate: { rotate: 360 },
    transition: { duration: 1, repeat: Infinity, ease: 'linear' }
  };
};

// Hook para animaciones de skeleton
export const useSkeletonAnimation = () => {
  return {
    animate: { 
      backgroundPosition: '200% 0',
    },
    transition: { 
      duration: 1.5, 
      repeat: Infinity, 
      ease: 'linear' 
    }
  };
};
