import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { bottomNavHeight, getSafeBottomInset } from '../layout';
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
  { id: 'membership', icon: 'analytics-outline', activeIcon: 'analytics', label: 'Điểm' },
  { id: 'profile', icon: 'person-outline', activeIcon: 'person', label: 'Tài khoản' },
];

export function BottomNav({ active, onNavigate }: BottomNavProps) {
  const insets = useSafeAreaInsets();
  const bottomPadding = getSafeBottomInset(insets.bottom);

  return (
    <View style={[styles.safeArea, { paddingBottom: bottomPadding }]}>
      <View style={styles.container}>
        {tabs.map((tab) => {
          const selected = active === tab.id;

          return (
            <Pressable
              key={tab.id}
              hitSlop={8}
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
                selected && styles.tabSelected,
                pressed && styles.tabPressed,
              ]}
            >
              <View style={styles.iconWrap}>
                <Ionicons
                  color={colors.white}
                  name={selected ? tab.activeIcon : tab.icon}
                  size={selected ? 27 : 25}
                />
              </View>

              <Text
                maxFontSizeMultiplier={1.08}
                numberOfLines={1}
                style={[styles.label, selected && styles.selectedLabel]}
              >
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
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
    paddingHorizontal: 14,
    paddingTop: 6,
  },

  container: {
    minHeight: bottomNavHeight,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
    borderRadius: 30,
    backgroundColor: '#075da8c1',
    paddingHorizontal: 7,
    paddingTop: 7,
    paddingBottom: 7,
    shadowColor: '#2C2C2C',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.96,
    shadowRadius: 18,
    elevation: 14,
  },

  tab: {
    flex: 1,
    minHeight: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
    paddingHorizontal: 2,
    paddingTop: 5,
    paddingBottom: 5,
  },

  tabSelected: {
    backgroundColor: 'rgba(255,255,255,0.22)',
  },

  tabPressed: {
    opacity: 0.78,
    transform: [{ scale: 0.96 }],
  },

  iconWrap: {
    width: 34,
    height: 29,
    alignItems: 'center',
    justifyContent: 'center',
  },

  label: {
    marginTop: 3,
    color: 'rgba(255,255,255,0.76)',
    fontSize: 8,
    fontWeight: '800',
    lineHeight: 10,
    textAlign: 'center',
  },

  selectedLabel: {
    color: colors.white,
    fontWeight: '900',
  },
});