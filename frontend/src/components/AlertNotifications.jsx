import React, { useState, useEffect, useRef } from 'react';

const AlertNotifications = () => {
  const [alerts, setAlerts] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('Disconnected');
  const wsRef = useRef(null);
  const reconnectRef = useRef(null);
  const isUnmountedRef = useRef(false);

  useEffect(() => {
    isUnmountedRef.current = false;
    connectWebSocket();
    return () => {
      // Mark unmounted FIRST so the ws.onclose handler does not schedule a reconnect.
      isUnmountedRef.current = true;
      if (reconnectRef.current) { clearTimeout(reconnectRef.current); reconnectRef.current = null; }
      if (wsRef.current) { wsRef.current.close(); wsRef.current = null; }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const connectWebSocket = () => {
    if (isUnmountedRef.current) return;
    try {
      setConnectionStatus('Connecting...');
      const ws = new WebSocket('ws://localhost:8000/ws/alerts');
      ws.onopen = () => { if (!isUnmountedRef.current) { setIsConnected(true); setConnectionStatus('Connected'); } };
      ws.onmessage = (event) => {
        if (isUnmountedRef.current) return;
        const data = JSON.parse(event.data);
        if (data.type === 'alert') {
          const newAlert = { id: Date.now(), type: data.alert_type, message: data.message, timestamp: new Date(data.timestamp).toLocaleTimeString(), data: data.data };
          setAlerts(prev => [newAlert, ...prev].slice(0, 8));
          setTimeout(() => setAlerts(prev => prev.filter(a => a.id !== newAlert.id)), 10000);
        }
      };
      ws.onerror = () => { if (!isUnmountedRef.current) setConnectionStatus('Error'); };
      ws.onclose = () => {
        if (isUnmountedRef.current) return;
        setIsConnected(false);
        setConnectionStatus('Disconnected');
        // Schedule a tracked reconnect so it can be cancelled on unmount.
        reconnectRef.current = setTimeout(connectWebSocket, 5000);
      };
      wsRef.current = ws;
    } catch { if (!isUnmountedRef.current) setConnectionStatus('Failed'); }
  };

  const getAlertConfig = (type) => ({
    danger:  { border: 'neon-border-red',   icon: '⚠', label: 'THREAT DETECTED',  textColor: 'text-neon-red' },
    warning: { border: 'neon-border-red',   icon: '⚡', label: 'WARNING',           textColor: 'text-yellow-400' },
    success: { border: 'neon-border-green', icon: '✓', label: 'CLEAR',             textColor: 'text-neon-green' },
    info:    { border: 'neon-border',       icon: 'i', label: 'INFO',              textColor: 'text-neon-cyan' },
  }[type] || { border: 'neon-border', icon: '•', label: 'ALERT', textColor: 'text-neon-cyan' });

  return (
    <div className="fixed top-16 right-4 z-50 w-80 space-y-2">
      {/* WS status */}
      <div className="glass-panel p-2.5 rounded-sm flex items-center justify-between">
        <span className="font-mono-jet text-xs text-slate-500 tracking-widest">WS STATUS</span>
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-neon-green animate-pulse' : 'bg-neon-red'}`} />
          <span className={`font-mono-jet text-xs ${isConnected ? 'text-neon-green' : 'text-neon-red'}`}>{connectionStatus.toUpperCase()}</span>
        </div>
      </div>

      {/* Alerts */}
      {alerts.map(alert => {
        const cfg = getAlertConfig(alert.type);
        return (
          <div key={alert.id} className={`glass-panel ${cfg.border} rounded-sm p-3 animate-slide-in ${alert.type === 'danger' ? 'animate-shake' : ''}`}>
            <div className="flex items-start gap-3">
              <span className={`font-sora text-base ${cfg.textColor} mt-0.5`}>{cfg.icon}</span>
              <div className="flex-1 min-w-0">
                <div className={`font-sora text-xs font-bold tracking-widest ${cfg.textColor}`}>{cfg.label}</div>
                <p className="font-mono-jet text-xs text-slate-300 mt-0.5 truncate">{alert.message}</p>
                <p className="font-mono-jet text-xs text-slate-600 mt-1">{alert.timestamp}</p>
                {alert.data?.status && (
                  <span className={alert.data.status === 'SAFE' ? 'badge-safe' : 'badge-unsafe'}>{alert.data.status}</span>
                )}
              </div>
              <button onClick={() => setAlerts(prev => prev.filter(a => a.id !== alert.id))} className="text-slate-600 hover:text-white transition-colors text-xs">✕</button>
            </div>
          </div>
        );
      })}

      {alerts.length === 0 && isConnected && (
        <div className="glass-panel p-3 rounded-sm text-center">
          <p className="font-mono-jet text-xs text-slate-600 tracking-wide">NO ACTIVE ALERTS</p>
        </div>
      )}
    </div>
  );
};

export default AlertNotifications;
