import { createNativeStackNavigator } from '@react-navigation/native-stack';
import temporizador from '../screens/temporizador';

const StackB = createNativeStackNavigator();

export default function StackBNavigator() {

  return (
    <StackB.Navigator screenOptions={{ headerShown: false}}>
      <StackB.Screen name="temporizador" component={temporizador} />
    </StackB.Navigator>
  );
}