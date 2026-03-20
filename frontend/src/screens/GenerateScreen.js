import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator, Animated, Platform,
  KeyboardAvoidingView, Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Clipboard from 'expo-clipboard';
import Toast from 'react-native-toast-message';
import { generateCaptions, claimAdReward } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { PLATFORMS, TONES, RADIUS, SPACING } from '../theme';
import BannerAdComponent from '../components/BannerAdComponent';

export default function GenerateScreen() {
  const { user, updateUserQuota } = useAuth();
  const [platform, setPlatform] = useState('instagram');
  const [tone, setTone] = useState('fun');
  const [topic, setTopic] = useState('');
  const [captions, setCaptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const scrollRef = useRef(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const theme = PLATFORMS[platform];

  const handleGenerate = async () => {
    if (!topic.trim()) {
      Toast.show({ type: 'error', text1: 'Enter a topic first!' });
      return;
    }

    const quotaLimit = user?.subscription === 'pro' ? 100 : 10;
    const used = user?.quota?.captionsUsed || 0;
    const bonus = user?.quota?.bonusCaption || 0;
    if (used >= quotaLimit + bonus) {
      Toast.show({
        type: 'error',
        text1: 'Daily limit reached!',
        text2: 'Watch an ad on the Quota tab to earn more captions.',
      });
      return;
    }

    setLoading(true);
    setCaptions([]);
    fadeAnim.setValue(0);

    try {
      const { data } = await generateCaptions(topic.trim(), platform, tone);
      setCaptions(data.captions);
      updateUserQuota(
        { ...user.quota, captionsUsed: data.quota.captionsUsed, hashtagsUsed: data.quota.hashtagsUsed },
        { captions: data.quota.captionsLimit, hashtags: data.quota.hashtagsLimit }
      );

      Animated.timing(fadeAnim, {
        toValue: 1, duration: 500, useNativeDriver: true
      }).start();

      setTimeout(() => {
        scrollRef.current?.scrollTo({ y: 300, animated: true });
      }, 200);
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to generate. Please try again.';
      Toast.show({ type: 'error', text1: 'Error', text2: msg });
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async (caption, index) => {
    const full = `${caption.text}\n\n${caption.hashtags}`;
    await Clipboard.setStringAsync(full);
    setCopiedIndex(index);
    Toast.show({ type: 'success', text1: 'Copied to clipboard! ✓' });
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const captionsUsed = user?.quota?.captionsUsed || 0;
  const bonusCaption = user?.quota?.bonusCaption || 0;
  const captionsLimit = (user?.subscription === 'pro' ? 100 : 10) + bonusCaption;
  const captionsRemaining = captionsLimit - captionsUsed;
  const quotaPercent = Math.min(captionsUsed / captionsLimit, 1);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1, backgroundColor: theme.background }}
    >
      <ScrollView ref={scrollRef} style={{ flex: 1 }} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <LinearGradient colors={theme.headerGradient} style={styles.header}>
          <Text style={styles.headerTitle}>CaptionCraft ✦</Text>
          <Text style={styles.headerSub}>AI Caption Generator</Text>
        </LinearGradient>

        {/* Platform Tabs */}
        <View style={[styles.tabsWrap, { backgroundColor: theme.background }]}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabs}>
            {Object.values(PLATFORMS).map((p) => (
              <TouchableOpacity
                key={p.id}
                style={[
                  styles.tab,
                  { borderColor: p.primary },
                  platform === p.id && { backgroundColor: p.primary }
                ]}
                onPress={() => { setPlatform(p.id); setCaptions([]); }}
              >
                <Text style={styles.tabEmoji}>{p.emoji}</Text>
                <Text style={[
                  styles.tabLabel,
                  { color: p.primary },
                  platform === p.id && { color: '#fff' }
                ]}>
                  {p.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Quota Bar */}
        <View style={[styles.quotaWrap, { backgroundColor: theme.background }]}>
          <View style={styles.quotaRow}>
            <Text style={[styles.quotaLabel, { color: theme.text }]}>Daily Captions</Text>
            <Text style={[styles.quotaLabel, { color: theme.text }]}>
              {captionsRemaining} left of {captionsLimit}
            </Text>
          </View>
          <View style={[styles.quotaTrack, { backgroundColor: theme.soft }]}>
            <View style={[styles.quotaFill, { width: `${quotaPercent * 100}%`, backgroundColor: theme.primary }]} />
          </View>
        </View>

        {/* Input Card */}
        <View style={[styles.card, { backgroundColor: '#fff', borderColor: theme.soft }]}>
          <Text style={[styles.inputLabel, { color: theme.primary }]}>WHAT'S YOUR TOPIC?</Text>
          <TextInput
            style={[styles.input, { borderColor: theme.soft, backgroundColor: theme.background, color: '#333' }]}
            placeholder={`e.g. morning coffee, travel, fitness...`}
            placeholderTextColor={theme.primary + '60'}
            value={topic}
            onChangeText={setTopic}
            multiline={false}
            returnKeyType="done"
          />

          {/* Tone Selector */}
          <Text style={[styles.inputLabel, { color: theme.primary, marginTop: SPACING.sm }]}>TONE</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.toneRow}>
              {TONES.map((t) => (
                <TouchableOpacity
                  key={t.id}
                  style={[
                    styles.toneChip,
                    { borderColor: theme.soft },
                    tone === t.id && { backgroundColor: theme.primary, borderColor: theme.primary }
                  ]}
                  onPress={() => setTone(t.id)}
                >
                  <Text style={[
                    styles.toneLabel,
                    { color: theme.primary },
                    tone === t.id && { color: '#fff' }
                  ]}>
                    {t.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          {/* Generate Button */}
          <TouchableOpacity
            style={[styles.genBtn, { backgroundColor: theme.primary }, loading && styles.btnDisabled]}
            onPress={handleGenerate}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.genBtnText}>✦ Generate Captions</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Loading Dots */}
        {loading && (
          <View style={styles.loadingWrap}>
            <Text style={[styles.loadingText, { color: theme.primary }]}>Crafting your captions...</Text>
          </View>
        )}

        {/* Results */}
        {captions.length > 0 && (
          <Animated.View style={{ opacity: fadeAnim }}>
            <Text style={[styles.resultsTitle, { color: theme.primary }]}>Your Captions ✦</Text>
            {captions.map((caption, i) => (
              <View key={i} style={[styles.captionCard, { borderColor: theme.soft }]}>
                <TouchableOpacity
                  style={[
                    styles.copyBtn,
                    { backgroundColor: copiedIndex === i ? '#b8f0c8' : theme.soft }
                  ]}
                  onPress={() => handleCopy(caption, i)}
                >
                  <Text style={[
                    styles.copyBtnText,
                    { color: copiedIndex === i ? '#2d7a4f' : theme.primary }
                  ]}>
                    {copiedIndex === i ? '✓ Copied' : 'Copy'}
                  </Text>
                </TouchableOpacity>
                <Text style={styles.captionText}>{caption.text}</Text>
                <Text style={[styles.hashtags, { color: theme.primary }]}>{caption.hashtags}</Text>
              </View>
            ))}
          </Animated.View>
        )}

        {/* Ad Banner */}
        <BannerAdComponent />
        <View style={{ height: 24 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  header: { padding: SPACING.lg, paddingTop: 56, alignItems: 'center' },
  headerTitle: { fontSize: 28, color: '#fff', fontFamily: 'DMSerifDisplay', letterSpacing: -0.5 },
  headerSub: { fontSize: 12, color: 'rgba(255,255,255,0.85)', fontFamily: 'Nunito', fontWeight: '700', letterSpacing: 1, marginTop: 2 },
  tabsWrap: { paddingVertical: 12 },
  tabs: { paddingHorizontal: SPACING.md, gap: 8, flexDirection: 'row' },
  tab: {
    paddingVertical: 8, paddingHorizontal: 14, borderRadius: RADIUS.full,
    borderWidth: 1.5, alignItems: 'center', flexDirection: 'row', gap: 4
  },
  tabEmoji: { fontSize: 14 },
  tabLabel: { fontSize: 12, fontFamily: 'Nunito', fontWeight: '700' },
  quotaWrap: { paddingHorizontal: SPACING.md, paddingBottom: 8 },
  quotaRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  quotaLabel: { fontSize: 12, fontFamily: 'Nunito', fontWeight: '700' },
  quotaTrack: { height: 7, borderRadius: RADIUS.full, overflow: 'hidden' },
  quotaFill: { height: '100%', borderRadius: RADIUS.full },
  card: {
    margin: SPACING.md, marginTop: 8, borderRadius: RADIUS.lg,
    borderWidth: 1.5, padding: SPACING.md,
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 12,
    shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  inputLabel: { fontSize: 11, fontFamily: 'Nunito', fontWeight: '700', letterSpacing: 0.8, marginBottom: 8 },
  input: {
    borderWidth: 1.5, borderRadius: RADIUS.sm, padding: 13,
    fontSize: 14, fontFamily: 'Nunito', marginBottom: 4,
  },
  toneRow: { flexDirection: 'row', gap: 8, paddingVertical: 4 },
  toneChip: {
    paddingVertical: 7, paddingHorizontal: 14, borderRadius: RADIUS.full,
    borderWidth: 1.5,
  },
  toneLabel: { fontSize: 13, fontFamily: 'Nunito', fontWeight: '700' },
  genBtn: {
    borderRadius: RADIUS.sm, padding: 15,
    alignItems: 'center', marginTop: 14,
  },
  btnDisabled: { opacity: 0.5 },
  genBtnText: { color: '#fff', fontSize: 18, fontFamily: 'DMSerifDisplay', letterSpacing: 0.3 },
  loadingWrap: { alignItems: 'center', padding: SPACING.md },
  loadingText: { fontFamily: 'Nunito', fontWeight: '600', fontSize: 14 },
  resultsTitle: { fontFamily: 'DMSerifDisplay', fontSize: 22, marginLeft: SPACING.md, marginTop: 4, marginBottom: 8 },
  captionCard: {
    backgroundColor: '#fff', borderWidth: 1.5,
    borderRadius: RADIUS.md, padding: 14,
    marginHorizontal: SPACING.md, marginBottom: 10,
    position: 'relative',
  },
  copyBtn: {
    position: 'absolute', top: 10, right: 10,
    borderRadius: 8, paddingVertical: 5, paddingHorizontal: 10, zIndex: 1
  },
  copyBtnText: { fontSize: 11, fontFamily: 'Nunito', fontWeight: '700' },
  captionText: { fontSize: 13, color: '#444', lineHeight: 20, marginBottom: 8, fontFamily: 'Nunito', paddingRight: 60 },
  hashtags: { fontSize: 12, fontFamily: 'Nunito', fontWeight: '600', lineHeight: 18 },
});
