import React from 'react';
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../App';

type Props = {
  navigation: StackNavigationProp<RootStackParamList>;
  currentRoute?: string;
};

const BottomNavbar: React.FC<Props> = ({ navigation, currentRoute }) => {
  const isActive = (route: string) => currentRoute === route;

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.navigate('Home')} style={styles.tab}>
        <Icon
          name={isActive('Home') ? "home" : "home-outline"}
          size={24}
          color={isActive('Home') ? "#007aff" : "#444"}
        />
        <Text style={[styles.label, isActive('Home') && styles.activeLabel]}>Home</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Notifications')} style={styles.tab}>
        <Icon
          name={isActive('Notifications') ? "bell" : "bell-outline"}
          size={24}
          color={isActive('Notifications') ? "#007aff" : "#444"}
        />
        <Text style={[styles.label, isActive('Notifications') && styles.activeLabel]}>Notifications</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Settings')} style={styles.tab}>
        <Icon
          name={isActive('Settings') ? "cog" : "cog-outline"}
          size={24}
          color={isActive('Settings') ? "#007aff" : "#444"}
        />
        <Text style={[styles.label, isActive('Settings') && styles.activeLabel]}>Settings</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Profile')} style={styles.tab}>
        <Icon
          name={isActive('Profile') ? "account" : "account-outline"}
          size={24}
          color={isActive('Profile') ? "#007aff" : "#444"}
        />
        <Text style={[styles.label, isActive('Profile') && styles.activeLabel]}>Profile</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
  },
  tab: {
    alignItems: 'center',
  },
  label: {
    fontSize: 12,
    color: '#444',
    marginTop: 2,
  },
  activeLabel: {
    color: '#007aff',
  },
});

export default BottomNavbar;
