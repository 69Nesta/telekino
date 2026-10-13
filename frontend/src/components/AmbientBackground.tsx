import type { CSSProperties } from 'react'
import type { ConnectionStatus } from '@/lib/protocol'
import type { ProcessedPalette } from '@/lib/ambient'

interface AmbientBackgroundProps {
  palette: ProcessedPalette
  intensityMultipliers: {
    bloomOpacity: number
    orb1Opacity: number
    orb2Opacity: number
    cardGlowOpacity: number
    ambientAlpha: number
  }
  connectionStatus: ConnectionStatus
  isAckPulsing: boolean
  motionEnabled?: boolean
}

export function AmbientBackground({
  palette,
  intensityMultipliers,
  connectionStatus,
  isAckPulsing,
  motionEnabled = true,
}: AmbientBackgroundProps) {
  const { bloomOpacity, orb1Opacity, orb2Opacity } = intensityMultipliers
  const isConnecting = connectionStatus === 'connecting' || connectionStatus === 'awaiting_approval'

  const styleVariables = {
    '--ambient-primary': `${palette.primary.r} ${palette.primary.g} ${palette.primary.b}`,
    '--ambient-secondary': `${palette.secondary.r} ${palette.secondary.g} ${palette.secondary.b}`,
    '--ambient-tertiary': `${palette.tertiary.r} ${palette.tertiary.g} ${palette.tertiary.b}`,
    '--ambient-bloom': `${palette.screenBloom.r} ${palette.screenBloom.g} ${palette.screenBloom.b}`,
    '--ambient-card-glow': `rgba(${palette.primary.r}, ${palette.primary.g}, ${palette.primary.b}, ${intensityMultipliers.cardGlowOpacity})`,
  } as CSSProperties

  return (
    <div
      aria-hidden="true"
      style={styleVariables}
      className="fixed inset-0 -z-10 pointer-events-none select-none overflow-hidden bg-[#07090e]"
    >
      <div
        className="absolute inset-0 transition-opacity duration-1000"
        style={{
          background: `radial-gradient(ellipse 110% 70% at 50% 15%, rgb(var(--ambient-tertiary) / 0.45) 0%, rgb(7 9 14 / 0.95) 60%, #050609 100%)`,
        }}
      />

      <div
        className="absolute -top-[12vw] inset-x-0 h-[48vh] transition-opacity duration-700"
        style={{
          background: `radial-gradient(ellipse 85% 65% at 50% 0%, rgb(var(--ambient-bloom) / ${bloomOpacity}) 0%, rgb(var(--ambient-primary) / ${bloomOpacity * 0.45}) 38%, transparent 75%)`,
        }}
      />

      <div
        className={`absolute -top-[8%] left-[2%] h-[65vw] w-[65vw] max-h-[600px] max-w-[600px] rounded-full blur-[85px] sm:blur-[120px] transition-transform duration-700 ${
          motionEnabled ? 'animate-ambient-drift-1' : ''
        }`}
        style={{
          background: `radial-gradient(circle, rgb(var(--ambient-primary) / ${orb1Opacity}) 0%, transparent 70%)`,
        }}
      />

      <div
        className={`absolute top-[28%] -right-[8%] h-[68vw] w-[68vw] max-h-[620px] max-w-[620px] rounded-full blur-[95px] sm:blur-[135px] transition-transform duration-700 ${
          motionEnabled ? 'animate-ambient-drift-2' : ''
        }`}
        style={{
          background: `radial-gradient(circle, rgb(var(--ambient-secondary) / ${orb2Opacity}) 0%, transparent 70%)`,
        }}
      />

      <div
        className="absolute -bottom-[15%] left-[10%] h-[45vw] w-[80vw] max-h-[420px] max-w-[700px] rounded-full blur-[90px] sm:blur-[120px] opacity-75"
        style={{
          background: `radial-gradient(circle, rgb(var(--ambient-secondary) / ${orb2Opacity * 0.7}) 0%, transparent 68%)`,
        }}
      />

      {isConnecting && (
        <div
          className="absolute top-[20%] inset-x-0 mx-auto h-[50vw] w-[50vw] max-h-[450px] max-w-[450px] rounded-full blur-[75px] animate-ambient-beacon"
          style={{
            background: `radial-gradient(circle, rgb(var(--ambient-primary) / 0.55) 0%, transparent 70%)`,
          }}
        />
      )}

      {isAckPulsing && (
        <div
          className="absolute top-[30%] inset-x-0 mx-auto h-[70vw] w-[70vw] max-h-[550px] max-w-[550px] rounded-full blur-[65px] animate-ambient-ack pointer-events-none"
          style={{
            background: `radial-gradient(circle, rgb(var(--ambient-bloom) / 0.65) 0%, rgb(var(--ambient-primary) / 0.3) 45%, transparent 70%)`,
          }}
        />
      )}

      <svg
        className="absolute inset-0 size-full pointer-events-none opacity-[0.038] mix-blend-overlay"
        xmlns="http://www.w3.org/2000/svg"
      >
        <filter id="ambient-film-grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="3" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#ambient-film-grain)" />
      </svg>

      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 90% 70% at 50% 45%, transparent 35%, rgba(5, 7, 11, 0.55) 80%, rgba(3, 4, 7, 0.85) 100%)',
        }}
      />
    </div>
  )
}
