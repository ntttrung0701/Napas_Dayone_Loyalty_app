import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '../../theme/colors';
import type { AppScreen, MainTab } from '../../types';

type BottomNavProps = {
  active?: MainTab;
  onNavigate: (screen: AppScreen) => void;
};

type IconName = ComponentProps<typeof Ionicons>['name'];

const tabs: Array<{ id: MainTab; icon: IconName; activeIcon: IconName; label: string }> = [
  { id: 'home', icon: 'home-outline', activeIcon: 'home', label: 'Trang chủ' },
  { id: 'offers', icon: 'gift-outline', activeIcon: 'gift', label: 'Ưu đãi' },
  { id: 'qr', icon: 'qr-code-outline', activeIcon: 'qr-code', label: 'Mã QR' },
  {
    id: 'notifications',
    icon: 'notifications-outline',
    activeIcon: 'notifications',
    label: 'Thông báo',
  },
  { id: 'profile', icon: 'person-outline', activeIcon: 'person', label: 'Tài khoản' },
];

export function BottomNav({ active, onNavigate }: BottomNavProps) {
  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        const selected = active === tab.id;
        return (
          <Pressable
  key={tab.id}
  onPress={() => {
    if (tab.id === 'offers') {
      onNavigate(tab.id);
      return;
    }

    if (!selected) {
      onNavigate(tab.id);
    }
  }}
  style={styles.tab}
>
            <View style={[styles.iconWrap, selected && styles.iconWrapSelected]}>
              <Ionicons
                color={selected ? colors.primary : colors.textMuted}
                name={selected ? tab.activeIcon : tab.icon}
                size={21}
              />
            </View>
            <Text style={[styles.label, selected && styles.selected]}>{tab.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 72,
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
    paddingBottom: 7,
    paddingTop: 6,
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 9,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrap: {
    width: 39,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 15,
  },
  iconWrapSelected: {
    backgroundColor: colors.primarySoft,
  },
  label: {
    marginTop: 2,
    color: colors.textMuted,
    fontSize: 9,
    fontWeight: '600',
  },
  selected: {
    color: colors.primary,
    fontWeight: '800',
  },
});
