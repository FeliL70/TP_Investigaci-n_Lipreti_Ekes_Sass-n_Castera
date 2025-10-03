import { createNativeStackNavigator } from '@react-navigation/native-stack';
import cronometro from '../screens/cronometro';

const StackB = createNativeStackNavigator();

export default function StackBNavigator() {

  return (
    <StackB.Navigator screenOptions={{ headerShown: false}}>
      <StackB.Screen name="cronometro" component={cronometro} />
    </StackB.Navigator>
  );
}