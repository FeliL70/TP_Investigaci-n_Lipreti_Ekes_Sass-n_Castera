import { createNativeStackNavigator } from '@react-navigation/native-stack';
import calendarioScreen from '../screens/calendarioScreen';

const StackC = createNativeStackNavigator();

export default function StackCNavigator() {

  return (
    <StackC.Navigator screenOptions={{ headerShown: false}}>
      <StackC.Screen name="Calendario" component={calendarioScreen} />
    </StackC.Navigator>
  );
}