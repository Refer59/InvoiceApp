import React, { useMemo, useState } from 'react';
import { View, Text, FlatList, Pressable, StyleSheet, Alert, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ChevronLeft, Printer, ChevronRight, Trash2, Search } from 'lucide-react-native';
import type { RootStackParamList } from '../../App';
import { useTheme } from '../theme';
import { PosButton } from '../components/PosButton';
import { NotavoMark } from '../components/NotavoMark';
import { useApp } from '../state/AppContext';
import { useTabNav } from '../navigation/TabNavContext';
import { clearHistory } from '../services/storage';
import type { HistoryEntry } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'History'>;

export default function HistoryScreen({ navigation }: Props) {
  const { state, dispatch } = useApp();
  const { navHeight } = useTabNav();
  const { theme } = useTheme();
  const c = theme.colors;
  const sp = theme.spacing;
  const r = theme.radii;
  const fs = theme.typography.fontSizes;
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    if (!query.trim()) return state.history;
    const q = query.toLowerCase();
    return state.history.filter(
      (e) => e.total.includes(q) || e.date.toLowerCase().includes(q) || e.snapshot.NUMDOCTO.includes(q),
    );
  }, [state.history, query]);

  const handleClear = () => {
    Alert.alert('¿Borrar historial?', 'No podrás recuperar los tickets eliminados.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Borrar', style: 'destructive',
        onPress: async () => {
          await clearHistory();
          dispatch({ type: 'HYDRATE', company: state.company, settings: state.settings, history: [] });
        },
      },
    ]);
  };

  const handleReprint = (entry: HistoryEntry) => {
    dispatch({ type: 'UPDATE_TICKET', ticket: entry.snapshot });
    navigation.navigate('Preview');
  };

  const styles = useMemo(() => StyleSheet.create({
    root: { flex: 1, backgroundColor: c.bg.base },
    header: {
      flexDirection: 'row', alignItems: 'center', gap: sp.md,
      paddingHorizontal: sp.lg, paddingVertical: sp.md,
      backgroundColor: c.bg.surface, borderBottomWidth: 1, borderBottomColor: c.border.subtle,
    },
    backBtn: { padding: sp.xs },
    title: { fontSize: fs.h3, fontWeight: '700', color: c.text.primary, fontFamily: theme.typography.fonts.uiBold, flex: 1 },
    clearBtn: { padding: sp.xs },
    searchBar: {
      flexDirection: 'row', alignItems: 'center', gap: sp.sm,
      margin: sp.lg, borderRadius: r.full,
      backgroundColor: c.bg.surfaceAlt, paddingHorizontal: sp.lg, paddingVertical: sp.sm,
    },
    searchInput: { flex: 1, fontSize: fs.body, color: c.text.primary, fontFamily: theme.typography.fonts.ui },
    empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: sp.md, paddingBottom: sp['4xl'] },
    emptyTitle: { fontSize: fs.mono2, fontWeight: '700', color: c.text.primary, fontFamily: theme.typography.fonts.uiBold },
    emptyText: { fontSize: fs.small, color: c.text.secondary, fontFamily: theme.typography.fonts.ui, textAlign: 'center' },
    list: { padding: sp.lg, gap: sp.sm, paddingBottom: sp.xl + navHeight },
    row: {
      flexDirection: 'row', alignItems: 'center', gap: sp.md,
      backgroundColor: c.bg.surface, borderRadius: r.md,
      borderWidth: 1, borderColor: c.border.subtle, padding: sp.md,
    },
    rowIcon: { width: 44, height: 44, borderRadius: r.sm, alignItems: 'center', justifyContent: 'center', backgroundColor: c.brand.primarySoft },
    rowTotal: { fontSize: fs.h3, fontWeight: '700', color: c.text.primary, fontFamily: theme.typography.fonts.monoSemiBold },
    rowDate: { fontSize: fs.label, color: c.text.secondary, fontFamily: theme.typography.fonts.ui, marginTop: 2 },
    rowMeta: { fontSize: fs.label, color: c.text.muted, fontFamily: theme.typography.fonts.ui },
    rowActions: { flexDirection: 'row', alignItems: 'center', gap: sp.xs },
    reprintBtn: { width: 36, height: 36, borderRadius: r.sm, alignItems: 'center', justifyContent: 'center', backgroundColor: c.brand.primarySoft },
  }), [theme, navHeight]);

  const renderItem = ({ item }: { item: HistoryEntry }) => (
    <Pressable style={styles.row} onPress={() => handleReprint(item)}>
      <View style={styles.rowIcon}>
        <Printer size={20} color={c.brand.primary} strokeWidth={1.75} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.rowTotal}>{item.total}</Text>
        <Text style={styles.rowDate}>{item.date}</Text>
        <Text style={styles.rowMeta}>{item.itemCount} artículo{item.itemCount !== 1 ? 's' : ''} · #{item.snapshot.NUMDOCTO}</Text>
      </View>
      <View style={styles.rowActions}>
        <Pressable onPress={() => handleReprint(item)} style={styles.reprintBtn}>
          <Printer size={16} color={c.brand.primary} strokeWidth={1.75} />
        </Pressable>
        <ChevronRight size={18} color={c.text.muted} strokeWidth={1.75} />
      </View>
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft size={22} color={c.text.primary} strokeWidth={1.75} />
        </Pressable>
        <Text style={styles.title}>Historial</Text>
        {state.history.length > 0 && (
          <Pressable onPress={handleClear} style={styles.clearBtn}>
            <Trash2 size={20} color={c.semantic.danger} strokeWidth={1.75} />
          </Pressable>
        )}
      </View>

      {state.history.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>Sin historial</Text>
          <Text style={styles.emptyText}>Todavía no hay tickets.{'\n'}Creá el primero.</Text>
          <PosButton label="Nueva nota" icon="plus"
            onPress={() => { dispatch({ type: 'NEW_TICKET' }); navigation.navigate('NewTicket'); }} />
        </View>
      ) : (
        <>
          <View style={styles.searchBar}>
            <Search size={18} color={c.text.muted} strokeWidth={1.75} />
            <TextInput
              style={styles.searchInput}
              value={query}
              onChangeText={setQuery}
              placeholder="Buscar por monto, fecha o #"
              placeholderTextColor={c.text.muted}
            />
          </View>
          <FlatList
            data={filtered}
            keyExtractor={(e) => e.id}
            renderItem={renderItem}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
          />
        </>
      )}
    </SafeAreaView>
  );
}
