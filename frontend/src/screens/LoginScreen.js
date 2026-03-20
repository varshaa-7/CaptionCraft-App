import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';
import { RADIUS, SPACING } from '../theme';

export default function LoginScreen({ navigation }) {
  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Missing Fields', 'Please fill in all required fields.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Weak Password', 'Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    try {
      if (isLogin) {
        await login(email.trim(), password);
      } else {
        await register(email.trim(), password, name.trim());
      }
    }  catch (err) {
      console.log('Login error:', JSON.stringify(err.response?.data));
      console.log('Status:', err.response?.status);
      console.log('Message:', err.message);
      const msg = err.response?.data?.error || err.message || 'Something went wrong. Please try again.';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#fff0f5', '#fde8f0']} style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.inner}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.logoWrap}>
            <Text style={styles.logo}>✦</Text>
            <Text style={styles.appName}>CaptionCraft</Text>
            <Text style={styles.tagline}>AI-powered captions for every platform</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>{isLogin ? 'Welcome back' : 'Create account'}</Text>

            {!isLogin && (
              <TextInput
                style={styles.input}
                placeholder="Display name"
                placeholderTextColor="#c0496e80"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
              />
            )}

            <TextInput
              style={styles.input}
              placeholder="Email address"
              placeholderTextColor="#c0496e80"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#c0496e80"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <TouchableOpacity
              style={[styles.btn, loading && styles.btnDisabled]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.btnText}>
                  {isLogin ? '✦ Sign In' : '✦ Create Account'}
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.switchBtn}
              onPress={() => setIsLogin(!isLogin)}
            >
              <Text style={styles.switchText}>
                {isLogin
                  ? "Don't have an account? Sign up"
                  : 'Already have an account? Sign in'}
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.footerNote}>
            By continuing, you agree to our Terms of Service and Privacy Policy.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  inner: {
    flexGrow: 1, justifyContent: 'center',
    padding: SPACING.lg,
  },
  logoWrap: { alignItems: 'center', marginBottom: SPACING.xl },
  logo: { fontSize: 52, color: '#E8729A', marginBottom: 4 },
  appName: {
    fontSize: 34, color: '#E8729A',
    fontFamily: 'DMSerifDisplay', letterSpacing: -0.5
  },
  tagline: { fontSize: 14, color: '#c0496e', marginTop: 4, fontFamily: 'Nunito' },
  card: {
    backgroundColor: '#fff',
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1.5,
    borderColor: '#fde8f0',
    shadowColor: '#E8729A',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  cardTitle: {
    fontSize: 22, color: '#c0496e',
    fontFamily: 'DMSerifDisplay', marginBottom: SPACING.md
  },
  input: {
    borderWidth: 1.5, borderColor: '#fde8f0',
    borderRadius: RADIUS.sm, padding: 13,
    marginBottom: SPACING.sm, fontSize: 15,
    color: '#333', backgroundColor: '#fff8fb',
    fontFamily: 'Nunito',
  },
  btn: {
    backgroundColor: '#E8729A', borderRadius: RADIUS.sm,
    padding: 15, alignItems: 'center', marginTop: SPACING.sm,
  },
  btnDisabled: { opacity: 0.6 },
  btnText: {
    color: '#fff', fontSize: 17, fontFamily: 'DMSerifDisplay', letterSpacing: 0.3
  },
  switchBtn: { alignItems: 'center', marginTop: SPACING.md },
  switchText: { color: '#E8729A', fontFamily: 'Nunito', fontSize: 14, fontWeight: '600' },
  footerNote: {
    textAlign: 'center', color: '#ccc', fontSize: 11,
    marginTop: SPACING.lg, fontFamily: 'Nunito',
  },
});
