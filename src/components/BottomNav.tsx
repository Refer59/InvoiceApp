import React from 'react';
import { View, Pressable, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts } from '../theme/tokens';
import { Icon } from './Icon';
import { useApp } from '../state/AppContext';

interface NavItem {
  key: string;
  label: string;
  icon: string;
  route: string;
}

const ITEMS: NavItem[] = [
  { key: 'dashboard', label: 'Inicio', icon: 'receipt', route: 'Dashboard' },
  { key: 'history', label: 'Historial', icon: 'history', route: 'History' },
  { key: 'printer', label: 'Impresora', icon: 'printer', route: 'Printer' },
  { key: 'settings', label: 'Ajustes', icon: 'settings', route: 'Settings' },
];

interface Props {
  active: string;
  onNavigate: (route: string) => void;
}

export function BottomNav({ active, onNavigate }: Props) {
  const insets = useSafeAreaInsets();
  const { state } = useApp();
  const accent = state.settings.accentColor;

  return (
    <View
      style={[
        styles.container,
        { paddingBottom: insets.bottom + 4 },
      ]}
    >
      {ITEMS.map((item) => {
        const isActive = active === item.key;
        const fg = isActive ? accent : colors.textFaint;
        return (
          <Pressable
            key={item.key}
            onPress={() => onNavigate(item.route)}
            style={styles.tab}
          >
            <Icon name={item.icon as any} size={22} color={fg} />
            <Text style={[styles.label, { color: fg, fontWeight: isActive ? '600' : '400' }]}>
              {item.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
    paddingVertical: 4,
  },
  label: {
    fontFamily: fonts.ui,
    fontSize: 11,
  },
});
