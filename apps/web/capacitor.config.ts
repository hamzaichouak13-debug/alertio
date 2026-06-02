// ─────────────────────────────────────────────
// ALERTIO — capacitor.config.ts
// iOS + Android mobile build config
// ─────────────────────────────────────────────

import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId:     "io.alertio.app",
  appName:   "Alertio",
  webDir:    "out",   // Next.js static export output dir

  // Development: point to local Next.js dev server
  // Comment out for production builds
  server: process.env.CAPACITOR_DEV === "true"
    ? {
        url:           "http://YOUR_LOCAL_IP:3000",
        cleartext:     true,
        androidScheme: "http",
      }
    : undefined,

  plugins: {
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"],
    },
    SplashScreen: {
      launchShowDuration:     2000,
      backgroundColor:        "#0E0F11",
      showSpinner:            false,
      androidSpinnerStyle:    "small",
      iosSpinnerStyle:        "small",
      spinnerColor:           "#1D9E75",
      splashFullScreen:       true,
      splashImmersive:        true,
    },
    StatusBar: {
      style:           "DARK",
      backgroundColor: "#0E0F11",
    },
  },

  ios: {
    contentInset: "automatic",
    preferredContentMode: "mobile",
    // Required for push notifications
    // Add the GoogleService-Info.plist to ios/App/App/
  },

  android: {
    allowMixedContent:  false,
    captureInput:       true,
    webContentsDebuggingEnabled: process.env.NODE_ENV === "development",
    // Add google-services.json to android/app/
  },
};

export default config;
