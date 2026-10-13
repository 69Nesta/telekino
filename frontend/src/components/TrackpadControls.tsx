import { useEffect, useRef } from 'react'
import type { PointerEvent } from 'react'
import type { ControlAction } from '@/lib/protocol'

type TrackpadControlsProps = {
  disabled: boolean
  onCommand: (action: Exclude<ControlAction, 'open_url'>, args: Record<string, number>) => void
}

type PointerPosition = { x: number; y: number; startX: number; startY: number; pointerType: string; button: number }

const TAP_SLOP = 10
const LONG_PRESS_MS = 550

export function TrackpadControls({ disabled, onCommand }: TrackpadControlsProps) {
  const pointersRef = useRef(new Map<number, PointerPosition>())
  const longPressTimerRef = useRef<number | null>(null)
  const longPressedRef = useRef(new Set<number>())
  const multiTouchRef = useRef(false)
  const suppressContextMenuRef = useRef(false)
  const scrollRemainderRef = useRef({ x: 0, y: 0 })
  const pendingMovementRef = useRef({ x: 0, y: 0 })
  const pendingScrollRef = useRef({ x: 0, y: 0 })
  const frameRef = useRef<number | null>(null)

  const scheduleFlush = () => {
    if (frameRef.current !== null) return
    frameRef.current = window.requestAnimationFrame(() => {
      frameRef.current = null
      const movement = pendingMovementRef.current
      const scroll = pendingScrollRef.current
      pendingMovementRef.current = { x: 0, y: 0 }
      pendingScrollRef.current = { x: 0, y: 0 }
      if (movement.x || movement.y) onCommand('track_pad', movement)
      if (scroll.x || scroll.y) onCommand('scroll', scroll)
    })
  }

  const clearLongPress = () => {
    if (longPressTimerRef.current !== null) {
      window.clearTimeout(longPressTimerRef.current)
      longPressTimerRef.current = null
    }
  }

  useEffect(() => () => {
    clearLongPress()
    if (frameRef.current !== null) window.cancelAnimationFrame(frameRef.current)
  }, [])

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (disabled) return
    event.currentTarget.setPointerCapture(event.pointerId)
    pointersRef.current.set(event.pointerId, {
      x: event.clientX,
      y: event.clientY,
      startX: event.clientX,
      startY: event.clientY,
      pointerType: event.pointerType,
      button: event.button,
    })

    if (pointersRef.current.size > 1) {
      multiTouchRef.current = true
      clearLongPress()
    }
    if (event.pointerType === 'touch' && pointersRef.current.size === 1) {
      clearLongPress()
      longPressTimerRef.current = window.setTimeout(() => {
        const pointer = pointersRef.current.get(event.pointerId)
        if (!pointer || pointersRef.current.size !== 1) return
        const moved = Math.hypot(pointer.x - pointer.startX, pointer.y - pointer.startY)
        if (moved <= TAP_SLOP) {
          longPressedRef.current.add(event.pointerId)
          suppressContextMenuRef.current = true
          window.setTimeout(() => { suppressContextMenuRef.current = false }, 1000)
          onCommand('right_click', {})
        }
      }, LONG_PRESS_MS)
    }
  }

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (disabled) return
    const pointers = pointersRef.current
    const current = pointers.get(event.pointerId)
    if (!current) return

    const dx = event.pointerType === 'mouse' ? event.movementX : event.clientX - current.x
    const dy = event.pointerType === 'mouse' ? event.movementY : event.clientY - current.y
    current.x = event.clientX
    current.y = event.clientY
    if (Math.hypot(current.x - current.startX, current.y - current.startY) > TAP_SLOP) clearLongPress()

    if (event.pointerType === 'touch' && pointers.size >= 2) {
      const totalX = [...pointers.values()].reduce((sum, pointer) => sum + pointer.x, 0)
      const totalY = [...pointers.values()].reduce((sum, pointer) => sum + pointer.y, 0)
      const previousX = totalX - dx
      const previousY = totalY - dy
      const scroll = scrollRemainderRef.current
      scroll.x += (totalX - previousX) / pointers.size / 24
      scroll.y += (totalY - previousY) / pointers.size / 24
      const x = Math.trunc(scroll.x)
      const y = Math.trunc(scroll.y)
      if (x !== 0 || y !== 0) {
        scroll.x -= x
        scroll.y -= y
        pendingScrollRef.current.x += x
        pendingScrollRef.current.y += y
        scheduleFlush()
      }
      return
    }

    if (event.pointerType === 'touch' || event.pointerType === 'mouse') {
      if (dx !== 0 || dy !== 0) {
        pendingMovementRef.current.x += dx
        pendingMovementRef.current.y += dy
        scheduleFlush()
      }
    }
  }

  const handlePointerUp = (event: PointerEvent<HTMLDivElement>) => {
    clearLongPress()
    const pointer = pointersRef.current.get(event.pointerId)
    pointersRef.current.delete(event.pointerId)
    if (!pointer || disabled) return

    const moved = Math.hypot(event.clientX - pointer.startX, event.clientY - pointer.startY)
    const wasLongPressed = longPressedRef.current.delete(event.pointerId)
    if (!wasLongPressed && pointer.button === 0 && !multiTouchRef.current && moved <= TAP_SLOP && pointersRef.current.size === 0) {
      onCommand('click', {})
    }
    if (pointersRef.current.size === 0) {
      multiTouchRef.current = false
      scrollRemainderRef.current = { x: 0, y: 0 }
    }
  }

  const handlePointerCancel = (event: PointerEvent<HTMLDivElement>) => {
    clearLongPress()
    pointersRef.current.delete(event.pointerId)
    longPressedRef.current.delete(event.pointerId)
    if (pointersRef.current.size === 0) multiTouchRef.current = false
  }

  return (
    <section className="space-y-3" aria-labelledby="trackpad-title">
      <h2 id="trackpad-title" className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
        Trackpad
      </h2>
      <div
        role="application"
        aria-label="Trackpad control: drag to move, tap to click, long press to right click, two fingers to scroll"
        aria-disabled={disabled}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        onContextMenu={(event) => {
          event.preventDefault()
          if (suppressContextMenuRef.current) {
            suppressContextMenuRef.current = false
            return
          }
          if (!disabled) onCommand('right_click', {})
        }}
        className={[
          'relative aspect-[4/3] w-full overflow-hidden rounded-2xl',
          'border border-border bg-muted/40 touch-none select-none transition-colors',
          disabled ? 'cursor-not-allowed opacity-50' : 'cursor-crosshair hover:bg-muted/60',
        ].join(' ')}
      >
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-0 h-full w-px bg-border" />
          <div className="absolute left-0 top-1/2 h-px w-full bg-border" />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="rounded-full border border-border bg-background/80 px-3 py-1 text-center text-xs text-muted-foreground">
              {disabled ? 'Disabled' : 'Drag · Tap to click · Two fingers to scroll'}
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
