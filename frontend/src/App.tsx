import { RadioTower } from 'lucide-react'
import { PairingPanel } from '@/components/PairingPanel'
import { RemoteControls } from '@/components/RemoteControls'
import { useRemote } from '@/hooks/useRemote'

function App() {
  const remote = useRemote()
  const isConnected = remote.status === 'connected'

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
          <RemoteControls lastAck={remote.lastAck} error={remote.error} onCommand={remote.sendCommand} />
        ) : (
          <PairingPanel
            status={remote.status}
            error={remote.error}
            defaultDeviceName={remote.deviceName}
            onConnect={remote.connect}
            onDisconnect={remote.disconnect}
          />
        )}
        <p className="px-1 text-center text-xs text-muted-foreground">Commands are sent directly to the paired Mac.</p>
      </div>
    </main>
  )
}

export default App
