import React from 'react';
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../App';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing } from '../ui/theme';

type Props = {
  navigation?: StackNavigationProp<RootStackParamList>;
  currentRoute?: string;
};

const BottomNavbar: React.FC<Props> = ({ currentRoute }) => {
  // Get the navigation object directly from useNavigation hook
  // This ensures we always have the most up-to-date navigation context
  const navigation = useNavigation();

  const isActive = (route: string) => currentRoute === route;

  // Use the most direct approach possible for navigation
  const handleNavigation = (screenName: string) => {
    try {
      // @ts-ignore - This is a workaround for TypeScript strict checking
      navigation.navigate(screenName);
    } catch (error) {
      console.error(`Navigation error to ${screenName}:`, error);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => handleNavigation('Home')} style={styles.tab}>
        <Icon
          name={isActive('Home') ? "home" : "home-outline"}
          size={24}
          color={isActive('Home') ? colors.primary : colors.textMuted}
        />
        <Text style={[styles.label, isActive('Home') && styles.activeLabel]}>Home</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => handleNavigation('Notifications')} style={styles.tab}>
        <Icon
          name={isActive('Notifications') ? "bell" : "bell-outline"}
          size={24}
          color={isActive('Notifications') ? colors.primary : colors.textMuted}
        />
        <Text style={[styles.label, isActive('Notifications') && styles.activeLabel]}>Notifications</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => handleNavigation('HelpDesk')} style={styles.tab}>
        <Icon
          name={isActive('HelpDesk') ? "folder" : "folder-outline"}
          size={24}
          color={isActive('HelpDesk') ? colors.primary : colors.textMuted}
        />
        <Text style={[styles.label, isActive('HelpDesk') && styles.activeLabel]}>Resources</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => handleNavigation('Settings')} style={styles.tab}>
        <Icon
          name={isActive('Settings') ? "cog" : "cog-outline"}
          size={24}
          color={isActive('Settings') ? colors.primary : colors.textMuted}
        />
        <Text style={[styles.label, isActive('Settings') && styles.activeLabel]}>Settings</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => handleNavigation('Profile')} style={styles.tab}>
        <Icon
          name={isActive('Profile') ? "account" : "account-outline"}
          size={24}
          color={isActive('Profile') ? colors.primary : colors.textMuted}
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
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  tab: {
    alignItems: 'center',
  },
  label: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  activeLabel: {
    color: colors.primary,
  },
});

export default BottomNavbar;
