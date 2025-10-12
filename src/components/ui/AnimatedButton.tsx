"use client";

import React from 'react';
import { motion } from 'framer-motion';

interface AnimatedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  ripple?: boolean;
  className?: string;
}

const variants = {
  primary: 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl',
  secondary: 'bg-gray-600 hover:bg-gray-700 text-white shadow-lg hover:shadow-xl',
  ghost: 'bg-transparent hover:bg-gray-100 text-gray-700',
  danger: 'bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-xl'
};

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg'
};

export default function AnimatedButton({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  iconPosition = 'left',
  ripple = true,
  className = '',
  disabled,
  ...props
}: AnimatedButtonProps) {
  const baseClasses = `
    relative overflow-hidden rounded-lg font-medium transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
    ${variants[variant]}
    ${sizes[size]}
    ${className}
  `.trim();

  const motionProps = {
    whileHover: !disabled && !loading ? {
      scale: 1.02,
      transition: { duration: 0.2 }
    } : undefined,
    whileTap: !disabled && !loading ? {
      scale: 0.98,
      transition: { duration: 0.1 }
    } : undefined,
    disabled: disabled || loading
  };

  // Filtrar props que pueden causar conflictos con motion
  const {
    style: _style,
    onAnimationStart: _onAnimationStart,
    onAnimationEnd: _onAnimationEnd,
    onAnimationIteration: _onAnimationIteration,
    onDrag: _onDrag,
    onDragStart: _onDragStart,
    onDragEnd: _onDragEnd,
    ...buttonProps
  } = props;

  return (
    <motion.button
      whileHover={motionProps.whileHover || {}}
      whileTap={motionProps.whileTap || {}}
      disabled={motionProps.disabled}
      className={baseClasses}
      {...buttonProps}
    >
      {/* Ripple effect */}
      {ripple && (
        <motion.div
          className="absolute inset-0 bg-white/20 rounded-lg"
          initial={{ scale: 0, opacity: 0 }}
          whileTap={{
            scale: 1,
            opacity: [0, 0.3, 0],
            transition: { duration: 0.3 }
          }}
        />
      )}

      {/* Loading spinner */}
      {loading && (
        <motion.div
          className="absolute inset-0 flex items-center justify-center bg-inherit rounded-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
        </motion.div>
      )}

      {/* Button content */}
      <div className={`flex items-center justify-center gap-2 ${loading ? 'opacity-0' : ''}`}>
        {icon && iconPosition === 'left' && (
          <motion.span
            initial={{ x: -5, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            {icon}
          </motion.span>
        )}

        <span>{children}</span>

        {icon && iconPosition === 'right' && (
          <motion.span
            initial={{ x: 5, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            {icon}
          </motion.span>
        )}
      </div>
    </motion.button>
  );
}

// Botón con animación de pulso para acciones importantes
export function PulseButton(props: AnimatedButtonProps) {
  return (
    <motion.div
      animate={{
        scale: [1, 1.05, 1],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut'
      }}
    >
      <AnimatedButton {...props} />
    </motion.div>
  );
}

// Botón con efecto de gradiente animado
export function GradientButton(props: AnimatedButtonProps) {
  return (
    <motion.div
      className="relative overflow-hidden rounded-lg"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600"
        animate={{
          backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'linear'
        }}
        style={{
          backgroundSize: '200% 200%'
        }}
      />
      <div className="relative bg-transparent">
        <AnimatedButton {...props} className="bg-transparent hover:bg-transparent" />
      </div>
    </motion.div>
  );
}
