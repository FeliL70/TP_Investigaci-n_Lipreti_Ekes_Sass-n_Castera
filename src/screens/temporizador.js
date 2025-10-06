import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, Keyboard, Vibration } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';

export default function TemporizadorScreen() {
  const [tiempoRestante, setTiempoRestante] = useState(0);
  const [corriendo, setCorriendo] = useState(false);
  const [minutos, setMinutos] = useState('');
  const [segundos, setSegundos] = useState('');
  const [sound, setSound] = useState(null);

  const intervalRef = useRef(null);

  useEffect(() => {
    if (corriendo && tiempoRestante > 0) {
      intervalRef.current = setInterval(() => {
        setTiempoRestante((prev) => prev - 1);
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }

    // Cuando llega a 0, sonar y vibrar
    if (tiempoRestante === 0 && corriendo) {
      reproducirSonido();
      vibrarTelefono();
      setCorriendo(false);
    }

    return () => clearInterval(intervalRef.current);
  }, [corriendo, tiempoRestante]);

  const formatearTiempo = (segundos) => {
    const min = Math.floor(segundos / 60);
    const seg = segundos % 60;
    return `${min.toString().padStart(2, '0')}:${seg.toString().padStart(2, '0')}`;
  };

  async function reproducirSonido() {
    try {
      const { sound } = await Audio.Sound.createAsync({
        uri: 'https://actions.google.com/sounds/v1/alarms/alarm_clock.ogg',
      });
      setSound(sound);
      await sound.playAsync();
    } catch (error) {
      console.error('Error al reproducir sonido:', error);
    }
  }

  function vibrarTelefono() {
    
    Vibration.vibrate([20000]);
  }

  useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  const toggleTemporizador = () => {
    if (!corriendo) {
      if (tiempoRestante === 0) {
        const totalSegundos = parseInt(minutos || 0) * 60 + parseInt(segundos || 0);
        if (totalSegundos > 0) {
          setTiempoRestante(totalSegundos);
          setCorriendo(true);
          Keyboard.dismiss();
        }
      } else {
        setCorriendo(true);
      }
    } else {
      setCorriendo(false);
    }
  };

  const reiniciarTemporizador = () => {
    setCorriendo(false);
    setTiempoRestante(0);
    setMinutos('');
    setSegundos('');
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.titulo}>Temporizador</Text>

      <View style={styles.circulo}>
        <Text style={styles.tiempo}>{formatearTiempo(tiempoRestante)}</Text>
      </View>

      <Text style={styles.label}>Configurar tiempo:</Text>

      <View style={styles.inputRow}>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Min</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            placeholder="00"
            placeholderTextColor="#aaa"
            value={minutos}
            onChangeText={setMinutos}
            returnKeyType="done"
          />
        </View>

        <Text style={styles.dosPuntos}>:</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Seg</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            placeholder="00"
            placeholderTextColor="#aaa"
            value={segundos}
            onChangeText={setSegundos}
            returnKeyType="done"
          />
        </View>
      </View>

      <View style={styles.controles}>
        <TouchableOpacity onPress={toggleTemporizador}>
          <Ionicons name={corriendo ? "pause" : "play"} size={48} color="white" />
        </TouchableOpacity>

        <TouchableOpacity onPress={reiniciarTemporizador}>
          <Ionicons name="refresh" size={48} color="white" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#272727',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  titulo: {
    color: 'white',
    fontSize: 28,
    marginBottom: 30,
    fontWeight: 'bold',
  },
  circulo: {
    width: 250,
    height: 250,
    borderRadius: 125,
    borderWidth: 6,
    borderColor: '#C92828',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  tiempo: {
    fontSize: 48,
    textAlign: 'center',
    color: 'white',
    fontWeight: 'bold',
  },
  label: {
    color: 'white',
    fontSize: 18,
    marginBottom: 8,
    marginTop: 12,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  inputGroup: {
    alignItems: 'center',
  },
  inputLabel: {
    color: 'white',
    fontSize: 14,
    marginBottom: 4,
  },
  input: {
    width: 70,
    height: 40,
    borderColor: '#555',
    borderWidth: 1,
    borderRadius: 8,
    color: 'white',
    textAlign: 'center',
    fontSize: 18,
  },
  dosPuntos: {
    color: 'white',
    fontSize: 32,
    marginHorizontal: 10,
  },
  controles: {
    flexDirection: 'row',
    gap: 60,
    marginTop: 30,
  },
});
