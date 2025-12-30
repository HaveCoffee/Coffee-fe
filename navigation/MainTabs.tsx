// navigation/MainTabs.tsx
import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import CoffeeMatchScreen from '../screens/CoffeeMatchScreen';
import ConversationScreen from '../screens/ConversationScreen';
import DiscoverScreen from '../screens/DiscoverScreen';
import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ReportAbuseScreen from '../screens/ReportAbuseScreen';
import { MainTabParamList, HomeStackParamList, ChatStackParamList, DiscoverStackParamList } from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();
const HomeStack = createStackNavigator<HomeStackParamList>();
const DiscoverStack = createStackNavigator<DiscoverStackParamList>();
const ChatStack = createStackNavigator<ChatStackParamList>();
const ProfileStack = createStackNavigator();

function HomeStackScreen() {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="Home" component={HomeScreen} />
      <HomeStack.Screen name="CoffeeMatch" component={CoffeeMatchScreen} />
    </HomeStack.Navigator>
  );
}

function ChatStackScreen() {
  return (
    <ChatStack.Navigator screenOptions={{ headerShown: false }}>
      <ChatStack.Screen name="Conversation" component={ConversationScreen} />
      <ChatStack.Screen name="CoffeeMatch" component={CoffeeMatchScreen} />
    </ChatStack.Navigator>
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
            case 'Chat':
              iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
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
        tabBarHideOnKeyboard: true,
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeStackScreen} 
        options={{ title: 'Home' }}
      />
      <Tab.Screen 
        name="Discover" 
        component={DiscoverStackScreen} 
        options={{ title: 'Discover' }}
      />
      <Tab.Screen 
        name="Chat" 
        component={ChatStackScreen} 
        options={{ 
          title: 'Chat',
          tabBarLabel: 'Chat',
        }}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            e.preventDefault();
            navigation.navigate('Chat', { 
              screen: 'Conversation',
              params: { id: 'new' } // Default to new conversation
            });
          },
        })}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileStackScreen} 
        options={{ title: 'Profile' }}
      />
    </Tab.Navigator>
  );
}