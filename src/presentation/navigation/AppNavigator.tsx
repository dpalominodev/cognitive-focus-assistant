import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { HomeScreen } from '../screens/HomeScreen';
import { StatsScreen } from '../screens/StatsScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { CalendarScreen } from '../screens/CalendarScreen';
import { useApp } from '../context/AppContext';
import { Text } from 'react-native'; 

const Tab = createBottomTabNavigator();

export const AppNavigator = () => {
  const { userName, loading } = useApp();

  if (loading) return null; 

  if (!userName) {
    return <LoginScreen />;
  }

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: { 
            backgroundColor: '#121212', 
            borderTopColor: '#333', 
            height: 60, 
            paddingBottom: 10 
          },
          tabBarActiveTintColor: '#6C63FF',
          tabBarInactiveTintColor: '#666',
        }}
      >
        <Tab.Screen 
          name="Misiones" 
          component={HomeScreen} 
          options={{
            tabBarIcon: ({color}) => <Text style={{color, fontSize: 20}}>⚔️</Text>
          }}
        />
        
        <Tab.Screen 
          name="Calendario" 
          component={CalendarScreen} 
          options={{
            tabBarIcon: ({color}) => <Text style={{color, fontSize: 20}}>📆</Text>
          }}
        />

        <Tab.Screen 
          name="Datos" 
          component={StatsScreen} 
          options={{
            tabBarIcon: ({color}) => <Text style={{color, fontSize: 20}}>📊</Text>
          }}
        />
        <Tab.Screen 
          name="Menu" 
          component={ProfileScreen} 
          options={{
            tabBarIcon: ({color}) => <Text style={{color, fontSize: 20}}>👤</Text>
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
};