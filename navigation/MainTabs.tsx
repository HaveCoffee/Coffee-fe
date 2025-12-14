// navigation/MainTabs.tsx
import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StyleSheet } from 'react-native';
import DiscoverScreen from '../screens/DiscoverScreen';
import HomeScreen from '../screens/HomeScreen';
import PlansScreen from '../screens/PlansScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { MainTabParamList } from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();

export default function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: '#FF9500',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          borderTopWidth: 0,
          elevation: 0,
          height: 60,
          paddingBottom: 5,
        },
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
          tabBarLabel: 'Home',
        }}
      />
      <Tab.Screen 
        name="Discover" 
        component={DiscoverScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="compass-outline" size={size} color={color} />
          ),
          tabBarLabel: 'Discover',
        }}
      />
      <Tab.Screen 
        name="Plans" 
        component={PlansScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar-outline" size={size} color={color} />
          ),
          tabBarLabel: 'Plans',
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
          tabBarLabel: 'Profile',
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  micButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FF9500',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});