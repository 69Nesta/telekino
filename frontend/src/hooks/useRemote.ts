import { useCallback, useEffect, useRef, useState } from 'react'
import { getDefaultDeviceName } from '@/lib/device'
import {
	createAuthMessage,
	createCommandMessage,
	type ConnectionStatus,
	type ControlAction,
	type ServerMessage,
} from '@/lib/protocol'

const TOKEN_KEY = 'telekino-auth-token'

function getStoredToken(): string | null {
	if (typeof window === 'undefined') return null
	return window.localStorage.getItem(TOKEN_KEY)
}

function parseServerMessage(data: string): ServerMessage | null {
	try {
		const message: unknown = JSON.parse(data)
		if (!message || typeof message !== 'object' || !('type' in message)) return null
		return message as ServerMessage
	} catch {
		return null
	}
}

export function useRemote() {
	const socketRef = useRef<WebSocket | null>(null)
	const deviceNameRef = useRef(getDefaultDeviceName())
	const [deviceName, setDeviceName] = useState(getDefaultDeviceName())
	const [status, setStatus] = useState<ConnectionStatus>('idle')
	const [error, setError] = useState<string | null>(null)
	const [lastAck, setLastAck] = useState<string | null>(null)

	const disconnect = useCallback(() => {
		socketRef.current?.close()
		socketRef.current = null
		setStatus('disconnected')
	}, [])

	const connect = useCallback((deviceName = deviceNameRef.current) => {
		socketRef.current?.close()
		deviceNameRef.current = deviceName.trim() || getDefaultDeviceName()
		setDeviceName(deviceNameRef.current)
		setError(null)
		setLastAck(null)
		setStatus('connecting')

		const socket = new WebSocket(`${window.location.origin.replace(/^http/, 'ws')}/ws`)
		socketRef.current = socket

		socket.addEventListener('open', () => {
			socket.send(JSON.stringify(createAuthMessage(deviceNameRef.current, getStoredToken())))
		})

		socket.addEventListener('message', (event) => {
			const message = parseServerMessage(event.data)
			if (!message) {
				setStatus('error')
				setError('Received an invalid message from the host computer.')
				return
			}

			switch (message.type) {
				case 'auth_pending':
					setStatus('awaiting_approval')
					break
				case 'auth_approved':
					window.localStorage.setItem(TOKEN_KEY, message.token)
					break
				case 'auth_denied':
					window.localStorage.removeItem(TOKEN_KEY)
					setStatus('unauthorized')
					setError(message.reason)
					break
				case 'ready':
					setStatus('connected')
					setError(null)
					break
				case 'command_ack':
					setLastAck(message.action)
					setError(null)
					break
				case 'error':
					setError(message.message)
					break
			}
		})

		socket.addEventListener('error', () => {
			setStatus('error')
			setError('Unable to connect to the host computer.')
		})

		socket.addEventListener('close', () => {
			if (socketRef.current === socket) {
				socketRef.current = null
				setStatus((current) => current === 'connected' ? 'disconnected' : current)
			}
		})
	}, [])

	const sendCommand = useCallback((action: ControlAction) => {
		const socket = socketRef.current
		if (status !== 'connected' || socket?.readyState !== WebSocket.OPEN) return false
		socket.send(JSON.stringify(createCommandMessage(action)))
		return true
	}, [status])

	useEffect(() => () => socketRef.current?.close(), [])

	return { status, error, lastAck, connect, disconnect, sendCommand, deviceName }
}
