import { ArrowLeft, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { ControlAction } from '@/lib/protocol'

type NavigationControlsProps = { disabled: boolean; onCommand: (action: ControlAction) => void }

export function NavigationControls({ disabled, onCommand }: NavigationControlsProps) {
  return (
    <section className="space-y-3" aria-labelledby="navigation-controls-title">
      <h2 id="navigation-controls-title" className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Navigation</h2>
      <div className="grid grid-cols-2 gap-3">
        <Button variant="outline" className="h-12" disabled={disabled} onClick={() => onCommand('left_arrow')} aria-label="Press left arrow"><ArrowLeft /> Left</Button>
        <Button variant="outline" className="h-12" disabled={disabled} onClick={() => onCommand('right_arrow')} aria-label="Press right arrow">Right <ArrowRight /></Button>
      </div>
    </section>
  )
}