'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useTheme } from '@/lib/ThemeContext'
import { ELEMENT_TYPES } from './WorldElementCard'

interface WorldElement {
  id: number
  element_type: string
  emoji: string | null
  name: string
  description: string | null
  image_url: string | null
  canvas_x: number
  canvas_y: number
  creator_name: string
}

interface Connection {
  from: number
  to: number
}

interface WorldCanvasProps {
  elements: WorldElement[]
  connections: Connection[]
  worldId: number
  userId: string
  canEdit: boolean
  onElementMove: (elementId: number, x: number, y: number) => void
  onElementClick: (element: WorldElement) => void
  onConnectionAdd: (fromId: number, toId: number) => void
}

export default function WorldCanvas({
  elements,
  connections,
  worldId,
  userId,
  canEdit,
  onElementMove,
  onElementClick,
  onConnectionAdd,
}: WorldCanvasProps) {
  const { theme } = useTheme()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const [scale, setScale] = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [dragging, setDragging] = useState<number | null>(null)
  const [panning, setPanning] = useState(false)
  const [panStart, setPanStart] = useState({ x: 0, y: 0 })
  const [connecting, setConnecting] = useState<number | null>(null)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

  const ELEMENT_SIZE = 120
  const ELEMENT_RADIUS = 60

  const getCanvasCoords = useCallback((clientX: number, clientY: number) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }
    const rect = canvas.getBoundingClientRect()
    return {
      x: (clientX - rect.left - offset.x) / scale,
      y: (clientY - rect.top - offset.y) / scale,
    }
  }, [offset, scale])

  const findElementAt = useCallback((x: number, y: number) => {
    for (const el of elements) {
      const dx = x - (el.canvas_x || 100 + elements.indexOf(el) * 150)
      const dy = y - (el.canvas_y || 100)
      if (dx * dx + dy * dy < ELEMENT_RADIUS * ELEMENT_RADIUS) {
        return el
      }
    }
    return null
  }, [elements])

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    const container = containerRef.current
    if (container) {
      canvas.width = container.clientWidth
      canvas.height = container.clientHeight
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.save()
    ctx.translate(offset.x, offset.y)
    ctx.scale(scale, scale)

    // Draw grid
    ctx.strokeStyle = theme.colors.text + '15'
    ctx.lineWidth = 1
    const gridSize = 50
    const startX = Math.floor(-offset.x / scale / gridSize) * gridSize - gridSize
    const startY = Math.floor(-offset.y / scale / gridSize) * gridSize - gridSize
    const endX = startX + canvas.width / scale + gridSize * 2
    const endY = startY + canvas.height / scale + gridSize * 2

    for (let x = startX; x < endX; x += gridSize) {
      ctx.beginPath()
      ctx.moveTo(x, startY)
      ctx.lineTo(x, endY)
      ctx.stroke()
    }
    for (let y = startY; y < endY; y += gridSize) {
      ctx.beginPath()
      ctx.moveTo(startX, y)
      ctx.lineTo(endX, y)
      ctx.stroke()
    }

    // Draw connections
    ctx.strokeStyle = theme.colors.text + '60'
    ctx.lineWidth = 3
    connections.forEach(conn => {
      const from = elements.find(e => e.id === conn.from)
      const to = elements.find(e => e.id === conn.to)
      if (from && to) {
        const fromX = from.canvas_x || 100
        const fromY = from.canvas_y || 100
        const toX = to.canvas_x || 100
        const toY = to.canvas_y || 100

        ctx.beginPath()
        ctx.moveTo(fromX, fromY)
        ctx.lineTo(toX, toY)
        ctx.stroke()
      }
    })

    // Draw connecting line while dragging
    if (connecting !== null) {
      const fromEl = elements.find(e => e.id === connecting)
      if (fromEl) {
        ctx.strokeStyle = theme.colors.accent1
        ctx.setLineDash([5, 5])
        ctx.beginPath()
        ctx.moveTo(fromEl.canvas_x || 100, fromEl.canvas_y || 100)
        const canvasCoords = getCanvasCoords(mousePos.x, mousePos.y)
        ctx.lineTo(canvasCoords.x, canvasCoords.y)
        ctx.stroke()
        ctx.setLineDash([])
      }
    }

    // Draw elements
    elements.forEach((el, index) => {
      const x = el.canvas_x || 100 + index * 150
      const y = el.canvas_y || 100
      const typeConfig = ELEMENT_TYPES[el.element_type] || { color: '#888', emoji: '❓' }

      // Shadow
      ctx.fillStyle = 'rgba(0,0,0,0.2)'
      ctx.beginPath()
      ctx.arc(x + 4, y + 4, ELEMENT_RADIUS, 0, Math.PI * 2)
      ctx.fill()

      // Main circle
      ctx.fillStyle = typeConfig.color
      ctx.strokeStyle = 'black'
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.arc(x, y, ELEMENT_RADIUS, 0, Math.PI * 2)
      ctx.fill()
      ctx.stroke()

      // Image or emoji
      if (el.image_url) {
        // Draw image in a circle (would need image loading)
        ctx.fillStyle = theme.colors.text
        ctx.font = '40px sans-serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(el.emoji || typeConfig.emoji, x, y - 15)
      } else {
        ctx.fillStyle = theme.colors.text
        ctx.font = '40px sans-serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(el.emoji || typeConfig.emoji, x, y - 10)
      }

      // Name
      ctx.fillStyle = theme.colors.text
      ctx.font = 'bold 12px sans-serif'
      ctx.fillText(el.name.slice(0, 15), x, y + 30)

      // Type badge
      ctx.font = '10px sans-serif'
      ctx.fillStyle = theme.colors.text + '80'
      ctx.fillText(el.element_type, x, y + 45)
    })

    ctx.restore()
  }, [elements, connections, offset, scale, theme, connecting, mousePos, getCanvasCoords])

  useEffect(() => {
    draw()
  }, [draw])

  useEffect(() => {
    const handleResize = () => draw()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [draw])

  const handleMouseDown = (e: React.MouseEvent) => {
    const coords = getCanvasCoords(e.clientX, e.clientY)
    const element = findElementAt(coords.x, coords.y)

    if (e.shiftKey && element && canEdit) {
      // Start connection
      setConnecting(element.id)
    } else if (element && canEdit) {
      // Start dragging
      setDragging(element.id)
    } else {
      // Start panning
      setPanning(true)
      setPanStart({ x: e.clientX - offset.x, y: e.clientY - offset.y })
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    setMousePos({ x: e.clientX, y: e.clientY })

    if (dragging !== null) {
      const coords = getCanvasCoords(e.clientX, e.clientY)
      onElementMove(dragging, coords.x, coords.y)
    } else if (panning) {
      setOffset({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      })
    }
  }

  const handleMouseUp = (e: React.MouseEvent) => {
    if (connecting !== null) {
      const coords = getCanvasCoords(e.clientX, e.clientY)
      const targetElement = findElementAt(coords.x, coords.y)
      if (targetElement && targetElement.id !== connecting) {
        onConnectionAdd(connecting, targetElement.id)
      }
      setConnecting(null)
    }
    setDragging(null)
    setPanning(false)
  }

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? 0.9 : 1.1
    const newScale = Math.min(Math.max(scale * delta, 0.3), 3)

    // Zoom towards mouse position
    const rect = canvasRef.current?.getBoundingClientRect()
    if (rect) {
      const mouseX = e.clientX - rect.left
      const mouseY = e.clientY - rect.top
      const newOffsetX = mouseX - (mouseX - offset.x) * (newScale / scale)
      const newOffsetY = mouseY - (mouseY - offset.y) * (newScale / scale)
      setOffset({ x: newOffsetX, y: newOffsetY })
    }

    setScale(newScale)
  }

  const handleDoubleClick = (e: React.MouseEvent) => {
    const coords = getCanvasCoords(e.clientX, e.clientY)
    const element = findElementAt(coords.x, coords.y)
    if (element) {
      onElementClick(element)
    }
  }

  const resetView = () => {
    setScale(1)
    setOffset({ x: 50, y: 50 })
  }

  return (
    <div className="relative w-full" ref={containerRef}>
      {/* Controls */}
      <div className="absolute top-4 left-4 z-10 flex gap-2">
        <button
          onClick={() => setScale(s => Math.min(s * 1.2, 3))}
          className="w-10 h-10 font-bold rounded-lg hover:scale-105 transition-transform"
          style={{
            backgroundColor: theme.colors.backgroundAlt,
            border: '2px solid black',
            color: theme.colors.text,
          }}
        >
          +
        </button>
        <button
          onClick={() => setScale(s => Math.max(s * 0.8, 0.3))}
          className="w-10 h-10 font-bold rounded-lg hover:scale-105 transition-transform"
          style={{
            backgroundColor: theme.colors.backgroundAlt,
            border: '2px solid black',
            color: theme.colors.text,
          }}
        >
          −
        </button>
        <button
          onClick={resetView}
          className="px-3 h-10 font-bold rounded-lg hover:scale-105 transition-transform text-sm"
          style={{
            backgroundColor: theme.colors.backgroundAlt,
            border: '2px solid black',
            color: theme.colors.text,
          }}
        >
          Reset
        </button>
      </div>

      {/* Instructions */}
      <div
        className="absolute top-4 right-4 z-10 px-3 py-2 rounded-lg text-xs"
        style={{
          backgroundColor: theme.colors.backgroundAlt + 'CC',
          border: '2px solid black',
          color: theme.colors.text,
        }}
      >
        <div>Drag to move elements</div>
        <div>Shift+drag to connect</div>
        <div>Double-click to view</div>
        <div>Scroll to zoom</div>
      </div>

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        className="w-full rounded-xl cursor-grab active:cursor-grabbing"
        style={{
          height: '500px',
          backgroundColor: theme.colors.background,
          border: '3px solid black',
          boxShadow: '4px 4px 0 black',
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        onDoubleClick={handleDoubleClick}
      />

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-2 mt-4">
        {Object.entries(ELEMENT_TYPES).map(([type, config]) => (
          <div
            key={type}
            className="flex items-center gap-1 px-2 py-1 rounded-full text-xs"
            style={{
              backgroundColor: config.color,
              border: '2px solid black',
              color: theme.colors.text,
            }}
          >
            <span>{config.emoji}</span>
            <span>{config.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
