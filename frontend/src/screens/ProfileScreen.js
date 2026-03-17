import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, TextInput, Alert, ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Toast from 'react-native-toast-message';
import { useAuth } from '../context/AuthContext';
import { updateProfile } from '../services/api';
import { RADIUS, SPACING } from '../theme';

export default function ProfileScreen() {
  const { user, logout, updateUserQuota } = useAuth();
  const [editingName, setEditingName] = useState(false);
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [saving, setSaving] = useState(false);

  const handleSaveName = async () => {
    if (!displayName.trim()) return;
    setSaving(true);
    try {
      await updateProfile(displayName.trim());
      Toast.show({ type: 'success', text1: 'Name updated!' });
      setEditingName(false);
    } catch {
      Toast.show({ type: 'error', text1: 'Failed to update name' });
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: logout }
    ]);
  };

  const initials = (user?.displayName || user?.email || 'U')
    .split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

  return (
    <View style={{ flex: 1, backgroundColor: '#fff0f5' }}>
      <LinearGradient colors={['#f8a7c0', '#E8729A']} style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <Text style={styles.userName}>{user?.displayName || 'User'}</Text>
        <Text style={styles.userEmail}>{user?.email}</Text>
        <View style={styles.subBadge}>
          <Text style={styles.subBadgeText}>
            {user?.subscription === 'pro' ? '⭐ Pro' : '✦ Free Plan'}
          </Text>
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Edit Name */}
        <View style={styles.card}>
          <Text style={styles.sectionLabel}>DISPLAY NAME</Text>
          {editingName ? (
            <View style={styles.editRow}>
              <TextInput
                style={styles.input}
                value={displayName}
                onChangeText={setDisplayName}
                autoFocus
                placeholder="Your name"
                placeholderTextColor="#c0496e60"
              />
              <TouchableOpacity
                style={[styles.saveBtn, saving && { opacity: 0.6 }]}
                onPress={handleSaveName}
                disabled={saving}
              >
                {saving
                  ? <ActivityIndicator color="#fff" size="small" />
                  : <Text style={styles.saveBtnText}>Save</Text>}
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.nameRow}>
              <Text style={styles.nameText}>{user?.displayName || 'Not set'}</Text>
              <TouchableOpacity onPress={() => setEditingName(true)}>
                <Text style={styles.editBtn}>Edit</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Stats */}
        <View style={styles.card}>
          <Text style={styles.sectionLabel}>YOUR STATS</Text>
          {[
            { label: 'Total Captions Generated', value: String(user?.quota?.captionsUsed || 0) },
            { label: 'Today\'s Captions Used', value: String(user?.quota?.captionsUsed || 0) },
            { label: 'Subscription', value: user?.subscription === 'pro' ? '⭐ Pro' : 'Free' },
          ].map((stat) => (
            <View key={stat.label} style={styles.statRow}>
              <Text style={styles.statLabel}>{stat.label}</Text>
              <Text style={styles.statVal}>{stat.value}</Text>
            </View>
          ))}
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>

        <Text style={styles.version}>CaptionCraft v1.0.0</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { padding: SPACING.lg, paddingTop: 56, alignItems: 'center', paddingBottom: SPACING.xl },
  avatar: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center', justifyContent: 'center', marginBottom: 10,
  },
  avatarText: { fontSize: 26, color: '#fff', fontFamily: 'DMSerifDisplay' },
  userName: { fontSize: 22, color: '#fff', fontFamily: 'DMSerifDisplay' },
  userEmail: { fontSize: 13, color: 'rgba(255,255,255,0.8)', fontFamily: 'Nunito', marginTop: 2 },
  subBadge: {
    backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: RADIUS.full,
    paddingVertical: 5, paddingHorizontal: 14, marginTop: 8,
  },
  subBadgeText: { color: '#fff', fontSize: 12, fontFamily: 'Nunito', fontWeight: '700' },
  content: { padding: SPACING.md },
  card: {
    backgroundColor: '#fff', borderRadius: RADIUS.md, padding: SPACING.md,
    borderWidth: 1.5, borderColor: '#fde8f0', marginBottom: 12,
  },
  sectionLabel: { fontSize: 11, fontFamily: 'Nunito', fontWeight: '700', color: '#E8729A', letterSpacing: 0.8, marginBottom: 12 },
  editRow: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  input: {
    flex: 1, borderWidth: 1.5, borderColor: '#fde8f0', borderRadius: RADIUS.sm,
    padding: 10, fontSize: 14, fontFamily: 'Nunito', color: '#333', backgroundColor: '#fff8fb',
  },
  saveBtn: {
    backgroundColor: '#E8729A', borderRadius: RADIUS.sm,
    paddingVertical: 10, paddingHorizontal: 16,
  },
  saveBtnText: { color: '#fff', fontFamily: 'Nunito', fontWeight: '700', fontSize: 13 },
  nameRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  nameText: { fontSize: 15, color: '#333', fontFamily: 'Nunito', fontWeight: '600' },
  editBtn: { color: '#E8729A', fontFamily: 'Nunito', fontWeight: '700', fontSize: 13 },
  statRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#fde8f0' },
  statLabel: { fontSize: 13, color: '#666', fontFamily: 'Nunito' },
  statVal: { fontSize: 13, color: '#E8729A', fontFamily: 'Nunito', fontWeight: '700' },
  logoutBtn: {
    backgroundColor: '#fff', borderRadius: RADIUS.md, padding: 15,
    alignItems: 'center', borderWidth: 1.5, borderColor: '#f08080', marginBottom: 12,
  },
  logoutText: { color: '#d63031', fontFamily: 'Nunito', fontWeight: '700', fontSize: 15 },
  version: { textAlign: 'center', color: '#ccc', fontSize: 12, fontFamily: 'Nunito' },
});
