# CaptionCraft — AI Caption Generator

Full-stack mobile app: React Native (Expo) + Node.js/Express backend + MongoDB + Grok AI + Firebase Auth + AdMob.

---
## 📸 Screenshots

### Home Screen
![Home](frontend/assets/screenshots/Home.jpeg)

### Profile Screen
![Login](frontend/assets/screenshots/Profile.jpeg)

### Instagram Caption Generation Screen
![Generate](frontend/assets/screenshots/Instagram.jpeg)

### LinkedIn Caption Generation Screen
![History](frontend/assets/screenshots/Linkedin.jpeg)

### Youtube Caption Generation Screen
![Profile](frontend/assets/screenshots/Yt.jpeg)

### Other Caption Generation Screen
![Ads](frontend/assets/screenshots/Other.jpeg)

## Project Structure

```
captioncraft/
├── backend/          ← Node.js + Express API
│   ├── server.js
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   └── .env.example
└── frontend/         ← React Native (Expo)
    ├── App.js
    ├── src/
    │   ├── screens/
    │   ├── components/
    │   ├── context/
    │   ├── services/
    │   └── theme/
    └── assets/
```

---

## STEP 1 — Prerequisites

Install these before anything else:

- Node.js 18+ → https://nodejs.org
- Git → https://git-scm.com
- Expo CLI → `npm install -g expo-cli`
- EAS CLI → `npm install -g eas-cli`

---

## STEP 2 — MongoDB Atlas (Free)

1. Go to https://www.mongodb.com/atlas
2. Create a free account → Create a free cluster (M0)
3. Under "Database Access" → Add a user with password
4. Under "Network Access" → Add IP `0.0.0.0/0` (allow all)
5. Click "Connect" → "Connect your application"
6. Copy the connection string — it looks like:
   `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/`
7. Add `/captioncraft` at the end before the `?`

---

## STEP 3 — Groq API Key (Free & Fast)

1. Go to https://console.groq.com
2. Sign up for a free account
3. Go to "API Keys" → click "Create API Key"
4. Copy the key — starts with `gsk_...`
5. Paste it as `GROQ_API_KEY` in your `.env`

Groq is free to use with generous rate limits. The default model is
`llama-3.3-70b-versatile` — ultra fast and great for creative writing.
You can swap the model by setting `GROQ_MODEL` in `.env`:
- `llama-3.3-70b-versatile` — best quality (default)
- `llama3-8b-8192` — fastest, good for testing
- `mixtral-8x7b-32768` — good balance of speed + quality
- `gemma2-9b-it` — lightweight alternative

---

## STEP 4 — Backend Setup

```bash
cd captioncraft/backend

# Install dependencies
npm install

# Copy env file
cp .env.example .env
```

Now edit `.env` with your real values:

```
PORT=5000
MONGODB_URI=mongodb+srv://youruser:yourpassword@cluster0.xxxxx.mongodb.net/captioncraft?retryWrites=true&w=majority
JWT_SECRET=make_this_a_long_random_string_at_least_32_chars
GROK_API_KEY=xai-your-key-here
GROK_API_URL=https://api.x.ai/v1/chat/completions
NODE_ENV=development
```

Run the backend:

```bash
# Development (auto-restart on changes)
npm run dev

# Production
npm start
```

You should see:
```
✅ MongoDB connected
🚀 Server running on port 5000
```

Test it: http://localhost:5000/api/health

---

## STEP 5 — Fonts Setup

Download these free fonts and place them in `frontend/assets/fonts/`:

**DM Serif Display** (Google Fonts):
https://fonts.google.com/specimen/DM+Serif+Display
- Download → extract → copy `DMSerifDisplay-Regular.ttf` and `DMSerifDisplay-Italic.ttf`

**Nunito** (Google Fonts):
https://fonts.google.com/specimen/Nunito
- Download → extract → copy `Nunito-Regular.ttf`, `Nunito-Bold.ttf`, `Nunito-SemiBold.ttf`

Create the folder:
```bash
mkdir -p captioncraft/frontend/assets/fonts
# Then paste the .ttf files here
```

---

## STEP 6 — Firebase Setup (Authentication)

1. Go to https://console.firebase.google.com
2. Create a new project (e.g. "CaptionCraft")
3. Add an Android app:
   - Package name: `com.yourname.captioncraft`
   - Download `google-services.json` → place in `frontend/`
4. Add an iOS app:
   - Bundle ID: `com.yourname.captioncraft`
   - Download `GoogleService-Info.plist` → place in `frontend/`
