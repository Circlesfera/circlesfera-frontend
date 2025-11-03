/**
 * Configuración centralizada de Framer Motion
 * Presets y variantes reusables para animaciones consistentes
 */

import type { Variants } from 'framer-motion';

/**
 * Configuraciones de transición estándar
 * Usando timing functions naturales (easeOut suave)
 */
export const motionTransitions = {
  smooth: {
    type: 'tween',
    duration: 0.3,
    ease: [0.4, 0, 0.2, 1] // easeOut cubic-bezier
  },
  gentle: {
    type: 'tween',
    duration: 0.4,
    ease: [0.4, 0, 0.2, 1]
  },
  quick: {
    type: 'tween',
    duration: 0.2,
    ease: [0.4, 0, 0.2, 1]
  },
  spring: {
    type: 'spring',
    stiffness: 300,
    damping: 30,
    mass: 0.8
  },
  springGentle: {
    type: 'spring',
    stiffness: 200,
    damping: 25,
    mass: 1
  }
} as const;

/**
 * Variantes estándar de fade-in
 */
export const fadeVariants: Variants = {
  hidden: {
    opacity: 0
  },
  visible: {
    opacity: 1,
    transition: motionTransitions.smooth
  }
};

/**
 * Variantes de fade-in con movimiento vertical
 */
export const fadeUpVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 20
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: motionTransitions.gentle
  }
};

/**
 * Variantes de fade-in con movimiento horizontal
 */
export const fadeInRightVariants: Variants = {
  hidden: {
    opacity: 0,
    x: -20
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: motionTransitions.smooth
  }
};

export const fadeInLeftVariants: Variants = {
  hidden: {
    opacity: 0,
    x: 20
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: motionTransitions.smooth
  }
};

/**
 * Variantes de scale-in
 */
export const scaleVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.95
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: motionTransitions.spring
  }
};

/**
 * Variantes para elementos de lista (stagger children)
 */
export const staggerContainer: Variants = {
  hidden: {
    opacity: 0
  },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1
    }
  }
};

export const staggerItem: Variants = {
  hidden: {
    opacity: 0,
    y: 20
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: motionTransitions.smooth
  }
};

/**
 * Variantes para hover states
 */
export const hoverScale: Variants = {
  rest: {
    scale: 1,
    transition: motionTransitions.quick
  },
  hover: {
    scale: 1.02,
    transition: motionTransitions.quick
  }
};

export const hoverLift: Variants = {
  rest: {
    y: 0,
    boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.3)',
    transition: motionTransitions.smooth
  },
  hover: {
    y: -4,
    boxShadow: '0 8px 32px -4px rgba(0, 0, 0, 0.4)',
    transition: motionTransitions.smooth
  }
};

/**
 * Variantes para botones y elementos interactivos
 */
export const buttonVariants: Variants = {
  rest: {
    scale: 1,
    transition: motionTransitions.quick
  },
  hover: {
    scale: 1.05,
    transition: motionTransitions.quick
  },
  tap: {
    scale: 0.98,
    transition: motionTransitions.quick
  }
};

/**
 * Variantes para modales y dialogs
 */
export const modalVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
    y: 20
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: motionTransitions.spring
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 20,
    transition: motionTransitions.quick
  }
};

export const overlayVariants: Variants = {
  hidden: {
    opacity: 0
  },
  visible: {
    opacity: 1,
    transition: motionTransitions.smooth
  },
  exit: {
    opacity: 0,
    transition: motionTransitions.quick
  }
};

/**
 * Variantes para transiciones de página
 */
export const pageVariants: Variants = {
  initial: {
    opacity: 0,
    y: 20
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: motionTransitions.gentle
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: motionTransitions.quick
  }
};

/**
 * Variantes para cards con efecto glassmorphism
 */
export const cardVariants: Variants = {
  rest: {
    scale: 1,
    boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.3)',
    transition: motionTransitions.smooth
  },
  hover: {
    scale: 1.01,
    boxShadow: '0 8px 32px -4px rgba(0, 0, 0, 0.4)',
    transition: motionTransitions.smooth
  }
};

/**
 * Variantes para elementos de loading
 */
export const loadingVariants: Variants = {
  animate: {
    scale: [1, 1.1, 1],
    opacity: [0.7, 1, 0.7],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: 'easeInOut'
    }
  }
};

/**
 * Hook helper para crear variantes personalizadas con delay
 */
export const createDelayedVariants = (
  baseVariants: Variants,
  delay: number
): Variants => {
  return {
    ...baseVariants,
    visible: {
      ...baseVariants.visible,
      transition: {
        ...(baseVariants.visible?.transition as object),
        delay
      }
    }
  };
};

