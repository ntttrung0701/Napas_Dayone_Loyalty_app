import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '../../theme/colors';
import type { AppScreen, MainTab } from '../../types';

type BottomNavProps = {
  active: MainTab;
  onNavigate: (screen: AppScreen) => void;
};

type IconName = ComponentProps<typeof Ionicons>['name'];

const tabs: Array<{ id: MainTab; icon: IconName; activeIcon: IconName; label: string }> = [
  { id: 'home', icon: 'home-outline', activeIcon: 'home', label: 'Trang chủ' },
  { id: 'offers', icon: 'gift-outline', activeIcon: 'gift', label: 'Ưu đãi' },
  { id: 'qr', icon: 'qr-code-outline', activeIcon: 'qr-code', label: 'Mã QR' },
  { id: 'history', icon: 'time-outline', activeIcon: 'time', label: 'Lịch sử' },
  { id: 'profile', icon: 'person-outline', activeIcon: 'person', label: 'Tài khoản' },
];

export function BottomNav({ active, onNavigate }: BottomNavProps) {
  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        const selected = active === tab.id;
        return (
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ selected }}
            key={tab.id}
            onPress={() => {
              if (!selected) onNavigate(tab.id);
            }}
            style={styles.tab}
          >
            <Ionicons
              color={selected ? colors.primary : colors.textMuted}
              name={selected ? tab.activeIcon : tab.icon}
              size={22}
            />
            <Text style={[styles.label, selected && styles.selected]}>{tab.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 66,
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
    paddingBottom: 6,
    paddingTop: 5,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '600',
  },
  selected: {
    color: colors.primary,
    fontWeight: '800',
  },
});
