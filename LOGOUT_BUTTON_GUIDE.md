# Logout Button Locations

## ✅ Logout Button Added Successfully

### Location 1: Profile Screen (Bottom of page)
**File**: `screens/ProfileScreen.tsx` (Line 243-268)
**How to access**:
1. Go to Profile tab (bottom navigation)
2. Scroll to the very bottom
3. You'll see a red "Logout" button with an icon

**Code Added**:
```tsx
<TouchableOpacity
  style={styles.logoutButton}
  onPress={() => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/(auth)');
          },
        },
      ]
    );
  }}
>
  <Ionicons name="log-out-outline" size={20} color="#E53935" />
  <Text style={styles.logoutText}>Logout</Text>
</TouchableOpacity>
```

### Location 2: Home Screen Menu
**File**: `screens/HomeScreen.tsx` (Line 258-283)
**How to access**:
1. Go to Messages/Home tab
2. Tap the three dots (⋮) in top right corner
3. Select "Logout" from menu

## 🔄 How to See the Changes

If you don't see the logout button, try:

1. **Reload the app**: Shake device → "Reload"
2. **Clear cache**: `npx expo start -c`
3. **Restart Metro**: Stop and restart `npx expo start`

## 🎨 Button Styling

The logout button has:
- Red border (#E53935)
- Red text and icon
- Centered layout
- Confirmation dialog before logout

## ✅ What Happens on Logout

1. Shows confirmation dialog
2. Clears JWT token from SecureStore
3. Clears user data
4. Redirects to login screen
