import { FastForward, Play, Rewind } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { ControlAction } from '@/lib/protocol'

type MediaControlsProps = {
  disabled: boolean
  onCommand: (action: Exclude<ControlAction, 'open_url'>, args: Record<string, number>) => void
}

export function MediaControls({ disabled, onCommand }: MediaControlsProps) {
  function handleClick(action: Exclude<ControlAction, 'open_url'>) {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(15)
      } catch {}
    }
    onCommand(action, {})
  }

  return (
    <section className="space-y-2.5" aria-labelledby="media-controls-title">
      <div className="flex items-center justify-between px-0.5">
        <h2
          id="media-controls-title"
          className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground"
        >
          Playback
        </h2>
        <span className="text-[11px] text-muted-foreground">Media Controls</span>
      </div>
      <div className="grid grid-cols-3 gap-2.5">
        <Button
          variant="secondary"
          size="lg"
          className="h-12 w-full rounded-2xl shadow-2xs transition-transform active:scale-95"
          disabled={disabled}
          onClick={() => handleClick('previous_track')}
          aria-label="Previous track"
        >
          <Rewind className="size-5" />
        </Button>
        <Button
          variant="default"
          size="lg"
          className="h-12 w-full rounded-2xl shadow-sm transition-transform active:scale-95"
          disabled={disabled}
          onClick={() => handleClick('play_pause')}
          aria-label="Play or pause"
        >
          <Play className="size-5 fill-current" />
        </Button>
        <Button
          variant="secondary"
          size="lg"
          className="h-12 w-full rounded-2xl shadow-2xs transition-transform active:scale-95"
          disabled={disabled}
          onClick={() => handleClick('next_track')}
          aria-label="Next track"
        >
          <FastForward className="size-5" />
        </Button>
      </div>
    </section>
  )
}