import { Ionicons } from '@expo/vector-icons';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

export default function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const router = useRouter();

  return (
    <View style={styles.tabBar}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label = options.tabBarLabel !== undefined
          ? options.tabBarLabel
          : options.title !== undefined
          ? options.title
          : route.name;

        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: 'tabLongPress',
            target: route.key,
          });
        };

        // Special handling for microphone button (middle tab)
        if (route.name === 'Voice') {
          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarTestID}
              onPress={() => {
                // Navigate to voice/Ella chat
                router.push('/ella-chat');
              }}
              style={styles.micButton}
            >
              <Ionicons name="mic" size={28} color="white" />
            </TouchableOpacity>
          );
        }

        let iconName: keyof typeof Ionicons.glyphMap = 'home-outline';
        switch (route.name) {
          case 'index':
          case 'Home':
            iconName = isFocused ? 'home' : 'home-outline';
            break;
          case 'Discover':
            iconName = isFocused ? 'compass' : 'compass-outline';
            break;
          case 'Plans':
            iconName = isFocused ? 'calendar' : 'calendar-outline';
            break;
          case 'Profile':
          case 'profile':
            iconName = isFocused ? 'person' : 'person-outline';
            break;
        }

        return (
          <TouchableOpacity
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarTestID}
            onPress={onPress}
            onLongPress={onLongPress}
            style={styles.tabItem}
          >
            <Ionicons 
              name={iconName} 
              size={24} 
              color={isFocused ? '#FF9500' : 'gray'} 
            />
            <View style={[styles.tabLabel, isFocused && styles.tabLabelActive]}>
              {typeof label === 'string' && (
                <View style={styles.labelContainer}>
                  <View style={styles.labelTextContainer}>
                    <View style={[styles.labelBackground, isFocused && styles.labelBackgroundActive]} />
                    <View style={styles.labelTextWrapper}>
                      <View style={[styles.labelText, isFocused && styles.labelTextActive]}>
                        {label}
                      </View>
                    </View>
                  </View>
                </View>
              )}
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    height: 60,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingBottom: 5,
    paddingTop: 5,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  micButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FF9500',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -30,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  tabLabel: {
    marginTop: 4,
  },
  tabLabelActive: {
    // Active state styling
  },
  labelContainer: {
    alignItems: 'center',
  },
  labelTextContainer: {
    position: 'relative',
  },
  labelBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  labelBackgroundActive: {
    // Active background styling
  },
  labelTextWrapper: {
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  labelText: {
    fontSize: 12,
    color: 'gray',
  },
  labelTextActive: {
    color: '#FF9500',
    fontWeight: '600',
  },
});
