import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const JurisprudenciaScreen = () => (
  <View style={styles.container}>
    <Text style={styles.title}>Jurisprudência</Text>
    <Text>Funcionalidade a ser implementada.</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold' },
});

export default JurisprudenciaScreen;
