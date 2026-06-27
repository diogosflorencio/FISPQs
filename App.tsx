import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppNavigator } from './src/navigation/AppNavigator';
import { VersionCheckProvider } from './src/context/VersionCheckContext';
import { ForegroundNotificationProvider } from './src/context/ForegroundNotificationProvider';
import { navigationRef, flushPendingNotification } from './src/navigation/navigationRef';
import { initializePushNotifications } from './src/services/pushNotificationService';

const App = () => {
  useEffect(() => {
    void initializePushNotifications();
  }, []);

  return (
    <SafeAreaProvider>
      <VersionCheckProvider>
        <ForegroundNotificationProvider>
          <NavigationContainer ref={navigationRef} onReady={flushPendingNotification}>
            <AppNavigator />
          </NavigationContainer>
        </ForegroundNotificationProvider>
      </VersionCheckProvider>
    </SafeAreaProvider>
  );
};

export default App;
