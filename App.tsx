import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppNavigator } from './src/navigation/AppNavigator';
import { VersionCheckProvider } from './src/context/VersionCheckContext';

const App = () => {
  return (
    <SafeAreaProvider>
      <VersionCheckProvider>
        <NavigationContainer>
          <AppNavigator />
        </NavigationContainer>
      </VersionCheckProvider>
    </SafeAreaProvider>
  );
};

export default App;
