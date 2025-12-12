// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Add support for audio file extensions
config.resolver.assetExts.push(
  // Audio formats
  'ogg',
  'wav',
  'mp3',
  'm4a',
  'aac'
);

module.exports = config;
