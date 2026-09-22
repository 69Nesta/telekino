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
    id: createDeviceId(),
    name: name.trim() || getDefaultDeviceName(),
    address: normalizeDeviceAddress(address),
  }
}

function createDeviceId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }

  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    const bytes = crypto.getRandomValues(new Uint8Array(16))
    bytes[6] = (bytes[6] & 0x0f) | 0x40
    bytes[8] = (bytes[8] & 0x3f) | 0x80
    return [...bytes].map((byte, index) => {
      const value = byte.toString(16).padStart(2, '0')
      return [4, 6, 8, 10].includes(index) ? `-${value}` : value
    }).join('')
  }

  return `device-${Date.now()}-${Math.random().toString(36).slice(2)}`
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
