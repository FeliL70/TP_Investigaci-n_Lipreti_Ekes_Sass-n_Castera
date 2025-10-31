import { createNativeStackNavigator } from '@react-navigation/native-stack';
import temporizador from '../screens/temporizador';

const StackA = createNativeStackNavigator();

export default function StackANavigator() {

  return (
    <StackA.Navigator screenOptions={{ headerShown: false}}>
      <StackA.Screen name="temporizador" component={temporizador} />
    </StackA.Navigator>
  );
}