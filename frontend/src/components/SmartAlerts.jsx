import React, { useState, useEffect, useRef, useCallback } from 'react';

const ALERT_HISTORY_KEY = 'vs-alert-history';
const ALERT_SETTINGS_KEY = 'vs-alert-settings';

const defaultSettings = {
  enabled: true,
  unsafeThreshold: 3,        // number of unsafe events in window before alerting
  windowSeconds: 60,          // time window in seconds
  pushNotifications: false,
  soundEnabled: false,
};

const loadHistory = () => {
  try { return JSON.parse(localStorage.getItem(ALERT_HISTORY_KEY) || '[]'); } catch { return []; }
};

const saveHistory = (h) => localStorage.setItem(ALERT_HISTORY_KEY, JSON.stringify(h.slice(0, 100)));

const SmartAlerts = ({ onAlertTriggered }) => {
  const [settings, setSettings] = useState(() => {
    try { return { ...defaultSettings, ...JSON.parse(localStorage.getItem(ALERT_SETTINGS_KEY) || '{}') }; }
    catch { return defaultSettings; }
  });
  const [alertHistory, setAlertHistory] = useState(loadHistory);
  const [activeAlerts, setActiveAlerts] = useState([]);
  const [activeTab, setActiveTab] = useState('settings');
  const [pushGranted, setPushGranted] = useState(Notification.permission === 'granted');
  const recentUnsafeRef = useRef([]); // timestamps of recent unsafe events

  /* persist settings */
  useEffect(() => {
    localStorage.setItem(ALERT_SETTINGS_KEY, JSON.stringify(settings));
  }, [settings]);

  /* listen for unsafe events broadcast from parent via custom event */
  useEffect(() => {
    const handler = (e) => {
      if (!settings.enabled) return;
      const { status } = e.detail || {};
      if (status === 'UNSAFE') recordUnsafeEvent();
    };
    window.addEventListener('vs:analysis-result', handler);
    return () => window.removeEventListener('vs:analysis-result', handler);
  }, [settings]);

  const recordUnsafeEvent = useCallback(() => {
    const now = Date.now();
    recentUnsafeRef.current = [...recentUnsafeRef.current.filter(t => now - t < settings.windowSeconds * 1000), now];
    if (recentUnsafeRef.current.length >= settings.unsafeThreshold) {
      triggerAlert(recentUnsafeRef.current.length);
      recentUnsafeRef.current = []; // reset after firing
    }
  }, [settings]);

  const triggerAlert = useCallback((count) => {
    const alert = {
      id: Date.now(),
      message: `${count} unsafe events detected in ${settings.windowSeconds}s window`,
      timestamp: new Date().toISOString(),
      count,
    };

    /* add to history */
    setAlertHistory(prev => {
      const next = [alert, ...prev];
      saveHistory(next);
      return next;
    });

    /* in-app flash */
    setActiveAlerts(prev => [...prev, alert]);
    setTimeout(() => setActiveAlerts(prev => prev.filter(a => a.id !== alert.id)), 8000);

    /* browser push notification */
    if (settings.pushNotifications && pushGranted) {
      new Notification('VisionSafe — Threat Alert', {
        body: alert.message,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'vs-alert',
      });
    }

    /* sound (simple beep via AudioContext) */
    if (settings.soundEnabled) {
      try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination);
        osc.type = 'square'; osc.frequency.value = 880;
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
        osc.start(); osc.stop(ctx.currentTime + 0.4);
      } catch {}
    }

    onAlertTriggered?.(alert);
  }, [settings, pushGranted, onAlertTriggered]);

  const requestPush = async () => {
    const result = await Notification.requestPermission();
    setPushGranted(result === 'granted');
    if (result === 'granted') setSettings(s => ({ ...s, pushNotifications: true }));
  };

  const clearHistory = () => {
    setAlertHistory([]);
    localStorage.removeItem(ALERT_HISTORY_KEY);
  };

  /* expose triggerAlert for testing */
  const testAlert = () => triggerAlert(settings.unsafeThreshold);

  const tabs = [
    { id: 'settings', label: 'THRESHOLDS' },
    { id: 'history', label: `HISTORY (${alertHistory.length})` },
  ];

  return (
    <div className="space-y-4">

      {/* Active alert flash banners */}
      {activeAlerts.map(alert => (
        <div key={alert.id} className="glass-panel neon-border-red p-3 rounded-sm flex items-start gap-3 animate-slide-in">
          <span className="text-neon-red font-orbitron text-base animate-pulse">⚠</span>
          <div className="flex-1">
            <p className="font-orbitron text-xs font-bold text-neon-red tracking-widest">THRESHOLD BREACHED</p>
            <p className="font-mono-jet text-xs text-slate-300 mt-0.5">{alert.message}</p>
          </div>
          <button onClick={() => setActiveAlerts(p => p.filter(a => a.id !== alert.id))} className="text-slate-600 hover:text-slate-400 text-xs">✕</button>
        </div>
      ))}

      {/* Header */}
      <div className="glass-panel rounded-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-neon-cyan/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${settings.enabled ? 'bg-neon-green animate-pulse' : 'bg-slate-600'}`} />
            <span className="font-orbitron text-xs text-neon-cyan tracking-widest">SMART ALERTS</span>
          </div>
          {/* master enable */}
          <button
            onClick={() => setSettings(s => ({ ...s, enabled: !s.enabled }))}
            className={`font-mono-jet text-xs px-3 py-1 rounded-sm border transition-all ${
              settings.enabled
                ? 'border-neon-green text-neon-green hover:bg-neon-green/10'
                : 'border-slate-600 text-slate-600 hover:border-neon-cyan hover:text-neon-cyan'
            }`}
          >
            {settings.enabled ? 'ENABLED' : 'DISABLED'}
          </button>
        </div>

        {/* Sub-tabs */}
        <div className="flex gap-1 p-2 border-b border-neon-cyan/10">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={`px-3 py-1.5 font-mono-jet text-xs tracking-widest rounded-sm transition-all ${
                activeTab === t.id ? 'bg-neon-cyan text-cyber-black font-bold' : 'text-slate-500 hover:text-neon-cyan'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Settings tab */}
        {activeTab === 'settings' && (
          <div className="p-4 space-y-5">

            {/* Unsafe threshold */}
            <div>
              <div className="flex justify-between mb-2">
                <label className="font-mono-jet text-xs text-slate-500 tracking-widest">UNSAFE EVENT THRESHOLD</label>
                <span className="font-orbitron text-xs text-neon-red font-bold">{settings.unsafeThreshold} events</span>
              </div>
              <input type="range" min={1} max={20} step={1}
                value={settings.unsafeThreshold}
                onChange={e => setSettings(s => ({ ...s, unsafeThreshold: Number(e.target.value) }))}
                className="confidence-range"
                style={{ '--val': `${((settings.unsafeThreshold - 1) / 19) * 100}%` }}
              />
              <p className="font-mono-jet text-xs text-slate-600 mt-1">Alert fires when this many unsafe events occur in the time window below.</p>
            </div>

            {/* Window */}
            <div>
              <div className="flex justify-between mb-2">
                <label className="font-mono-jet text-xs text-slate-500 tracking-widest">TIME WINDOW</label>
                <span className="font-orbitron text-xs text-neon-cyan font-bold">{settings.windowSeconds}s</span>
              </div>
              <input type="range" min={10} max={300} step={10}
                value={settings.windowSeconds}
                onChange={e => setSettings(s => ({ ...s, windowSeconds: Number(e.target.value) }))}
                className="confidence-range"
                style={{ '--val': `${((settings.windowSeconds - 10) / 290) * 100}%` }}
              />
              <div className="flex justify-between mt-1">
                <span className="font-mono-jet text-xs text-slate-600">10s</span>
                <span className="font-mono-jet text-xs text-slate-600">5 min</span>
              </div>
            </div>

            {/* Summary */}
            <div className="bg-neon-red/5 border border-neon-red/20 rounded-sm p-3">
              <p className="font-mono-jet text-xs text-slate-400 leading-relaxed">
                Alert fires when <span className="text-neon-red font-bold">{settings.unsafeThreshold} unsafe event{settings.unsafeThreshold !== 1 ? 's' : ''}</span> occur within a <span className="text-neon-cyan font-bold">{settings.windowSeconds}s</span> window.
              </p>
            </div>

            {/* Push notifications */}
            <div className="border-t border-slate-800 pt-4 space-y-3">
              <p className="font-mono-jet text-xs text-slate-500 tracking-widest">NOTIFICATION CHANNELS</p>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-mono-jet text-xs text-slate-300">Browser Push Notifications</p>
                  <p className="font-mono-jet text-xs text-slate-600">{pushGranted ? 'Permission granted' : 'Permission required'}</p>
                </div>
                {pushGranted ? (
                  <button
                    onClick={() => setSettings(s => ({ ...s, pushNotifications: !s.pushNotifications }))}
                    className={`font-mono-jet text-xs px-3 py-1 rounded-sm border transition-all ${
                      settings.pushNotifications
                        ? 'border-neon-green text-neon-green'
                        : 'border-slate-600 text-slate-600 hover:border-neon-cyan hover:text-neon-cyan'
                    }`}
                  >
                    {settings.pushNotifications ? 'ON' : 'OFF'}
                  </button>
                ) : (
                  <button onClick={requestPush} className="btn-cyber px-3 py-1 text-xs font-mono-jet">
                    <span>ALLOW</span>
                  </button>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-mono-jet text-xs text-slate-300">Alert Sound</p>
                  <p className="font-mono-jet text-xs text-slate-600">Audible beep on threshold breach</p>
                </div>
                <button
                  onClick={() => setSettings(s => ({ ...s, soundEnabled: !s.soundEnabled }))}
                  className={`font-mono-jet text-xs px-3 py-1 rounded-sm border transition-all ${
                    settings.soundEnabled
                      ? 'border-neon-green text-neon-green'
                      : 'border-slate-600 text-slate-600 hover:border-neon-cyan hover:text-neon-cyan'
                  }`}
                >
                  {settings.soundEnabled ? 'ON' : 'OFF'}
                </button>
              </div>
            </div>

            {/* Test button */}
            <button onClick={testAlert} className="btn-danger w-full py-2 text-xs font-mono-jet tracking-widest">
              TEST ALERT
            </button>
          </div>
        )}

        {/* History tab */}
        {activeTab === 'history' && (
          <div>
            {alertHistory.length > 0 && (
              <div className="px-4 py-2 border-b border-neon-cyan/10 flex justify-end">
                <button onClick={clearHistory} className="font-mono-jet text-xs text-slate-500 hover:text-neon-red transition-colors">CLEAR ALL</button>
              </div>
            )}
            <div className="max-h-64 overflow-y-auto divide-y divide-slate-800/50">
              {alertHistory.length === 0 ? (
                <div className="p-6 text-center">
                  <p className="font-mono-jet text-xs text-slate-600">No alerts triggered yet.</p>
                </div>
              ) : alertHistory.map(alert => (
                <div key={alert.id} className="px-4 py-3 flex items-start gap-3">
                  <span className="text-neon-red text-xs mt-0.5 flex-shrink-0">⚠</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-mono-jet text-xs text-slate-300">{alert.message}</p>
                    <p className="font-mono-jet text-xs text-slate-600 mt-0.5">{new Date(alert.timestamp).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SmartAlerts;
