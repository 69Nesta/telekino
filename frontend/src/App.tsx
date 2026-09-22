import { useEffect, useState } from 'react'
import { RadioTower } from 'lucide-react'
import { ChangeDevice } from '@/components/ChangeDevice'
import { DeviceManager } from '@/components/DeviceManager'
import { PairingPanel } from '@/components/PairingPanel'
import { RemoteControls } from '@/components/RemoteControls'
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
    if (remote.lastAck) toast.success(`Sent ${remote.lastAck.replaceAll('_', ' ')}`)
  }, [remote.lastAck])

  useEffect(() => {
    if (remote.error) toast.error(remote.error)
  }, [remote.error])

  return (
    <main className="min-h-svh overflow-hidden bg-[radial-gradient(circle_at_top_left,oklch(0.93_0.08_75),transparent_38%),linear-gradient(135deg,oklch(0.98_0.02_90),oklch(0.93_0.025_170))] px-4 py-8 text-foreground dark:bg-[radial-gradient(circle_at_top_left,oklch(0.28_0.07_75),transparent_38%),linear-gradient(135deg,oklch(0.16_0.02_90),oklch(0.12_0.025_170))] sm:px-6 sm:py-12">
      <div className="mx-auto flex min-h-[calc(100svh-6rem)] w-full max-w-lg flex-col justify-center gap-6">
        <header className="flex items-center gap-3 px-1">
          <div className="flex size-9 items-center justify-center rounded-xl bg-foreground text-background">
            <RadioTower size={18} aria-hidden="true" />
          </div>
          <div>
            <p className="text-sm font-semibold tracking-tight">Telekino</p>
            <p className="text-xs text-muted-foreground">A small remote for your Mac</p>
          </div>
        </header>
        {isConnected ? (
          <RemoteControls onCommand={remote.sendCommand} connected={isConnected} />
        ) : (
          <>
            <PairingPanel status={remote.status} error={remote.error} onDisconnect={remote.disconnect} />
            <DeviceManager
              devices={devices}
              activeDeviceId={remote.activeDevice?.id ?? null}
              onChange={setDevices}
              onConnect={remote.connect}
            />
          </>
        )}
        <p className="px-1 text-center text-xs text-muted-foreground">Commands are sent directly to the paired Mac.</p>
      </div>
      <ChangeDevice onChangeDevice={remote.disconnect} connected={isConnected} />
      <Toaster position="top-center" />
    </main>
  )
}

export default App
