// navigation/AppNavigator.tsx
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import AuthScreen from '../screens/AuthScreen';
import MainTabs from './MainTabs';
import ConversationScreen from '../screens/ConversationScreen';
import CoffeeMatchScreen from '../screens/CoffeeMatchScreen';
import ReportAbuseScreen from '../screens/ReportAbuseScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Auth" component={AuthScreen} />
      <Stack.Screen name="Main" component={MainTabs} />
      <Stack.Screen name="Conversation" component={ConversationScreen} />
      <Stack.Screen name="CoffeeMatch" component={CoffeeMatchScreen} />
      <Stack.Screen name="ReportAbuse" component={ReportAbuseScreen} />
    </Stack.Navigator>
  );
}