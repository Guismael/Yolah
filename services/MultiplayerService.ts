// TCP Multiplayer Service for Yolah
import TcpSocket from 'react-native-tcp-socket';
import dgram from 'react-native-udp';

export const DEFAULT_MULTIPLAYER_PORT = 8888;
export const DEFAULT_DISCOVERY_PORT = 10010;
const ROOM_DISCOVERY_MULTICAST_GROUP = '224.0.0.10';
const ROOM_BROADCAST_PREFIX = 'IDroom:';

const toUint8Array = (data: any): Uint8Array => {
  if (!data) {
    return new Uint8Array();
  }

  if (data instanceof Uint8Array) {
    return data;
  }

  if (Array.isArray(data)) {
    return Uint8Array.from(data);
  }

  if (typeof data === 'string') {
    try {
      return new TextEncoder().encode(data);
    } catch {
      return new Uint8Array();
    }
  }

  if (typeof data.length === 'number' && data.length >= 0) {
    try {
      const out = new Uint8Array(data.length);
      for (let i = 0; i < data.length; i += 1) {
        out[i] = Number(data[i]) & 0xff;
      }
      return out;
    } catch {
      return new Uint8Array();
    }
  }

  return new Uint8Array();
};

const decodeUtf8 = (bytes: Uint8Array): string => {
  if (!bytes.length) {
    return '';
  }

  try {
    return new TextDecoder('utf-8').decode(bytes);
  } catch {
    return String(bytes);
  }
};

const toHexPreview = (bytes: Uint8Array, maxBytes: number = 96): string => {
  if (!bytes.length) {
    return '<empty>';
  }

  const clipped = bytes.slice(0, maxBytes);
  const hex = Array.from(clipped, (b) => b.toString(16).padStart(2, '0')).join(' ');
  if (bytes.length > maxBytes) {
    return `${hex} ... (+${bytes.length - maxBytes} bytes)`;
  }
  return hex;
};

export type PlayerRole = 'host' | 'client';
export type GameMove = {
  type: 'move';
  from: [number, number];
  to: [number, number];
  player: 'b' | 'w';
};

export type GameMessage = 
  | GameMove
  | { type: 'start'; hostColor: 'b' | 'w'; timer?: number }
  | { type: 'restart' }
  | { type: 'disconnect' }
  | { type: 'profile'; username: string; profileImage: string | null };

type ConnectionCallback = (connected: boolean, role: PlayerRole) => void;
type MessageCallback = (message: GameMessage) => void;
type ErrorCallback = (error: string) => void;
type DiscoveryLogCallback = (entry: string) => void;
type RoomAnnouncementCallback = (roomId: string, hostIp: string, fromAddress: string, rawMessage: string) => void;

class MultiplayerService {
  private socket: any = null;
  private server: any = null;
  private role: PlayerRole | null = null;
  private isConnected: boolean = false;
  private connectTimeoutHandle: ReturnType<typeof setTimeout> | null = null;
  private broadcastIntervalHandle: ReturnType<typeof setInterval> | null = null;
  private readonly connectTimeoutMs = 10000;
  
  private onConnectionChange: ConnectionCallback | null = null;
  private readonly connectionListeners: Set<ConnectionCallback> = new Set();
  private onMessage: MessageCallback | null = null;
  private onError: ErrorCallback | null = null;
  private onDiscoveryLog: DiscoveryLogCallback | null = null;
  private onRoomAnnouncement: RoomAnnouncementCallback | null = null;
  private incomingBuffer: string = '';
  private messageQueue: GameMessage[] = [];
  private broadcastSocket: any = null;
  private discoverySocket: any = null;
  private isBroadcastStopping: boolean = false;
  private isDiscoveryStopping: boolean = false;

  private emitDiscoveryLog(message: string): void {
    console.log(`[RoomDiscovery] ${message}`);
    this.onDiscoveryLog?.(message);
  }

