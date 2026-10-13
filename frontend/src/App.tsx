import { useEffect, useState, type CSSProperties } from 'react'
import { LogOut, RadioTower } from 'lucide-react'
import { DeviceManager } from '@/components/DeviceManager'
import { PairingPanel } from '@/components/PairingPanel'
import { RemoteControls } from '@/components/RemoteControls'
import { AmbientBackground } from '@/components/AmbientBackground'
import { Button } from '@/components/ui/button'
import { Toaster } from '@/components/ui/sonner'
import { useRemote } from '@/hooks/useRemote'
import { useAmbientEngine } from '@/hooks/useAmbientEngine'
import { loadDevices, saveDevices, type RemoteDevice } from '@/lib/device'
import { toast } from 'sonner'
import { useAppSelector } from '@/store/hooks'

function App() {
  const remote = useRemote()
  const rawColor = useAppSelector((state) => state.home)
  const [devices, setDevices] = useState<RemoteDevice[]>(loadDevices)
  const isConnected = remote.status === 'connected'

  const ambient = useAmbientEngine({
    screenColor: rawColor,
    connectionStatus: remote.status,
    lastAck: remote.lastAck,
  })

  useEffect(() => saveDevices(devices), [devices])

  useEffect(() => {
    if (remote.lastAck === 'open_url') {
      toast.success('Website opened on Mac')
    } else if (remote.lastAck) {
      toast.success(`Sent ${remote.lastAck.replaceAll('_', ' ')}`)
    }
  }, [remote.lastAck])

  useEffect(() => {
    if (remote.error) toast.error(remote.error)
  }, [remote.error])

  return (
    <main
      style={{
        '--ambient-primary': `${ambient.palette.primary.r} ${ambient.palette.primary.g} ${ambient.palette.primary.b}`,
        '--ambient-secondary': `${ambient.palette.secondary.r} ${ambient.palette.secondary.g} ${ambient.palette.secondary.b}`,
        '--ambient-card-glow': `rgba(${ambient.palette.primary.r}, ${ambient.palette.primary.g}, ${ambient.palette.primary.b}, ${ambient.intensityMultipliers.cardGlowOpacity})`,
      } as CSSProperties}
      className="relative min-h-svh overflow-y-auto px-3.5 py-6 text-foreground sm:px-6 sm:py-12"
    >
      <AmbientBackground
        palette={ambient.palette}
        intensityMultipliers={ambient.intensityMultipliers}
        connectionStatus={ambient.connectionStatus}
        isAckPulsing={ambient.isAckPulsing}
      />

      <div className="relative mx-auto flex min-h-[calc(100svh-4rem)] w-full max-w-lg flex-col justify-center gap-5">
        <header className="flex items-center justify-between px-1">
          <div className="flex items-center gap-3">
            <div
              className="relative flex size-9 items-center justify-center rounded-xl bg-foreground text-background shadow-md transition-all duration-500"
              style={{
                boxShadow: `0 0 20px -2px rgba(${ambient.palette.primary.r}, ${ambient.palette.primary.g}, ${ambient.palette.primary.b}, 0.5)`,
              }}
            >
              <RadioTower size={18} aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-semibold tracking-tight">Telekino</p>
              <p className="text-xs text-muted-foreground">Mac Remote Controller</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isConnected && (
              <div
                className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-medium text-foreground/80 backdrop-blur-md"
                title="Ambilight synced with Mac"
              >
                <span className="relative flex size-2 items-center justify-center">
                  <span
                    className="absolute inline-flex size-full animate-ping rounded-full opacity-60"
                    style={{
                      backgroundColor: `rgb(${ambient.palette.primary.r}, ${ambient.palette.primary.g}, ${ambient.palette.primary.b})`,
                    }}
                  />
                  <span
                    className="relative inline-flex size-1.5 rounded-full transition-colors duration-500"
                    style={{
                      backgroundColor: `rgb(${ambient.palette.primary.r}, ${ambient.palette.primary.g}, ${ambient.palette.primary.b})`,
                    }}
                  />
                </span>
                <span>Ambilight</span>
              </div>
            )}

            {isConnected && (
              <Button
                variant="outline"
                size="sm"
                onClick={remote.disconnect}
                className="h-8 gap-1.5 rounded-lg border-white/10 bg-white/5 text-xs font-medium text-muted-foreground hover:bg-white/10 hover:text-foreground"
              >
                <LogOut className="size-3.5" /> Disconnect
              </Button>
            )}
          </div>
        </header>

        {isConnected ? (
          <RemoteControls
            onCommand={remote.sendCommand}
            onOpenUrl={remote.openUrl}
            connected={isConnected}
            deviceName={remote.activeDevice?.name}
          />
        ) : (
          <>
            <PairingPanel
              status={remote.status}
              error={remote.error}
              onDisconnect={remote.disconnect}
            />
            <DeviceManager
              devices={devices}
              activeDeviceId={remote.activeDevice?.id ?? null}
              onChange={setDevices}
              onConnect={remote.connect}
            />
          </>
        )}

        <p className="px-1 text-center text-xs text-muted-foreground/80">
          Commands are sent directly to the paired Mac.
        </p>
      </div>

      <Toaster position="top-center" />
    </main>
  )
}

export default App
