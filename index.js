/**
 * @format
 */

import { AppRegistry } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import App from './App';
import { name as appName } from './app.json';
import 'react-native-url-polyfill/auto';

messaging().setBackgroundMessageHandler(async remoteMessage => {
  if (__DEV__) {
    console.log('FCM em segundo plano:', remoteMessage.notification?.title);
  }
});

AppRegistry.registerComponent(appName, () => App);
