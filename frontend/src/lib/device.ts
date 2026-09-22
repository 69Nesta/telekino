export type RemoteDevice = {
  id: string
  name: string
  address: string
}

export const DEVICES_STORAGE_KEY = 'telekino-devices'

export function getDefaultDeviceName(): string {
  if (typeof navigator === 'undefined') return 'Web Remote'

  const platform = navigator.platform?.toLowerCase() || ''
  const platformName = platform.includes('mac')
    ? 'Mac'
    : platform.includes('win')
      ? 'Windows'
      : platform.includes('linux')
        ? 'Linux'
        : navigator.platform?.replace(/\s+/g, ' ').trim()

  if (platformName) return `${platformName} Remote`
  return 'Web Remote'
}

export function getDefaultDeviceAddress(): string {
  if (typeof window === 'undefined') return 'ws://localhost:6767/ws'
  return `${window.location.origin.replace(/^http/, 'ws')}/ws`
}

export function createDevice(name: string, address: string): RemoteDevice {
  return {
    id: crypto.randomUUID(),
    name: name.trim() || getDefaultDeviceName(),
    address: normalizeDeviceAddress(address),
  }
}

export function normalizeDeviceAddress(address: string): string {
  const trimmed = address.trim().replace(/\/$/, '')
  if (!trimmed) return getDefaultDeviceAddress()
  if (trimmed.startsWith('ws://') || trimmed.startsWith('wss://')) {
    return trimmed.endsWith('/ws') ? trimmed : `${trimmed}/ws`
  }
  const websocketAddress = trimmed.replace(/^http:/, 'ws:').replace(/^https:/, 'wss:')
  return websocketAddress.endsWith('/ws') ? websocketAddress : `${websocketAddress}/ws`
}

export function loadDevices(): RemoteDevice[] {
  if (typeof window === 'undefined') return []
  try {
    const stored: unknown = JSON.parse(window.localStorage.getItem(DEVICES_STORAGE_KEY) || '[]')
    if (!Array.isArray(stored)) return []
    return stored.filter(isRemoteDevice).map((device) => ({ ...device, address: normalizeDeviceAddress(device.address) }))
  } catch {
    return []
  }
}

export function saveDevices(devices: RemoteDevice[]): void {
  window.localStorage.setItem(DEVICES_STORAGE_KEY, JSON.stringify(devices))
}

function isRemoteDevice(value: unknown): value is RemoteDevice {
  if (!value || typeof value !== 'object') return false
  const device = value as Record<string, unknown>
  return typeof device.id === 'string' && typeof device.name === 'string' && typeof device.address === 'string'
}
