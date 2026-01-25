import React from 'react';
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radii, shadows, spacing } from '../ui/theme';

type Props = {
  currentRoute?: string;
};

const BottomNavbar: React.FC<Props> = ({ currentRoute }) => {
  // Get the navigation object directly from useNavigation hook
  // This ensures we always have the most up-to-date navigation context
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

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
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, spacing.sm) }]}>
      <TouchableOpacity
        onPress={() => handleNavigation('Home')}
        style={styles.tab}
        activeOpacity={0.7}
        accessibilityRole="tab"
        accessibilityState={{ selected: isActive('Home') }}
        accessibilityLabel="Home"
        hitSlop={{ top: 8, bottom: 8, left: 12, right: 12 }}
      >
        <Icon
          name={isActive('Home') ? "home" : "home-outline"}
          size={24}
          color={isActive('Home') ? colors.primary : colors.textMuted}
        />
        <Text style={[styles.label, isActive('Home') && styles.activeLabel]}>Home</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => handleNavigation('Notifications')}
        style={styles.tab}
        activeOpacity={0.7}
        accessibilityRole="tab"
        accessibilityState={{ selected: isActive('Notifications') }}
        accessibilityLabel="Notifications"
        hitSlop={{ top: 8, bottom: 8, left: 12, right: 12 }}
      >
        <Icon
          name={isActive('Notifications') ? "bell" : "bell-outline"}
          size={24}
          color={isActive('Notifications') ? colors.primary : colors.textMuted}
        />
        <Text style={[styles.label, isActive('Notifications') && styles.activeLabel]}>Notifications</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => handleNavigation('HelpDesk')}
        style={styles.tab}
        activeOpacity={0.7}
        accessibilityRole="tab"
        accessibilityState={{ selected: isActive('HelpDesk') }}
        accessibilityLabel="Resources"
        hitSlop={{ top: 8, bottom: 8, left: 12, right: 12 }}
      >
        <Icon
          name={isActive('HelpDesk') ? "folder" : "folder-outline"}
          size={24}
          color={isActive('HelpDesk') ? colors.primary : colors.textMuted}
        />
        <Text style={[styles.label, isActive('HelpDesk') && styles.activeLabel]}>Resources</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => handleNavigation('Settings')}
        style={styles.tab}
        activeOpacity={0.7}
        accessibilityRole="tab"
        accessibilityState={{ selected: isActive('Settings') }}
        accessibilityLabel="Settings"
        hitSlop={{ top: 8, bottom: 8, left: 12, right: 12 }}
      >
        <Icon
          name={isActive('Settings') ? "cog" : "cog-outline"}
          size={24}
          color={isActive('Settings') ? colors.primary : colors.textMuted}
        />
        <Text style={[styles.label, isActive('Settings') && styles.activeLabel]}>Settings</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => handleNavigation('Profile')}
        style={styles.tab}
        activeOpacity={0.7}
        accessibilityRole="tab"
        accessibilityState={{ selected: isActive('Profile') }}
        accessibilityLabel="Profile"
        hitSlop={{ top: 8, bottom: 8, left: 12, right: 12 }}
      >
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
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    ...shadows.card,
  },
  tab: {
    alignItems: 'center',
    flex: 1,
    paddingVertical: spacing.xs,
  },
  label: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  activeLabel: {
    color: colors.primary,
    fontWeight: '700',
  },
});

export default BottomNavbar;
