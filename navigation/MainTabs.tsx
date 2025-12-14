// navigation/MainTabs.tsx
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MainTabParamList } from './types';
import HomeScreen from '../screens/HomeScreen';
import DiscoverScreen from '../screens/DiscoverScreen';
import PlansScreen from '../screens/PlansScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { Ionicons } from '@expo/vector-icons';
import { createStackNavigator } from '@react-navigation/stack';
import ConversationScreen from '../screens/ConversationScreen';
import CoffeeMatchScreen from '../screens/CoffeeMatchScreen';
import ReportAbuseScreen from '../screens/ReportAbuseScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();
const HomeStack = createStackNavigator();
const DiscoverStack = createStackNavigator();
const PlansStack = createStackNavigator();
const ProfileStack = createStackNavigator();

function HomeStackScreen() {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="Home" component={HomeScreen} />
      <HomeStack.Screen name="Conversation" component={ConversationScreen} />
      <HomeStack.Screen name="CoffeeMatch" component={CoffeeMatchScreen} />
    </HomeStack.Navigator>
  );
}

function DiscoverStackScreen() {
  return (
    <DiscoverStack.Navigator screenOptions={{ headerShown: false }}>
      <DiscoverStack.Screen name="Discover" component={DiscoverScreen} />
      <DiscoverStack.Screen name="CoffeeMatch" component={CoffeeMatchScreen} />
    </DiscoverStack.Navigator>
  );
}

function PlansStackScreen() {
  return (
    <PlansStack.Navigator screenOptions={{ headerShown: false }}>
      <PlansStack.Screen name="Plans" component={PlansScreen} />
      <PlansStack.Screen name="Conversation" component={ConversationScreen} />
    </PlansStack.Navigator>
  );
}

function ProfileStackScreen() {
  return (
    <ProfileStack.Navigator screenOptions={{ headerShown: false }}>
      <ProfileStack.Screen name="Profile" component={ProfileScreen} />
      <ProfileStack.Screen name="ReportAbuse" component={ReportAbuseScreen} />
    </ProfileStack.Navigator>
  );
}

export default function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home';

          switch (route.name) {
            case 'Home':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'Discover':
              iconName = focused ? 'compass' : 'compass-outline';
              break;
            case 'Plans':
              iconName = focused ? 'calendar' : 'calendar-outline';
              break;
            case 'Profile':
              iconName = focused ? 'person' : 'person-outline';
              break;
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#FF9500',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          borderTopWidth: 0,
          elevation: 0,
          height: 60,
          paddingBottom: 5,
          backgroundColor: '#fff',
        },
        tabBarLabelStyle: {
          fontSize: 12,
          marginBottom: 5,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeStackScreen} />
      <Tab.Screen name="Discover" component={DiscoverStackScreen} />
      <Tab.Screen 
        name="Plans" 
        component={PlansStackScreen}
        options={{
          tabBarLabel: 'Plans',
          tabBarBadge: 3, // Example badge
        }}
      />
      <Tab.Screen name="Profile" component={ProfileStackScreen} />
    </Tab.Navigator>
  );
}