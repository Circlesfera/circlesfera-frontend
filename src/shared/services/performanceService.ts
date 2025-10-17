/**
 * Servicio de performance para el frontend
 * Monitorea métricas de performance y optimiza la experiencia del usuario
 */

interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  memoryUsage: number;
  networkRequests: number;
  errors: number;
  timestamp: string;
}

interface WebVitals {
  FCP?: number; // First Contentful Paint
  LCP?: number; // Largest Contentful Paint
  FID?: number; // First Input Delay
  CLS?: number; // Cumulative Layout Shift
  TTFB?: number; // Time to First Byte
}

class PerformanceService {
  private metrics: PerformanceMetrics[] = [];
  private vitals: WebVitals = {};
  private observers: PerformanceObserver[] = [];
  private isInitialized = false;

  /**
   * Inicializar el servicio de performance
   */
  init(): void {
    if (this.isInitialized) return;

    this.setupPerformanceObserver();
    this.setupWebVitals();
    this.setupMemoryMonitoring();
    this.setupErrorTracking();

    this.isInitialized = true;
  }

  /**
   * Configurar observer de performance
   */
  private setupPerformanceObserver(): void {
    if (typeof window === 'undefined' || !('PerformanceObserver' in window)) return;

    try {
      // Observer para navigation timing
      const navigationObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'navigation') {
            const navEntry = entry as PerformanceNavigationTiming;
            this.recordNavigationMetrics(navEntry);
          }
        }
      });

      navigationObserver.observe({ entryTypes: ['navigation'] });
      this.observers.push(navigationObserver);

      // Observer para resource timing
      const resourceObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'resource') {
            const resourceEntry = entry as PerformanceResourceTiming;
            this.recordResourceMetrics(resourceEntry);
          }
        }
      });

      resourceObserver.observe({ entryTypes: ['resource'] });
      this.observers.push(resourceObserver);

      // Observer para paint timing
      const paintObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'paint') {
            const paintEntry = entry as PerformancePaintTiming;
            this.recordPaintMetrics(paintEntry);
          }
        }
      });

      paintObserver.observe({ entryTypes: ['paint'] });
      this.observers.push(paintObserver);
    } catch (error) {
      console.error('Error setting up performance observer:', error);
    }
  }

  /**
   * Configurar Web Vitals
   */
  private setupWebVitals(): void {
    // First Contentful Paint
    this.measureFCP();

    // Largest Contentful Paint
    this.measureLCP();

    // First Input Delay
    this.measureFID();

    // Cumulative Layout Shift
    this.measureCLS();
  }

  /**
   * Medir First Contentful Paint
   */
  private measureFCP(): void {
    if (typeof window === 'undefined' || !('PerformanceObserver' in window)) return;

    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.name === 'first-contentful-paint') {
            this.vitals.FCP = entry.startTime;
            observer.disconnect();
          }
        }
      });

      observer.observe({ entryTypes: ['paint'] });
    } catch (error) {
      console.error('Error measuring FCP:', error);
    }
  }

  /**
   * Medir Largest Contentful Paint
   */
  private measureLCP(): void {
    if (typeof window === 'undefined' || !('PerformanceObserver' in window)) return;

    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        if (lastEntry) {
          this.vitals.LCP = lastEntry.startTime;
        }
      });

      observer.observe({ entryTypes: ['largest-contentful-paint'] });
    } catch (error) {
      console.error('Error measuring LCP:', error);
    }
  }

  /**
   * Medir First Input Delay
   */
  private measureFID(): void {
    if (typeof window === 'undefined' || !('PerformanceObserver' in window)) return;

    try {
      const observer = new PerformanceObserver((list) => {
        for (const _entry of list.getEntries()) {
          const entry = _entry as unknown as Record<string, unknown>; // PerformanceEventTiming no está disponible en todos los navegadores
          if (entry.processingStart && entry.startTime) {
            this.vitals.FID = (entry.processingStart as number) - (entry.startTime as number);
            observer.disconnect();
          }
        }
      });

      observer.observe({ entryTypes: ['first-input'] });
    } catch (error) {
      console.error('Error measuring FID:', error);
    }
  }

  /**
   * Medir Cumulative Layout Shift
   */
  private measureCLS(): void {
    if (typeof window === 'undefined' || !('PerformanceObserver' in window)) return;

    try {
      let clsValue = 0;
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const layoutEntry = entry as unknown as Record<string, unknown>;
          if (!layoutEntry.hadRecentInput) {
            clsValue += (layoutEntry.value as number) || 0;
          }
        }
        this.vitals.CLS = clsValue;
      });

      observer.observe({ entryTypes: ['layout-shift'] });
    } catch (error) {
      console.error('Error measuring CLS:', error);
    }
  }

  /**
   * Configurar monitoreo de memoria
   */
  private setupMemoryMonitoring(): void {
    if (typeof window === 'undefined' || !('memory' in performance)) return;

    setInterval(() => {
      const memory = (performance as unknown as Record<string, unknown>).memory;
      if (memory) {
        this.recordMemoryUsage(memory as Record<string, unknown>);
      }
    }, 30000); // Cada 30 segundos
  }

  /**
   * Configurar tracking de errores
   */
  private setupErrorTracking(): void {
    if (typeof window === 'undefined') return;

    window.addEventListener('error', (event) => {
      this.recordError(event.error);
    });

    window.addEventListener('unhandledrejection', (event) => {
      this.recordError(event.reason);
    });
  }

  /**
   * Registrar métricas de navegación
   */
  private recordNavigationMetrics(entry: PerformanceNavigationTiming): void {
    const metrics: PerformanceMetrics = {
      loadTime: entry.loadEventEnd - entry.fetchStart,
      renderTime: entry.domContentLoadedEventEnd - entry.domContentLoadedEventStart,
      memoryUsage: this.getMemoryUsage(),
      networkRequests: 0, // Se actualizará con resource metrics
      errors: 0, // Se actualizará con error tracking
      timestamp: new Date().toISOString(),
    };

    this.metrics.push(metrics);
  }

  /**
   * Registrar métricas de recursos
   */
  private recordResourceMetrics(_entry: PerformanceResourceTiming): void {
    // Incrementar contador de requests de red
    const latestMetric = this.metrics[this.metrics.length - 1];
    if (latestMetric) {
      latestMetric.networkRequests++;
    }
  }

  /**
   * Registrar métricas de paint
   */
  private recordPaintMetrics(_entry: PerformancePaintTiming): void {
    // Las métricas de paint se manejan en Web Vitals
  }

  /**
   * Registrar uso de memoria
   */
  private recordMemoryUsage(memory: Record<string, unknown>): void {
    const latestMetric = this.metrics[this.metrics.length - 1];
    if (latestMetric) {
      latestMetric.memoryUsage = (memory.usedJSHeapSize as number) / 1024 / 1024; // MB
    }
  }

  /**
   * Registrar error
   */
  private recordError(error: Error): void {
    const latestMetric = this.metrics[this.metrics.length - 1];
    if (latestMetric) {
      latestMetric.errors++;
    }

    console.error('Performance error recorded:', error);
  }

  /**
   * Obtener uso de memoria actual
   */
  private getMemoryUsage(): number {
    if (typeof window === 'undefined' || !('memory' in performance)) return 0;

    const memory = (performance as unknown as Record<string, unknown>).memory;
    return memory ? ((memory as Record<string, unknown>).usedJSHeapSize as number) / 1024 / 1024 : 0; // MB
  }

  /**
   * Obtener métricas de performance
   */
  getMetrics(): PerformanceMetrics[] {
    return [...this.metrics];
  }

  /**
   * Obtener Web Vitals
   */
  getWebVitals(): WebVitals {
    return { ...this.vitals };
  }

  /**
   * Obtener métricas promedio
   */
  getAverageMetrics(): Partial<PerformanceMetrics> {
    if (this.metrics.length === 0) return {};

    const totals = this.metrics.reduce(
      (acc, metric) => ({
        loadTime: acc.loadTime + metric.loadTime,
        renderTime: acc.renderTime + metric.renderTime,
        memoryUsage: acc.memoryUsage + metric.memoryUsage,
        networkRequests: acc.networkRequests + metric.networkRequests,
        errors: acc.errors + metric.errors,
      }),
      { loadTime: 0, renderTime: 0, memoryUsage: 0, networkRequests: 0, errors: 0 }
    );

    const count = this.metrics.length;

    return {
      loadTime: Math.round(totals.loadTime / count),
      renderTime: Math.round(totals.renderTime / count),
      memoryUsage: Math.round((totals.memoryUsage / count) * 100) / 100,
      networkRequests: Math.round(totals.networkRequests / count),
      errors: Math.round(totals.errors / count),
    };
  }

  /**
   * Verificar si el performance es bueno
   */
  isGoodPerformance(): boolean {
    const vitals = this.getWebVitals();

    // Criterios de performance buena
    const goodFCP = !vitals.FCP || vitals.FCP < 1800; // < 1.8s
    const goodLCP = !vitals.LCP || vitals.LCP < 2500; // < 2.5s
    const goodFID = !vitals.FID || vitals.FID < 100; // < 100ms
    const goodCLS = !vitals.CLS || vitals.CLS < 0.1; // < 0.1

    return goodFCP && goodLCP && goodFID && goodCLS;
  }

  /**
   * Limpiar observers
   */
  cleanup(): void {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
    this.metrics = [];
    this.vitals = {};
    this.isInitialized = false;
  }

  /**
   * Exportar métricas para análisis
   */
  exportMetrics(): string {
    return JSON.stringify({
      metrics: this.metrics,
      vitals: this.vitals,
      averages: this.getAverageMetrics(),
      isGoodPerformance: this.isGoodPerformance(),
    }, null, 2);
  }
}

// Singleton instance
export const performanceService = new PerformanceService();

// Auto-inicializar en el cliente
if (typeof window !== 'undefined') {
  performanceService.init();
}
