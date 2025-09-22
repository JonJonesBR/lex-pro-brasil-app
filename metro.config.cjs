const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Adiciona electron.js à lista de arquivos a serem ignorados pelo Metro.
config.resolver.blacklistREs = [
  /electron\.js/,
];

// Fixa o problema de bundling para web
config.resolver.assetExts = config.resolver.assetExts.filter((ext) => ext !== 'svg');
config.resolver.sourceExts = [...config.resolver.sourceExts, 'svg'];

module.exports = config;
