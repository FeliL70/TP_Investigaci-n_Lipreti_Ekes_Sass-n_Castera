import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Audio } from 'expo-av';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ScreenInicial() {

  const sonidoLocalRef = useRef(null);
  const [estaPausado, setEstaPausado] = useState(false);

  useEffect(() => {
    const cargarYReproducirSonidoLocal = async () => {
      const { sound } = await Audio.Sound.createAsync(
        require('../../assets/Gustavo.mp3')
      );
      sonidoLocalRef.current = sound;

      await sound.playAsync();
      setEstaPausado(false);
    };

    cargarYReproducirSonidoLocal();

    return () => {
      if (sonidoLocalRef.current) sonidoLocalRef.current.unloadAsync();
    };
  }, []);

  const reproducirSonidoLocal = async () => {
    if (sonidoLocalRef.current) {
      await sonidoLocalRef.current.replayAsync();
      setEstaPausado(false);
    }
  };

  const pausarOReanudarSonido = async () => {
    if (sonidoLocalRef.current) {
      const status = await sonidoLocalRef.current.getStatusAsync();
      if (status.isPlaying) {
        await sonidoLocalRef.current.pauseAsync();
        setEstaPausado(true);
      } else {
        await sonidoLocalRef.current.playAsync();
        setEstaPausado(false);
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.texto}>¡Bienvenido!</Text>

      <TouchableOpacity style={styles.BotonP} onPress={pausarOReanudarSonido}>
        <Text style={styles.BotonP}>
          {estaPausado ? '▶️' : '⏸️'}
        </Text>
      </TouchableOpacity>
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
  boton: {
    backgroundColor: '#000000',
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 10,
    marginBottom: 10,
  },
  BotonP: {
    backgroundColor: '#9b9b9b',
    paddingVertical: 1,
    paddingHorizontal: 5,
    borderRadius: 10,
    fontSize: 36,
  },

  texto: {
    fontSize: 50,
    fontWeight: 'bold',
    color: 'white',
    marginVertical: 30,
  },
});
