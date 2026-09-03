/**
 * Real-Time Bidirectional Event Synchronization Service
 * 
 * Synchronizes updates across:
 * 1. Admin Dashboard <--> Main Storefront (Home, Shop, Product Detail, Cart)
 * 2. Multi-tab and multi-window browser sessions (using Web BroadcastChannel API)
 * 3. Instant intra-window custom event dispatchers
 */

export type SyncEventType =
  | 'PRODUCT_UPDATED'
  | 'ORDER_PLACED'
  | 'ORDER_UPDATED'
  | 'CATEGORY_UPDATED'
  | 'SETTINGS_UPDATED'
  | 'INVENTORY_UPDATED'
  | 'REFRESH_ALL';

export interface SyncEventPayload<T = any> {
  type: SyncEventType;
  payload?: T;
  timestamp: number;
  sourceId: string;
}

const CHANNEL_NAME = 'fumare_live_sync_channel';
const INSTANCE_ID = `inst-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

let channel: BroadcastChannel | null = null;
if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
  try {
    channel = new BroadcastChannel(CHANNEL_NAME);
  } catch (e) {
    console.warn('[SyncService] BroadcastChannel unavailable, using Window events only:', e);
  }
}

/**
 * Broadcast an update to both current window and all other open tabs/windows
 */
export function broadcastSync<T = any>(type: SyncEventType, payload?: T) {
  const syncEvent: SyncEventPayload<T> = {
    type,
    payload,
    timestamp: Date.now(),
    sourceId: INSTANCE_ID
  };

  // 1. Dispatch custom event on window for immediate in-page components
  if (typeof window !== 'undefined') {
    try {
      window.dispatchEvent(new CustomEvent('fumare:sync', { detail: syncEvent }));
    } catch (e) {
      console.warn('[SyncService] Window event dispatch error:', e);
    }
  }

  // 2. Broadcast to other tabs/windows via BroadcastChannel
  if (channel) {
    try {
      channel.postMessage(syncEvent);
    } catch (e) {
      console.warn('[SyncService] BroadcastChannel postMessage error:', e);
    }
  }

  // 3. Fallback localStorage event trigger for cross-tab in older environments
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      localStorage.setItem('fumare_last_sync_event', JSON.stringify(syncEvent));
    } catch {
      // ignore quota errors
    }
  }
}

/**
 * Subscribe to sync events
 * @param filterType Specific event type to listen to, or '*' for all events
 * @param callback Callback function invoked when event occurs
 * @returns Unsubscribe function
 */
export function onSync(
  filterType: SyncEventType | '*',
  callback: (event: SyncEventPayload) => void
): () => void {
  if (typeof window === 'undefined') {
    return () => {};
  }

  const handleEvent = (event: SyncEventPayload) => {
    if (filterType === '*' || event.type === filterType) {
      callback(event);
    }
  };

  // Handler for in-window custom events
  const onCustomEvent = (e: Event) => {
    const customEvent = e as CustomEvent<SyncEventPayload>;
    if (customEvent.detail) {
      handleEvent(customEvent.detail);
    }
  };

  // Handler for cross-tab BroadcastChannel messages
  const onBroadcastMessage = (event: MessageEvent) => {
    if (event.data && event.data.type) {
      handleEvent(event.data as SyncEventPayload);
    }
  };

  // Handler for localStorage fallback
  const onStorageEvent = (e: StorageEvent) => {
    if (e.key === 'fumare_last_sync_event' && e.newValue) {
      try {
        const parsed = JSON.parse(e.newValue);
        if (parsed.sourceId !== INSTANCE_ID) {
          handleEvent(parsed);
        }
      } catch {
        // ignore JSON parse errors
      }
    }
  };

  window.addEventListener('fumare:sync', onCustomEvent);
  if (channel) {
    channel.addEventListener('message', onBroadcastMessage);
  }
  window.addEventListener('storage', onStorageEvent);

  return () => {
    window.removeEventListener('fumare:sync', onCustomEvent);
    if (channel) {
      channel.removeEventListener('message', onBroadcastMessage);
    }
    window.removeEventListener('storage', onStorageEvent);
  };
}
