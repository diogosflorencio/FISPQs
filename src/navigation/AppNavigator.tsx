import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { PdfList } from '../components/PDFList/index';
import { PdfViewer } from '../components/PDFViewer';
import { VersionScreen } from '../screens/VersionScreen';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { TutorialScreen } from '../screens/TutorialScreen';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { APP_COLORS } from '../config/theme';


const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const HomeStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="PdfList" 
        component={PdfList}
        options={{ 
          title: 'FDS/FISPQs - Meio Ambiente',
          headerStyle: {
            backgroundColor: APP_COLORS.primary,
          },
          headerTintColor: APP_COLORS.primaryTextOnPrimary,
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      />
      <Stack.Screen 
        name="PdfViewer" 
        component={PdfViewer as any} 
        options={({ route }) => ({ 
          title: (route.params as { title?: string })?.title || 'Visualizador',
          headerStyle: {
            backgroundColor: APP_COLORS.primary,
          },
          headerTintColor: APP_COLORS.primaryTextOnPrimary,
        })}
      />
    </Stack.Navigator>
  );
};

export const AppNavigator = () => {
  const insets = useSafeAreaInsets();
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: APP_COLORS.primary,
        tabBarInactiveTintColor: APP_COLORS.tabBarInactive,
        tabBarStyle: {
          paddingBottom: Math.max(5, insets.bottom),
          height: 60 + insets.bottom,
        },
        headerShown: false,
        tabBarHideOnKeyboard: true,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeStack}
        options={{
          tabBarLabel: 'FISPQs',
          tabBarIcon: ({ color, size }) => (
            <Icon name="description" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Tutorial"
        component={TutorialScreen}
        options={{
          tabBarLabel: 'Sobre',
          tabBarIcon: ({ color, size }) => (
            <Icon name="info" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="About"
        component={VersionScreen}
        options={{
          tabBarLabel: 'Versões',
          tabBarIcon: ({ color, size }) => (
            <Icon name="history" size={size} color={color} />
          ),
        }}
      />
      
    </Tab.Navigator>
  );
}; 