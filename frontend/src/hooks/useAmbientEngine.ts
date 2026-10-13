import { useEffect, useRef, useState, useMemo, useCallback } from 'react'
import type { ConnectionStatus } from '@/lib/protocol'
import {
  AMBIENT_INTENSITY_CONFIG,
  IDLE_AMBIENT_COLOR,
  generateHarmonicPalette,
  type ProcessedPalette,
  type RGB,
} from '@/lib/ambient'

interface UseAmbientEngineProps {
  screenColor: RGB
  connectionStatus: ConnectionStatus
  lastAck?: string | null
}

const LERP_FACTOR = 0.065
const EPSILON = 0.35

export function useAmbientEngine({
  screenColor,
  connectionStatus,
  lastAck,
}: UseAmbientEngineProps) {
  const isConnected = connectionStatus === 'connected'

  const targetRgb = useMemo<RGB>(() => {
    if (connectionStatus === 'connecting' || connectionStatus === 'awaiting_approval') {
      return { r: 215, g: 145, b: 35 }
    }
    if (isConnected) {
      return screenColor
    }
    return IDLE_AMBIENT_COLOR
  }, [connectionStatus, isConnected, screenColor])

  const [currentRgb, setCurrentRgb] = useState<RGB>(targetRgb)
  const [isAckPulsing, setIsAckPulsing] = useState(false)
  const ackTimerRef = useRef<number | null>(null)

  const currentRef = useRef<RGB>({ ...targetRgb })
  const targetRef = useRef<RGB>({ ...targetRgb })
  const isAnimatingRef = useRef(false)

  const startAnimation = useCallback(() => {
    isAnimatingRef.current = true

    const step = () => {
      const cur = currentRef.current
      const tgt = targetRef.current

      const dr = tgt.r - cur.r
      const dg = tgt.g - cur.g
      const db = tgt.b - cur.b

      const distance = Math.hypot(dr, dg, db)

      if (distance < EPSILON) {
        currentRef.current = { ...tgt }
        setCurrentRgb({ ...tgt })
        isAnimatingRef.current = false
        return
      }

      const next: RGB = {
        r: cur.r + dr * LERP_FACTOR,
        g: cur.g + dg * LERP_FACTOR,
        b: cur.b + db * LERP_FACTOR,
      }

      currentRef.current = next
      setCurrentRgb({ ...next })

      requestAnimationFrame(step)
    }

    requestAnimationFrame(step)
  }, [])

  useEffect(() => {
    targetRef.current = targetRgb
    if (!isAnimatingRef.current) {
      startAnimation()
    }
  }, [targetRgb, startAnimation])

  useEffect(() => {
    if (!lastAck) return

    setIsAckPulsing(true)
    if (ackTimerRef.current !== null) {
      window.clearTimeout(ackTimerRef.current)
    }
    ackTimerRef.current = window.setTimeout(() => {
      setIsAckPulsing(false)
      ackTimerRef.current = null
    }, 700)

    return () => {
      if (ackTimerRef.current !== null) {
        window.clearTimeout(ackTimerRef.current)
      }
    }
  }, [lastAck])

  const palette: ProcessedPalette = useMemo(() => {
    return generateHarmonicPalette(currentRgb)
  }, [currentRgb])

  return {
    currentRgb,
    palette,
    intensityMultipliers: AMBIENT_INTENSITY_CONFIG,
    isAckPulsing,
    connectionStatus,
    isConnected,
  }
}
