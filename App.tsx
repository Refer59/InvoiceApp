import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_800ExtraBold,
} from '@expo-google-fonts/inter'
import { OpenSans_700Bold } from '@expo-google-fonts/open-sans'
import {
  JetBrainsMono_400Regular,
  JetBrainsMono_600SemiBold,
} from '@expo-google-fonts/jetbrains-mono';

import { AppProvider } from './src/state/AppContext';
import { ThemeProvider } from './src/theme';

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
  const [fontsLoaded] = useFonts({
    OpenSans_700Bold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
    JetBrainsMono_400Regular,
    JetBrainsMono_600SemiBold,
  });

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F3E7D3' }}>
        <ActivityIndicator color="#E8702E" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AppProvider>
          <NavigationContainer>
            <StatusBar style="auto" />
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
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
