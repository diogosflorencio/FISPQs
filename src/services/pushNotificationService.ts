import { PermissionsAndroid, Platform } from 'react-native';
import messaging, { type FirebaseMessagingTypes } from '@react-native-firebase/messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FCM_TOPICS, type FcmNotificationData } from '../config/firebaseTopics';
import { navigateFromNotification, setPendingNotification } from '../navigation/navigationRef';
import { showForegroundNotification } from './foregroundNotificationBus';

const TOPICS_STORAGE_KEY = '@fispqs_fcm_topics_subscribed';

function parseNotificationData(
  message: FirebaseMessagingTypes.RemoteMessage,
): FcmNotificationData | undefined {
  const raw = message.data;
  if (!raw || typeof raw !== 'object') {
    return undefined;
  }
  return raw as FcmNotificationData;
}

async function requestNotificationPermission(): Promise<boolean> {
  if (Platform.OS === 'android') {
    if (Platform.Version >= 33) {
      const result = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
      );
      return result === PermissionsAndroid.RESULTS.GRANTED;
    }
    return true;
  }

  const authStatus = await messaging().requestPermission();
  return (
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL
  );
}

async function subscribeToAllTopics(): Promise<void> {
  const topics = Object.values(FCM_TOPICS);
  await Promise.all(topics.map(topic => messaging().subscribeToTopic(topic)));
  await AsyncStorage.setItem(TOPICS_STORAGE_KEY, JSON.stringify(topics));
}

function showForegroundAlert(message: FirebaseMessagingTypes.RemoteMessage): void {
  const title = message.notification?.title ?? 'FISPQs';
  const body = message.notification?.body ?? 'Nova atualização disponível.';
  const data = parseNotificationData(message);

  showForegroundNotification({
    title,
    body,
    data,
    onPress: () => navigateFromNotification(data),
  });
}

export async function initializePushNotifications(): Promise<void> {
  const granted = await requestNotificationPermission();
  if (!granted) {
    console.warn('Permissão de notificação não concedida.');
    return;
  }

  const alreadySubscribed = await AsyncStorage.getItem(TOPICS_STORAGE_KEY);
  if (!alreadySubscribed) {
    try {
      await subscribeToAllTopics();
      console.log('Inscrito nos tópicos FCM:', Object.values(FCM_TOPICS).join(', '));
    } catch (error) {
      console.error('Erro ao inscrever nos tópicos FCM:', error);
    }
  }

  if (Platform.OS === 'ios') {
    await messaging().registerDeviceForRemoteMessages();
  }

  const token = await messaging().getToken();
  if (__DEV__ && token) {
    console.log('FCM device token (debug):', token);
  }

  messaging().onTokenRefresh(newToken => {
    if (__DEV__) {
      console.log('FCM token atualizado:', newToken);
    }
  });

  messaging().onMessage(async remoteMessage => {
    showForegroundAlert(remoteMessage);
  });

  messaging().onNotificationOpenedApp(remoteMessage => {
    navigateFromNotification(parseNotificationData(remoteMessage));
  });

  const initial = await messaging().getInitialNotification();
  if (initial) {
    const data = parseNotificationData(initial);
    setPendingNotification(data);
  }
}