5. In Firebase console → Authentication → Sign-in method:
   - Enable "Email/Password"
   - Enable "Google" (optional)

---

## STEP 7 — Frontend Setup

```bash
cd captioncraft/frontend

# Install dependencies
npm install

# Update the API base URL in src/services/api.js
# Change BASE_URL to your local IP for testing:
# http://YOUR_LOCAL_IP:5000/api
# Find your IP: run `ipconfig` (Windows) or `ifconfig` (Mac/Linux)
```

Run on Android/iOS:

```bash
# Start Expo
npm start

# Press 'a' for Android emulator
# Press 'i' for iOS simulator
# Scan QR code with Expo Go app on your phone
```

---

## STEP 8 — AdMob Setup (Monetization)

1. Go to https://admob.google.com
2. Create an account → Add app (Android + iOS)
3. Create ad units:
   - Banner Ad
   - Interstitial Ad
   - Rewarded Ad
4. Copy the Ad Unit IDs
5. Replace test IDs in `src/theme/index.js`:

```js
export const ADMOB_IDS = {
  bannerAndroid: 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX',
  interstitialAndroid: 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX',
  rewardedAndroid: 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX',
  bannerIos: 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX',
  interstitialIos: 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX',
  rewardedIos: 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX',
};
```

Then uncomment the real AdMob code in `src/components/BannerAdComponent.js`
and `src/screens/QuotaScreen.js`.

---

## STEP 9 — Deploy Backend

### Option A: Railway (Recommended — Easiest)

1. Go to https://railway.app → Sign up with GitHub
2. New Project → Deploy from GitHub repo
3. Select your repo → set root directory to `/backend`
4. Add environment variables (same as your .env)
5. Railway auto-deploys → gives you a URL like:
   `https://captioncraft-api-production.up.railway.app`
6. Update `BASE_URL` in `frontend/src/services/api.js` to this URL

### Option B: Render

1. Go to https://render.com → New Web Service
2. Connect GitHub → root directory: `backend`
3. Build command: `npm install`
4. Start command: `npm start`
5. Add environment variables
6. Deploy → copy the URL

---

## STEP 10 — Build APK for Google Play

```bash
cd frontend

# Login to Expo
eas login

# Configure build
eas build:configure

# Build Android APK (takes ~10-15 mins, builds in cloud)
eas build --platform android --profile preview

# For production AAB (for Play Store)
eas build --platform android --profile production
```

The build happens in Expo's cloud. You get a download link when done.

---

## API Endpoints Reference

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | No | Register with email/password |
| POST | `/api/auth/login` | No | Login with email/password |
| POST | `/api/auth/firebase` | No | Firebase/Google sign-in |
| GET | `/api/auth/me` | Yes | Get current user |
| POST | `/api/captions/generate` | Yes | Generate AI captions |
| GET | `/api/captions/history` | Yes | Get caption history |
| DELETE | `/api/captions/history` | Yes | Clear history |
| GET | `/api/users/quota` | Yes | Get quota status |
| PUT | `/api/users/profile` | Yes | Update display name |
| POST | `/api/ads/reward` | Yes | Claim rewarded ad bonus |

---

## Quota System

| Plan | Captions/Day | Hashtags/Day |
|------|-------------|--------------|
| Free | 10 | 50 |
| Pro  | 100 | 500 |
| +Ad reward | +5 captions or +10 hashtags | Max 25 bonus captions / 100 bonus hashtags per day |

Quota resets automatically at midnight via cron job.

---

## Platform Themes

| Platform | Theme Color |
|----------|-------------|
| Instagram | Baby Pink `#E8729A` |
| LinkedIn | Light Blue `#2d7fc1` |
| YouTube | Warm Red `#d63031` |
| Other | Light Purple `#7c53c3` |

---

## Troubleshooting

**"Network request failed" on mobile:**
- Make sure your phone and computer are on the same WiFi
- Use your computer's local IP (not localhost) in `api.js`
- Run `ipconfig` (Windows) or `ifconfig` (Mac) to find your IP

**MongoDB connection error:**
- Check your connection string in `.env`
- Make sure your IP is whitelisted in MongoDB Atlas Network Access

**Groq API error:**
- Verify your `GROQ_API_KEY` starts with `gsk_`
- Get a free key at https://console.groq.com
- Check rate limits — free tier allows ~30 requests/min

**Font not loading:**
- Make sure all .ttf files are in `frontend/assets/fonts/`
- File names must match exactly what's in `App.js`

**Expo QR code not working:**
- Try pressing `w` to open in web browser first
- Or use `expo start --tunnel` for network issues
