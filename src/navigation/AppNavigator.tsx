import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { PdfList } from '../components/PdfList';
import { PdfViewer } from '../components/PdfViewer';
import { RootStackParamList } from './types';


const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator = () => {
  return (
    <NavigationContainer>
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
          // headerTitleAlign: 'center',
          }}
        />
        <Stack.Screen 
          name="PdfViewer" 
          component={PdfViewer}
          options={({ route }) => ({ 
            title: route.params?.title?.replace('.pdf', '') || 'Visualizador de fisqps (aqui deveria ter o nome do fispq)',
            headerStyle: {
              backgroundColor: '#004000',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          })}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}; 