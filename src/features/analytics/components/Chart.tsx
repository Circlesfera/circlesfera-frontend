'use client'

import { useRef, useEffect, useState } from 'react'
import { motion } from 'framer-motion'

interface ChartDataPoint {
  label: string
  value: number
  color?: string
  [key: string]: unknown
}

interface ChartProps {
  data: ChartDataPoint[]
  type: 'line' | 'bar' | 'pie' | 'doughnut' | 'area'
  title?: string
  subtitle?: string
  height?: number
  colors?: string[]
  className?: string
  showLegend?: boolean
  showGrid?: boolean
  showLabels?: boolean
  animation?: boolean
}

export function Chart({
  data,
  type,
  title,
  subtitle,
  height = 300,
  colors = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6'],
  className = '',
  showLegend = true,
  showGrid = true,
  showLabels = true,
  animation = true
}: ChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [dimensions, setDimensions] = useState({ width: 0, height })

  useEffect(() => {
    const updateDimensions = () => {
      if (canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect()
        setDimensions({ width: rect.width, height })
      }
    }

    updateDimensions()
    window.addEventListener('resize', updateDimensions)
    return () => window.removeEventListener('resize', updateDimensions)
  }, [height])

  useEffect(() => {
    if (!canvasRef.current || !data.length) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Establecer dimensiones del canvas
    canvas.width = dimensions.width * window.devicePixelRatio
    canvas.height = dimensions.height * window.devicePixelRatio
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio)

    // Limpiar canvas
    ctx.clearRect(0, 0, dimensions.width, dimensions.height)

    // Configurar estilos
    ctx.font = '12px Inter, sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'

    switch (type) {
      case 'line':
        drawLineChart(ctx, data, dimensions, colors, showGrid, showLabels, animation)
        break
      case 'bar':
        drawBarChart(ctx, data, dimensions, colors, showGrid, showLabels, animation)
        break
      case 'pie':
        drawPieChart(ctx, data, dimensions, colors, showLegend, animation)
        break
      case 'doughnut':
        drawDoughnutChart(ctx, data, dimensions, colors, showLegend, animation)
        break
      case 'area':
        drawAreaChart(ctx, data, dimensions, colors, showGrid, showLabels, animation)
        break
    }
  }, [data, type, dimensions, colors, showGrid, showLabels, showLegend, animation])

  if (!data.length) {
    return (
      <div className={`flex items-center justify-center ${className}`} style={{ height }}>
        <div className="text-center text-gray-500 dark:text-gray-400">
          <p>No hay datos disponibles</p>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 ${className}`}
    >
      {(title || subtitle) && (
        <div className="mb-6">
          {title && (
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
          )}
          {subtitle && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{subtitle}</p>
          )}
        </div>
      )}

      <div className="relative">
        <canvas
          ref={canvasRef}
          width={dimensions.width}
          height={dimensions.height}
          className="w-full h-full"
        />
      </div>
    </motion.div>
  )
}

// Función para dibujar gráfico de líneas
function drawLineChart(
  ctx: CanvasRenderingContext2D,
  data: ChartDataPoint[],
  dimensions: { width: number; height: number },
  colors: string[],
  showGrid: boolean,
  showLabels: boolean,
  animation: boolean
) {
  const { width, height } = dimensions
  const padding = 40
  const chartWidth = width - padding * 2
  const chartHeight = height - padding * 2

  // Encontrar valores mínimos y máximos
  const values = data.map(d => typeof d === 'object' ? d.value : d)
  const minValue = Math.min(...values)
  const maxValue = Math.max(...values)
  const range = maxValue - minValue || 1

  // Dibujar grid
  if (showGrid) {
    ctx.strokeStyle = '#E5E7EB'
    ctx.lineWidth = 1
    ctx.setLineDash([2, 2])

    // Líneas horizontales
    for (let i = 0; i <= 5; i++) {
      const y = padding + (chartHeight / 5) * i
      ctx.beginPath()
      ctx.moveTo(padding, y)
      ctx.lineTo(padding + chartWidth, y)
      ctx.stroke()
    }

    ctx.setLineDash([])
  }

  // Dibujar línea
  ctx.strokeStyle = colors[0] || '#3B82F6'
  ctx.lineWidth = 3
  ctx.beginPath()

  // Aplicar animación si está habilitada
  if (animation) {
    ctx.globalAlpha = 0.8
  }

  data.forEach((point, index) => {
    const value = typeof point === 'object' ? point.value : point
    const x = padding + (chartWidth / (data.length - 1)) * index
    const y = padding + chartHeight - ((value - minValue) / range) * chartHeight

    if (index === 0) {
      ctx.moveTo(x, y)
    } else {
      ctx.lineTo(x, y)
    }
  })

  ctx.stroke()

  // Dibujar puntos
  ctx.fillStyle = colors[0] || '#3B82F6'
  data.forEach((point, index) => {
    const value = typeof point === 'object' ? point.value : point
    const x = padding + (chartWidth / (data.length - 1)) * index
    const y = padding + chartHeight - ((value - minValue) / range) * chartHeight

    ctx.beginPath()
    ctx.arc(x, y, 4, 0, 2 * Math.PI)
    ctx.fill()
  })

  // Dibujar etiquetas
  if (showLabels) {
    ctx.fillStyle = '#6B7280'
    ctx.font = '11px Inter, sans-serif'
    ctx.textAlign = 'center'

    data.forEach((point, index) => {
      const value = typeof point === 'object' ? point.value : point
      const x = padding + (chartWidth / (data.length - 1)) * index

      ctx.fillText(value.toString(), x, padding + chartHeight + 20)
    })
  }
}

// Función para dibujar gráfico de barras
function drawBarChart(
  ctx: CanvasRenderingContext2D,
  data: ChartDataPoint[],
  dimensions: { width: number; height: number },
  colors: string[],
  showGrid: boolean,
  showLabels: boolean,
  animation: boolean
) {
  const { width, height } = dimensions
  const padding = 40
  const chartWidth = width - padding * 2
  const chartHeight = height - padding * 2

  // Encontrar valor máximo
  const values = data.map(d => typeof d === 'object' ? d.value : d)
  const maxValue = Math.max(...values)

  // Dibujar grid
  if (showGrid) {
    ctx.strokeStyle = '#E5E7EB'
    ctx.lineWidth = 1
    ctx.setLineDash([2, 2])

    for (let i = 0; i <= 5; i++) {
      const y = padding + (chartHeight / 5) * i
      ctx.beginPath()
      ctx.moveTo(padding, y)
      ctx.lineTo(padding + chartWidth, y)
      ctx.stroke()
    }

    ctx.setLineDash([])
  }

  // Dibujar barras
  const barWidth = chartWidth / data.length * 0.8
  const barSpacing = chartWidth / data.length * 0.2

  // Aplicar animación si está habilitada
  if (animation) {
    ctx.globalAlpha = 0.8
  }

  data.forEach((point, index) => {
    const value = typeof point === 'object' ? point.value : point
    const barHeight = (value / maxValue) * chartHeight
    const x = padding + (chartWidth / data.length) * index + barSpacing / 2
    const y = padding + chartHeight - barHeight

    ctx.fillStyle = colors[index % colors.length] || '#3B82F6'
    ctx.fillRect(x, y, barWidth, barHeight)
  })

  // Dibujar etiquetas
  if (showLabels) {
    ctx.fillStyle = '#6B7280'
    ctx.font = '11px Inter, sans-serif'
    ctx.textAlign = 'center'

    data.forEach((point, index) => {
      const value = typeof point === 'object' ? point.value : point
      const x = padding + (chartWidth / data.length) * index + chartWidth / data.length / 2

      ctx.fillText(value.toString(), x, padding + chartHeight + 20)
    })
  }
}

// Función para dibujar gráfico circular
function drawPieChart(
  ctx: CanvasRenderingContext2D,
  data: ChartDataPoint[],
  dimensions: { width: number; height: number },
  colors: string[],
  showLegend: boolean,
  animation: boolean
) {
  const { width, height } = dimensions
  const centerX = width / 2
  const centerY = height / 2 - (showLegend ? 20 : 0)
  const radius = Math.min(width, height) / 2 - 40

  const total = data.reduce((sum, point) => sum + (typeof point === 'object' ? point.value : point), 0)
  let currentAngle = -Math.PI / 2

  // Aplicar animación si está habilitada
  if (animation) {
    ctx.globalAlpha = 0.8
  }

  data.forEach((point, index) => {
    const value = typeof point === 'object' ? point.value : point
    const sliceAngle = (value / total) * 2 * Math.PI

    ctx.fillStyle = colors[index % colors.length] || '#3B82F6'
    ctx.beginPath()
    ctx.moveTo(centerX, centerY)
    ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle)
    ctx.closePath()
    ctx.fill()

    currentAngle += sliceAngle
  })
}

// Función para dibujar gráfico de dona
function drawDoughnutChart(
  ctx: CanvasRenderingContext2D,
  data: ChartDataPoint[],
  dimensions: { width: number; height: number },
  colors: string[],
  showLegend: boolean,
  animation: boolean
) {
  const { width, height } = dimensions
  const centerX = width / 2
  const centerY = height / 2 - (showLegend ? 20 : 0)
  const outerRadius = Math.min(width, height) / 2 - 40
  const innerRadius = outerRadius * 0.6

  const total = data.reduce((sum, point) => sum + (typeof point === 'object' ? point.value : point), 0)
  let currentAngle = -Math.PI / 2

  // Aplicar animación si está habilitada
  if (animation) {
    ctx.globalAlpha = 0.8
  }

  data.forEach((point, index) => {
    const value = typeof point === 'object' ? point.value : point
    const sliceAngle = (value / total) * 2 * Math.PI

    ctx.fillStyle = colors[index % colors.length] || '#3B82F6'
    ctx.beginPath()
    ctx.arc(centerX, centerY, outerRadius, currentAngle, currentAngle + sliceAngle)
    ctx.arc(centerX, centerY, innerRadius, currentAngle + sliceAngle, currentAngle, true)
    ctx.closePath()
    ctx.fill()

    currentAngle += sliceAngle
  })
}

// Función para dibujar gráfico de área
function drawAreaChart(
  ctx: CanvasRenderingContext2D,
  data: ChartDataPoint[],
  dimensions: { width: number; height: number },
  colors: string[],
  showGrid: boolean,
  showLabels: boolean,
  animation: boolean
) {
  const { width, height } = dimensions
  const padding = 40
  const chartWidth = width - padding * 2
  const chartHeight = height - padding * 2

  // Encontrar valores mínimos y máximos
  const values = data.map(d => typeof d === 'object' ? d.value : d)
  const minValue = Math.min(...values)
  const maxValue = Math.max(...values)
  const range = maxValue - minValue || 1

  // Dibujar grid
  if (showGrid) {
    ctx.strokeStyle = '#E5E7EB'
    ctx.lineWidth = 1
    ctx.setLineDash([2, 2])

    for (let i = 0; i <= 5; i++) {
      const y = padding + (chartHeight / 5) * i
      ctx.beginPath()
      ctx.moveTo(padding, y)
      ctx.lineTo(padding + chartWidth, y)
      ctx.stroke()
    }

    ctx.setLineDash([])
  }

  // Dibujar área
  const gradient = ctx.createLinearGradient(0, padding, 0, padding + chartHeight)
  gradient.addColorStop(0, colors[0] || '#3B82F6' + '40')
  gradient.addColorStop(1, colors[0] || '#3B82F6' + '10')

  // Aplicar animación si está habilitada
  if (animation) {
    ctx.globalAlpha = 0.8
  }

  ctx.fillStyle = gradient
  ctx.beginPath()
  ctx.moveTo(padding, padding + chartHeight)

  data.forEach((point, index) => {
    const value = typeof point === 'object' ? point.value : point
    const x = padding + (chartWidth / (data.length - 1)) * index
    const y = padding + chartHeight - ((value - minValue) / range) * chartHeight
    ctx.lineTo(x, y)
  })

  ctx.lineTo(padding + chartWidth, padding + chartHeight)
  ctx.closePath()
  ctx.fill()

  // Dibujar línea
  ctx.strokeStyle = colors[0] || '#3B82F6'
  ctx.lineWidth = 2
  ctx.beginPath()

  data.forEach((point, index) => {
    const value = typeof point === 'object' ? point.value : point
    const x = padding + (chartWidth / (data.length - 1)) * index
    const y = padding + chartHeight - ((value - minValue) / range) * chartHeight

    if (index === 0) {
      ctx.moveTo(x, y)
    } else {
      ctx.lineTo(x, y)
    }
  })

  ctx.stroke()

  // Dibujar etiquetas
  if (showLabels) {
    ctx.fillStyle = '#6B7280'
    ctx.font = '11px Inter, sans-serif'
    ctx.textAlign = 'center'

    data.forEach((point, index) => {
      const value = typeof point === 'object' ? point.value : point
      const x = padding + (chartWidth / (data.length - 1)) * index

      ctx.fillText(value.toString(), x, padding + chartHeight + 20)
    })
  }
}

export default Chart
