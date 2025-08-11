// metro.config.js
const { getDefaultConfig } = require('@expo/metro-config');

const projectRoot = __dirname;
const config = getDefaultConfig(projectRoot);

// Add mp4 support
config.resolver.assetExts.push('mp4');

module.exports = config;