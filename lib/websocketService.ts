import { RealtimeChannel, RealtimePostgresChangesPayload, RealtimePostgresChangesFilter } from '@supabase/supabase-js';
import { supabase } from './supabase';

type EventType = 'INSERT' | 'UPDATE' | 'DELETE' | '*';
type MessageHandler = (data: unknown) => void;
type TableEvent = 'INSERT' | 'UPDATE' | 'DELETE' | '*';

interface SubscribeToTableOptions {
  table: string;
  event: TableEvent;
  schema?: string;
  filter?: Record<string, string>;
}

interface QueuedMessage {
  message: unknown;
  resolve: (value: boolean) => void;
}

export class WebSocketService {
  private static instance: WebSocketService;
  private channel: RealtimeChannel | null = null;
  private messageHandlers: Set<MessageHandler> = new Set();
  private isConnected = false;

  private notifyHandlers(data: unknown): void {
    this.messageHandlers.forEach(handler => handler(data));
  }
  private readonly channelName: string;
  private connectionPromise: Promise<boolean> | null = null;
  private messageQueue: QueuedMessage[] = [];
  private authToken: string | null = null;

  private constructor() {
    this.channelName = 'xquests_realtime_channel';
  }

  public static getInstance(): WebSocketService {
    if (!WebSocketService.instance) {
      WebSocketService.instance = new WebSocketService();
    }
    return WebSocketService.instance;
  }

  public getConnectionStatus(): boolean {
    return this.isConnected;
  }

  public async disconnect(): Promise<void> {
    if (this.channel) {
      try {
        const status = await this.channel.unsubscribe();
        if (status === 'error') {
          console.error('Error disconnecting from WebSocket');
        }
      } catch (error) {
        console.error('Error during WebSocket disconnect:', error);
      } finally {
        this.channel = null;
      }
    }
    this.isConnected = false;
    this.connectionPromise = null;
  }

  public setAuthToken(token: string): void {
    this.authToken = token;
    if (this.isConnected) {
      this.disconnect().then(() => this.connect());
    }
  }

  public async connect(): Promise<boolean> {
    if (this.connectionPromise) {
      return this.connectionPromise;
    }

    this.connectionPromise = new Promise<boolean>(async (resolve, reject) => {
      try {
        if (this.isConnected && this.channel) {
          resolve(true);
          return;
        }

        this.channel = supabase.channel(this.channelName, {
          config: {
            broadcast: { self: true },
            presence: { key: 'presence' },
          },
        });

        if (!this.channel) {
          throw new Error('Failed to create channel');
        }

        this.channel
          .on('broadcast', { event: 'message' }, (payload: unknown) => {
            if (payload && typeof payload === 'object' && 'payload' in payload) {
              this.notifyHandlers((payload as { payload: unknown }).payload);
            }
          })
          .on('presence', { event: 'sync' }, () => {
            // eslint-disable-next-line no-console
            console.log('Online users:', this.channel?.presenceState());
          })
          .subscribe((status) => {
            const wasConnected = this.isConnected;
            this.isConnected = status === 'SUBSCRIBED';
            
            if (this.isConnected && !wasConnected) {
              // eslint-disable-next-line no-console
              console.log('Supabase Realtime connected');
              this.processMessageQueue();
              resolve(true);
            } else if (!this.isConnected && wasConnected) {
              // eslint-disable-next-line no-console
              console.log('Supabase Realtime disconnected');
              this.cleanup();
            }
          });

        this.isConnected = true;
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error connecting to Supabase Realtime:', error);
        this.cleanup();
        reject(error);
      }
    });

    return this.connectionPromise;
  }
          

  private cleanup(): void {
    this.isConnected = false;
    this.connectionPromise = null;
  }

  private processMessageQueue(): void {
    while (this.messageQueue.length > 0 && this.isConnected && this.channel) {
      const item = this.messageQueue.shift();
      if (item) {
        const { message, resolve } = item;
        this.send(message)
          .then(() => resolve(true))
          .catch((error: Error) => {
            // eslint-disable-next-line no-console
            console.error('Error processing queued message:', error);
            resolve(false);
          });
      }
    }
  }

  private async send(message: unknown): Promise<boolean> {
    if (!this.isConnected || !this.channel) {
      return new Promise((resolve) => {
        this.messageQueue.push({ message, resolve });
        if (!this.connectionPromise) {
          this.connect().catch((error: Error) => {
            // eslint-disable-next-line no-console
            console.error('Failed to connect:', error);
          });
        }
      });
    }

    try {
      await this.channel.send({
        type: 'broadcast',
        event: 'message',
        payload: message,
      });
      return true;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error sending message:', error);
      return false;
    }
  }

  public async sendMessage<T>(message: {
    type: string;
    userId?: string;
    payload: T;
  }): Promise<boolean> {
    return this.send(message);
  }

  public addMessageHandler(handler: MessageHandler): () => void {
    this.messageHandlers.add(handler);
    return () => this.removeMessageHandler(handler);
  }

  public removeMessageHandler(handler: MessageHandler): void {
    this.messageHandlers.delete(handler);
  }


  public get connectionState(): string {
    if (!this.isConnected) return 'disconnected';
    return this.channel ? 'connected' : 'connecting';
  }



  public subscribeToTable(
    options: SubscribeToTableOptions | string,
    event?: TableEvent,
    schema = 'public',
    filter?: Record<string, string>
  ): () => void {
    if (!this.channel) {
      throw new Error('Not connected to Supabase Realtime');
    }

    const { table, event: eventName, schema: tableSchema } = 
      typeof options === 'string' 
        ? { table: options, event: event || '*', schema }
        : { 
            table: options.table, 
            event: options.event, 
            schema: options.schema || 'public',
          };

    // Create a channel with a unique name
    const channelName = `table-db-changes-${table}-${Date.now()}`;
    const channel = supabase.channel(channelName);
    
    // Set up the subscription with proper typing
    const subscription = channel
      .on(
        'postgres_changes' as any, // Type assertion needed due to type definition issues
        {
          event: eventName === '*' ? '*' : eventName.toLowerCase(),
          schema: tableSchema,
          table,
          ...(filter ? { filter } : {}),
        },
        (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => {
          this.notifyHandlers(payload);
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log(`Subscribed to ${table} changes`);
        } else if (status === 'CHANNEL_ERROR') {
          console.error(`Error subscribing to ${table} changes`);
        } else if (status === 'TIMED_OUT') {
          console.error(`Subscription to ${table} changes timed out`);
        } else if (status === 'CLOSED') {
          console.log(`Unsubscribed from ${table} changes`);
        }
      });

    // Return cleanup function
    return () => {
      subscription.unsubscribe();
    };
  }
} 

export const webSocketService = WebSocketService.getInstance();
