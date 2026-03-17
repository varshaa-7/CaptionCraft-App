import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';

export default function BannerAdComponent() {

  return (
    <View style={styles.placeholder}>
      <Text style={styles.placeholderText}>📢 Advertisement</Text>
      <Text style={styles.placeholderSub}>Banner Ad (AdMob)</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', marginVertical: 8 },
  placeholder: {
    marginHorizontal: 16, marginVertical: 8,
    backgroundColor: '#fff8fb', borderRadius: 10,
    borderWidth: 1.5, borderColor: '#fde8f0',
    borderStyle: 'dashed', padding: 12,
    alignItems: 'center',
  },
  placeholderText: { fontSize: 13, color: '#E8729A', fontFamily: 'Nunito', fontWeight: '700' },
  placeholderSub: { fontSize: 11, color: '#ccc', fontFamily: 'Nunito', marginTop: 2 },
});
