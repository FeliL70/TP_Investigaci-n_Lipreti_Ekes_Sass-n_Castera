import { Image } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import StackANavigator from './stackA';
import StackBNavigator from './stackB';
import StackCNavigator from './stackC';

import { Ionicons } from '@expo/vector-icons';
import logoTab from '../../assets/logoTab.png';

const Tab = createBottomTabNavigator();

export default function MyTabs() {
  return (
    <Tab.Navigator 
         initialRouteName="primer screen"
    screenOptions={{ headerShown: false}}>

<Tab.Screen 
        name="Calendario" 
        component={StackCNavigator}
        options={{
          tabBarIcon: () => (
            <Ionicons name="calendar" size={24} color={"black"} />
          ),
        }}
      />

      <Tab.Screen 
        name="Temporizador" 
        component={StackANavigator}
        options={{
          tabBarIcon: () => (
            <Ionicons name="stopwatch-outline" size={28} color={"black"} />
          ),
        }}
      />

      <Tab.Screen name="primer screen" component={StackBNavigator}
      options={{
        tabBarIcon: () => (
            <Image
    source={logoTab}
    style={{ width: 24, height: 24 }}
    resizeMode="contain"
  />
        ),
      }} />

    </Tab.Navigator>
  );
}