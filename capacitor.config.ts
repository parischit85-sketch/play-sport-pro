import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.playsportpro.app',
  appName: 'Play Sport Pro',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"]
    },
    LocalNotifications: {
      smallIcon: "ic_stat_icon_config_sample",
      iconColor: "#488AFF"
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#ffffff'
    },
    GoogleAuth: {
      scopes: ["profile", "email"],
      serverClientId: "1004722051733-70tcjn7ermucm07jibslelk719eblv3f.apps.googleusercontent.com",
      forceCodeForRefreshToken: true
    }
  }
};

export default config;
