import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput, FlatList, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useState, useEffect } from 'react';
import { Calendar } from 'react-native-calendars';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Notifications from 'expo-notifications';

export default function CalendarioScreen() {
  const navigation = useNavigation();
  const [fechaSeleccionada, setFechaSeleccionada] = useState(new Date());
  const [eventos, setEventos] = useState({});
  const [modalVisible, setModalVisible] = useState(false);
  const [nuevoEvento, setNuevoEvento] = useState('');
  const [horaEvento, setHoraEvento] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);

  useEffect(() => {
    const requestPermissions = async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        alert('Permisos de notificaciones denegados');
      }
    };
    requestPermissions();
  }, []);

  useEffect(() => {
    const subscription = Notifications.addNotificationReceivedListener(notification => {
      const { title, body } = notification.request.content;
      Alert.alert(title, body);
    });
    return () => subscription.remove();
  }, []);

  const agregarEvento = () => {
    if (nuevoEvento.trim()) {
      const fechaKey = fechaSeleccionada.toISOString().slice(0, 10);
      const timeString = horaEvento.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setEventos(prev => {
        const updatedEventos = {
          ...prev,
          [fechaKey]: [...(prev[fechaKey] || []), { title: nuevoEvento, time: timeString }]
        };
        scheduleNotification(fechaKey, nuevoEvento, horaEvento);
        return updatedEventos;
      });
      setNuevoEvento('');
      setHoraEvento(new Date());
      setModalVisible(false);
    }
  };

  const scheduleNotification = async (dateKey, title, time) => {
    const [hour, minute] = time.getHours ? [time.getHours(), time.getMinutes()] : [horaEvento.getHours(), horaEvento.getMinutes()];
    const [year, month, day] = dateKey.split('-').map(Number);
    const notificationDate = new Date(year, month - 1, day, hour, minute, 0);

    const now = new Date();
    if (notificationDate > now) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Evento: " + title,
          body: `Es hora de tu evento programado a las ${time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
          sound: true,
        },
        trigger: notificationDate,
      });
    }
  };

  const getMarkedDates = () => {
    const marked = {};
    Object.keys(eventos).forEach(date => {
      marked[date] = { marked: true, dotColor: 'red' };
    });
    const selectedKey = fechaSeleccionada.toISOString().slice(0, 10);
    marked[selectedKey] = { ...marked[selectedKey], selected: true, selectedColor: '#00adf5' };
    return marked;
  };

  return (
    <View style={{ backgroundColor: '#272727', flex: 1 }}>
      <View style={styles.calendarioScreen}>
        <Calendar
          style={styles.calendario}
          theme={{
            calendarBackground: '#272727',
            dayTextColor: 'white',
            monthTextColor: 'white',
            arrowColor: 'white',
            selectedDayBackgroundColor: '#00adf5',
            selectedDayTextColor: '#ffffff',
            todayTextColor: '#00adf5',
          }}
          onDayPress={(day) => {
            const nuevaFecha = new Date(day.dateString);
            setFechaSeleccionada(nuevaFecha);
          }}
          markedDates={getMarkedDates()}
        />

        <Text style={styles.text}>
          Fecha seleccionada: {fechaSeleccionada.toDateString()}
        </Text>

        <TouchableOpacity style={styles.button} onPress={() => setModalVisible(true)}>
          <Text style={styles.buttonText}>Agregar Evento</Text>
        </TouchableOpacity>

        <Modal visible={modalVisible} animationType="slide" transparent={true}>
  <View style={styles.modalContainer}>
    <View style={styles.modalContent}>
      <Text style={styles.modalTitle}>Nuevo Evento</Text>

      <TextInput
        style={styles.input}
        placeholder="Título del evento"
        placeholderTextColor="#aaa"
        value={nuevoEvento}
        onChangeText={setNuevoEvento}
      />

      {/* 🔹 Botón para seleccionar la hora */}
      <TouchableOpacity
        style={styles.timeButton}
        onPress={() => setShowTimePicker(true)}
      >
        <Text style={styles.timeButtonText}>
          {horaEvento.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </TouchableOpacity>

      {showTimePicker && (
        <DateTimePicker
          value={horaEvento}
          mode="time"
          is24Hour={true}
          display="default"
          onChange={(event, selectedDate) => {
            setShowTimePicker(false);
            if (selectedDate) {
              setHoraEvento(selectedDate);
            }
          }}
        />
      )}

      <View style={styles.modalButtons}>
        <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
          <Text style={styles.buttonText}>Cancelar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.saveButton} onPress={agregarEvento}>
          <Text style={styles.buttonText}>Guardar</Text>
        </TouchableOpacity>
      </View>
    </View>
  </View>
</Modal>

        <Text style={styles.text}>Eventos:</Text>
        <FlatList
          data={eventos[fechaSeleccionada.toISOString().slice(0, 10)] || []}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => <Text style={styles.eventText}>{item.title} - {item.time}</Text>}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  calendarioScreen: {
    flex: 1,
    justifyContent: 'flex-start',
    alignContent: 'center',
    paddingHorizontal: 15,
  },
  calendario: {
    marginTop: 70,
  },
  text: {
    color: 'white',
    fontSize: 22,
    marginVertical: 10,
    textAlign: 'left',
    paddingHorizontal: 15,
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#00adf5',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#272727',
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  modalTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
    color: 'white',
    backgroundColor: '#333',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    backgroundColor: '#666',
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginRight: 5,
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: '#00adf5',
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginLeft: 5,
    alignItems: 'center',
  },
  eventText: {
    color: 'white',
    fontSize: 16,
    marginBottom: 5,
    paddingHorizontal: 15,
  },
  timeButton: {
    padding: 12,
    marginBottom: 10,
    borderRadius: 5,
    backgroundColor: '#333',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
  },
  timeButtonText: {
    color: 'white',
    fontSize: 18,
  },
});
