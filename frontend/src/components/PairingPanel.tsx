import { LoaderCircle, MonitorUp, PlugZap, RotateCcw, ShieldCheck, Unplug } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import type { ConnectionStatus } from '@/lib/protocol'
import { statusCopy, statusTone } from '@/lib/protocol'

type PairingPanelProps = {
  status: ConnectionStatus
  error: string | null
  onDisconnect: () => void
}

const statusIcons = {
  idle: PlugZap,
  connecting: LoaderCircle,
  awaiting_approval: ShieldCheck,
  connected: MonitorUp,
  reconnecting: RotateCcw,
  disconnected: Unplug,
  unauthorized: ShieldCheck,
  error: PlugZap,
} as const

export function PairingPanel({ status, error, onDisconnect }: PairingPanelProps) {
  const StatusIcon = statusIcons[status]
  const isBusy = status === 'connecting' || status === 'awaiting_approval'
  const isConnected = status === 'connected'

  return (
    <Card className="border-black/10 bg-white/75 shadow-xl shadow-black/5 backdrop-blur dark:border-white/10 dark:bg-white/5">
      <CardHeader className="gap-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
            <StatusIcon className={status === 'connecting' ? 'animate-spin' : ''} aria-hidden="true" />
          </div>
          <Badge variant={statusTone[status]}>{statusCopy[status]}</Badge>
        </div>
        <div>
          <CardTitle className="text-2xl tracking-tight">Connect a Mac</CardTitle>
          <CardDescription className="mt-2 max-w-sm leading-relaxed">
            Select a configured Mac below, then approve this remote from the host terminal.
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && <p className="text-sm text-destructive" role="alert">{error}</p>}
        {status === 'awaiting_approval' && (
            <div className="rounded-lg bg-amber-500/10 px-3 py-2 flex items-center gap-2">
                <Spinner className="text-amber-200" />
                <p className="text-sm text-amber-800 dark:text-amber-200">
                    Check the host computer and approve the connection request.
                </p>
            </div>
        )}
        <Button className="w-full" onClick={onDisconnect} disabled={isBusy || !isConnected} variant={isConnected ? 'destructive' : 'outline'}>
          {isConnected ? 'Disconnect' : 'Choose a Mac below'}
        </Button>
      </CardContent>
    </Card>
  )
}