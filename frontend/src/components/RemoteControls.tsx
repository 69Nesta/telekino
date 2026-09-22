import { Check, Radio } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MediaControls } from '@/components/MediaControls'
import { NavigationControls } from '@/components/NavigationControls'
import { VolumeControls } from '@/components/VolumeControls'
import type { ControlAction } from '@/lib/protocol'

type RemoteControlsProps = {
  lastAck: string | null
  error: string | null
  onCommand: (action: ControlAction) => void
}

export function RemoteControls({ lastAck, error, onCommand }: RemoteControlsProps) {
  return (
    <Card className="border-black/10 bg-white/75 shadow-xl shadow-black/5 backdrop-blur dark:border-white/10 dark:bg-white/5">
      <CardHeader className="flex-row items-start justify-between gap-4">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Telekino remote</p>
          <CardTitle className="text-2xl tracking-tight">Control your Mac</CardTitle>
        </div>
        <Badge variant="default" className="gap-1.5"><Radio size={12} /> Live</Badge>
      </CardHeader>
      <CardContent className="space-y-8">
        <MediaControls disabled={false} onCommand={onCommand} />
        <div className="h-px bg-border" />
        <VolumeControls disabled={false} onCommand={onCommand} />
        <NavigationControls disabled={false} onCommand={onCommand} />
        {(lastAck || error) && (
          <div className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${error ? 'bg-destructive/10 text-destructive' : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'}`} role="status">
            {error ? null : <Check size={15} />}
            {error || `Sent ${lastAck?.replaceAll('_', ' ')}`}
          </div>
        )}
      </CardContent>
    </Card>
  )
}