import type { ControlAction } from '@/lib/protocol'

export interface ControlsProps {
  disabled: boolean
  onCommand: (action: Exclude<ControlAction, 'open_url'>, args: Record<string, number>) => void
}