import React, { useState } from 'react';
import {
  View, Text, FlatList, Pressable, StyleSheet, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';
import { colors, radii, fonts } from '../theme/tokens';
import { Icon } from '../components/Icon';
import { PosButton } from '../components/PosButton';
import { BottomNav } from '../components/BottomNav';
import { useApp } from '../state/AppContext';
import { clearHistory } from '../services/storage';
import type { HistoryEntry } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'History'>;

export default function HistoryScreen({ navigation }: Props) {
  const { state, dispatch } = useApp();
  const accent = state.settings.accentColor;

  const handleClear = () => {
    Alert.alert(
      'Borrar historial',
      '¿Estás seguro? No podrás recuperar los tickets eliminados.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Borrar', style: 'destructive',
          onPress: async () => {
            await clearHistory();
            // Clear from state by re-hydrating — simple approach: dispatch with empty history
            dispatch({ type: 'HYDRATE', company: state.company, settings: state.settings, history: [] });
          },
        },
      ]
    );
  };

  const handleReprint = (entry: HistoryEntry) => {
    dispatch({ type: 'UPDATE_TICKET', ticket: entry.snapshot });
    navigation.navigate('Preview');
  };

  const renderItem = ({ item }: { item: HistoryEntry }) => (
    <Pressable style={styles.row} onPress={() => handleReprint(item)}>
      <View style={[styles.rowIcon, { backgroundColor: accent + '18' }]}>
        <Icon name="receipt" size={20} color={accent} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.rowTotal}>{item.total}</Text>
        <Text style={styles.rowDate}>{item.date}</Text>
        <Text style={styles.rowMeta}>{item.itemCount} artículo{item.itemCount !== 1 ? 's' : ''} · #{item.snapshot.NUMDOCTO}</Text>
      </View>
      <View style={styles.rowActions}>
        <Pressable
          onPress={() => handleReprint(item)}
          style={[styles.reprintBtn, { backgroundColor: accent + '18' }]}
        >
          <Icon name="printer" size={16} color={accent} />
        </Pressable>
        <Icon name="chevron_right" size={18} color={colors.textFaint} />
      </View>
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Icon name="arrow_left" size={22} color={colors.text} />
        </Pressable>
        <Text style={styles.title}>Historial</Text>
        {state.history.length > 0 && (
          <Pressable onPress={handleClear} style={styles.clearBtn}>
            <Icon name="trash" size={20} color={colors.danger} />
          </Pressable>
        )}
      </View>

      {state.history.length === 0 ? (
        <View style={styles.empty}>
          <Icon name="history" size={48} color={colors.textFaint} />
          <Text style={styles.emptyTitle}>Sin historial</Text>
          <Text style={styles.emptyText}>Los tickets impresos aparecerán aquí</Text>
          <PosButton
            label="Nueva nota"
            icon="plus"
            onPress={() => {
              dispatch({ type: 'NEW_TICKET' });
              navigation.navigate('NewTicket');
            }}
            style={{ marginTop: 8 }}
          />
        </View>
      ) : (
        <FlatList
          data={state.history}
          keyExtractor={(e) => e.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}

      <BottomNav active="history" onNavigate={(route) => navigation.navigate(route as any)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 16, paddingVertical: 14,
    backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  backBtn: { padding: 4 },
  title: { fontSize: 17, fontWeight: '700', color: colors.text, fontFamily: fonts.ui, flex: 1 },
  clearBtn: { padding: 4 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8, paddingBottom: 80 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: colors.text, fontFamily: fonts.ui },
  emptyText: { fontSize: 14, color: colors.textMuted, fontFamily: fonts.ui },
  list: { padding: 16, gap: 10, paddingBottom: 24 },
  row: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: colors.surface, borderRadius: radii.md,
    borderWidth: 1, borderColor: colors.border, padding: 12,
  },
  rowIcon: { width: 44, height: 44, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  rowTotal: { fontSize: 17, fontWeight: '700', color: colors.text, fontFamily: fonts.mono },
  rowDate: { fontSize: 12, color: colors.textMuted, fontFamily: fonts.ui, marginTop: 2 },
  rowMeta: { fontSize: 12, color: colors.textFaint, fontFamily: fonts.ui },
  rowActions: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  reprintBtn: { width: 36, height: 36, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
});
