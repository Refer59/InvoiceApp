import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { AppProvider } from './src/state/AppContext';

import DashboardScreen from './src/screens/DashboardScreen';
import NewTicketScreen from './src/screens/NewTicketScreen';
import AddItemScreen from './src/screens/AddItemScreen';
import PreviewScreen from './src/screens/PreviewScreen';
import PrintingScreen from './src/screens/PrintingScreen';
import PrinterScreen from './src/screens/PrinterScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import EmpresaScreen from './src/screens/EmpresaScreen';
import SettingsScreen from './src/screens/SettingsScreen';

export type RootStackParamList = {
  Dashboard: undefined;
  NewTicket: undefined;
  AddItem: undefined;
  Preview: undefined;
  Printing: undefined;
  Printer: undefined;
  History: undefined;
  Empresa: undefined;
  Settings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <NavigationContainer>
          <StatusBar style="dark" />
          <Stack.Navigator
            initialRouteName="Dashboard"
            screenOptions={{ headerShown: false, animation: 'slide_from_right' }}
          >
            <Stack.Screen name="Dashboard" component={DashboardScreen} />
            <Stack.Screen name="NewTicket" component={NewTicketScreen} />
            <Stack.Screen
              name="AddItem"
              component={AddItemScreen}
              options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
            />
            <Stack.Screen name="Preview" component={PreviewScreen} />
            <Stack.Screen
              name="Printing"
              component={PrintingScreen}
              options={{ presentation: 'modal', animation: 'slide_from_bottom', gestureEnabled: false }}
            />
            <Stack.Screen name="Printer" component={PrinterScreen} />
            <Stack.Screen name="History" component={HistoryScreen} />
            <Stack.Screen name="Empresa" component={EmpresaScreen} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </AppProvider>
    </SafeAreaProvider>
  );
}
