import { useState, useEffect } from 'react';
import { Play, Pause, SkipForward, Volume2, Unplug, Smartphone, Server, Loader2, Info } from 'lucide-react';

const App = () => {
  const [token, setToken] = useState(() => localStorage.getItem('remote_auth_token') || '');
  const [serverUrl, setServerUrl] = useState(() => localStorage.getItem('remote_server_url') || 'http://localhost:6767');
  const [deviceName, setDeviceName] = useState('Web Remote');

  const [isPairing, setIsPairing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [volume, setVolume] = useState(50);
  const [isPlaying, setIsPlaying] = useState(false); // Optimistic local state
  const [statusMsg, setStatusMsg] = useState('');

  // Persist auth data when it changes
  useEffect(() => {
    if (token) {
      localStorage.setItem('remote_auth_token', token);
    } else {
      localStorage.removeItem('remote_auth_token');
    }
    localStorage.setItem('remote_server_url', serverUrl);
  }, [token, serverUrl]);

  // Custom API handler that simulates the Rust server if it's offline
  const apiCall = async (endpoint, method, body = null) => {
    setErrorMsg('');
    setStatusMsg('');

    try {
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const response = await fetch(`${serverUrl}${endpoint}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : null,
        signal: AbortSignal.timeout(3000) // 3 second timeout
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (err) {
      console.warn("Real server unreachable, using mock mode.", err);
      // Fallback Mock Logic
      return new Promise((resolve) => {
        setTimeout(() => {
          if (endpoint === '/auth/request') {
            resolve({ token: 'mock-uuid-token-' + Math.random().toString(36).substring(7) });
          } else {
            resolve({ status: 'ok' }); // control endpoints return 200 OK
          }
        }, 1500); // Simulate network/terminal approval delay
      });
    }
  };

  const handlePairing = async (e) => {
    e.preventDefault();
    setIsPairing(true);
    setErrorMsg('');

    try {
      const data = await apiCall('/auth/request', 'POST', { device_name: deviceName });
      if (data && data.token) {
        setToken(data.token);
      } else {
        setErrorMsg('Pairing denied or invalid response.');
      }
    } catch (err) {
      setErrorMsg('Failed to connect to host.');
    } finally {
      setIsPairing(false);
    }
  };

  const handleDisconnect = () => {
    setToken('');
    setStatusMsg('Disconnected');
  };

  const sendCommand = async (action, value = null) => {
    const payload = { action };
    if (value !== null) {
      payload.value = value;
    }

    // Optimistic UI updates
    if (action === 'play_pause') setIsPlaying(!isPlaying);
    setStatusMsg(`Sending ${action}...`);

    try {
      await apiCall('/api/control', 'POST', payload);
      setStatusMsg(`Command sent successfully.`);
      setTimeout(() => setStatusMsg(''), 2000);
    } catch (err) {
      setStatusMsg(`Failed to send ${action}.`);
    }
  };

  const handleVolumeChange = (e) => {
    setVolume(parseInt(e.target.value));
  };

  const handleVolumeRelease = () => {
    // Convert 0-100 to 0.0-1.0 for the Rust backend
    sendCommand('set_volume', volume / 100);
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-neutral-950 text-neutral-200 flex flex-col items-center justify-center p-6 font-sans">
        <div className="w-full max-w-sm bg-neutral-900 border border-neutral-800 rounded-3xl p-8 shadow-2xl">
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-blue-500/20 text-blue-400 rounded-full flex items-center justify-center mb-4">
              <Smartphone size={32} />
            </div>
            <h1 className="text-2xl font-semibold text-white tracking-tight">Media Remote</h1>
            <p className="text-neutral-500 text-sm mt-2 text-center">Pair with your host computer</p>
          </div>

          <form onSubmit={handlePairing} className="space-y-5">
            <div>
              <label className="block text-xs font-medium text-neutral-400 uppercase tracking-wider mb-2">Host URL</label>
              <div className="relative">
                <Server className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" size={18} />
                <input
                  type="url"
                  value={serverUrl}
                  onChange={(e) => setServerUrl(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl py-3 pl-10 pr-4 text-white outline-none transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-400 uppercase tracking-wider mb-2">Device Name</label>
              <input
                type="text"
                value={deviceName}
                onChange={(e) => setDeviceName(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl py-3 px-4 text-white outline-none transition-all"
                required
              />
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg text-center">
                {errorMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={isPairing}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-neutral-800 disabled:text-neutral-500 text-white font-medium py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              {isPairing ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  <span>Waiting for host approval...</span>
                </>
              ) : (
                'Pair Device'
              )}
            </button>
          </form>

          <div className="mt-6 flex items-start gap-2 text-xs text-neutral-500 bg-neutral-950 p-3 rounded-lg">
            <Info size={16} className="shrink-0 mt-0.5 text-blue-400" />
            <p>If the Rust server is offline, this UI will use a mock response to demonstrate functionality after 1.5s.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-200 flex flex-col p-6 font-sans select-none">
      {/* Header */}
      <div className="flex justify-between items-center mb-12 mt-4">
        <div>
          <h1 className="text-xl font-semibold text-white tracking-tight">Living Room Mac</h1>
          <div className="flex items-center gap-2 text-xs text-emerald-400 mt-1">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
            Connected
          </div>
        </div>
        <button
          onClick={handleDisconnect}
          className="p-3 bg-neutral-900 border border-neutral-800 rounded-full text-neutral-400 hover:text-red-400 hover:border-red-900/50 transition-colors"
          aria-label="Disconnect"
        >
          <Unplug size={20} />
        </button>
      </div>

      {/* Main Controls */}
      <div className="flex-1 flex flex-col items-center justify-center max-w-md mx-auto w-full gap-10">

        {/* Playback Controls Area */}
        <div className="flex items-center justify-center gap-6 w-full">
          <button
            onClick={() => sendCommand('play_pause')}
            className="w-32 h-32 bg-gradient-to-br from-neutral-800 to-neutral-900 border border-neutral-700/50 rounded-full flex items-center justify-center text-white shadow-[0_0_40px_rgba(0,0,0,0.5)] active:scale-95 transition-all"
          >
            {isPlaying ? (
              <Pause size={48} className="fill-white" />
            ) : (
              <Play size={48} className="fill-white ml-2" />
            )}
          </button>

          <button
            onClick={() => sendCommand('next_track')}
            className="w-20 h-20 bg-neutral-900 border border-neutral-800 rounded-full flex items-center justify-center text-neutral-300 hover:text-white active:scale-95 transition-all shadow-xl"
          >
            <SkipForward size={28} className="fill-current" />
          </button>
        </div>

        {/* Volume Control */}
        <div className="w-full bg-neutral-900/50 p-6 rounded-3xl border border-neutral-800/50 backdrop-blur-sm mt-8">
          <div className="flex justify-between items-center mb-6">
            <span className="text-sm font-medium text-neutral-400 flex items-center gap-2">
              <Volume2 size={18} /> Master Volume
            </span>
            <span className="text-sm font-bold text-white">{volume}%</span>
          </div>

          <div className="relative w-full h-12 flex items-center">
            {/* Custom Range Slider Styling */}
            <input
              type="range"
              min="0"
              max="100"
              value={volume}
              onChange={handleVolumeChange}
              onPointerUp={handleVolumeRelease}
              className="w-full h-3 bg-neutral-800 rounded-full appearance-none cursor-pointer outline-none z-10
                [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-8 [&::-webkit-slider-thumb]:h-8
                [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-lg
                [&::-moz-range-thumb]:w-8 [&::-moz-range-thumb]:h-8 [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-none [&::-moz-range-thumb]:rounded-full"
            />
            {/* Custom Track Fill Overlay */}
            <div
              className="absolute left-0 h-3 bg-blue-500 rounded-full pointer-events-none"
              style={{ width: `${volume}%` }}
            ></div>
          </div>
        </div>

      </div>

      {/* Status Bar */}
      <div className="h-10 mt-auto flex items-center justify-center">
        <p className="text-xs text-neutral-500 transition-opacity duration-300">
          {statusMsg || 'Ready'}
        </p>
      </div>
    </div>
  );
};

export default App;
