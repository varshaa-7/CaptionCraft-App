import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function BannerAdComponent() {
  return (
    <View style={styles.placeholder}>
      <Text style={styles.text}>📢 Ad Banner</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  placeholder: {
    marginHorizontal: 16,
    marginVertical: 8,
    backgroundColor: '#fff8fb',
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#fde8f0',
    padding: 12,
    alignItems: 'center',
  },
  text: { fontSize: 12, color: '#ccc' },
});