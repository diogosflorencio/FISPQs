import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { PdfList } from '../components/PDFList/index';
import { PdfViewer } from '../components/PDFViewer';
import { AboutScreen } from '../screens/AboutScreen';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { TutorialScreen } from '../screens/TutorialScreen';


const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const HomeStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="PdfList" 
        component={PdfList}
        options={{ 
          title: 'FISPQs - Meio Ambiente',
          headerStyle: {
            backgroundColor: '#004000',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      />
      <Stack.Screen 
        name="PdfViewer" 
        component={PdfViewer}
        options={({ route }) => ({ 
          title: route.params?.title || 'Visualizador',
          headerStyle: {
            backgroundColor: '#004000',
          },
          headerTintColor: '#fff',
        })}
      />
    </Stack.Navigator>
  );
};

export const AppNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#004000',
        tabBarInactiveTintColor: '#666',
        tabBarStyle: {
          paddingBottom: 5,
          height: 60,
        },
        headerShown: false,
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
          tabBarLabel: 'Tutorial',
          tabBarIcon: ({ color, size }) => (
            <Icon name="help" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="About"
        component={AboutScreen}
        options={{
          tabBarLabel: 'Sobre',
          tabBarIcon: ({ color, size }) => (
            <Icon name="info" size={size} color={color} />
          ),
        }}
      />
      
    </Tab.Navigator>
  );
}; 