import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  Headphones,
  Loader2,
  LogOut,
  Monitor,
  Pause,
  Play,
  Radio,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

type ConnectionStatus = 'idle' | 'connecting' | 'awaiting_approval' | 'connected' | 'reconnecting' | 'disconnected' | 'unauthorized' | 'error';
type ServerMessage =
  | { type: 'auth_pending' }
  | { type: 'auth_approved'; token: string }
  | { type: 'auth_denied'; reason: string }
  | { type: 'ready' }
  | { type: 'command_ack'; action: string }
  | { type: 'error'; message: string };

const statusCopy: Record<ConnectionStatus, string> = {
  idle: 'Ready to pair', connecting: 'Connecting', awaiting_approval: 'Awaiting approval', connected: 'Connected', reconnecting: 'Reconnecting', disconnected: 'Disconnected', unauthorized: 'Authorization required', error: 'Connection error',
};

const statusTone: Record<ConnectionStatus, 'default' | 'success' | 'warning' | 'destructive' | 'secondary'> = {
  idle: 'secondary', connecting: 'warning', awaiting_approval: 'warning', connected: 'success', reconnecting: 'warning', disconnected: 'secondary', unauthorized: 'destructive', error: 'destructive',
};

function App() {
  const [token, setToken] = useState(() => localStorage.getItem('remote_auth_token') || '');
  const [serverUrl, setServerUrl] = useState(() => localStorage.getItem('remote_server_url') || 'http://localhost:6767');
  const [deviceName, setDeviceName] = useState('Web Remote');
  const [status, setStatus] = useState<ConnectionStatus>(() => localStorage.getItem('remote_auth_token') ? 'connecting' : 'idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [lastCommand, setLastCommand] = useState('');
  const [volume, setVolume] = useState(50);
  const [isPlaying, setIsPlaying] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const manualClose = useRef(false);
  const tokenRef = useRef(token);

  useEffect(() => {
    tokenRef.current = token;
  }, [token]);

  useEffect(() => {
    if (token) localStorage.setItem('remote_auth_token', token);
    else localStorage.removeItem('remote_auth_token');
    localStorage.setItem('remote_server_url', serverUrl);
  }, [token, serverUrl]);

  const closeSocket = useCallback(() => {
    manualClose.current = true;
    if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
    socketRef.current?.close();
    socketRef.current = null;
  }, []);

  const connectSocket = useCallback(function connectSocket(authToken: string, pairing = false) {
    closeSocket();
    manualClose.current = false;
    setErrorMessage('');
    setStatus(pairing ? 'connecting' : 'reconnecting');

    const websocketUrl = `${serverUrl.replace(/^http/, 'ws').replace(/\/$/, '')}/ws`;
    const socket = new WebSocket(websocketUrl);
    socketRef.current = socket;

    socket.onopen = () => {
      setStatus(pairing ? 'awaiting_approval' : 'connecting');
      socket.send(JSON.stringify({ type: 'auth', device_name: deviceName, token: authToken || undefined }));
    };

    socket.onmessage = (event) => {
      let message: ServerMessage;
      try {
        message = JSON.parse(event.data) as ServerMessage;
      } catch {
        setStatus('error');
        setErrorMessage('The server sent an unreadable response.');
        return;
      }

      if (message.type === 'auth_pending') setStatus('awaiting_approval');
      if (message.type === 'auth_approved') setToken(message.token);
      if (message.type === 'auth_denied') {
        setStatus(authToken ? 'unauthorized' : 'error');
        setErrorMessage(message.reason);
        if (authToken) setToken('');
        socket.close();
      }
      if (message.type === 'ready') setStatus('connected');
      if (message.type === 'command_ack') setLastCommand(`${message.action.replaceAll('_', ' ')} sent`);
      if (message.type === 'error') setErrorMessage(message.message);
    };

    socket.onerror = () => {
      setStatus('error');
      setErrorMessage('Unable to reach the host server.');
    };

    socket.onclose = () => {
      socketRef.current = null;
      if (!manualClose.current && tokenRef.current) {
        setStatus('reconnecting');
        reconnectTimer.current = setTimeout(() => connectSocket(tokenRef.current), 2000);
      } else if (!manualClose.current) {
        setStatus('disconnected');
      }
    };
  }, [closeSocket, deviceName, serverUrl]);

  useEffect(() => {
    const savedToken = localStorage.getItem('remote_auth_token');
    if (savedToken) connectSocket(savedToken);
    return closeSocket;
  }, [closeSocket, connectSocket, serverUrl]);

  const sendCommand = (action: string) => {
    if (status !== 'connected' || socketRef.current?.readyState !== WebSocket.OPEN) {
      setErrorMessage('Connect to the host before sending controls.');
      return;
    }
    socketRef.current.send(JSON.stringify({ type: 'command', action }));
    if (action === 'play_pause') setIsPlaying((playing) => !playing);
    if (action === 'volume_up') setVolume((current) => Math.min(100, current + 5));
    if (action === 'volume_down') setVolume((current) => Math.max(0, current - 5));
    setErrorMessage('');
  };

  const handlePair = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    connectSocket('', true);
  };

  const disconnect = () => {
    closeSocket();
    setToken('');
    setStatus('idle');
    setErrorMessage('');
  };

  const isConnected = status === 'connected';

  if (!token || !isConnected) {
    return (
      <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,oklch(0.3_0.08_190),transparent_42%),linear-gradient(135deg,oklch(0.14_0.02_220),oklch(0.08_0.01_260))] px-5 py-10 text-white sm:px-8">
        <div className="mx-auto flex min-h-[80vh] max-w-5xl items-center justify-center">
          <Card className="w-full max-w-lg border-white/10 bg-black/25 text-white shadow-2xl backdrop-blur-xl">
            <CardHeader className="space-y-5 p-8 pb-4 sm:p-10 sm:pb-5">
              <div className="flex items-center justify-between"><div className="flex size-12 items-center justify-center rounded-2xl bg-cyan-400/15 text-cyan-300"><Headphones size={24} /></div><Badge variant={statusTone[status]}><Radio className="size-3" /> {statusCopy[status]}</Badge></div>
              <div><p className="mb-2 text-xs font-medium uppercase tracking-[0.24em] text-cyan-300/75">Telekino remote</p><h1 className="text-3xl font-semibold tracking-tight">Connect to your media room.</h1><p className="mt-3 max-w-md text-sm leading-6 text-white/60">Pair this browser with the host computer. The host will ask for approval before controls become available.</p></div>
            </CardHeader>
            <CardContent className="p-8 pt-4 sm:p-10 sm:pt-5">
              <form onSubmit={handlePair} className="space-y-5">
                <div className="space-y-2"><label htmlFor="server-url" className="text-sm font-medium text-white/80">Host URL</label><Input id="server-url" type="url" value={serverUrl} onChange={(event) => setServerUrl(event.target.value)} required placeholder="http://localhost:6767" className="border-white/10 bg-white/5 text-white placeholder:text-white/30" /></div>
                <div className="space-y-2"><label htmlFor="device-name" className="text-sm font-medium text-white/80">Device name</label><Input id="device-name" value={deviceName} onChange={(event) => setDeviceName(event.target.value)} required className="border-white/10 bg-white/5 text-white" /></div>
                {errorMessage && <div className="flex items-start gap-2 rounded-lg border border-red-400/20 bg-red-400/10 p-3 text-sm text-red-200"><CircleAlert className="mt-0.5 size-4 shrink-0" />{errorMessage}</div>}
                <Button type="submit" size="lg" disabled={status === 'connecting' || status === 'awaiting_approval'} className="w-full bg-cyan-300 text-slate-950 hover:bg-cyan-200">{status === 'connecting' || status === 'awaiting_approval' ? <><Loader2 className="animate-spin" /> Waiting for host approval</> : <>Pair device <ChevronRight /></>}</Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_85%_5%,oklch(0.32_0.08_190),transparent_30%),linear-gradient(135deg,oklch(0.12_0.02_220),oklch(0.07_0.01_260))] px-5 py-6 text-white sm:px-8 sm:py-10">
      <div className="mx-auto max-w-5xl">
        <header className="flex items-start justify-between gap-4"><div><p className="text-xs font-medium uppercase tracking-[0.24em] text-cyan-300/75">Telekino remote</p><h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Living Room Mac</h1><div className="mt-3 flex items-center gap-2 text-sm text-white/55"><span className="size-2 rounded-full bg-emerald-300 shadow-[0_0_12px] shadow-emerald-300" /> {statusCopy[status]}</div></div><Button variant="outline" size="icon" onClick={disconnect} aria-label="Disconnect" title="Disconnect" className="border-white/10 bg-white/5 text-white hover:bg-white/10"><LogOut /></Button></header>
        <section className="mt-12 grid gap-5 lg:grid-cols-[1.35fr_0.65fr]">
          <Card className="border-white/10 bg-white/6 text-white shadow-2xl backdrop-blur-xl"><CardHeader className="flex-row items-center justify-between border-b border-white/10 p-6"><div><p className="text-sm text-white/50">Playback</p><h2 className="mt-1 text-xl font-medium">Media controls</h2></div><Badge variant="success"><Check className="size-3" /> Live</Badge></CardHeader><CardContent className="p-6"><div className="flex items-center justify-center gap-4 py-10 sm:gap-8"><Button variant="outline" size="icon-lg" onClick={() => sendCommand('previous_track')} disabled={!isConnected} aria-label="Previous track" title="Previous track" className="rounded-full border-white/10 bg-white/5 text-white hover:bg-white/10"><ChevronLeft /></Button><Button size="icon-lg" onClick={() => sendCommand('play_pause')} disabled={!isConnected} aria-label={isPlaying ? 'Pause' : 'Play'} title={isPlaying ? 'Pause' : 'Play'} className="size-24 rounded-full bg-cyan-300 text-slate-950 shadow-[0_0_50px_oklch(0.8_0.12_190/0.25)] hover:bg-cyan-200">{isPlaying ? <Pause className="fill-current" size={32} /> : <Play className="fill-current" size={32} />}</Button><Button variant="outline" size="icon-lg" onClick={() => sendCommand('next_track')} disabled={!isConnected} aria-label="Next track" title="Next track" className="rounded-full border-white/10 bg-white/5 text-white hover:bg-white/10"><ChevronRight /></Button></div><div className="grid grid-cols-2 gap-3 sm:grid-cols-4"><Button variant="secondary" onClick={() => sendCommand('volume_down')} disabled={!isConnected}><Volume2 /> Quieter</Button><Button variant="secondary" onClick={() => sendCommand('volume_up')} disabled={!isConnected}><Volume2 /> Louder</Button><Button variant="secondary" onClick={() => sendCommand('volume_mute')} disabled={!isConnected}><VolumeX /> Mute</Button><Button variant="secondary" onClick={() => sendCommand('play_pause')} disabled={!isConnected}><Pause /> Toggle</Button></div></CardContent></Card>
          <Card className="border-white/10 bg-white/6 text-white shadow-2xl backdrop-blur-xl"><CardHeader className="p-6"><p className="text-sm text-white/50">Volume</p><div className="mt-1 flex items-end justify-between"><h2 className="text-xl font-medium">Master level</h2><span className="text-3xl font-semibold text-cyan-200">{volume}%</span></div></CardHeader><CardContent className="space-y-6 p-6 pt-0"><div className="h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-cyan-300 transition-all" style={{ width: `${volume}%` }} /></div><div className="grid grid-cols-2 gap-3"><Button variant="outline" onClick={() => sendCommand('volume_down')} disabled={!isConnected}><Volume2 /> Down</Button><Button variant="outline" onClick={() => sendCommand('volume_up')} disabled={!isConnected}><Volume2 /> Up</Button></div><div className="rounded-lg border border-white/10 bg-black/10 p-4 text-sm text-white/55"><Monitor className="mb-3 size-4 text-cyan-300" />Commands are sent live to the connected host.</div></CardContent></Card>
        </section>
        <section className="mt-5 grid gap-5 sm:grid-cols-2"><Card className="border-white/10 bg-white/4 text-white"><CardHeader className="p-6"><h2 className="text-lg font-medium">Keyboard navigation</h2><p className="text-sm text-white/50">Move focus on the host screen.</p></CardHeader><CardContent className="grid grid-cols-2 gap-3 p-6 pt-0"><Button variant="outline" onClick={() => sendCommand('left_arrow')} disabled={!isConnected}><ArrowLeft /> Left</Button><Button variant="outline" onClick={() => sendCommand('right_arrow')} disabled={!isConnected}>Right <ArrowRight /></Button></CardContent></Card><Card className={cn('border-white/10 bg-white/4 text-white', errorMessage && 'border-red-300/30')}><CardHeader className="p-6"><h2 className="text-lg font-medium">Activity</h2><p className="text-sm text-white/50">{errorMessage || lastCommand || 'Ready for your next command.'}</p></CardHeader><CardContent className="p-6 pt-0"><Badge variant={errorMessage ? 'destructive' : 'secondary'}>{errorMessage ? <CircleAlert className="size-3" /> : <Check className="size-3" />} {errorMessage ? 'Action needs attention' : 'All systems normal'}</Badge></CardContent></Card></section>
      </div>
    </main>
  );
}

export default App;
