import { View, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import { Calendar } from 'react-native-calendars';

export default function CalendarioScreen() {
  const navigation = useNavigation();
  const [fechaSeleccionada, setFechaSeleccionada] = useState(new Date());

  return (
    <View style={{ backgroundColor: '#272727', flex: 1 }}>
      <View style={styles.calendarioScreen}>
        <View style={{ height: 23 }} />

        <Calendar
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
          markedDates={{
            [fechaSeleccionada.toISOString().slice(0, 10)]: {
              selected: true,
              marked: true,
              selectedColor: '#00adf5',
            },
          }}
        />

        <View style={{ height: 46 }} />
        <Text style={styles.text}>
          Fecha seleccionada: {fechaSeleccionada.toDateString()}
        </Text>
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
  text: {
    color: 'white',
    fontSize: 22,
    marginBottom: 10,
    textAlign: 'left',
    paddingHorizontal: 15,
    fontWeight: 'bold',
  },
});