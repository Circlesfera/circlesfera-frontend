'use client';

import { cva, type VariantProps } from 'class-variance-authority';
import type { ComponentPropsWithoutRef } from 'react';
import { forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';

const cardVariants = cva('card-base', {
  variants: {
    variant: {
      default: '',
      elevated: 'shadow-card hover:shadow-card-hover transition-shadow duration-300',
      glass: 'glass-dark',
      primary: 'glass-primary'
    },
    interactive: {
      true: 'card-interactive',
      false: ''
    },
    padding: {
      none: 'p-0',
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8'
    }
  },
  defaultVariants: {
    variant: 'default',
    interactive: false,
    padding: 'md'
  }
} as const);

export type CardProps = ComponentPropsWithoutRef<'div'> & VariantProps<typeof cardVariants>;

/**
 * Componente Card estilizado con diseño profesional.
 * Soporta variantes, estados interactivos y diferentes niveles de padding.
 */
export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, interactive, padding, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={twMerge(cardVariants({ variant, interactive, padding }), className)}
        {...props}
      />
    );
  }
);

Card.displayName = 'Card';

export type CardHeaderProps = ComponentPropsWithoutRef<'div'>;

export const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={twMerge('flex flex-col space-y-1.5 pb-4', className)}
        {...props}
      />
    );
  }
);

CardHeader.displayName = 'CardHeader';

type HeadingTag = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

type HeadingProps = ComponentPropsWithoutRef<'h3'>;

export type CardTitleProps = HeadingProps & {
  readonly as?: HeadingTag;
};

export const CardTitle = forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ className, as: Component = 'h3', ...props }, ref) => {
    const Tag = Component;
    return (
      <Tag
        ref={ref}
        className={twMerge('text-xl font-semibold leading-none tracking-tight text-foreground', className)}
        {...props}
      />
    );
  }
);

CardTitle.displayName = 'CardTitle';

export type CardDescriptionProps = ComponentPropsWithoutRef<'p'>;

export const CardDescription = forwardRef<HTMLParagraphElement, CardDescriptionProps>(
  ({ className, ...props }, ref) => {
    return (
      <p
        ref={ref}
        className={twMerge('text-sm text-foreground-muted', className)}
        {...props}
      />
    );
  }
);

CardDescription.displayName = 'CardDescription';

export type CardContentProps = ComponentPropsWithoutRef<'div'>;

export const CardContent = forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, ...props }, ref) => {
    return (
      <div ref={ref} className={twMerge('', className)} {...props} />
    );
  }
);

CardContent.displayName = 'CardContent';

export type CardFooterProps = ComponentPropsWithoutRef<'div'>;

export const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={twMerge('flex items-center pt-4', className)}
        {...props}
      />
    );
  }
);

CardFooter.displayName = 'CardFooter';
