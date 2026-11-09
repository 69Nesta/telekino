import type { ControlsProps } from '@/types/control'
import { useState, type KeyboardEvent } from 'react'
import { Input } from '@/components/ui/input'

export function KeyboardControls({ disabled, onCommand }: ControlsProps) {
    const [text, setText] = useState<string>("")

    function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
        if (e.key.length !== 1) return

        e.preventDefault()
        setText(e.key)
        if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
          try {
            navigator.vibrate(15)
          } catch {}
        }
        onCommand("keyboard", {})
    }

    return (
        <Input
            placeholder="Enter text"
            disabled={disabled}
            value={text}
            onKeyDown={handleKeyDown}
            onChange={() => {}}
        />
    )
}