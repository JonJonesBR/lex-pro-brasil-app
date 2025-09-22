import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

// Importe as telas
import DashboardScreen from './app/screens/DashboardScreen';
import ClientesScreen from './app/screens/ClientesScreen';
import AgendaScreen from './app/screens/AgendaScreen';
import ProcessosScreen from './app/screens/ProcessosScreen';
import FinanceiroScreen from './app/screens/FinanceiroScreen';
import ConfigScreen from './app/screens/ConfigScreen';

const Tab = createBottomTabNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Tab.Navigator
        initialRouteName="Dashboard"
        screenOptions={{
          tabBarActiveTintColor: '#003366',
          tabBarInactiveTintColor: 'gray',
        }}
      >
        <Tab.Screen 
          name="Dashboard" 
          component={DashboardScreen} 
          options={{
            tabBarLabel: 'Dashboard',
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="view-dashboard" color={color} size={size} />
            ),
          }}
        />
        <Tab.Screen 
          name="Clientes" 
          component={ClientesScreen} 
          options={{
            tabBarLabel: 'Clientes',
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="account-group" color={color} size={size} />
            ),
          }}
        />
        <Tab.Screen 
          name="Agenda" 
          component={AgendaScreen} 
          options={{
            tabBarLabel: 'Agenda',
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="calendar-clock" color={color} size={size} />
            ),
          }}
        />
        <Tab.Screen 
          name="Processos" 
          component={ProcessosScreen} 
          options={{
            tabBarLabel: 'Processos',
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="gavel" color={color} size={size} />
            ),
          }}
        />
        <Tab.Screen 
          name="Financeiro" 
          component={FinanceiroScreen} 
          options={{
            tabBarLabel: 'Financeiro',
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="currency-brl" color={color} size={size} />
            ),
          }}
        />
        <Tab.Screen 
          name="Configurações" 
          component={ConfigScreen} 
          options={{
            tabBarLabel: 'Ajustes',
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="cog" color={color} size={size} />
            ),
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

export default App;