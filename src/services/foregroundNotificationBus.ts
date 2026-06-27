import type { FcmNotificationData } from '../config/firebaseTopics';

export type ForegroundNotificationPayload = {
  title: string;
  body: string;
  data?: FcmNotificationData;
  onPress?: () => void;
};

type Listener = (payload: ForegroundNotificationPayload) => void;

let listener: Listener | null = null;

export function setForegroundNotificationListener(next: Listener | null): void {
  listener = next;
}

export function showForegroundNotification(payload: ForegroundNotificationPayload): void {
  listener?.(payload);
}
