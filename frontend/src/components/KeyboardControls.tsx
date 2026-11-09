import { useEffect, useRef, useState } from 'react'
import type { ChangeEvent, KeyboardEvent, PointerEvent, ReactNode } from 'react'
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowRightToLine,
  ArrowUp,
  CornerDownLeft,
  Delete,
  Keyboard,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { SpecialKey } from '@/lib/protocol'

type KeyboardControlsProps = {
  disabled: boolean
  onTypeText: (text: string) => void
  onPressKey: (key: SpecialKey, repeat?: number) => void
}

const REPEAT_DELAY_MS = 380
const REPEAT_INTERVAL_MS = 70

const FORWARDED_KEYS: Partial<Record<string, SpecialKey>> = {
  ArrowUp: 'up',
  ArrowDown: 'down',
  ArrowLeft: 'left',
  ArrowRight: 'right',
  Escape: 'escape',
  Delete: 'delete',
  Home: 'home',
  End: 'end',
}

const segmenter =
  typeof Intl !== 'undefined' && 'Segmenter' in Intl
    ? new Intl.Segmenter(undefined, { granularity: 'grapheme' })
    : null

function graphemes(value: string): string[] {
  if (!segmenter) return Array.from(value)
  return Array.from(segmenter.segment(value), (part) => part.segment)
}

function vibrate() {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate(10)
    } catch {}
  }
}

function diffBuffer(previous: string, next: string) {
  const before = graphemes(previous)
  const after = graphemes(next)
  let common = 0
  while (common < before.length && common < after.length && before[common] === after[common]) common++
  return { erase: before.length - common, insert: after.slice(common).join('') }
}

type KeyButtonProps = {
  label: string
  disabled: boolean
  repeatable?: boolean
  emphasis?: boolean
  onPress: () => void
  children: ReactNode
}

function KeyButton({ label, disabled, repeatable = false, emphasis = false, onPress, children }: KeyButtonProps) {
  const timerRef = useRef<number | null>(null)

  const stop = () => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current)
      window.clearInterval(timerRef.current)
      timerRef.current = null
    }
  }

  useEffect(() => stop, [])

  const handlePointerDown = (event: PointerEvent<HTMLButtonElement>) => {
    if (disabled || event.button !== 0) return
    event.currentTarget.setPointerCapture(event.pointerId)
    onPress()
    if (!repeatable) return
    stop()
    timerRef.current = window.setTimeout(() => {
      timerRef.current = window.setInterval(onPress, REPEAT_INTERVAL_MS)
    }, REPEAT_DELAY_MS)
  }

  return (
    <Button
      type="button"
      variant={emphasis ? 'default' : 'outline'}
      aria-label={label}
      title={label}
      disabled={disabled}
      onMouseDown={(event) => event.preventDefault()}
      onPointerDown={handlePointerDown}
      onPointerUp={stop}
      onPointerCancel={stop}
      onLostPointerCapture={stop}
      onContextMenu={(event) => event.preventDefault()}
      onClick={(event) => {
        if (event.detail === 0) onPress()
      }}
      className="h-11 rounded-xl text-xs font-semibold shadow-2xs transition-transform select-none touch-manipulation active:scale-95"
    >
      {children}
    </Button>
  )
}

