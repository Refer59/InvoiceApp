import React, { useMemo } from 'react';
import { View, Pressable, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Receipt, History, Printer, Settings2 } from 'lucide-react-native';
import { useTheme } from '../theme';

interface NavItem {
  key: string;
  label: string;
  Icon: React.ComponentType<{ size: number; color: string; strokeWidth: number }>;
  route: string;
}

const ITEMS: NavItem[] = [
  { key: 'dashboard', label: 'Inicio', Icon: Receipt, route: 'Dashboard' },
  { key: 'history', label: 'Historial', Icon: History, route: 'History' },
  { key: 'printer', label: 'Impresora', Icon: Printer, route: 'Printer' },
  { key: 'settings', label: 'Ajustes', Icon: Settings2, route: 'Settings' },
];

interface Props {
  active: string;
  onNavigate: (route: string) => void;
}

export function BottomNav({ active, onNavigate }: Props) {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const c = theme.colors;
  const fs = theme.typography.fontSizes;

  const styles = useMemo(() => StyleSheet.create({
    container: {
      flexDirection: 'row',
      backgroundColor: c.bg.surface,
      borderTopWidth: 1,
      borderTopColor: c.border.subtle,
      paddingTop: theme.spacing.sm,
      paddingBottom: insets.bottom + theme.spacing.xs,
    },
    tab: {
      flex: 1,
      alignItems: 'center',
      gap: 3,
      paddingVertical: theme.spacing.xs,
    },
    label: {
      fontFamily: theme.typography.fonts.ui,
      fontSize: fs.micro,
    },
  }), [theme, insets.bottom]);

  return (
    <View style={styles.container}>
      {ITEMS.map((item) => {
        const isActive = active === item.key;
        const fg = isActive ? c.brand.primary : c.text.muted;
        return (
          <Pressable key={item.key} onPress={() => onNavigate(item.route)} style={styles.tab}>
            <item.Icon size={22} color={fg} strokeWidth={isActive ? 2.25 : 1.75} />
            <Text style={[styles.label, { color: fg, fontWeight: isActive ? '600' : '400' }]}>
              {item.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
