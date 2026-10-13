import { Volume, Volume1, Volume2, VolumeX } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { ControlAction } from '@/lib/protocol'

type VolumeControlsProps = {
  disabled: boolean
  onCommand: (action: Exclude<ControlAction, 'open_url'>, args: Record<string, number>) => void
}

export function VolumeControls({ disabled, onCommand }: VolumeControlsProps) {
  function handleClick(action: Exclude<ControlAction, 'open_url'>) {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(15)
      } catch {}
    }
    onCommand(action, {})
  }

  return (
    <section className="space-y-2.5" aria-labelledby="volume-controls-title">
      <div className="flex items-center justify-between px-0.5">
        <h2
          id="volume-controls-title"
          className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground"
        >
          Volume
        </h2>
        <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
          <Volume className="size-3" /> Mac Audio
        </span>
      </div>
      <div className="grid grid-cols-3 gap-2.5">
        <Button
          variant="outline"
          className="h-12 rounded-2xl shadow-2xs transition-transform active:scale-95"
          disabled={disabled}
          onClick={() => handleClick('volume_down')}
          aria-label="Volume down"
        >
          <Volume1 className="size-4.5" />
        </Button>
        <Button
          variant="outline"
          className="h-12 rounded-2xl shadow-2xs transition-transform active:scale-95"
          disabled={disabled}
          onClick={() => handleClick('volume_mute')}
          aria-label="Mute volume"
        >
          <VolumeX className="size-4.5" />
        </Button>
        <Button
          variant="outline"
          className="h-12 rounded-2xl shadow-2xs transition-transform active:scale-95"
          disabled={disabled}
          onClick={() => handleClick('volume_up')}
          aria-label="Volume up"
        >
          <Volume2 className="size-4.5" />
        </Button>
      </div>
    </section>
  )
}