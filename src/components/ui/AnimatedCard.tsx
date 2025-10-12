"use client";

import React from 'react';
import { motion, MotionProps } from 'framer-motion';

interface AnimatedCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'fade';
  hover?: boolean;
  tap?: boolean;
  className?: string;
}

const directionVariants = {
  up: { y: 20, opacity: 0 },
  down: { y: -20, opacity: 0 },
  left: { x: 20, opacity: 0 },
  right: { x: -20, opacity: 0 },
  fade: { opacity: 0 }
};

export default function AnimatedCard({
  children,
  delay = 0,
  duration = 0.3,
  direction = 'fade',
  hover = true,
  tap = true,
  className = '',
  ...props
}: AnimatedCardProps) {
  const motionProps: MotionProps = {
    initial: directionVariants[direction],
    animate: { x: 0, y: 0, opacity: 1 },
    transition: {
      duration,
      delay,
      ease: [0.25, 0.46, 0.45, 0.94] // easeOutQuart
    },
    whileHover: hover ? {
      y: -2,
      scale: 1.02,
      transition: { duration: 0.2 }
    } : undefined,
    whileTap: tap ? {
      scale: 0.98,
      transition: { duration: 0.1 }
    } : undefined,
    className: `bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 ${className}`
  };

  return (
    <motion.div {...motionProps} {...props}>
      {children}
    </motion.div>
  );
}

// Variante específica para posts
export function AnimatedPostCard({ children, index, ...props }: AnimatedCardProps & { index?: number }) {
  return (
    <AnimatedCard
      direction="up"
      delay={(index || 0) * 0.1}
      duration={0.4}
      className="border border-gray-200 dark:border-gray-700"
      {...props}
    >
      {children}
    </AnimatedCard>
  );
}

// Variante para stories
export function AnimatedStoryCard({ children, index, ...props }: AnimatedCardProps & { index?: number }) {
  return (
    <AnimatedCard
      direction="right"
      delay={(index || 0) * 0.05}
      duration={0.3}
      className="flex-shrink-0"
      {...props}
    >
      {children}
    </AnimatedCard>
  );
}
