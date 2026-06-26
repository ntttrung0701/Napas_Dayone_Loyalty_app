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
  <View style={styles.safeArea}>
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
            style={({ pressed }) => [
              styles.tab,
              pressed && styles.tabPressed,
            ]}
            hitSlop={8}
          >
            <View style={[styles.iconWrap, selected && styles.iconWrapSelected]}>
              <Ionicons
                color={selected ? colors.primary : colors.textMuted}
                name={selected ? tab.activeIcon : tab.icon}
                size={22}
              />
            </View>

            <Text style={[styles.label, selected && styles.selected]}>
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  </View>
);
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: 'transparent',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },

  container: {
    minHeight: 66,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: 'rgba(223,231,239,0.92)',
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.96)',
    paddingHorizontal: 8,
    paddingTop: 7,
    paddingBottom: 7,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 18,
    elevation: 12,
  },

  tab: {
    width: 58,
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },

  tabPressed: {
    opacity: 0.72,
    transform: [{ scale: 0.96 }],
  },

  iconWrap: {
    width: 34,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
  },

  iconWrapSelected: {
    backgroundColor: colors.primarySoft,
  },

  label: {
    marginTop: 3,
    color: colors.textMuted,
    fontSize: 9,
    fontWeight: '700',
    lineHeight: 12,
  },

  selected: {
    color: colors.primary,
    fontWeight: '900',
  },
});
