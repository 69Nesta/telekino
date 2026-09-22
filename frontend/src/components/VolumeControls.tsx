import { Volume, Volume1, Volume2, VolumeX } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { ControlAction } from '@/lib/protocol'

type VolumeControlsProps = { disabled: boolean; onCommand: (action: ControlAction) => void }

export function VolumeControls({ disabled, onCommand }: VolumeControlsProps) {
  return (
    <section className="space-y-3" aria-labelledby="volume-controls-title">
      <h2 id="volume-controls-title" className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Volume</h2>
      <div className="grid grid-cols-3 gap-3">
        <Button variant="outline" className="h-12" disabled={disabled} onClick={() => onCommand('volume_down')} aria-label="Volume down"><Volume1 /></Button>
        <Button variant="outline" className="h-12" disabled={disabled} onClick={() => onCommand('volume_mute')} aria-label="Mute volume"><VolumeX /></Button>
        <Button variant="outline" className="h-12" disabled={disabled} onClick={() => onCommand('volume_up')} aria-label="Volume up"><Volume2 /></Button>
      </div>
      <div className="flex items-center gap-2 text-xs text-muted-foreground"><Volume size={14} /> Commands control the Mac system volume.</div>
    </section>
  )
}