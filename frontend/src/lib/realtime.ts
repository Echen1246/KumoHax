import { AlertEvent } from './api';

export function subscribeToAlerts(
  endpoint: string,
  onMessage: (event: AlertEvent) => void,
  onError?: (error: Event) => void
): () => void {
  const source = new EventSource(endpoint);
  const handler = (evt: MessageEvent) => {
    try {
      const data = JSON.parse(evt.data) as AlertEvent;
      onMessage(data);
    } catch (_err) {
      // ignore malformed
    }
  };
  source.addEventListener('message', handler);
  if (onError) {
    source.addEventListener('error', onError);
  }
  return () => {
    source.removeEventListener('message', handler);
    source.close();
  };
} 