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
      buildNumber: '3',
      infoPlist: {
        UIBackgroundModes: ['remote-notification', 'fetch', 'processing'],
        ITSAppUsesNonExemptEncryption: false,
        NSCalendarsUsageDescription: 'This app needs access to your calendar to sync events as tasks.',
        NSUserNotificationsUsageDescription: 'This app needs to send you reminders for your tasks.',
      },
      entitlements: {
        'aps-environment': 'development',
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
    plugins: [
      'expo-notifications',
      [
        'expo-background-fetch',
        {
          // Enable background fetch for calendar sync
        }
      ],
      [
        'expo-task-manager',
        {
          // Required for background tasks
        }
      ]
    ],
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
