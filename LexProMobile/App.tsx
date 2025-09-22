
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StyleSheet, StatusBar, Platform } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';

// Importe suas telas
import ClientesScreen from './app/screens/ClientesScreen';
import ProcessosScreen from './app/screens/ProcessosScreen';
import AgendaScreen from './app/screens/AgendaScreen';
import ConfigScreen from './app/screens/ConfigScreen';

const Tab = createBottomTabNavigator();

const App: React.FC = () => {
    return (
        <>
            <StatusBar barStyle="light-content" backgroundColor="#003366" />
            <NavigationContainer>
                <Tab.Navigator
                    id={undefined}
                    screenOptions={({ route }) => ({
                        tabBarIcon: ({ focused, color, size }) => {
                            let iconName: React.ComponentProps<typeof FontAwesome>['name'] = 'circle';

                            if (route.name === 'Clientes') {
                                iconName = focused ? 'users' : 'users';
                            } else if (route.name === 'Processos') {
                                iconName = focused ? 'legal' : 'legal';
                            } else if (route.name === 'Agenda') {
                                iconName = focused ? 'calendar' : 'calendar-o';
                            } else if (route.name === 'Configurações') {
                                iconName = focused ? 'cog' : 'cogs';
                            }
                            return <FontAwesome name={iconName} size={size} color={color} />;
                        },
                        tabBarActiveTintColor: '#0059b3',
                        tabBarInactiveTintColor: 'gray',
                        tabBarStyle: {
                            backgroundColor: '#FFFFFF',
                            paddingBottom: Platform.OS === 'ios' ? 0 : 5,
                            paddingTop: 5,
                            height: Platform.OS === 'ios' ? 80 : 60,
                        },
                        tabBarLabelStyle: {
                            fontSize: 12,
                            fontWeight: '500',
                        },
                        headerStyle: {
                            backgroundColor: '#003366',
                        },
                        headerTintColor: '#FFFFFF',
                        headerTitleStyle: {
                            fontWeight: 'bold',
                        },
                    })}
                >
                    <Tab.Screen
                        name="Clientes"
                        component={ClientesScreen}
                        options={{ title: 'Clientes' }}
                    />
                    <Tab.Screen
                        name="Processos"
                        component={ProcessosScreen}
                        options={{ title: 'Processos' }}
                    />
                    <Tab.Screen
                        name="Agenda"
                        component={AgendaScreen}
                        options={{ title: 'Agenda' }}
                    />
                    <Tab.Screen
                        name="Configurações"
                        component={ConfigScreen}
                        options={{ title: 'API Keys' }}
                    />
                </Tab.Navigator>
            </NavigationContainer>
        </>
    );
};

export default App;
