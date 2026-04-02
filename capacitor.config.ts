import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.vaultbaseball.os',
  appName: 'VAULT OS',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    iosScheme: 'https',
    hostname: 'app'
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
    NativeBiometric: {
      useFallback: true,
    },
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#0d0d0d',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
    },
    StatusBar: {
      style: 'Dark',
      backgroundColor: '#0d0d0d',
    },
  },
  ios: {
    scheme: 'VAULT OS',
    contentInset: 'automatic',
    backgroundColor: '#0d0d0d',
    preferredContentMode: 'mobile',
    limitsNavigationsToAppBoundDomains: false,
    allowsLinkPreview: false,
  },
  android: {
    allowMixedContent: true,
    backgroundColor: '#0d0d0d',
    captureInput: true,
    webContentsDebuggingEnabled: false,
  },
};

export default config;