export function KeyboardControls({ disabled, onTypeText, onPressKey }: KeyboardControlsProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const bufferRef = useRef('')
  const [buffer, setBuffer] = useState('')
  const [focused, setFocused] = useState(false)

  const updateBuffer = (value: string) => {
    bufferRef.current = value
    setBuffer(value)
  }

  const press = (key: SpecialKey, repeat = 1) => {
    vibrate()
    onPressKey(key, repeat)
  }

  const keepCaretAtEnd = () => {
    const input = inputRef.current
    if (!input) return
    const end = input.value.length
    if (input.selectionStart !== end || input.selectionEnd !== end) input.setSelectionRange(end, end)
  }

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const next = event.target.value
    const { erase, insert } = diffBuffer(bufferRef.current, next)
    updateBuffer(next)
    if (erase > 0) onPressKey('backspace', erase)
    if (insert) {
      vibrate()
      onTypeText(insert)
    }
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.nativeEvent.isComposing || event.metaKey || event.ctrlKey || event.altKey) return

    if (event.key === 'Enter') {
      event.preventDefault()
      press('enter')
      updateBuffer('')
      return
    }

    if (event.key === 'Backspace' && bufferRef.current.length === 0) {
      event.preventDefault()
      press('backspace')
      return
    }

    const forwarded = FORWARDED_KEYS[event.key]
    if (forwarded) {
      event.preventDefault()
      press(forwarded)
    }
  }

  const clearLocal = () => {
    updateBuffer('')
    inputRef.current?.focus()
  }

  const active = focused && !disabled

  return (
    <section className="space-y-2.5" aria-labelledby="keyboard-title">
      <div className="flex items-center justify-between px-0.5">
        <h2
          id="keyboard-title"
          className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground"
        >
          Keyboard
        </h2>
        <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground" aria-live="polite">
          <span
            className={`size-1.5 rounded-full transition-colors ${active ? 'bg-emerald-500' : 'bg-muted-foreground/40'}`}
            aria-hidden="true"
          />
          {disabled ? 'Unavailable' : active ? 'Live typing' : 'Tap the field to type'}
        </span>
      </div>

      <div
        className={[
          'relative flex items-center rounded-2xl border bg-muted/40 transition-all',
          active ? 'border-ring ring-3 ring-ring/30 bg-background' : 'border-border',
          disabled ? 'opacity-50' : 'cursor-text',
        ].join(' ')}
        onClick={() => inputRef.current?.focus()}
      >
        <Keyboard
          className={`pointer-events-none absolute left-3.5 size-4 transition-colors ${active ? 'text-foreground' : 'text-muted-foreground'}`}
          aria-hidden="true"
        />
        <input
          ref={inputRef}
          type="text"
          aria-label="Type on the host computer"
          placeholder="Type on your Mac…"
          disabled={disabled}
          value={buffer}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onSelect={keepCaretAtEnd}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          enterKeyHint="send"
          className="h-12 w-full min-w-0 bg-transparent pl-10 pr-11 text-base outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed"
        />
        {buffer.length > 0 && !disabled && (
          <button
            type="button"
            aria-label="Clear local preview (does not erase on the Mac)"
            title="Clear preview"
            onMouseDown={(event) => event.preventDefault()}
            onClick={(event) => {
              event.stopPropagation()
              clearLocal()
            }}
            className="absolute right-2 flex size-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-4 gap-2">
        <KeyButton label="Escape" disabled={disabled} onPress={() => press('escape')}>
          Esc
        </KeyButton>
        <KeyButton label="Arrow up" disabled={disabled} repeatable onPress={() => press('up')}>
          <ArrowUp className="size-4" />
        </KeyButton>
        <KeyButton label="Tab" disabled={disabled} onPress={() => press('tab')}>
          <ArrowRightToLine className="size-4" /> Tab
        </KeyButton>
        <KeyButton label="Backspace" disabled={disabled} repeatable onPress={() => press('backspace')}>
          <Delete className="size-4" />
        </KeyButton>
        <KeyButton label="Arrow left" disabled={disabled} repeatable onPress={() => press('left')}>
          <ArrowLeft className="size-4" />
        </KeyButton>
        <KeyButton label="Arrow down" disabled={disabled} repeatable onPress={() => press('down')}>
          <ArrowDown className="size-4" />
        </KeyButton>
        <KeyButton label="Arrow right" disabled={disabled} repeatable onPress={() => press('right')}>
          <ArrowRight className="size-4" />
        </KeyButton>
        <KeyButton
          label="Enter"
          disabled={disabled}
          emphasis
          onPress={() => {
            press('enter')
            updateBuffer('')
          }}
        >
          <CornerDownLeft className="size-4" />
        </KeyButton>
      </div>
    </section>
  )
}
