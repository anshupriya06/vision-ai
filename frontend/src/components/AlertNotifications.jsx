import React, { useState, useEffect, useRef } from 'react';

const AlertNotifications = () => {
  const [alerts, setAlerts] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('Disconnected');
  const wsRef = useRef(null);

  useEffect(() => {
    // Connect to WebSocket
    connectWebSocket();

    // Cleanup on unmount
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  const connectWebSocket = () => {
    try {
      setConnectionStatus('Connecting...');
      const ws = new WebSocket('ws://localhost:8000/ws/alerts');

      ws.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        setConnectionStatus('Connected');
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log('Received message:', data);

        if (data.type === 'alert') {
          // Add new alert to the list
          const newAlert = {
            id: Date.now(),
            type: data.alert_type,
            message: data.message,
            timestamp: new Date(data.timestamp).toLocaleTimeString(),
            data: data.data,
          };

          setAlerts((prevAlerts) => [newAlert, ...prevAlerts].slice(0, 10)); // Keep last 10 alerts

          // Auto-remove after 10 seconds
          setTimeout(() => {
            setAlerts((prevAlerts) => prevAlerts.filter((a) => a.id !== newAlert.id));
          }, 10000);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setConnectionStatus('Error');
      };

      ws.onclose = () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
        setConnectionStatus('Disconnected');

        // Attempt to reconnect after 5 seconds
        setTimeout(() => {
          console.log('Attempting to reconnect...');
          connectWebSocket();
        }, 5000);
      };

      wsRef.current = ws;
    } catch (error) {
      console.error('Failed to connect:', error);
      setConnectionStatus('Failed');
    }
  };

  const sendPing = () => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'ping' }));
    }
  };

  const getAlertStyles = (type) => {
    const baseStyles = 'p-4 rounded-xl shadow-lg backdrop-blur-xl border animate-slide-in';
    const typeStyles = {
      danger: 'bg-red-500/20 border-red-500/50 text-red-100',
      warning: 'bg-yellow-500/20 border-yellow-500/50 text-yellow-100',
      success: 'bg-green-500/20 border-green-500/50 text-green-100',
      info: 'bg-blue-500/20 border-blue-500/50 text-blue-100',
    };
    return `${baseStyles} ${typeStyles[type] || typeStyles.info}`;
  };

  const getAlertIcon = (type) => {
    const icons = {
      danger: '🚨',
      warning: '⚠️',
      success: '✅',
      info: 'ℹ️',
    };
    return icons[type] || '📢';
  };

  return (
    <div className="fixed top-20 right-4 z-50 w-96 space-y-3">
      {/* Connection Status */}
      <div className="glassmorphism p-3 rounded-xl border border-white/10">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-300">WebSocket Status</span>
          <div className="flex items-center space-x-2">
            <span
              className={`w-3 h-3 rounded-full ${
                isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'
              }`}
            ></span>
            <span className="text-sm text-white">{connectionStatus}</span>
          </div>
        </div>
        {isConnected && (
          <button
            onClick={sendPing}
            className="mt-2 text-xs text-accent hover:text-white transition-colors"
          >
            Send Ping
          </button>
        )}
      </div>

      {/* Alert Messages */}
      <div className="space-y-2">
        {alerts.map((alert) => (
          <div key={alert.id} className={getAlertStyles(alert.type)}>
            <div className="flex items-start space-x-3">
              <span className="text-2xl">{getAlertIcon(alert.type)}</span>
              <div className="flex-1">
                <p className="font-semibold text-white">{alert.message}</p>
                <p className="text-xs mt-1 opacity-75">{alert.timestamp}</p>
                {alert.data && Object.keys(alert.data).length > 0 && (
                  <div className="mt-2 text-xs opacity-90">
                    {alert.data.filename && (
                      <div>📹 {alert.data.filename}</div>
                    )}
                    {alert.data.status && (
                      <div>
                        Status: <span className="font-bold">{alert.data.status}</span>
                      </div>
                    )}
                    {alert.data.confidence && (
                      <div>Confidence: {(alert.data.confidence * 100).toFixed(1)}%</div>
                    )}
                  </div>
                )}
              </div>
              <button
                onClick={() => setAlerts((prev) => prev.filter((a) => a.id !== alert.id))}
                className="text-white/50 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {alerts.length === 0 && isConnected && (
        <div className="glassmorphism p-6 rounded-xl border border-white/10 text-center">
          <p className="text-gray-400 text-sm">
            No alerts yet. Waiting for video processing...
          </p>
        </div>
      )}
    </div>
  );
};

export default AlertNotifications;
