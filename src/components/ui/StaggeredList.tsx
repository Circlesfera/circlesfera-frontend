"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface StaggeredListProps {
  children: React.ReactNode[];
  className?: string;
  staggerDelay?: number;
  animationType?: 'fadeUp' | 'fadeLeft' | 'fadeRight' | 'scale';
  duration?: number;
}

const animationVariants = {
  fadeUp: {
    initial: { y: 20, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: -20, opacity: 0 }
  },
  fadeLeft: {
    initial: { x: 20, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: -20, opacity: 0 }
  },
  fadeRight: {
    initial: { x: -20, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: 20, opacity: 0 }
  },
  scale: {
    initial: { scale: 0.8, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0.8, opacity: 0 }
  }
};

export default function StaggeredList({
  children,
  className = '',
  staggerDelay = 0.1,
  animationType = 'fadeUp',
  duration = 0.4
}: StaggeredListProps) {
  const variant = animationVariants[animationType];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: variant.initial,
    visible: variant.animate,
    exit: variant.exit
  };

  return (
    <motion.div
      className={className}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <AnimatePresence mode="popLayout">
        {children.map((child, index) => (
          <motion.div
            key={index}
            variants={itemVariants}
            layout
            layoutId={`staggered-item-${index}`}
          >
            {child}
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
}

// Componente específico para el feed de posts
export function AnimatedPostList({ posts, children }: { posts: any[], children: (post: any, index: number) => React.ReactNode }) {
  return (
    <StaggeredList
      className="space-y-6"
      staggerDelay={0.1}
      animationType="fadeUp"
      duration={0.5}
    >
      {posts.map((post, index) => children(post, index))}
    </StaggeredList>
  );
}

// Componente para stories horizontales
export function AnimatedStoryList({ stories, children }: { stories: any[], children: (story: any, index: number) => React.ReactNode }) {
  return (
    <StaggeredList
      className="flex space-x-4 overflow-x-auto scrollbar-hide"
      staggerDelay={0.05}
      animationType="fadeRight"
      duration={0.3}
    >
      {stories.map((story, index) => children(story, index))}
    </StaggeredList>
  );
}
