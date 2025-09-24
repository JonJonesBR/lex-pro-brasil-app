# Qwen CLI Guide for Lex Pro Brasil App

## Project Overview
This is the Lex Pro Brasil App - a legal technology application built with React Native/Expo. The project includes both mobile and web components with Electron support.

## Project Structure
- Root: Contains main configuration files (package.json, app.json, metro.config.cjs)
- `.expo/`: Expo cache and temporary files
- Various configuration files for building, testing, and deployment

## Key Technologies
- React Native/Expo
- TypeScript
- Electron (desktop support)
- EAS Build (for mobile builds)

## Common Commands
- `npx expo start` - Start development server
- `npx expo run:android` - Run on Android
- `npx expo run:ios` - Run on iOS
- `npm run build` - Build for production
- `eas build` - Build using Expo Application Services

## Files and Directories to Focus On
- `App.tsx` - Main application component
- `app.json` - Expo configuration
- `package.json` - Dependencies and scripts
- `tsconfig.json` - TypeScript configuration
- `metro.config.cjs` - Metro bundler configuration
- `eas.json` - EAS Build configuration

## Context for Qwen CLI
- This is a legal tech application helping Brazilian users with legal document processing
- The app likely involves document handling, legal compliance, and user authentication
- Consider Brazilian localization (pt-BR), legal requirements, and data privacy laws (LGPD)
- The app may integrate with legal databases or APIs for document verification

## Interaction Tips
- When asking about features, consider legal compliance requirements
- Remember to maintain user data privacy according to Brazilian regulations
- Consider offline functionality for legal document access
- Think about accessibility for legal document interfaces
- SEMPRE VEJA O ARQUIVO RESUMO_PROJETO.md AO INICIAR A INTERAÇÃO COM O USUÁRIO, PARA CONTINUAR DE ONDE PARAMOS
- AO FINAL, QUANDO O USUÁRIO INDICAR QUE DESEJA PARAR OU SE DESPEDIR, ATUALIZE O ARQUIVO RESUMO_PROJETO.md COM O QUE FOI FEITO NO PROJETO ATÉ ENTÃO