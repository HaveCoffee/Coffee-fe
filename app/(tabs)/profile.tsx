import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useAuth } from '../../context/AuthContext';

export default function ProfileScreen() {
  const { user, logout } = useAuth();

  return (
    <View style={styles.container}>
      <View style={styles.profileHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </Text>
        </View>
        <Text style={styles.userName}>{user?.name || 'User'}</Text>
        <Text style={styles.userEmail}>{user?.email || 'user@example.com'}</Text>
      </View>
      
      <View style={styles.menuContainer}>
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuText}>Edit Profile</Text>
          <Ionicons name="chevron-forward" size={20} color="#6C6C6C" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuText}>Settings</Text>
          <Ionicons name="chevron-forward" size={20} color="#6C6C6C" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.menuItem, styles.logoutButton]}
          onPress={logout}
        >
          <Text style={[styles.menuText, styles.logoutText]}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  profileHeader: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#7C4DFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 40,
    fontWeight: 'bold',
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1E1E1E',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: '#6C6C6C',
  },
  menuContainer: {
    marginTop: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  menuText: {
    fontSize: 16,
    color: '#1E1E1E',
  },
  logoutButton: {
    marginTop: 8,
    justifyContent: 'center',
  },
  logoutText: {
    color: '#FF3B30',
  },
});