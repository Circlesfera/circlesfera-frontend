/**
 * 🚀 Performance Hook - Monitoreo de Performance Frontend
 * =====================================================
 * Hook para monitorear y optimizar performance del frontend
 */

import { useEffect, useRef, useCallback, useState } from 'react'
import { useRouter } from 'next/navigation'

interface PerformanceMetrics {
  pageLoadTime: number
  firstContentfulPaint: number
  largestContentfulPaint: number
  firstInputDelay: number
  cumulativeLayoutShift: number
  timeToInteractive: number
  bundleSize: number
  renderTime: number
}

interface PerformanceConfig {
  enableWebVitals: boolean
  enableBundleAnalysis: boolean
  enableRenderTracking: boolean
  slowThreshold: number
  reportEndpoint?: string
}

const defaultConfig: PerformanceConfig = {
  enableWebVitals: true,
  enableBundleAnalysis: true,
  enableRenderTracking: true,
  slowThreshold: 2000, // 2 segundos
  reportEndpoint: '/api/performance'
}

export const usePerformance = (config: Partial<PerformanceConfig> = {}) => {
  const router = useRouter()
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null)
  const [isSlow, setIsSlow] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const configRef = useRef({ ...defaultConfig, ...config })
  const startTimeRef = useRef<number>(Date.now())
  const renderStartRef = useRef<number>(0)
  const renderEndRef = useRef<number>(0)

  // Medir tiempo de renderizado
  const measureRender = useCallback((componentName: string) => {
    if (!configRef.current.enableRenderTracking) return

    const renderTime = renderEndRef.current - renderStartRef.current

    if (renderTime > 16) { // Más de 16ms (60fps)
      console.warn(`Slow render detected: ${componentName} took ${renderTime}ms`)
    }

    return renderTime
  }, [])

  // Medir tiempo de navegación
  const measureNavigation = useCallback((url: string) => {
    const navigationStart = performance.now()

    return () => {
      const navigationTime = performance.now() - navigationStart

      if (navigationTime > configRef.current.slowThreshold) {
        console.warn(`Slow navigation detected: ${url} took ${navigationTime}ms`)
      }

      return navigationTime
    }
  }, [])

  // Medir tiempo de API calls
  const measureApiCall = useCallback((endpoint: string) => {
    const startTime = performance.now()

    return (response: any) => {
      const duration = performance.now() - startTime

      if (duration > 1000) { // Más de 1 segundo
        console.warn(`Slow API call detected: ${endpoint} took ${duration}ms`)
      }

      return { duration, response }
    }
  }, [])

  // Medir tiempo de bundle loading
  const measureBundleLoad = useCallback(() => {
    if (!configRef.current.enableBundleAnalysis) return

    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming

    if (navigation) {
      const bundleSize = navigation.transferSize || 0
      const loadTime = navigation.loadEventEnd - navigation.fetchStart

      setMetrics(prev => ({
        ...prev,
        bundleSize,
        pageLoadTime: loadTime
      } as PerformanceMetrics))
    }
  }, [])

  // Medir Web Vitals
  const measureWebVitals = useCallback(() => {
    if (!configRef.current.enableWebVitals) return

    // First Contentful Paint
    const fcpEntry = performance.getEntriesByName('first-contentful-paint')[0]
    if (fcpEntry) {
      setMetrics(prev => ({
        ...prev,
        firstContentfulPaint: fcpEntry.startTime
      } as PerformanceMetrics))
    }

    // Largest Contentful Paint
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      const lastEntry = entries[entries.length - 1]

      if (lastEntry) {
        setMetrics(prev => ({
          ...prev,
          largestContentfulPaint: lastEntry.startTime
        } as PerformanceMetrics))
      }
    })

    lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })

    // First Input Delay
    const fidObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      entries.forEach((entry: any) => {
        setMetrics(prev => ({
          ...prev,
          firstInputDelay: entry.processingStart - entry.startTime
        } as PerformanceMetrics))
      })
    })

    fidObserver.observe({ entryTypes: ['first-input'] })

    // Cumulative Layout Shift
    let clsValue = 0
    const clsObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      entries.forEach((entry: any) => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value
        }
      })

      setMetrics(prev => ({
        ...prev,
        cumulativeLayoutShift: clsValue
      } as PerformanceMetrics))
    })

    clsObserver.observe({ entryTypes: ['layout-shift'] })

    // Time to Interactive
    const ttiObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      const lastEntry = entries[entries.length - 1]

      if (lastEntry) {
        setMetrics(prev => ({
          ...prev,
          timeToInteractive: lastEntry.startTime
        } as PerformanceMetrics))
      }
    })

    ttiObserver.observe({ entryTypes: ['measure'] })

    // Cleanup
    return () => {
      lcpObserver.disconnect()
      fidObserver.disconnect()
      clsObserver.disconnect()
      ttiObserver.disconnect()
    }
  }, [])

  // Reportar métricas
  const reportMetrics = useCallback(async (customMetrics?: Partial<PerformanceMetrics>) => {
    if (!configRef.current.reportEndpoint) return

    const finalMetrics = { ...metrics, ...customMetrics }

    try {
      await fetch(configRef.current.reportEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          metrics: finalMetrics,
          url: window.location.href,
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString()
        })
      })
    } catch (error) {
      console.error('Failed to report performance metrics:', error)
    }
  }, [metrics])

  // Optimizar imágenes
  const optimizeImage = useCallback((src: string, options: {
    width?: number
    height?: number
    quality?: number
    format?: 'webp' | 'avif' | 'jpeg' | 'png'
  } = {}) => {
    const { width, height, quality = 80, format = 'webp' } = options

    // Si es una imagen local, usar Next.js Image Optimization
    if (src.startsWith('/') || src.includes('localhost')) {
      return src
    }

    // Para imágenes externas, usar un servicio de optimización
    const params = new URLSearchParams()
    if (width) params.append('w', width.toString())
    if (height) params.append('h', height.toString())
    params.append('q', quality.toString())
    params.append('f', format)

    return `https://images.weserv.nl/?url=${encodeURIComponent(src)}&${params.toString()}`
  }, [])

  // Preload recursos críticos
  const preloadResource = useCallback((href: string, as: 'script' | 'style' | 'image' | 'font' | 'fetch') => {
    const link = document.createElement('link')
    link.rel = 'preload'
    link.href = href
    link.as = as

    if (as === 'font') {
      link.crossOrigin = 'anonymous'
    }

    document.head.appendChild(link)
  }, [])

  // Prefetch rutas
  const prefetchRoute = useCallback((href: string) => {
    router.prefetch(href)
  }, [router])

  // Lazy load componente
  const lazyLoadComponent = useCallback(async (importFn: () => Promise<any>) => {
    const startTime = performance.now()

    try {
      const component = await importFn()
      const loadTime = performance.now() - startTime

      if (loadTime > 1000) {
        console.warn(`Slow component load detected: ${loadTime}ms`)
      }

      return component
    } catch (error) {
      console.error('Failed to lazy load component:', error)
      throw error
    }
  }, [])

  // Detectar dispositivos lentos
  const detectSlowDevice = useCallback(() => {
    const connection = (navigator as any).connection
    const memory = (performance as any).memory

    const isSlowConnection = connection && (
      connection.effectiveType === 'slow-2g' ||
      connection.effectiveType === '2g' ||
      connection.downlink < 1
    )

    const isLowMemory = memory && memory.jsHeapSizeLimit < 100000000 // 100MB

    return isSlowConnection || isLowMemory
  }, [])

  // Optimizar para dispositivos lentos
  const optimizeForSlowDevice = useCallback(() => {
    const isSlow = detectSlowDevice()

    if (isSlow) {
      // Reducir calidad de imágenes
      document.documentElement.style.setProperty('--image-quality', '0.6')

      // Deshabilitar animaciones
      document.documentElement.style.setProperty('--animation-duration', '0s')

      // Reducir efectos visuales
      document.documentElement.style.setProperty('--blur-radius', '0px')
    }

    return isSlow
  }, [detectSlowDevice])

  // Efectos
  useEffect(() => {
    startTimeRef.current = Date.now()
    setIsLoading(true)

    // Medir métricas iniciales
    measureBundleLoad()
    const cleanup = measureWebVitals()

    // Marcar como cargado después de un delay
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 100)

    return () => {
      cleanup?.()
      clearTimeout(timer)
    }
  }, [measureBundleLoad, measureWebVitals])

  useEffect(() => {
    if (metrics) {
      const totalTime = metrics.pageLoadTime || 0
      setIsSlow(totalTime > configRef.current.slowThreshold)
    }
  }, [metrics])

  // Inicializar render tracking
  useEffect(() => {
    renderStartRef.current = performance.now()

    return () => {
      renderEndRef.current = performance.now()
    }
  })

  return {
    // Estado
    metrics,
    isSlow,
    isLoading,

    // Métricas
    measureRender,
    measureNavigation,
    measureApiCall,
    measureBundleLoad,
    measureWebVitals,

    // Optimización
    optimizeImage,
    preloadResource,
    prefetchRoute,
    lazyLoadComponent,
    detectSlowDevice,
    optimizeForSlowDevice,

    // Reportes
    reportMetrics,

    // Utilidades
    startTime: startTimeRef.current,
    config: configRef.current
  }
}

export default usePerformance
