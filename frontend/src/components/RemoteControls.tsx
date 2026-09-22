import { Radio } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MediaControls } from '@/components/MediaControls'
import { NavigationControls } from '@/components/NavigationControls'
import { VolumeControls } from '@/components/VolumeControls'
import type { ControlAction } from '@/lib/protocol'

type RemoteControlsProps = {
  onCommand: (action: ControlAction) => void
}

export function RemoteControls({ onCommand }: RemoteControlsProps) {
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
      </CardContent>
    </Card>
  )
}