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

  const intervalRef = useRef(null);
  const soundRef = useRef(null); // mantiene el sonido pre-cargado
  const audioUri = 'https://actions.google.com/sounds/v1/alarms/alarm_clock.ogg';

  // Pre-cargar el sonido cuando monta el componente
  useEffect(() => {
    let mounted = true;

    async function loadSound() {
      try {
        const { sound } = await Audio.Sound.createAsync(
          { uri: audioUri },
          { shouldPlay: false, staysActiveInBackground: true } // no reproducir aún
        );
        if (mounted) {
          soundRef.current = sound;
        } else {
          // si ya se desmontó, descargar
          await sound.unloadAsync();
        }
      } catch (err) {
        console.warn('No se pudo pre-cargar sonido:', err);
        soundRef.current = null;
      }
    }

    loadSound();

    return () => {
      mounted = false;
      // cleanup: descargar si existe
      if (soundRef.current) {
        soundRef.current.unloadAsync().catch(() => {});
      }
    };
  }, []);

  // Intervalo del temporizador
  useEffect(() => {
    if (corriendo && tiempoRestante > 0) {
      intervalRef.current = setInterval(() => {
        setTiempoRestante((prev) => prev - 1);
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }

    if (tiempoRestante === 0 && corriendo) {
      // Cuando llega a 0: ejecutar sonido y vibración simultáneamente
      activarAlarmaSimultanea();
      setCorriendo(false);
    }

    return () => clearInterval(intervalRef.current);
  }, [corriendo, tiempoRestante]);

  const formatearTiempo = (seg) => {
    const min = Math.floor(seg / 60);
    const s = seg % 60;
    return `${min.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Alarma simultánea: reproducir sonido ya cargado y vibrar sin await
  const activarAlarmaSimultanea = () => {
    // vibración (patrón intermitente). En Android el patrón funciona bien.
    const pattern = [500, 500, 500, 500, 500]; // ~2.5s intermitente
    Vibration.vibrate(pattern);

    // reproducir sonido ya precargado sin await para que empiece inmediatamente
    if (soundRef.current) {
      // replayAsync reinicia y reproduce
      soundRef.current
        .replayAsync()
        .catch(async (err) => {
          // si falla (ej: sound fue descargado), intentamos cargar rápido y reproducir
          console.warn('Error al reproducir precargado, intento cargar y reproducir:', err);
          try {
            const { sound } = await Audio.Sound.createAsync({ uri: audioUri }, { shouldPlay: true });
            // reemplazamos la referencia por el nuevo y lo dejamos para limpieza
            if (soundRef.current) {
              // descargar viejo si existe
              soundRef.current.unloadAsync().catch(() => {});
            }
            soundRef.current = sound;
          } catch (e) {
            console.error('No se pudo reproducir el sonido de alarma:', e);
          }
        });
    } else {
      // fallback: si no está precargado, intentar crear y reproducir (esto puede demorar)
      Audio.Sound.createAsync({ uri: audioUri }, { shouldPlay: true })
        .then(({ sound }) => {
          // guardamos para próximos usos
          if (soundRef.current) {
            soundRef.current.unloadAsync().catch(() => {});
          }
          soundRef.current = sound;
        })
        .catch((e) => {
          console.error('Fallo al cargar sonido en fallback:', e);
        });
    }
  };

  const toggleTemporizador = () => {
    if (!corriendo) {
      if (tiempoRestante === 0) {
        const totalSegundos = parseInt(minutos || '0', 10) * 60 + parseInt(segundos || '0', 10);
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
    // detener sonido si está sonando
    if (soundRef.current) {
      soundRef.current.stopAsync().catch(() => {});
    }
    // cancelar vibración en Android/iOS
    Vibration.cancel();
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
          <Ionicons name={corriendo ? 'pause' : 'play'} size={48} color="white" />
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