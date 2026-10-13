export type ConnectionStatus =
  | 'idle'
  | 'connecting'
  | 'awaiting_approval'
  | 'connected'
  | 'reconnecting'
  | 'disconnected'
  | 'unauthorized'
  | 'error'

export type ControlAction =
  | 'play_pause'
  | 'previous_track'
  | 'next_track'
  | 'volume_up'
  | 'volume_down'
  | 'volume_mute'
  | 'left_arrow'
  | 'right_arrow'
  | 'track_pad'
  | 'click'
  | 'right_click'
  | 'scroll'
  | 'open_url'

export type CommandActionPayload =
  | { action: Exclude<ControlAction, 'open_url'> }
  | { action: 'open_url'; url: string }

export type ClientMessage =
  | { type: 'auth'; device_name: string; token: string | null }
  | { type: 'command'; action: CommandActionPayload; args?: Record<string, number> }

export type ServerMessage =
  | { type: 'auth_pending' }
  | { type: 'auth_approved'; token: string }
  | { type: 'auth_denied'; reason: string }
  | { type: 'ready' }
  | { type: 'command_ack'; action: string }
  | { type: 'error'; message: string }
  | { type: 'average_color', color: any}

export const statusCopy: Record<ConnectionStatus, string> = {
  idle: 'Ready to pair',
  connecting: 'Connecting',
  awaiting_approval: 'Awaiting approval',
  connected: 'Connected',
  reconnecting: 'Reconnecting',
  disconnected: 'Disconnected',
  unauthorized: 'Authorization required',
  error: 'Connection error',
}

export const statusTone: Record<ConnectionStatus, 'default' | 'destructive' | 'secondary' | 'outline'> = {
  idle: 'outline',
  connecting: 'secondary',
  awaiting_approval: 'secondary',
  connected: 'default',
  reconnecting: 'secondary',
  disconnected: 'secondary',
  unauthorized: 'destructive',
  error: 'destructive',
}

export function createAuthMessage(deviceName: string, token: string | null): ClientMessage {
  return { type: 'auth', device_name: deviceName, token }
}

export function createCommandMessage(action: Exclude<ControlAction, 'open_url'>, args: Record<string, number> = {}): ClientMessage {
  return { type: 'command', action: { action }, args }
}

export function createOpenUrlMessage(url: string): ClientMessage {
  return { type: 'command', action: { action: 'open_url', url }, args: {} }
}
