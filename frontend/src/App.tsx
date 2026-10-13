import { useEffect, useState } from 'react'
import { LogOut, RadioTower } from 'lucide-react'
import { DeviceManager } from '@/components/DeviceManager'
import { PairingPanel } from '@/components/PairingPanel'
import { RemoteControls } from '@/components/RemoteControls'
import { Button } from '@/components/ui/button'
import { Toaster } from '@/components/ui/sonner'
import { useRemote } from '@/hooks/useRemote'
import { loadDevices, saveDevices, type RemoteDevice } from '@/lib/device'
import { toast } from 'sonner'

function App() {
  const remote = useRemote()
  const [devices, setDevices] = useState<RemoteDevice[]>(loadDevices)
  const isConnected = remote.status === 'connected'

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
    <main className="min-h-svh overflow-y-auto bg-[radial-gradient(circle_at_top_left,oklch(0.93_0.08_75),transparent_38%),linear-gradient(135deg,oklch(0.98_0.02_90),oklch(0.93_0.025_170))] px-3.5 py-6 text-foreground dark:bg-[radial-gradient(circle_at_top_left,oklch(0.28_0.07_75),transparent_38%),linear-gradient(135deg,oklch(0.16_0.02_90),oklch(0.12_0.025_170))] sm:px-6 sm:py-12">
      <div className="mx-auto flex min-h-[calc(100svh-4rem)] w-full max-w-lg flex-col justify-center gap-5">
        <header className="flex items-center justify-between px-1">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-xl bg-foreground text-background shadow-xs">
              <RadioTower size={18} aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-semibold tracking-tight">Telekino</p>
              <p className="text-xs text-muted-foreground">Mac Remote Controller</p>
            </div>
          </div>
          {isConnected && (
            <Button
              variant="outline"
              size="sm"
              onClick={remote.disconnect}
              className="h-8 gap-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground"
            >
              <LogOut className="size-3.5" /> Disconnect
            </Button>
          )}
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

        <p className="px-1 text-center text-xs text-muted-foreground">
          Commands are sent directly to the paired Mac.
        </p>
      </div>

      <Toaster position="top-center" />
    </main>
  )
}

export default App
