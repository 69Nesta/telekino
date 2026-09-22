import { FastForward, Play, Rewind } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { ControlAction } from '@/lib/protocol'

type MediaControlsProps = { disabled: boolean; onCommand: (action: ControlAction) => void }

export function MediaControls({ disabled, onCommand }: MediaControlsProps) {
  return (
    <section className="space-y-3" aria-labelledby="media-controls-title">
      <h2 id="media-controls-title" className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Playback</h2>
      <div className="grid grid-cols-3 gap-3">
        <Button variant="secondary" size="icon-lg" className="h-16 w-full" disabled={disabled} onClick={() => onCommand('previous_track')} aria-label="Previous track">
          <Rewind />
        </Button>
        <Button size="icon-lg" className="h-16 w-full" disabled={disabled} onClick={() => onCommand('play_pause')} aria-label="Play or pause">
          <Play />
        </Button>
        <Button variant="secondary" size="icon-lg" className="h-16 w-full" disabled={disabled} onClick={() => onCommand('next_track')} aria-label="Next track">
          <FastForward />
        </Button>
      </div>
    </section>
  )
}