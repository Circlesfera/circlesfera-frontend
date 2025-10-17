# Performance Optimization Utilities

Este directorio contiene utilidades optimizadas para mejorar el rendimiento de la aplicación CircleSfera.

## 🚀 Componentes Optimizados

### OptimizedImage
Componente de imagen optimizado con lazy loading, placeholders y manejo de errores.

```tsx
import { OptimizedImage } from '@/shared/performance';

<OptimizedImage
  src="/image.jpg"
  alt="Descripción"
  width={500}
  height={300}
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,..."
  priority={false}
/>
```

### VirtualizedList
Lista virtualizada para renderizar grandes cantidades de datos de manera eficiente.

```tsx
import { VirtualizedList } from '@/shared/performance';

<VirtualizedList
  items={posts}
  itemHeight={200}
  containerHeight={600}
  renderItem={(post, index) => <PostCard key={index} post={post} />}
/>
```

### OptimizedLoader
Componente de carga optimizado con múltiples variantes.

```tsx
import { OptimizedLoader } from '@/shared/performance';

<OptimizedLoader
  variant="spinner"
  size="lg"
  text="Cargando posts..."
  fullScreen={false}
/>
```

## 🔧 Hooks de Rendimiento

### useVirtualization
Hook para virtualización de listas grandes.

```tsx
import { useVirtualization } from '@/shared/performance';

const { visibleItems, totalHeight, offsetY, scrollToIndex } = useVirtualization(
  items.length,
  { itemHeight: 200, containerHeight: 600 }
);
```

### useOptimizedQuery
Hook para consultas de API optimizadas con cache y retry automático.

```tsx
import { useOptimizedQuery } from '@/shared/performance';

const { data, loading, error, refetch } = useOptimizedQuery(
  'posts',
  () => api.getPosts(),
  {
    staleTime: 5 * 60 * 1000, // 5 minutos
    cacheTime: 10 * 60 * 1000, // 10 minutos
    retry: 3
  }
);
```

### useOptimizedForm
Hook para formularios optimizados con validación debounced.

```tsx
import { useOptimizedForm } from '@/shared/performance';

const { values, errors, setValue, handleSubmit, isValid } = useOptimizedForm({
  initialValues: { email: '', password: '' },
  validate: (values) => {
    const errors = {};
    if (!values.email) errors.email = 'Email requerido';
    return errors;
  },
  onSubmit: async (values) => {
    await api.login(values);
  }
});
```

### useDebounce
Hook para debounce de valores.

```tsx
import { useDebounce } from '@/shared/performance';

const [searchQuery, setSearchQuery] = useState('');
const debouncedQuery = useDebounce(searchQuery, 300);
```

### useThrottle
Hook para throttling de funciones.

```tsx
import { useThrottle } from '@/shared/performance';

const throttledScroll = useThrottle(handleScroll, 100);
```

## 🛠️ Utilidades de Rendimiento

### performanceUtils
Utilidades generales para optimización de rendimiento.

```tsx
import { performanceUtils } from '@/shared/performance';

// Medir rendimiento de componentes
performanceUtils.measureComponent('PostCard', () => {
  // Código del componente
});

// Throttling manual
const throttledFunction = performanceUtils.throttle(myFunction, 1000);

// Debounce manual
const debouncedFunction = performanceUtils.debounce(myFunction, 300);

// Memoización
const memoizedFunction = performanceUtils.memoize(expensiveFunction);

// Lazy loading de imágenes
performanceUtils.lazyLoadImage(imgElement, 'image.jpg');

// Preload de recursos
performanceUtils.preloadResource('/critical.css', 'style');

// Medir Core Web Vitals
performanceUtils.measureWebVitals();
```

## 📊 Mejores Prácticas

### 1. Uso de Memoización
- Usa `React.memo` para componentes que reciben props estables
- Usa `useMemo` para cálculos costosos
- Usa `useCallback` para funciones que se pasan como props

### 2. Virtualización
- Usa `VirtualizedList` para listas con más de 100 elementos
- Implementa lazy loading para imágenes fuera del viewport
- Usa `useVirtualization` para casos personalizados

### 3. Optimización de Imágenes
- Usa `OptimizedImage` en lugar de `<img>` estándar
- Implementa placeholders y blur effects
- Usa `priority` solo para imágenes above-the-fold

### 4. Gestión de Estado
- Usa `useOptimizedQuery` para datos de API
- Implementa cache local con `useOptimizedForm`
- Usa debounce para búsquedas y validaciones

### 5. Monitoreo de Rendimiento
- Implementa `performanceUtils.measureWebVitals()`
- Usa `performanceUtils.measureComponent()` para debugging
- Monitorea Core Web Vitals en producción

## 🎯 Objetivos de Rendimiento

- **First Contentful Paint (FCP)**: < 1.8s
- **Largest Contentful Paint (LCP)**: < 2.5s
- **First Input Delay (FID)**: < 100ms
- **Cumulative Layout Shift (CLS)**: < 0.1
- **Time to Interactive (TTI)**: < 3.8s

## 🔍 Debugging

Para debugging de rendimiento:

1. Usa React DevTools Profiler
2. Implementa `performanceUtils.measureComponent()`
3. Monitorea Core Web Vitals
4. Usa Lighthouse para auditorías completas

## 📚 Referencias

- [React Performance](https://react.dev/learn/render-and-commit)
- [Next.js Performance](https://nextjs.org/docs/advanced-features/measuring-performance)
- [Web Vitals](https://web.dev/vitals/)
- [Virtualization](https://react-window.now.sh/)