  private handleIncomingData(data: any): void {
    try {
      const chunk = data.toString();
      console.log('[Transport] Raw chunk received:', chunk);
      this.incomingBuffer += chunk;
      const messages = this.incomingBuffer.split('\n');
      this.incomingBuffer = messages.pop() ?? '';

      for (const rawMessage of messages) {
        const payload = rawMessage.trim();
        if (!payload) continue;

        try {
          const message: GameMessage = JSON.parse(payload);
          console.log('[Transport] Parsed message:', message);
          
          // If callback is set, deliver message immediately
          if (this.onMessage) {
            this.onMessage(message);
          } else {
            // Buffer message if no callback is set yet
            console.log('[Transport] Buffering message, no callback registered yet:', message);
            this.messageQueue.push(message);
          }
        } catch (e) {
          console.error('[Transport] Error parsing message:', e, payload);
        }
      }
    } catch (error) {
      console.error('[Transport] Error processing incoming socket data:', error);
    }
  }

  private clearConnectTimeout(): void {
    if (this.connectTimeoutHandle) {
      clearTimeout(this.connectTimeoutHandle);
      this.connectTimeoutHandle = null;
    }
  }

  private emitError(error: string): void {
    if (this.onError) {
      this.onError(error);
    }
  }

  private emitConnection(connected: boolean, role: PlayerRole): void {
    this.onConnectionChange?.(connected, role);
    this.connectionListeners.forEach((listener) => {
      try {
        listener(connected, role);
      } catch (error) {
        console.error('Connection listener error:', error);
      }
    });
  }

  private ensureDisconnectedState(): void {
    this.clearConnectTimeout();
    this.isConnected = false;
    this.incomingBuffer = '';
  }

  // Start as host (server)
  startHost(port: number = DEFAULT_MULTIPLAYER_PORT): void {
    this.disconnect(() => {
      try {
        this.role = 'host';

        this.server = TcpSocket.createServer((socket: any) => {
          console.log('Client connected');
          this.clearConnectTimeout();
          this.socket = socket;
          this.isConnected = true;
          socket.setNoDelay?.(true);

          this.emitConnection(true, 'host');

          socket.on('data', (data: any) => {
            this.handleIncomingData(data);
          });

          socket.on('error', (error: any) => {
            console.error('Socket error:', error);
            this.emitError(`Host socket error: ${error?.message ?? error?.toString?.() ?? 'Unknown error'}`);
          });

          socket.on('close', () => {
            console.log('Client disconnected');
            this.ensureDisconnectedState();
            this.emitConnection(false, 'host');
          });
        }).listen({ port, host: '0.0.0.0', reuseAddress: true });

        this.server.on('listening', () => {
          const address = this.server?.address?.();
          console.log('Server listening on:', address);
        });

        this.server.on('error', (error: any) => {
          console.error('Server error:', error);
          this.emitError(`Server error on port ${port}: ${error?.message ?? error?.toString?.() ?? 'Unknown error'}`);
        });

        console.log(`Server started on port ${port}`);
      } catch (error: any) {
        console.error('Error starting host:', error);
        this.emitError(`Error starting host: ${error?.message ?? error?.toString?.() ?? 'Unknown error'}`);
      }
    });
  }

