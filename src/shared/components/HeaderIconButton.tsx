import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '../../theme/colors';

type HeaderIconName = ComponentProps<typeof Ionicons>['name'];

type HeaderIconButtonProps = {
  accessibilityLabel: string;
  icon: HeaderIconName;
  onPress: () => void;
  badgeCount?: number;
  iconColor?: string;
};

export function HeaderIconButton({
  accessibilityLabel,
  badgeCount = 0,
  icon,
  iconColor = colors.primaryDark,
  onPress,
}: HeaderIconButtonProps) {
  const shouldShowBadge = badgeCount > 0;

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}
    >
      <Ionicons color={iconColor} name={icon} size={20} />

      {shouldShowBadge ? (
        <View style={styles.badge}>
          <Text maxFontSizeMultiplier={1} style={styles.badgeText}>
            {badgeCount > 9 ? '9+' : badgeCount}
          </Text>
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    backgroundColor: colors.surface,
  },
  pressed: {
    opacity: 0.72,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -5,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.surface,
    borderRadius: 9,
    backgroundColor: colors.danger,
    paddingHorizontal: 3,
  },
  badgeText: {
    color: colors.white,
    fontSize: 8,
    fontWeight: '900',
    lineHeight: 10,
  },
});
