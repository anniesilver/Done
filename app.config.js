module.exports = {
  expo: {
    name: 'Done',
    slug: 'done',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/images/icon.png',
    userInterfaceStyle: 'light',
    splash: {
      image: './assets/images/splash.png',
      resizeMode: 'contain',
      backgroundColor: '#2874a6',
    },
    assetBundlePatterns: ['**/*'],
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.anniesilver.done',
      buildNumber: '2',
      infoPlist: {
        UIBackgroundModes: ['remote-notification'],
        ITSAppUsesNonExemptEncryption: false,
      },
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/images/adaptive-icon.png',
        backgroundColor: '#2874a6',
      },
      permissions: ['NOTIFICATIONS', 'VIBRATE'],
      package: 'com.done.app',
    },
    web: {
      bundler: 'metro',
    },
    plugins: [],
    platforms: ['ios', 'android', 'web'],
    extra: {
      eas: {
        projectId: "152dd094-92cb-4877-84cf-dabc43fd0af9"
      },
      supabaseUrl: "https://bsnmiprwtlgouvngaykg.supabase.co",
      supabaseAnonKey: "sb_publishable_Vs-fZ6lR9NgZ4_3EG_ugLQ_Oexv02tH",
    },
    owner: "annieyang",
  },
};
