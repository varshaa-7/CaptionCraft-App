// Platform-specific themes
export const PLATFORMS = {
  instagram: {
    id: 'instagram',
    label: 'Instagram',
    emoji: '📸',
    primary: '#E8729A',
    primaryLight: '#f8a7c0',
    background: '#fff0f5',
    soft: '#fde8f0',
    gradient: ['#fde8f0', '#fff0f5'],
    headerGradient: ['#f8a7c0', '#E8729A'],
    text: '#c0496e',
  },
  linkedin: {
    id: 'linkedin',
    label: 'LinkedIn',
    emoji: '💼',
    primary: '#2d7fc1',
    primaryLight: '#90c4e8',
    background: '#f0f7ff',
    soft: '#dbeeff',
    gradient: ['#dbeeff', '#f0f7ff'],
    headerGradient: ['#90c4e8', '#2d7fc1'],
    text: '#1a5a94',
  },
  youtube: {
    id: 'youtube',
    label: 'YouTube',
    emoji: '▶',
    primary: '#d63031',
    primaryLight: '#f08080',
    background: '#fff5f5',
    soft: '#ffe0e0',
    gradient: ['#ffe0e0', '#fff5f5'],
    headerGradient: ['#f08080', '#d63031'],
    text: '#a82323',
  },
  other: {
    id: 'other',
    label: 'Other',
    emoji: '✦',
    primary: '#7c53c3',
    primaryLight: '#c4a8e8',
    background: '#f8f0ff',
    soft: '#ecdeff',
    gradient: ['#ecdeff', '#f8f0ff'],
    headerGradient: ['#c4a8e8', '#7c53c3'],
    text: '#5a3a9a',
  },
};

export const TONES = [
  { id: 'fun', label: '😄 Fun' },
  { id: 'inspirational', label: '✨ Inspiring' },
  { id: 'professional', label: '💼 Pro' },
  { id: 'witty', label: '😏 Witty' },
  { id: 'romantic', label: '💕 Romantic' },
];

export const TYPOGRAPHY = {
  displayFont: 'DMSerifDisplay',
  bodyFont: 'Nunito',
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const RADIUS = {
  sm: 10,
  md: 16,
  lg: 22,
  full: 999,
};

// AdMob IDs - Replace with your real IDs
export const ADMOB_IDS = {
  // Test IDs (use these during development)
  bannerAndroid: 'ca-app-pub-3940256099942544/6300978111',
  interstitialAndroid: 'ca-app-pub-3940256099942544/1033173712',
  rewardedAndroid: 'ca-app-pub-3940256099942544/5224354917',
  bannerIos: 'ca-app-pub-3940256099942544/2934735716',
  interstitialIos: 'ca-app-pub-3940256099942544/4411468910',
  rewardedIos: 'ca-app-pub-3940256099942544/1712485313',
};
