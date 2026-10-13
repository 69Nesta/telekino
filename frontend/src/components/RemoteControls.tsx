import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { QuickAppsStrip } from '@/components/QuickAppsStrip'
import { MediaControls } from '@/components/MediaControls'
import { NavigationControls } from '@/components/NavigationControls'
import { TrackpadControls } from '@/components/TrackpadControls'
import { VolumeControls } from '@/components/VolumeControls'
import { loadFavorites, saveFavorites, type FavoriteSite } from '@/lib/favorites'
import type { ControlAction } from '@/lib/protocol'

type RemoteControlsProps = {
  onCommand: (action: Exclude<ControlAction, 'open_url'>, args: Record<string, number>) => void
  onOpenUrl: (url: string) => void
  connected: boolean
  deviceName?: string
}

export function RemoteControls({
  onCommand,
  onOpenUrl,
  connected,
  deviceName,
}: RemoteControlsProps) {
  const [favorites, setFavorites] = useState<FavoriteSite[]>(loadFavorites)

  function handleUpdateFavorites(updated: FavoriteSite[]) {
    setFavorites(updated)
    saveFavorites(updated)
  }

  function handleCommand(
    action: Exclude<ControlAction, 'open_url'>,
    args: Record<string, number> = {}
  ) {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(15)
      } catch {}
    }
    onCommand(action, args)
  }

  return (
    <Card className="border-black/10 bg-white/80 shadow-2xl shadow-black/5 backdrop-blur-md dark:border-white/10 dark:bg-zinc-900/80">
      <CardHeader className="flex flex-row items-center justify-between gap-4 pb-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Telekino Remote
          </p>
          <CardTitle className="text-xl font-bold tracking-tight">
            {deviceName || 'Mac Controller'}
          </CardTitle>
        </div>
        <Badge variant="default" className="gap-1.5 px-2.5 py-1">
          <span className="relative flex size-2" aria-hidden="true">
            <span
              className={`absolute inline-flex size-full animate-ping rounded-full ${
                connected ? 'bg-emerald-400' : 'bg-red-400'
              } opacity-75`}
            />
            <span
              className={`relative inline-flex size-2 rounded-full ${
                connected ? 'bg-emerald-500' : 'bg-red-500'
              }`}
            />
          </span>
          {connected ? 'Online' : 'Offline'}
        </Badge>
      </CardHeader>

      <CardContent className="space-y-5">
        <QuickAppsStrip
          favorites={favorites}
          onUpdateFavorites={handleUpdateFavorites}
          onOpenUrl={onOpenUrl}
          disabled={!connected}
        />

        <div className="h-px bg-border/80" />

        <div className="space-y-2.5">
          <TrackpadControls disabled={!connected} onCommand={onCommand} />
          <div className="grid grid-cols-2 gap-2.5">
            <Button
              variant="outline"
              className="h-11 rounded-xl text-xs font-semibold shadow-2xs transition-transform active:scale-95"
              disabled={!connected}
              onClick={() => handleCommand('click')}
            >
              Left Click
            </Button>
            <Button
              variant="outline"
              className="h-11 rounded-xl text-xs font-semibold shadow-2xs transition-transform active:scale-95"
              disabled={!connected}
              onClick={() => handleCommand('right_click')}
            >
              Right Click
            </Button>
          </div>
        </div>

        <div className="h-px bg-border/80" />

        <div className="space-y-3">
          <MediaControls disabled={!connected} onCommand={onCommand} />
          <NavigationControls disabled={!connected} onCommand={onCommand} />
        </div>

        <div className="h-px bg-border/80" />

        <VolumeControls disabled={!connected} onCommand={onCommand} />
      </CardContent>
    </Card>
  )
}
