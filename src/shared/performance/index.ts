// Performance hooks
export { useVirtualization, useLazyData, useDebounce, useThrottle } from '@/hooks/useVirtualization';
export { useOptimizedQuery, useOptimizedPaginatedQuery, useOptimizedSearch } from '@/hooks/useOptimizedQuery';
export { useOptimizedForm, useFormField, useValidation } from '@/hooks/useOptimizedForm';

// Performance components
export { default as OptimizedImage } from '@/components/OptimizedImage';
export { default as VirtualizedList } from '@/components/VirtualizedList';
export { default as OptimizedLoader } from '@/components/OptimizedLoader';

// Performance utilities
export const performanceUtils = {
  // Función para medir el rendimiento de componentes
  measureComponent: (componentName: string, fn: () => void) => {
    const start = performance.now();
    fn();
    const end = performance.now();
    console.log(`${componentName} took ${end - start} milliseconds`);
  },

  // Función para throttling
  throttle: <T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): ((...args: Parameters<T>) => void) => {
    let inThrottle: boolean;
    return function (this: any, ...args: Parameters<T>) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  },

  // Función para debounce
  debounce: <T extends (...args: any[]) => any>(
    func: T,
    delay: number
  ): ((...args: Parameters<T>) => void) => {
    let timeoutId: NodeJS.Timeout;
    return function (this: any, ...args: Parameters<T>) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
  },

  // Función para memoización
  memoize: <T extends (...args: any[]) => any>(fn: T): T => {
    const cache = new Map();
    return ((...args: Parameters<T>) => {
      const key = JSON.stringify(args);
      if (cache.has(key)) {
        return cache.get(key);
      }
      const result = fn(...args);
      cache.set(key, result);
      return result;
    }) as T;
  },

  // Función para lazy loading de imágenes
  lazyLoadImage: (img: HTMLImageElement, src: string) => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          img.src = src;
          observer.unobserve(img);
        }
      });
    });
    observer.observe(img);
  },

  // Función para preload de recursos críticos
  preloadResource: (href: string, as: string) => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = href;
    link.as = as;
    document.head.appendChild(link);
  },

  // Función para medir Core Web Vitals
  measureWebVitals: () => {
    if (typeof window !== 'undefined') {
      import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
        getCLS(console.log);
        getFID(console.log);
        getFCP(console.log);
        getLCP(console.log);
        getTTFB(console.log);
      });
    }
  }
};
