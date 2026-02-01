"""
WebSocket Test Client for VisionSafe
Demonstrates how to connect to the /ws/alerts endpoint
"""
import asyncio
import json
import websockets
from datetime import datetime


async def listen_to_alerts():
    """
    Connect to WebSocket and listen for alerts
    """
    uri = "ws://localhost:8000/ws/alerts"
    
    print(f"[{datetime.now().strftime('%H:%M:%S')}] Connecting to {uri}...")
    
    try:
        async with websockets.connect(uri) as websocket:
            print(f"[{datetime.now().strftime('%H:%M:%S')}] ✓ Connected to VisionSafe alerts!")
            print("Listening for alerts... (Press Ctrl+C to stop)\n")
            
            # Send ping every 30 seconds to keep connection alive
            async def send_ping():
                while True:
                    await asyncio.sleep(30)
                    try:
                        await websocket.send(json.dumps({"type": "ping"}))
                        print(f"[{datetime.now().strftime('%H:%M:%S')}] → Sent ping")
                    except Exception as e:
                        print(f"Error sending ping: {e}")
                        break
            
            # Start ping task
            ping_task = asyncio.create_task(send_ping())
            
            # Listen for messages
            try:
                async for message in websocket:
                    data = json.loads(message)
                    
                    # Format output based on message type
                    timestamp = datetime.now().strftime('%H:%M:%S')
                    
                    if data.get("type") == "connection":
                        print(f"[{timestamp}] 🔗 {data['message']}\n")
                    
                    elif data.get("type") == "alert":
                        alert_type = data.get("alert_type", "info")
                        emoji = {
                            "info": "ℹ️",
                            "warning": "⚠️",
                            "danger": "🚨",
                            "success": "✅"
                        }.get(alert_type, "📢")
                        
                        print(f"[{timestamp}] {emoji} ALERT ({alert_type.upper()})")
                        print(f"  Message: {data['message']}")
                        
                        if data.get("data"):
                            print(f"  Data: {json.dumps(data['data'], indent=4)}")
                        print()
                    
                    elif data.get("type") == "pong":
                        print(f"[{timestamp}] ← Received pong")
                    
                    elif data.get("type") == "status":
                        print(f"[{timestamp}] 📊 Status: {data['active_connections']} active connections")
                    
                    else:
                        print(f"[{timestamp}] 📨 {json.dumps(data, indent=2)}\n")
            
            except websockets.exceptions.ConnectionClosed:
                print(f"\n[{datetime.now().strftime('%H:%M:%S')}] Connection closed by server")
            
            finally:
                ping_task.cancel()
    
    except Exception as e:
        print(f"[{datetime.now().strftime('%H:%M:%S')}] ❌ Connection failed: {str(e)}")
        print("\nMake sure the backend server is running on http://localhost:8000")


async def send_test_alert():
    """
    Example: Send a test message to the server
    """
    uri = "ws://localhost:8000/ws/alerts"
    
    async with websockets.connect(uri) as websocket:
        # Request status
        await websocket.send(json.dumps({"type": "status"}))
        response = await websocket.recv()
        print(f"Status response: {response}")


if __name__ == "__main__":
    print("=" * 60)
    print("VisionSafe WebSocket Alert Client")
    print("=" * 60)
    print()
    
    try:
        # Run the client
        asyncio.run(listen_to_alerts())
    except KeyboardInterrupt:
        print(f"\n[{datetime.now().strftime('%H:%M:%S')}] Client stopped by user")
    except Exception as e:
        print(f"Error: {str(e)}")
