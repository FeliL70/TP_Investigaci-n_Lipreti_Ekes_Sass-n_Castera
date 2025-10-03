import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function screenInicial() {
  return (
    <SafeAreaView style={styles.container}>
      <View>
        <Text style={styles.texto}>Bienvenido!</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#272727',
    justifyContent: 'center',
    alignItems: 'center',
  },
  texto: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
  },
});