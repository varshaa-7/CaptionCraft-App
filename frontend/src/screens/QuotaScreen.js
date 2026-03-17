import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator, Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Toast from 'react-native-toast-message';
import { getQuota, claimAdReward } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { RADIUS, SPACING } from '../theme';


export default function QuotaScreen() {
  const { user, updateUserQuota } = useAuth();
  const [quota, setQuota] = useState(null);
  const [limits, setLimits] = useState(null);
  const [resetIn, setResetIn] = useState('');
  const [loading, setLoading] = useState(true);
  const [adLoading, setAdLoading] = useState(false);

  useEffect(() => {
    fetchQuota();
    const interval = setInterval(updateTimer, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchQuota = async () => {
    try {
      const { data } = await getQuota();
      setQuota(data.quota);
      setLimits(data.limits);
      setResetIn(data.resetIn);
    } catch (err) {
      Toast.show({ type: 'error', text1: 'Failed to load quota' });
    } finally {
      setLoading(false);
    }
  };

  const updateTimer = () => {
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0);
    const diff = midnight - now;
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    setResetIn(`${h}h ${m}m`);
  };

  const handleWatchAd = async (rewardType) => {
    setAdLoading(true);
    try {
      // In production, show real AdMob rewarded ad here
      // For now, simulate ad viewing
      Alert.alert(
        '🎬 Watch Ad',
        `Watch a short ad to earn ${rewardType === 'caption' ? '+5 captions' : '+10 hashtags'}`,
        [
          { text: 'Cancel', style: 'cancel', onPress: () => setAdLoading(false) },
          {
            text: 'Watch Now',
            onPress: async () => {
              // Simulate ad completion delay
              await new Promise(r => setTimeout(r, 1500));
              try {
                const { data } = await claimAdReward(rewardType);
                setQuota(data.quota);
                setLimits(data.limits);
                updateUserQuota(data.quota, data.limits);
                Toast.show({
                  type: 'success',
                  text1: data.message,
                  text2: 'Keep creating amazing content!',
                });
              } catch (err) {
                const msg = err.response?.data?.error || 'Failed to claim reward';
                Toast.show({ type: 'error', text1: msg });
              } finally {
                setAdLoading(false);
              }
            }
          }
        ]
      );
    } catch (err) {
      Toast.show({ type: 'error', text1: 'Ad unavailable. Try again later.' });
      setAdLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: '#fff0f5' }]}>
        <ActivityIndicator color="#E8729A" size="large" />
      </View>
    );
  }

  const captionsUsed = quota?.captionsUsed || 0;
  const captionsLimit = limits?.captions || 10;
  const hashtagsUsed = quota?.hashtagsUsed || 0;
  const hashtagsLimit = limits?.hashtags || 50;

  return (
    <View style={{ flex: 1, backgroundColor: '#fff0f5' }}>
      <LinearGradient colors={['#f8a7c0', '#E8729A']} style={styles.header}>
        <Text style={styles.headerTitle}>Your Quota</Text>
        <Text style={styles.headerSub}>Resets daily at midnight</Text>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Stats Cards */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNum}>{captionsLimit - captionsUsed}</Text>
            <Text style={styles.statLabel}>Captions Left</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNum}>{hashtagsLimit - hashtagsUsed}</Text>
            <Text style={styles.statLabel}>Hashtags Left</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNum}>{resetIn}</Text>
            <Text style={styles.statLabel}>Until Reset</Text>
          </View>
        </View>

        {/* Progress Bars */}
        <View style={styles.progressCard}>
          <View style={styles.progressRow}>
            <Text style={styles.progressLabel}>Captions</Text>
            <Text style={styles.progressVal}>{captionsUsed} / {captionsLimit}</Text>
          </View>
          <View style={styles.track}>
            <View style={[styles.fill, { width: `${Math.min(captionsUsed / captionsLimit, 1) * 100}%` }]} />
          </View>
          <View style={[styles.progressRow, { marginTop: 12 }]}>
            <Text style={styles.progressLabel}>Hashtags</Text>
            <Text style={styles.progressVal}>{hashtagsUsed} / {hashtagsLimit}</Text>
          </View>
          <View style={styles.track}>
            <View style={[styles.fill, { width: `${Math.min(hashtagsUsed / hashtagsLimit, 1) * 100}%` }]} />
          </View>
          {quota?.bonusCaption > 0 && (
            <Text style={styles.bonusNote}>✦ +{quota.bonusCaption} bonus captions from ads today</Text>
          )}
        </View>

        {/* Earn More */}
        <View style={styles.earnCard}>
          <Text style={styles.earnTitle}>Need more quota? ✦</Text>
          <Text style={styles.earnDesc}>
            Watch a short ad to earn bonus captions and hashtags. Quota resets automatically every day!
          </Text>

          <TouchableOpacity
            style={[styles.adBtn, adLoading && styles.btnDisabled]}
            onPress={() => handleWatchAd('caption')}
            disabled={adLoading}
          >
            {adLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.adBtnText}>🎬 Watch Ad → +5 Captions</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.adBtn, styles.adBtnPurple, adLoading && styles.btnDisabled]}
            onPress={() => handleWatchAd('hashtag')}
            disabled={adLoading}
          >
            <Text style={styles.adBtnText}>🏷️ Watch Ad → +10 Hashtags</Text>
          </TouchableOpacity>
        </View>

        {/* Detail Rows */}
        {[
          { label: 'Daily Captions Base', value: user?.subscription === 'pro' ? '100/day' : '10/day' },
          { label: 'Daily Hashtags Base', value: user?.subscription === 'pro' ? '500/day' : '50/day' },
          { label: 'Max Bonus/Day', value: '25 captions, 100 hashtags' },
          { label: 'Subscription', value: user?.subscription === 'pro' ? '⭐ Pro' : 'Free' },
        ].map((row) => (
          <View key={row.label} style={styles.detailRow}>
            <Text style={styles.detailLabel}>{row.label}</Text>
            <Text style={styles.detailVal}>{row.value}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { padding: SPACING.md, paddingTop: 56, paddingBottom: SPACING.md },
  headerTitle: { fontSize: 26, color: '#fff', fontFamily: 'DMSerifDisplay' },
  headerSub: { fontSize: 12, color: 'rgba(255,255,255,0.85)', fontFamily: 'Nunito', fontWeight: '600', marginTop: 2 },
  content: { padding: SPACING.md },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  statCard: {
    flex: 1, backgroundColor: '#fff', borderRadius: RADIUS.md,
    padding: 12, alignItems: 'center', borderWidth: 1.5, borderColor: '#fde8f0',
  },
  statNum: { fontSize: 20, fontFamily: 'DMSerifDisplay', color: '#E8729A' },
  statLabel: { fontSize: 10, color: '#999', fontFamily: 'Nunito', fontWeight: '700', marginTop: 2, textAlign: 'center' },
  progressCard: {
    backgroundColor: '#fff', borderRadius: RADIUS.md, padding: SPACING.md,
    borderWidth: 1.5, borderColor: '#fde8f0', marginBottom: 14,
  },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  progressLabel: { fontSize: 13, fontFamily: 'Nunito', fontWeight: '700', color: '#444' },
  progressVal: { fontSize: 13, fontFamily: 'Nunito', fontWeight: '700', color: '#E8729A' },
  track: { height: 8, backgroundColor: '#fde8f0', borderRadius: RADIUS.full, overflow: 'hidden' },
  fill: { height: '100%', backgroundColor: '#E8729A', borderRadius: RADIUS.full },
  bonusNote: { fontSize: 12, color: '#E8729A', fontFamily: 'Nunito', fontWeight: '600', marginTop: 10 },
  earnCard: {
    backgroundColor: '#fde8f0', borderRadius: RADIUS.md, padding: SPACING.md,
    marginBottom: 14,
  },
  earnTitle: { fontSize: 20, fontFamily: 'DMSerifDisplay', color: '#E8729A', marginBottom: 6 },
  earnDesc: { fontSize: 13, color: '#888', fontFamily: 'Nunito', lineHeight: 19, marginBottom: 14 },
  adBtn: {
    backgroundColor: '#E8729A', borderRadius: RADIUS.full, padding: 13,
    alignItems: 'center', marginBottom: 10,
  },
  adBtnPurple: { backgroundColor: '#7c53c3' },
  btnDisabled: { opacity: 0.5 },
  adBtnText: { color: '#fff', fontSize: 14, fontFamily: 'Nunito', fontWeight: '700' },
  detailRow: {
    backgroundColor: '#fff', borderRadius: RADIUS.sm, padding: 14,
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 8, borderWidth: 1.5, borderColor: '#fde8f0',
  },
  detailLabel: { fontSize: 13, fontFamily: 'Nunito', fontWeight: '700', color: '#444' },
  detailVal: { fontSize: 13, fontFamily: 'Nunito', fontWeight: '700', color: '#E8729A' },
});
