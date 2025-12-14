// navigation/AppNavigator.tsx
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import AuthScreen from '../screens/AuthScreen';
import MainTabs from './MainTabs';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Auth" component={AuthScreen} />
      <Stack.Screen name="Main" component={MainTabs} />
    </Stack.Navigator>
  );
}