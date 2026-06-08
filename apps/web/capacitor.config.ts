import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: "io.alertio.app",
  appName: "Alertio",

  server: {
    url: "https://alertio-prod.vercel.app",
    cleartext: false,
  },

  plugins: {
    SplashScreen: {
      launchAutoHide: true,
      launchShowDuration: 0,
    },
    StatusBar: {
      style: "DARK",
      backgroundColor: "#0E0F11",
    },
  },

  ios: {
    contentInset: "automatic",
    preferredContentMode: "mobile",
    webContentsDebuggingEnabled: true,
  },

  android: {
    allowMixedContent: false,
    captureInput: true,
    webContentsDebuggingEnabled: false,
  },
};

export default config;
