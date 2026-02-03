import React, { useRef } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Text,
  Animated,
  Platform,
  Vibration,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing } from '../ui/theme';

const TAB_CONFIG = [
  { route: 'Home', label: 'Internships', iconActive: 'briefcase-search', iconInactive: 'briefcase-search-outline' },
  { route: 'OJTTracker', label: 'OJT Tracker', iconActive: 'clock', iconInactive: 'clock-outline' },
  { route: 'RequirementsChecklist', label: 'Checklist', iconActive: 'clipboard-check', iconInactive: 'clipboard-check-outline' },
  { route: 'ResourceManagement', label: 'Guides', iconActive: 'book-open', iconInactive: 'book-open-outline' },
  { route: 'Settings', label: 'Settings', iconActive: 'cog', iconInactive: 'cog-outline' },
] as const;

type Props = {
  currentRoute?: string;
  notificationCount?: number;
};

const ICON_SIZE = 22;
const MIN_TOUCH_TARGET = 44;
const LABEL_FONT_SIZE = 9;
const NAV_BG = '#FFFFFF';
const NAV_INACTIVE_COLOR = '#374151';

const BottomNavbar: React.FC<Props> = ({ currentRoute, notificationCount = 0 }) => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const opacityAnims = useRef(TAB_CONFIG.map(() => new Animated.Value(1))).current;

  const isActive = (route: string) => currentRoute === route;

  const handlePress = (screenName: string, index: number) => {
    if (Platform.OS !== 'web') {
      try {
        Vibration.vibrate(6);
      } catch {
        // ignore
      }
    }
    try {
      // @ts-ignore
      navigation.navigate(screenName);
    } catch (error) {
      console.error(`Navigation error to ${screenName}:`, error);
    }
    // Subtle press feedback: brief opacity dip
    Animated.sequence([
      Animated.timing(opacityAnims[index], {
        toValue: 0.6,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnims[index], {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const safeBottom = Math.max(insets.bottom, 8);

  return (
    <View style={[styles.outer, { paddingBottom: safeBottom }]}>
      <View style={styles.container}>
        {TAB_CONFIG.map((tab, index) => {
          const active = isActive(tab.route);
          const showBadge = tab.badge && notificationCount > 0;
          const badgeLabel = notificationCount > 99 ? '99+' : String(notificationCount);

          return (
            <TouchableOpacity
              key={tab.route}
              onPress={() => handlePress(tab.route, index)}
              style={styles.tabWrapper}
              activeOpacity={0.7}
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
              accessibilityLabel={tab.label}
              accessibilityHint={active ? `${tab.label}, selected` : `Go to ${tab.label}`}
            >
              <Animated.View
                style={[styles.tabContent, { opacity: opacityAnims[index] }]}
              >
                <View style={styles.iconWrap}>
                  <Icon
                    name={active ? tab.iconActive : tab.iconInactive}
                    size={ICON_SIZE}
                    color={active ? colors.primary : NAV_INACTIVE_COLOR}
                  />
                  {showBadge && (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText} numberOfLines={1}>
                        {badgeLabel}
                      </Text>
                    </View>
                  )}
                </View>
                <Text
                  style={[styles.label, active && styles.labelActive]}
                  numberOfLines={1}
                  textAlign="center"
                  adjustsFontSizeToFit
                  minimumFontScale={0.75}
                >
                  {tab.label}
                </Text>
              </Animated.View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  outer: {
    paddingTop: 6,
    backgroundColor: NAV_BG,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(0,0,0,0.08)',
  },
  container: {
    flexDirection: 'row',
    alignItems: 'stretch',
    justifyContent: 'space-around',
    paddingHorizontal: 4,
  },
  tabWrapper: {
    flex: 1,
    minHeight: MIN_TOUCH_TARGET,
    minWidth: MIN_TOUCH_TARGET,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 2,
  },
  tabContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    paddingHorizontal: 2,
    flex: 1,
    minWidth: 0,
  },
  iconWrap: {
    position: 'relative',
    width: ICON_SIZE + 2,
    height: ICON_SIZE + 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 3,
  },
  badge: {
    position: 'absolute',
    top: -3,
    right: -6,
    minWidth: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    fontSize: 8,
    fontWeight: '700',
    color: colors.white,
  },
  label: {
    fontSize: LABEL_FONT_SIZE,
    color: NAV_INACTIVE_COLOR,
    fontWeight: '500',
    textAlign: 'center',
  },
  labelActive: {
    color: colors.primary,
    fontWeight: '600',
  },
});

export default BottomNavbar;
