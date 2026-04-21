import React, { useState, useRef, useEffect, useMemo } from 'react';
import { View, ActivityIndicator, Animated, Dimensions, Easing } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { NativeStackNavigationOptions } from '@react-navigation/native-stack';
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
import {
  TabNavProvider,
  useTabNav,
  navigationRef,
  ROUTE_TO_TAB,
  TabKey,
} from './src/navigation/TabNavContext';
import { BottomNav } from './src/components/BottomNav';

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

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;
// BottomNav slide animation duration (ms). Adjust this to change speed.
const NAV_ANIM_DURATION = 280;

function BottomNavOverlay() {
  const { setNavHeight } = useTabNav();
  const [activeRoute, setActiveRoute] = useState<string>('Dashboard');
  const activeTab: TabKey | undefined = ROUTE_TO_TAB[activeRoute];
  const lastTab = useRef<TabKey>('dashboard');
  if (activeTab) lastTab.current = activeTab;

  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const prevInfo = useRef<{ route: string; isTab: boolean }>({ route: 'Dashboard', isTab: true });

  useEffect(() => {
    const unsub = navigationRef.addListener('state', () => {
      const state = navigationRef.getRootState();
      if (!state) return;
      const route = state.routes[state.index];
      setActiveRoute(route.name);
    });
    return unsub;
  }, []);

  useEffect(() => {
    const wasTab = prevInfo.current.isTab;
    const prevRoute = prevInfo.current.route;
    const isTab = !!activeTab;

    const modalRoutes = ['AddItem', 'Printing'];
    const isModalTransition = modalRoutes.includes(activeRoute) || modalRoutes.includes(prevRoute);

    if (!wasTab && isTab) {
      translateX.setValue(-SCREEN_WIDTH);
      translateY.setValue(0);
      Animated.timing(isModalTransition ? translateY : translateX, {
        toValue: 0,
        duration: NAV_ANIM_DURATION,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    } else if (wasTab && !isTab) {
      if (isModalTransition) {
        Animated.timing(translateY, {
          toValue: SCREEN_HEIGHT,
          duration: NAV_ANIM_DURATION,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }).start();
      } else {
        Animated.timing(translateX, {
          toValue: -SCREEN_WIDTH,
          duration: NAV_ANIM_DURATION,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }).start();
      }
    } else if (isTab) {
      translateX.setValue(0);
      translateY.setValue(0);
    }

    prevInfo.current = { route: activeRoute, isTab };
  }, [activeRoute]);

  return (
    <Animated.View
      pointerEvents={activeTab ? 'auto' : 'none'}
      onLayout={(e) => setNavHeight(e.nativeEvent.layout.height)}
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        transform: [{ translateX }, { translateY }],
      }}
    >
      <BottomNav active={lastTab.current} />
    </Animated.View>
  );
}

const STATIC_SCREEN_OPTIONS: NativeStackNavigationOptions = { headerShown: false, animation: 'slide_from_right' };
const PUSH_OPTIONS: NativeStackNavigationOptions = { animation: 'slide_from_right' };
const MODAL_OPTIONS_ADD_ITEM: NativeStackNavigationOptions = { presentation: 'modal', animation: 'slide_from_bottom' };
const MODAL_OPTIONS_PRINTING: NativeStackNavigationOptions = { presentation: 'modal', animation: 'slide_from_bottom', gestureEnabled: false };

function RootNavigator() {
  const { animationFor } = useTabNav();

  const dashAnim = animationFor('dashboard');
  const histAnim = animationFor('history');
  const printAnim = animationFor('printer');
  const settAnim = animationFor('settings');

  const dashboardOpts = useMemo(() => ({ animation: dashAnim }), [dashAnim]);
  const historyOpts = useMemo(() => ({ animation: histAnim }), [histAnim]);
  const printerOpts = useMemo(() => ({ animation: printAnim }), [printAnim]);
  const settingsOpts = useMemo(() => ({ animation: settAnim }), [settAnim]);

  return (
    <View style={{ flex: 1 }}>
      <NavigationContainer ref={navigationRef}>
        <StatusBar style="auto" />
        <Stack.Navigator
          initialRouteName="Dashboard"
          screenOptions={STATIC_SCREEN_OPTIONS}
        >
          <Stack.Screen name="Dashboard" component={DashboardScreen} options={dashboardOpts} />
          <Stack.Screen name="NewTicket" component={NewTicketScreen} options={PUSH_OPTIONS} />
          <Stack.Screen name="AddItem" component={AddItemScreen} options={MODAL_OPTIONS_ADD_ITEM} />
          <Stack.Screen name="Preview" component={PreviewScreen} options={PUSH_OPTIONS} />
          <Stack.Screen name="Printing" component={PrintingScreen} options={MODAL_OPTIONS_PRINTING} />
          <Stack.Screen name="Printer" component={PrinterScreen} options={printerOpts} />
          <Stack.Screen name="History" component={HistoryScreen} options={historyOpts} />
          <Stack.Screen name="Empresa" component={EmpresaScreen} options={PUSH_OPTIONS} />
          <Stack.Screen name="Settings" component={SettingsScreen} options={settingsOpts} />
        </Stack.Navigator>
      </NavigationContainer>
      <BottomNavOverlay />
    </View>
  );
}

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
          <TabNavProvider>
            <RootNavigator />
          </TabNavProvider>
        </AppProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