  // Connect as client
  connectToHost(host: string, port: number = DEFAULT_MULTIPLAYER_PORT): void {
    this.disconnect(() => {
      try {
        this.role = 'client';
        const normalizedHost = host.trim();

        if (!normalizedHost) {
          this.emitError('Host IP is empty.');
          return;
        }

        this.connectTimeoutHandle = setTimeout(() => {
          if (!this.isConnected && this.socket) {
            const timeoutMessage = `Connection timeout after ${Math.round(this.connectTimeoutMs / 1000)}s. Check Wi‑Fi, IP, port, and VPN/firewall settings.`;
            console.error(timeoutMessage);
            this.emitError(timeoutMessage);
            try {
              this.socket.destroy();
            } catch {
              // no-op
            }
            this.socket = null;
            this.ensureDisconnectedState();
          }
        }, this.connectTimeoutMs);

        console.log(`Attempting TCP connection to ${normalizedHost}:${port}`);

        this.socket = TcpSocket.createConnection({ host: normalizedHost, port }, () => {
          console.log('Connected to host');
          this.clearConnectTimeout();
          this.isConnected = true;
          this.socket?.setNoDelay?.(true);
          // Disable socket timeout after successful connection (0 = no timeout)
          this.socket?.setTimeout?.(0);
          this.emitConnection(true, 'client');
        });

        // Set timeout only for the connection phase
        this.socket?.setTimeout?.(this.connectTimeoutMs);

        this.socket.on('timeout', () => {
          // Only handle timeout if not yet connected (connection phase only)
          if (!this.isConnected) {
            const timeoutMessage = `Socket timeout while connecting to ${normalizedHost}:${port}.`;
            console.error(timeoutMessage);
            this.emitError(timeoutMessage);
            this.socket?.destroy?.();
          }
        });

        this.socket.on('data', (data: any) => {
          this.handleIncomingData(data);
        });

        this.socket.on('error', (error: any) => {
          console.error('Connection error:', error);
          this.clearConnectTimeout();
          this.emitError(`Connection error to ${normalizedHost}:${port}: ${error?.message ?? error?.toString?.() ?? 'Unknown error'}`);
          this.ensureDisconnectedState();
        });

        this.socket.on('close', () => {
          console.log('Disconnected from host');
          this.ensureDisconnectedState();
          this.emitConnection(false, 'client');
        });
      } catch (error: any) {
        console.error('Error connecting to host:', error);
        this.clearConnectTimeout();
        this.emitError(`Error connecting to host: ${error?.message ?? error?.toString?.() ?? 'Unknown error'}`);
      }
    });
  }

  // Send a message to the other player
  sendMessage(message: GameMessage): void {
    if (!this.socket || !this.isConnected) {
      console.log('Cannot send message: not connected');
      return;
    }

    try {
      const data = `${JSON.stringify(message)}\n`;
      this.socket.write(data);
      console.log('[Transport] Sent message:', message);
    } catch (error) {
      console.error('[Transport] Error sending message:', error);
    }
  }

  // Disconnect from the game
  disconnect(onDisconnected?: () => void): void {
    this.clearConnectTimeout();

    const finalize = () => {
      this.ensureDisconnectedState();
      this.role = null;
      onDisconnected?.();
    };

    if (this.socket) {
      try {
        if (this.isConnected) {
          this.sendMessage({ type: 'disconnect' });
        }
      } catch (e) {
        console.error('Error sending disconnect message:', e);
      }

      try {
        // Keep an error listener attached while closing to avoid unhandled late errors.
        this.socket.on?.('error', (error: any) => {
          console.log('Ignored socket error during shutdown:', error?.message ?? String(error));
        });
        this.socket.end?.();
      } catch {
        // no-op
      }
      this.socket.destroy?.();
      this.socket = null;
    }

    const serverToClose = this.server;
    this.server = null;

    if (serverToClose) {
      let finalized = false;
      const finalizeOnce = () => {
        if (finalized) return;
        finalized = true;
        finalize();
      };

      try {
        serverToClose.once?.('close', finalizeOnce);
        serverToClose.close?.(() => {
          finalizeOnce();
        });
        setTimeout(finalizeOnce, 300);
      } catch (error) {
        console.error('Error closing server:', error);
        finalizeOnce();
      }

      return;
    }

    finalize();
  }

