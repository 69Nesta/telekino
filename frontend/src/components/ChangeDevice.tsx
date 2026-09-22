import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"


interface ChangeDeviceProps {
    onChangeDevice: () => void
    connected: boolean
}


export const ChangeDevice = ({ onChangeDevice, connected }: ChangeDeviceProps) => {
    return (
        <div className="absolute top-0 left-0 flex items-center justify-end gap-2 p-4">
            {connected && (
                <Button variant="outline" size="sm" onClick={onChangeDevice}>
                    <LogOut /> Change device
                </Button>)
            }
        </div>
    )
}