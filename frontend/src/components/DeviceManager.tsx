import { useState } from 'react'
import { Check, Laptop, Pencil, Plus, Trash2, Wifi } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { createDevice, getDefaultDeviceAddress, getDefaultDeviceName, type RemoteDevice } from '@/lib/device'

type DeviceManagerProps = {
  devices: RemoteDevice[]
  activeDeviceId: string | null
  onChange: (devices: RemoteDevice[]) => void
  onConnect: (device: RemoteDevice) => void
}

export function DeviceManager({ devices, activeDeviceId, onChange, onConnect }: DeviceManagerProps) {
  const [name, setName] = useState(getDefaultDeviceName())
  const [address, setAddress] = useState(getDefaultDeviceAddress())
  const [editingId, setEditingId] = useState<string | null>(null)

  function resetForm() {
    setEditingId(null)
    setName(getDefaultDeviceName())
    setAddress(getDefaultDeviceAddress())
  }

  function saveDevice() {
    const device = createDevice(name, address)
    const nextDevices = editingId
      ? devices.map((item) => item.id === editingId ? { ...device, id: editingId } : item)
      : [...devices, device]
    onChange(nextDevices)
    resetForm()
  }

  function removeDevice(deviceId: string) {
    onChange(devices.filter((device) => device.id !== deviceId))
    if (editingId === deviceId) resetForm()
  }

  return (
    <Card className="border-black/10 bg-white/75 shadow-xl shadow-black/5 backdrop-blur dark:border-white/10 dark:bg-white/5">
      <CardHeader>
        <CardTitle className="text-2xl tracking-tight">Your Macs</CardTitle>
        <CardDescription>Save the address of each Telekino host you want to control.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-2">
          {devices.map((device) => (
            <div key={device.id} className={`flex items-center gap-3 rounded-xl border p-3 ${activeDeviceId === device.id ? 'border-primary bg-primary/5' : 'border-border'}`}>
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted"><Laptop size={17} /></div>
              <button className="min-w-0 flex-1 text-left" onClick={() => onConnect(device)}>
                <span className="block truncate text-sm font-medium">{device.name}</span>
                <span className="block truncate text-xs text-muted-foreground">{device.address}</span>
              </button>
              {activeDeviceId === device.id && <Check size={16} className="text-primary" aria-label="Selected device" />}
              <Button variant="ghost" size="icon-sm" onClick={() => { setEditingId(device.id); setName(device.name); setAddress(device.address) }} aria-label={`Edit ${device.name}`}><Pencil /></Button>
              <Button variant="ghost" size="icon-sm" onClick={() => removeDevice(device.id)} aria-label={`Remove ${device.name}`}><Trash2 /></Button>
            </div>
          ))}
          {devices.length === 0 && <p className="rounded-xl border border-dashed p-4 text-center text-sm text-muted-foreground">No Macs configured yet.</p>}
        </div>
        <div className="space-y-3 border-t pt-5">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="grid gap-2 text-sm font-medium" htmlFor="device-name">Name<Input id="device-name" value={name} onChange={(event) => setName(event.target.value)} placeholder="My Mac" /></label>
            <label className="grid gap-2 text-sm font-medium" htmlFor="device-address">Mac address<Input id="device-address" value={address} onChange={(event) => setAddress(event.target.value)} placeholder="192.168.1.42:6767" /></label>
          </div>
          <div className="flex gap-2">
            <Button className="flex-1" onClick={saveDevice}><Plus /> {editingId ? 'Save device' : 'Add device'}</Button>
            {editingId && <Button variant="outline" onClick={resetForm}>Cancel</Button>}
          </div>
          <p className="flex items-center gap-2 text-xs text-muted-foreground"><Wifi size={14} /> Use `http://`, `https://`, `ws://`, or `wss://`; `/ws` is added automatically.</p>
        </div>
      </CardContent>
    </Card>
  )
}