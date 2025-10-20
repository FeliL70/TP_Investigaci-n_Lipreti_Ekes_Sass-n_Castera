import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput, FlatList, Alert, Platform } from 'react-native';
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
  const [tempTime, setTempTime] = useState(new Date());

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

  const abrirModal = () => {
    setNuevoEvento('');
    setHoraEvento(new Date());
    setModalVisible(true);
  };

  const cerrarModal = () => {
    setModalVisible(false);
    setShowTimePicker(false);
  };

  const abrirSelectorHora = () => {
    setTempTime(horaEvento);
    setShowTimePicker(true);
  };

  const aceptarHora = () => {
    setHoraEvento(tempTime);
    setShowTimePicker(false);
  };

  const agregarEvento = () => {
    if (!nuevoEvento.trim()) {
      Alert.alert('Error', 'Escribí un título para el evento.');
      return;
    }

    const fechaKey = fechaSeleccionada.toISOString().slice(0, 10);
    const timeString = horaEvento.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setEventos(prev => ({
      ...prev,
      [fechaKey]: [...(prev[fechaKey] || []), { title: nuevoEvento, time: timeString }],
    }));

    scheduleNotification(fechaKey, nuevoEvento, horaEvento);
    setNuevoEvento('');
    setHoraEvento(new Date());
    setModalVisible(false);
  };

  const scheduleNotification = async (dateKey, title, time) => {
    const hour = time.getHours();
    const minute = time.getMinutes();
    const [year, month, day] = dateKey.split('-').map(Number);
    const notificationDate = new Date(year, month - 1, day, hour, minute, 0);

    if (notificationDate > new Date()) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Evento: " + title,
          body: `Es hora de tu evento a las ${time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
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

        <TouchableOpacity style={styles.button} onPress={abrirModal}>
          <Text style={styles.buttonText}>Agregar Evento</Text>
        </TouchableOpacity>

        <Modal visible={modalVisible} animationType="slide" transparent={true} onRequestClose={cerrarModal}>
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

              <View style={{ alignItems: 'center', marginTop: 10 }}>
                <TouchableOpacity style={styles.circleTimeButton} onPress={abrirSelectorHora}>
                  <Text style={styles.circleTimeText}>
                    {horaEvento.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </TouchableOpacity>
                <Text style={styles.horaLabel}>Tocar el círculo para elegir hora</Text>
              </View>

              <View style={styles.modalButtons}>
                <TouchableOpacity style={styles.cancelButton} onPress={cerrarModal}>
                  <Text style={styles.buttonText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.saveButton} onPress={agregarEvento}>
                  <Text style={styles.buttonText}>Guardar</Text>
                </TouchableOpacity>
              </View>

              {showTimePicker && (
                <View style={styles.timePickerOverlay}>
                  <View style={styles.timePickerContainer}>
                    <DateTimePicker
                      value={tempTime}
                      mode="time"
                      is24Hour={true}
                      display={Platform.OS === 'ios' ? 'spinner' : 'clock'}
                      onChange={(event, selectedDate) => {
                        if (selectedDate) setTempTime(selectedDate);
                      }}
                    />

                    <View style={styles.timePickerButtons}>
                      <TouchableOpacity style={styles.tpButton} onPress={() => setShowTimePicker(false)}>
                        <Text style={styles.tpButtonText}>Cancelar</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.tpButton} onPress={aceptarHora}>
                        <Text style={styles.tpButtonText}>Aceptar</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              )}

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
    width: '90%',
    maxWidth: 420,
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
    borderColor: '#444',
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
    color: 'white',
    backgroundColor: '#202020',
  },
  circleTimeButton: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#333',
    borderWidth: 2,
    borderColor: '#00adf5',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
  },
  circleTimeText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  horaLabel: {
    color: '#bbb',
    marginTop: 6,
    fontSize: 13,
  },
  horaSeleccionada: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 5,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  cancelButton: {
    backgroundColor: '#666',
    padding: 10,
    borderRadius: 6,
    flex: 1,
    marginRight: 6,
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: '#00adf5',
    padding: 10,
    borderRadius: 6,
    flex: 1,
    marginLeft: 6,
    alignItems: 'center',
  },
  eventText: {
    color: 'white',
    fontSize: 16,
    marginBottom: 5,
    paddingHorizontal: 15,
  },
  timePickerOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  timePickerContainer: {
    width: '85%',
    backgroundColor: '#272727',
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
  },
  timePickerButtons: {
    flexDirection: 'row',
    marginTop: 8,
    width: '100%',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  tpButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    backgroundColor: '#00adf5',
  },
  tpButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});