  startRoomBroadcast(hostIp: string, roomId: string, discoveryPort: number = DEFAULT_DISCOVERY_PORT): void {
    this.stopRoomBroadcast();
    this.isBroadcastStopping = false;

    const normalizedIp = hostIp.trim();
    const normalizedRoomId = roomId.trim();
    if (!normalizedIp) {
      this.emitDiscoveryLog('Cannot broadcast room: host IP is empty.');
      return;
    }

    if (!normalizedRoomId) {
      this.emitDiscoveryLog('Cannot broadcast room: room ID is empty.');
      return;
    }

    try {
      this.broadcastSocket = dgram.createSocket({ type: 'udp4', reusePort: true });

      this.broadcastSocket.on('error', (error: any) => {
        if (this.isBroadcastStopping) {
          return;
        }
        this.emitDiscoveryLog(`Broadcast socket error: ${error?.message ?? String(error)}`);
      });

      this.broadcastSocket.on('listening', () => {
        const address = this.broadcastSocket?.address?.();
        this.emitDiscoveryLog(`Broadcast socket listening on ${address?.address ?? '0.0.0.0'}:${address?.port ?? 0}`);
      });

      this.broadcastSocket.bind(0, '0.0.0.0', () => {
        try {
          this.broadcastSocket?.setBroadcast(true);
          this.broadcastSocket?.setMulticastTTL?.(1);
        } catch (error: any) {
          this.emitDiscoveryLog(`Failed to configure multicast sender: ${error?.message ?? String(error)}`);
        }

        const payload = `${ROOM_BROADCAST_PREFIX}${normalizedRoomId}:${normalizedIp}`;
        this.emitDiscoveryLog(`Multicast group: ${ROOM_DISCOVERY_MULTICAST_GROUP}:${discoveryPort}`);
        this.emitDiscoveryLog(`Room payload: ${payload}`);

        const sendAnnouncement = () => {
          const socket = this.broadcastSocket;
          if (!socket || this.isBroadcastStopping) {
            return;
          }

          socket.send(payload, undefined, undefined, discoveryPort, ROOM_DISCOVERY_MULTICAST_GROUP, (error?: Error) => {
            if (error) {
              if (this.isBroadcastStopping || this.broadcastSocket !== socket) {
                return;
              }

              this.emitDiscoveryLog(`Multicast send error to ${ROOM_DISCOVERY_MULTICAST_GROUP}:${discoveryPort}: ${error.message}`);
              return;
            }

            if (this.isBroadcastStopping || this.broadcastSocket !== socket) {
              return;
            }

            this.emitDiscoveryLog(`Multicast sent: ${payload} -> ${ROOM_DISCOVERY_MULTICAST_GROUP}:${discoveryPort}`);
          });
        };

        sendAnnouncement();
        this.broadcastIntervalHandle = setInterval(sendAnnouncement, 1000);
      });
    } catch (error: any) {
      this.emitDiscoveryLog(`Failed to start room broadcast: ${error?.message ?? String(error)}`);
    }
  }

  stopRoomBroadcast(): void {
    this.isBroadcastStopping = true;

    if (this.broadcastIntervalHandle) {
      clearInterval(this.broadcastIntervalHandle);
      this.broadcastIntervalHandle = null;
    }

    if (this.broadcastSocket) {
      const socketToClose = this.broadcastSocket;
      this.broadcastSocket = null;

      try {
        // Keep an error handler while closing; otherwise a late "Socket is closed" can be unhandled.
        socketToClose.on?.('error', (error: any) => {
          const message = error?.message ?? String(error);
          if (message.includes('Socket is closed')) {
            return;
          }
          this.emitDiscoveryLog(`Ignored broadcast error during shutdown: ${message}`);
        });

        socketToClose.close?.(() => {
          this.emitDiscoveryLog('Room broadcast stopped.');
        });
      } catch {
        // no-op
      }
    }
  }

