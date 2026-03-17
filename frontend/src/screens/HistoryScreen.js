import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, RefreshControl
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Clipboard from 'expo-clipboard';
import Toast from 'react-native-toast-message';
import { getHistory, clearHistory } from '../services/api';
import { PLATFORMS, RADIUS, SPACING } from '../theme';

const platformMeta = PLATFORMS;

export default function HistoryScreen() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expanded, setExpanded] = useState(null);

  const fetchHistory = useCallback(async () => {
    try {
      const { data } = await getHistory();
      setHistory(data.history || []);
    } catch (err) {
      Toast.show({ type: 'error', text1: 'Failed to load history' });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchHistory(); }, []);

  const handleClearAll = () => {
    Alert.alert('Clear History', 'This will delete all your generated captions. This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear All', style: 'destructive',
        onPress: async () => {
          try {
            await clearHistory();
            setHistory([]);
            Toast.show({ type: 'success', text1: 'History cleared' });
          } catch {
            Toast.show({ type: 'error', text1: 'Failed to clear history' });
          }
        }
      }
    ]);
  };

  const handleCopy = async (text, hashtags) => {
    await Clipboard.setStringAsync(`${text}\n\n${hashtags}`);
    Toast.show({ type: 'success', text1: 'Copied! ✓' });
  };

  const formatTime = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffH = Math.floor(diffMs / 3600000);
    const diffD = Math.floor(diffH / 24);
    if (diffD > 0) return `${diffD}d ago`;
    if (diffH > 0) return `${diffH}h ago`;
    return 'Just now';
  };

  const renderItem = ({ item, index }) => {
    const p = platformMeta[item.platform] || platformMeta.other;
    const isExpanded = expanded === index;

    return (
      <TouchableOpacity
        style={[styles.historyItem, { borderColor: p.soft }]}
        onPress={() => setExpanded(isExpanded ? null : index)}
        activeOpacity={0.8}
      >
        <View style={styles.historyHeader}>
          <View style={[styles.platformBadge, { backgroundColor: p.primaryLight }]}>
            <Text style={styles.platformEmoji}>{p.emoji}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.historyTopic}>{item.topic}</Text>
            <Text style={styles.historyMeta}>
              {p.label} · {item.tone} · {item.captions?.length || 0} captions · {formatTime(item.generatedAt)}
            </Text>
          </View>
          <Text style={[styles.chevron, { color: p.primary }]}>{isExpanded ? '▲' : '▼'}</Text>
        </View>

        {isExpanded && item.captions?.map((c, i) => (
          <View key={i} style={[styles.captionItem, { borderColor: p.soft }]}>
            <Text style={styles.captionText}>{c.text}</Text>
            <Text style={[styles.hashtags, { color: p.primary }]}>{c.hashtags}</Text>
            <TouchableOpacity
              style={[styles.copyBtn, { backgroundColor: p.soft }]}
              onPress={() => handleCopy(c.text, c.hashtags)}
            >
              <Text style={[styles.copyBtnText, { color: p.primary }]}>Copy</Text>
            </TouchableOpacity>
          </View>
        ))}
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: '#fff0f5' }]}>
        <ActivityIndicator color="#E8729A" size="large" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#fff0f5' }}>
      <LinearGradient colors={['#f8a7c0', '#E8729A']} style={styles.header}>
        <Text style={styles.headerTitle}>History</Text>
        {history.length > 0 && (
          <TouchableOpacity onPress={handleClearAll} style={styles.clearBtn}>
            <Text style={styles.clearBtnText}>Clear All</Text>
          </TouchableOpacity>
        )}
      </LinearGradient>

      {history.length === 0 ? (
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyIcon}>📋</Text>
          <Text style={styles.emptyTitle}>No history yet</Text>
          <Text style={styles.emptyText}>Generate some captions and they'll appear here.</Text>
        </View>
      ) : (
        <FlatList
          data={history}
          keyExtractor={(_, i) => i.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => { setRefreshing(true); fetchHistory(); }}
              tintColor="#E8729A"
            />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    padding: SPACING.md, paddingTop: 56, paddingBottom: SPACING.md,
    flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between'
  },
  headerTitle: { fontSize: 26, color: '#fff', fontFamily: 'DMSerifDisplay' },
  clearBtn: {
    backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: RADIUS.full,
    paddingVertical: 6, paddingHorizontal: 14,
  },
  clearBtnText: { color: '#fff', fontSize: 13, fontFamily: 'Nunito', fontWeight: '700' },
  list: { padding: SPACING.md },
  historyItem: {
    backgroundColor: '#fff', borderWidth: 1.5, borderRadius: RADIUS.md,
    marginBottom: 10, overflow: 'hidden',
  },
  historyHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12 },
  platformBadge: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
  },
  platformEmoji: { fontSize: 16 },
  historyTopic: { fontSize: 14, fontWeight: '700', color: '#333', fontFamily: 'Nunito' },
  historyMeta: { fontSize: 11, color: '#999', marginTop: 2, fontFamily: 'Nunito' },
  chevron: { fontSize: 11, fontFamily: 'Nunito' },
  captionItem: {
    borderTopWidth: 1, padding: 12, position: 'relative',
  },
  captionText: { fontSize: 13, color: '#444', lineHeight: 19, fontFamily: 'Nunito', paddingRight: 55 },
  hashtags: { fontSize: 12, marginTop: 4, fontFamily: 'Nunito', fontWeight: '600' },
  copyBtn: {
    position: 'absolute', top: 12, right: 12,
    borderRadius: 6, paddingVertical: 4, paddingHorizontal: 10,
  },
  copyBtnText: { fontSize: 11, fontFamily: 'Nunito', fontWeight: '700' },
  emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: SPACING.xl },
  emptyIcon: { fontSize: 48, marginBottom: SPACING.sm },
  emptyTitle: { fontSize: 20, fontFamily: 'DMSerifDisplay', color: '#E8729A', marginBottom: 8 },
  emptyText: { fontSize: 14, color: '#999', textAlign: 'center', fontFamily: 'Nunito' },
});
