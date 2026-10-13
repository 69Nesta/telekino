import { ArrowLeft, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { ControlAction } from '@/lib/protocol'

type NavigationControlsProps = {
  disabled: boolean
  onCommand: (action: Exclude<ControlAction, 'open_url'>, args: Record<string, number>) => void
}

export function NavigationControls({ disabled, onCommand }: NavigationControlsProps) {
  function handleClick(action: Exclude<ControlAction, 'open_url'>) {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(15)
      } catch {}
    }
    onCommand(action, {})
  }

  return (
    <div className="grid grid-cols-2 gap-2.5">
      <Button
        variant="outline"
        className="h-11 rounded-xl text-xs font-semibold shadow-2xs transition-transform active:scale-95"
        disabled={disabled}
        onClick={() => handleClick('left_arrow')}
        aria-label="Seek left or backward"
      >
        <ArrowLeft className="size-4" /> Seek Left
      </Button>
      <Button
        variant="outline"
        className="h-11 rounded-xl text-xs font-semibold shadow-2xs transition-transform active:scale-95"
        disabled={disabled}
        onClick={() => handleClick('right_arrow')}
        aria-label="Seek right or forward"
      >
        Seek Right <ArrowRight className="size-4" />
      </Button>
    </div>
  )
}