  startRoomDiscovery(discoveryPort: number = DEFAULT_DISCOVERY_PORT, localDeviceIp?: string): void {
    this.stopRoomDiscovery();
    this.isDiscoveryStopping = false;

    const normalizedLocalIp = localDeviceIp?.trim();
    if (normalizedLocalIp) {
      this.emitDiscoveryLog(`Discovery local IP context: ${normalizedLocalIp}`);
    }

    try {
      this.discoverySocket = dgram.createSocket({ type: 'udp4', reusePort: true });

      try {
        this.discoverySocket?.setReuseAddr?.(true);
      } catch {
        // no-op
      }

      this.discoverySocket.on('error', (error: any) => {
        if (this.isDiscoveryStopping) {
          return;
        }
        this.emitDiscoveryLog(`Discovery socket error: ${error?.message ?? String(error)}`);
      });

      this.discoverySocket.on('listening', () => {
        const address = this.discoverySocket?.address?.();
        this.emitDiscoveryLog(`Discovery listening on ${address?.address ?? '0.0.0.0'}:${address?.port ?? discoveryPort}`);

        try {
          this.discoverySocket.addMembership?.(ROOM_DISCOVERY_MULTICAST_GROUP);
          this.discoverySocket.setMulticastLoopback?.(true);
          this.emitDiscoveryLog(`Joined multicast group ${ROOM_DISCOVERY_MULTICAST_GROUP}`);
        } catch (error: any) {
          this.emitDiscoveryLog(`Failed to join multicast group: ${error?.message ?? String(error)}`);
        }
      });

      this.discoverySocket.on('message', (message: any, remoteInfo: any) => {
        const rawBytes = toUint8Array(message);
        const payload = decodeUtf8(rawBytes);
        const fromAddress = remoteInfo?.address ?? 'unknown';
        const fromPort = remoteInfo?.port ?? 'unknown';
        const rawHexPreview = toHexPreview(rawBytes);

        this.emitDiscoveryLog(`RAW packet src=${fromAddress}:${fromPort} bytes=${rawBytes.length} hex=${rawHexPreview}`);
        this.emitDiscoveryLog(`RAW text: ${payload}`);

        if (normalizedLocalIp && fromAddress === normalizedLocalIp) {
          this.emitDiscoveryLog(`Ignored self packet from ${fromAddress}.`);
          return;
        }

        if (!payload.startsWith(ROOM_BROADCAST_PREFIX)) {
          this.emitDiscoveryLog('Ignored packet: not a room announcement.');
          return;
        }

        const announcement = payload.slice(ROOM_BROADCAST_PREFIX.length).trim();
        const [roomId, ...ipParts] = announcement.split(':');
        const hostIp = ipParts.join(':').trim();

        if (!roomId) {
          this.emitDiscoveryLog('Ignored room announcement: empty room ID.');
          return;
        }

        if (!hostIp) {
          this.emitDiscoveryLog('Ignored room announcement: empty host IP.');
          return;
        }

        this.emitDiscoveryLog(`Room found: id=${roomId} host=${hostIp} (sender ${fromAddress})`);
        this.onRoomAnnouncement?.(roomId, hostIp, fromAddress, payload);
      });

      this.discoverySocket.bind(discoveryPort, '0.0.0.0');
    } catch (error: any) {
      this.emitDiscoveryLog(`Failed to start room discovery: ${error?.message ?? String(error)}`);
    }
  }

  stopRoomDiscovery(): void {
    this.isDiscoveryStopping = true;

    if (this.discoverySocket) {
      const socketToClose = this.discoverySocket;
      this.discoverySocket = null;

      try {
        // Keep an error handler while closing; otherwise a late "Socket is closed" can be unhandled.
        socketToClose.on?.('error', (error: any) => {
          const message = error?.message ?? String(error);
          if (message.includes('Socket is closed')) {
            return;
          }
          this.emitDiscoveryLog(`Ignored discovery error during shutdown: ${message}`);
        });

        socketToClose.close?.(() => {
          this.emitDiscoveryLog('Room discovery stopped.');
        });
      } catch {
        // no-op
      }
    }
  }

  // Set callback handlers
  setConnectionCallback(callback: ConnectionCallback): void {
    this.onConnectionChange = callback;
  }

  addConnectionListener(callback: ConnectionCallback): () => void {
    this.connectionListeners.add(callback);
    return () => {
      this.connectionListeners.delete(callback);
    };
  }

  setMessageCallback(callback: MessageCallback | null): void {
    this.onMessage = callback;
    
    // Flush any buffered messages
    if (this.messageQueue.length > 0) {
      console.log('[Transport] Flushing buffered messages:', this.messageQueue.length);
      const queuedMessages = [...this.messageQueue];
      this.messageQueue = [];
      for (const message of queuedMessages) {
        console.log('[Transport] Delivering buffered message:', message);
        callback?.(message);
      }
    }
  }

  setErrorCallback(callback: ErrorCallback): void {
    this.onError = callback;
  }

  setDiscoveryLogCallback(callback: DiscoveryLogCallback | null): void {
    this.onDiscoveryLog = callback;
  }

  setRoomAnnouncementCallback(callback: RoomAnnouncementCallback | null): void {
    this.onRoomAnnouncement = callback;
  }

  // Getters
  getRole(): PlayerRole | null {
    return this.role;
  }

  getIsConnected(): boolean {
    return this.isConnected;
  }
}

// Singleton instance
export const multiplayerService = new MultiplayerService();
