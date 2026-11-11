# Expo & React Native Modern Engineering Playbook

Authoritative architectural specification for developing, styling, and deploying production-grade cross-platform mobile applications using Expo SDK (51+), Expo Router (v3+), and React Native. Synthesizes official standards from the Expo Core Team (`expo/skills`).

---

## 🧭 The Core Principle: Anti-Halos & Modern Mobile Discipline

Legacy React Native workflows relied on fragmented packages (`react-navigation` imperative stacks, raw `StyleSheet.create` boilerplate, fragile manual linking). Modern Expo development mandates **declarative file-based routing, native utility styling, safe area awareness, and deterministic EAS build pipelines**.

---

## 🏛️ 1. Expo Router File-Based Architecture

Expo Router aligns mobile development with modern web mental models:

### Directory Conventions (`app/`)
```
app/
├── _layout.tsx         # Root Layout (Theme, Auth, TanStack Query Providers)
├── (auth)/             # Route Group: Unauthenticated Stack
│   ├── _layout.tsx     # Auth Stack Navigator
│   ├── login.tsx       # /login
│   └── register.tsx    # /register
├── (tabs)/             # Route Group: Authenticated Tab Navigator
│   ├── _layout.tsx     # Bottom Tab Bar Configuration
│   ├── index.tsx       # Home Tab (/)
│   ├── explore.tsx     # Explore Tab (/explore)
│   └── profile.tsx     # Profile Tab (/profile)
├── item/
│   └── [id].tsx        # Dynamic Segment (/item/123)
└── +not-found.tsx      # 404 Fallback
```

### Invariants:
1. **Root Layout Seam**: Never render UI screens inside root `_layout.tsx`. Restrict root layout to global providers (`QueryClientProvider`, `ThemeProvider`, `SafeAreaProvider`) and the primary `<Stack>` router outlet.
2. **Typed Navigation**: Use typed routing from `expo-router`:
   ```tsx
   import { router, Link } from 'expo-router';
   
   // Programmatic push
   router.push({ pathname: '/item/[id]', params: { id: '42' } });
   
   // Declarative Link with asChild for custom button styling
   <Link href="/profile" asChild>
     <Pressable className="p-3 bg-primary rounded-xl active:opacity-80">
       <Text className="text-white font-medium">View Profile</Text>
     </Pressable>
   </Link>
   ```

---

## 🎨 2. Mobile UI Ergonomics & Styling

### NativeWind v4 (Tailwind for React Native)
- Configure `global.css` with `@tailwind base; @tailwind components; @tailwind utilities;`.
- Avoid arbitrary pixel hacks; adhere strictly to 4pt/8pt geometric spacing scales (`p-2`, `p-4`, `p-6`, `p-8`).

### Safe Area Insets Handling
Never render raw status bar overflows. Always decouple safe areas from visual background colors:
```tsx
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function ScreenContainer({ children }: { children: React.ReactNode }) {
  const insets = useSafeAreaInsets();
  
  return (
    <View 
      className="flex-1 bg-background"
      style={{
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
        paddingLeft: insets.left,
        paddingRight: insets.right,
      }}
    >
      {children}
    </View>
  );
}
```

### Touch Targets & Tactile Physics
- **Minimum Tap Target of $44 \times 44\text{px}$**: Apply `hitSlop={8}` or padding to micro-icons to guarantee tap reliability on mobile touchscreens.
- **Tactile Feedback**: Use `Pressable` with `:active` opacity or native haptics (`expo-haptics`) on primary interactions:
  ```tsx
  import * as Haptics from 'expo-haptics';
  
  <Pressable
    onPress={() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      handleAction();
    }}
    className="active:scale-[0.98] transition-transform"
  >
    {/* Content */}
  </Pressable>
  ```

---

## ⚡ 3. Data Fetching, State & Offline Persistence

### TanStack Query v5 in React Native
React Native apps do not share browser window focus. Connect network state and focus handlers explicitly:
```tsx
import { AppState, Platform } from 'react-native';
import type { AppStateStatus } from 'react-native';
import { focusManager, onlineManager } from '@tanstack/react-query';
import NetInfo from '@react-native-community/netinfo';

// Synchronize online state
onlineManager.setEventListener((setOnline) => {
  return NetInfo.addEventListener((state) => {
    setOnline(!!state.isConnected);
  });
});

// Synchronize app focus state
function onAppStateChange(status: AppStateStatus) {
  if (Platform.OS !== 'web') {
    focusManager.setFocused(status === 'active');
  }
}
```

### Storage Tiers
- **Tokens & Credentials**: Use `expo-secure-store` (hardware-backed Keychain on iOS, KeyStore on Android). Never place JWTs or API secrets in unencrypted `AsyncStorage`.
- **High-Performance Offline Cache**: Use `react-native-mmkv` for sub-millisecond key-value storage.

---

## 📱 4. Expo Go vs. Development Builds (`expo-dev-client`)

| Requirement | Supported in Expo Go? | Recommended Environment |
|---|---|---|
| Pure JS/TS, Expo SDK core APIs, Expo Router, NativeWind | ✅ YES | **Expo Go** (instant QR-code preview) |
| Custom native code (Kotlin/Swift), third-party pods | ❌ NO | **`expo-dev-client`** (`npx expo run:ios` / `android`) |
| Background location, native audio engines, in-app purchases | ❌ NO | **EAS Development Build** |

*Invariant*: If adding a native module without an Expo config plugin, immediately transition from Expo Go to custom development builds via `npx expo prebuild`.

---

## 🚀 5. EAS Workflows & Upgrade Discipline

### Safe Dependency Alignment
Never install React Native packages with raw `npm install` without version verification:
```bash
# Correct: Resolves compatible versions aligned with current Expo SDK
npx expo install <package-name>

# Fix dependency conflicts across installed modules
npx expo install --fix

# Clear bundler cache when encountering unexpected Metro resolve errors
npx expo start -c
```

### EAS Build Matrix (`eas.json`)
```json
{
  "cli": { "version": ">= 9.0.0" },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal"
    },
    "production": {
      "autoIncrement": true
    }
  },
  "submit": {
    "production": {}
  }
}
```
