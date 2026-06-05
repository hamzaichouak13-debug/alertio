import type { CapacitorConfig } from "@capacitor/cli";

const isDev = process.env.CAPACITOR_DEV === "true";

const config: CapacitorConfig = {
  appId:   "io.alertio.app",
  appName: "Alertio",
  webDir:  "out",  // ← chemin depuis la racine du monorepo

  server: isDev
    ? {
        url:           process.env.DEV_SERVER_URL ?? "http://localhost:3000",
        cleartext:     true,
        androidScheme: "http",
      }
    : undefined,

  plugins: {
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"],
    },
    SplashScreen: {
      launchShowDuration:  2000,
      backgroundColor:     "#0E0F11",
      showSpinner:         false,
      androidSpinnerStyle: "small",
      iosSpinnerStyle:     "small",
      spinnerColor:        "#1D9E75",
      splashFullScreen:    true,
      splashImmersive:     true,
    },
    StatusBar: {
      style:           "DARK",
      backgroundColor: "#0E0F11",
    },
  },

  ios: {
    contentInset:         "automatic",
    preferredContentMode: "mobile",
  },

  android: {
    allowMixedContent:           false,
    captureInput:                true,
    webContentsDebuggingEnabled: isDev,  // ← explicite
  },
};

export default config;