import React, { useState, useEffect, useRef } from 'react';
import {View,Text,TouchableOpacity,StyleSheet,TextInput,Keyboard,Vibration,KeyboardAvoidingView,Platform,ScrollView,Animated,Easing,} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import Svg, { Circle } from 'react-native-svg';

export default function TemporizadorScreen() {
  const [tiempoRestante, setTiempoRestante] = useState(0);
  const [corriendo, setCorriendo] = useState(false);
  const [minutos, setMinutos] = useState('');
  const [segundos, setSegundos] = useState('');
  const [tiempoInicial, setTiempoInicial] = useState(0);

  const intervalRef = useRef(null);
  const soundRef = useRef(null);
  const audioUri = 'https://actions.google.com/sounds/v1/alarms/alarm_clock.ogg';

  const radius = 120;
  const circumference = 2 * Math.PI * radius;

  const animProgress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let mounted = true;

    async function loadSound() {
      try {
        const { sound } = await Audio.Sound.createAsync(
          { uri: audioUri },
          { shouldPlay: false, staysActiveInBackground: true }
        );
        if (mounted) soundRef.current = sound;
        else await sound.unloadAsync();
      } catch (err) {
        console.warn('No se pudo pre-cargar sonido:', err);
        soundRef.current = null;
      }
    }

    loadSound();

    return () => {
      mounted = false;
      if (soundRef.current) soundRef.current.unloadAsync().catch(() => {});
    };
  }, []);

  useEffect(() => {
    if (corriendo && tiempoRestante > 0) {
      intervalRef.current = setInterval(() => {
        setTiempoRestante((prev) => prev - 1);
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }

    if (tiempoRestante === 0 && corriendo) {
      activarAlarmaSimultanea();
      setCorriendo(false);
    }

    return () => clearInterval(intervalRef.current);
  }, [corriendo, tiempoRestante]);

  useEffect(() => {
    if (corriendo && tiempoInicial > 0) {
      Animated.timing(animProgress, {
        toValue: 1,
        duration: tiempoRestante * 1000,
        easing: Easing.linear,
        useNativeDriver: false,
      }).start();
    } else {
      animProgress.stopAnimation();
    }
  }, [corriendo, tiempoRestante]);

  const formatearTiempo = (seg) => {
    const min = Math.floor(seg / 60);
    const s = seg % 60;
    return `${min.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const activarAlarmaSimultanea = () => {
    const pattern = [500, 500, 500, 500, 500];
    Vibration.vibrate(pattern);

    if (soundRef.current) {
      soundRef.current
        .replayAsync()
        .catch(async (err) => {
          console.warn('Error al reproducir precargado:', err);
          try {
            const { sound } = await Audio.Sound.createAsync({ uri: audioUri }, { shouldPlay: true });
            if (soundRef.current) soundRef.current.unloadAsync().catch(() => {});
            soundRef.current = sound;
          } catch (e) {
            console.error('No se pudo reproducir el sonido:', e);
          }
        });
    } else {
      Audio.Sound.createAsync({ uri: audioUri }, { shouldPlay: true })
        .then(({ sound }) => {
          if (soundRef.current) soundRef.current.unloadAsync().catch(() => {});
          soundRef.current = sound;
        })
        .catch((e) => console.error('Fallo al cargar sonido en fallback:', e));
    }
  };

  const toggleTemporizador = () => {
    if (!corriendo) {
      if (tiempoRestante === 0) {
        const totalSegundos = parseInt(minutos || '0', 10) * 60 + parseInt(segundos || '0', 10);
        if (totalSegundos > 0) {
          setTiempoRestante(totalSegundos);
          setTiempoInicial(totalSegundos);
          setCorriendo(true);
          animProgress.setValue(0);
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
    setTiempoInicial(0);
    setMinutos('');
    setSegundos('');
    animProgress.setValue(0);
    if (soundRef.current) soundRef.current.stopAsync().catch(() => {});
    Vibration.cancel();
  };

  const handleMinutosChange = (text) => {
    let value = text.replace(/[^0-9]/g, '');
    setMinutos(value);
  };

  const handleSegundosChange = (text) => {
    let value = text.replace(/[^0-9]/g, '');
    if (value === '') {
      setSegundos('');
      return;
    }
    const num = Math.min(parseInt(value, 10), 59);
    setSegundos(num.toString());
  };

  const animatedStroke = animProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [circumference, 0],
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <Text style={styles.titulo}>Temporizador</Text>

          <View style={styles.circuloContainer}>
            <Svg height="250" width="250">
            
              <Circle stroke="#fff" fill="none" cx="125" cy="125" r={radius} strokeWidth="10" />
              
              
              <AnimatedCircle
                stroke="#C92828"
                fill="none"
                cx="125"
                cy="125"
                r={radius}
                strokeWidth="10"
                strokeDasharray={circumference}
                strokeDashoffset={animatedStroke}
                strokeLinecap="round"
                rotation="90"  
                scaleX={-1}     
                origin="125,125"
              />
            </Svg>

            <View style={styles.textoCentrado}>
              <Text style={styles.tiempo}>{formatearTiempo(tiempoRestante)}</Text>
            </View>
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
                onChangeText={handleMinutosChange}
                returnKeyType="done"
                maxLength={5}
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
                onChangeText={handleSegundosChange}
                returnKeyType="done"
                maxLength={2}
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
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#272727' },
  scrollContent: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  titulo: { color: 'white', fontSize: 28, marginBottom: 30, fontWeight: 'bold' },
  circuloContainer: { position: 'relative', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  textoCentrado: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
  tiempo: { fontSize: 48, textAlign: 'center', color: 'white', fontWeight: 'bold' },
  label: { color: 'white', fontSize: 18, marginBottom: 8, marginTop: 12 },
  inputRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  inputGroup: { alignItems: 'center' },
  inputLabel: { color: 'white', fontSize: 14, marginBottom: 4 },
  input: { width: 70, height: 40, borderColor: '#555',  borderWidth: 1, borderRadius: 8, color: 'white', textAlign: 'center', fontSize: 18,},
  dosPuntos: { color: 'white', fontSize: 32, marginHorizontal: 10 },
  controles: { flexDirection: 'row', gap: 60, marginTop: 30 },
});
