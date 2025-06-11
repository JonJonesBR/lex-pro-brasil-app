
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StyleSheet, View, Text, StatusBar, Platform } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';

// Importe suas telas
import ClientesScreen from './app/screens/ClientesScreen';
import ConfigScreen from './app/screens/ConfigScreen'; // Importar a nova tela

// Componentes de Placeholder para outras telas
const ProcessosScreenPlaceholder: React.FC = () => (
    <View style={styles.placeholderContainer}>
        <FontAwesome name="legal" size={50} color="#003366" />
        <Text style={styles.placeholderText}>Tela de Processos (Em Breve)</Text>
    </View>
);

const AgendaScreenPlaceholder: React.FC = () => (
    <View style={styles.placeholderContainer}>
        <FontAwesome name="calendar" size={50} color="#003366" />
        <Text style={styles.placeholderText}>Tela de Agenda (Em Breve)</Text>
    </View>
);

const Tab = createBottomTabNavigator();

// Define um tipo para as rotas do Tab Navigator para melhor type-safety
type RootTabParamList = {
  Clientes: undefined;
  Processos: undefined;
  Agenda: undefined;
  Configurações: undefined; // Nova rota
};

const App: React.FC = () => {
    return (
        <>
            <StatusBar barStyle="light-content" backgroundColor="#003366" />
            <NavigationContainer>
                <Tab.Navigator
                    id={undefined} // Added to satisfy the type error
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
                        component={ProcessosScreenPlaceholder}
                        options={{ title: 'Processos' }}
                    />
                    <Tab.Screen
                        name="Agenda"
                        component={AgendaScreenPlaceholder}
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

const styles = StyleSheet.create({
    placeholderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f0f2f5',
    },
    placeholderText: {
        marginTop: 15,
        fontSize: 18,
        color: '#003366',
        fontWeight: '500',
    },
});

export default App;
