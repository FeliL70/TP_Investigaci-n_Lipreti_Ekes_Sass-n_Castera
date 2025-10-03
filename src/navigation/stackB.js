import { createNativeStackNavigator } from '@react-navigation/native-stack';
import screenInicial from '../screens/screenInicial';

const StackB = createNativeStackNavigator();

export default function StackBNavigator() {

  return (
    <StackB.Navigator screenOptions={{ headerShown: false}}>
      <StackB.Screen name="primer screen" component={screenInicial} />
    </StackB.Navigator>
  );
}