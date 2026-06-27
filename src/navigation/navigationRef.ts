import { createNavigationContainerRef } from '@react-navigation/native';
import type { FcmNotificationData } from '../config/firebaseTopics';

export type RootTabParamList = {
  Home: undefined;
  Feedback: undefined;
  Avisos: undefined;
  Tutorial: undefined;
  About: undefined;
};

export const navigationRef = createNavigationContainerRef<RootTabParamList>();

let pendingNotification: FcmNotificationData | undefined;

export function setPendingNotification(data: FcmNotificationData | undefined): void {
  pendingNotification = data;
}

export function flushPendingNotification(): void {
  if (!pendingNotification || !navigationRef.isReady()) {
    return;
  }
  const data = pendingNotification;
  pendingNotification = undefined;
  navigateFromNotification(data);
}

export function navigateFromNotification(data: FcmNotificationData | undefined): void {
  if (!data?.type) {
    if (navigationRef.isReady()) {
      navigationRef.navigate('Home');
    }
    return;
  }

  if (!navigationRef.isReady()) {
    setPendingNotification(data);
    return;
  }

  switch (data.type) {
    case 'aviso':
      navigationRef.navigate('Avisos');
      break;
    case 'feedback':
      navigationRef.navigate('Feedback');
      break;
    case 'doc':
    case 'app':
    default:
      navigationRef.navigate('Home');
      break;
  }
}
