import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';

export default function CronometroScreen() {
  const [tiempo, setTiempo] = useState(0);
  const [corriendo, setCorriendo] = useState(false);
  const [minutoAlarma, setMinutoAlarma] = useState('');
  const [sound, setSound] = useState(null);

  const intervalRef = useRef(null);

  
  useEffect(() => {
    if (corriendo) {
      intervalRef.current = setInterval(() => {
        setTiempo((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [corriendo]);

  
  useEffect(() => {
    if (minutoAlarma && tiempo === parseInt(minutoAlarma) * 60) {
      reproducirSonido();
    }
  }, [tiempo]);

  const formatearTiempo = (segundos) => {
    const min = Math.floor(segundos / 60);
    const seg = segundos % 60;
    return `${min}:${seg.toString().padStart(2, '0')}`;
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

  
  useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.titulo}>Cronómetro</Text>

      <View style={styles.circulo}>
        <Text style={styles.tiempo}>{formatearTiempo(tiempo)}</Text>
      </View>

      
      <Text style={styles.label}>Minuto de alarma:</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        placeholder="Ej: 5"
        placeholderTextColor="#aaa"
        value={minutoAlarma}
        onChangeText={setMinutoAlarma}
        blurOnSubmit={true}       
        returnKeyType="done"      
        onSubmitEditing={() => {}} 
      />

      <View style={styles.controles}>
        <TouchableOpacity onPress={() => setCorriendo(!corriendo)}>
          <Ionicons
            name={corriendo ? "pause" : "play"}
            size={48}
            color="white"
          />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => { setTiempo(0); setCorriendo(false); }}>
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
  input: {
    width: 100,
    height: 40,
    borderColor: '#555',
    borderWidth: 1,
    borderRadius: 8,
    color: 'white',
    textAlign: 'center',
    fontSize: 18,
    marginBottom: 20,
  },
  controles: {
    flexDirection: 'row',
    gap: 40,
    marginTop: 20,
  },
});
