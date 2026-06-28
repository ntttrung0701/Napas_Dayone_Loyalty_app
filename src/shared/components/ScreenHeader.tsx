import Ionicons from '@expo/vector-icons/Ionicons';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '../../theme/colors';

type ScreenHeaderProps = {
  title: string;
  onBack?: () => void;
  rightLabel?: string;
  rightContent?: ReactNode;
};

export function ScreenHeader({ title, onBack, rightLabel, rightContent }: ScreenHeaderProps) {
  return (
    <View style={styles.header}>
      <View style={styles.side}>
        {onBack ? (
          <Pressable accessibilityRole="button" onPress={onBack} style={styles.backButton}>
            <Ionicons color={colors.primaryDark} name="chevron-back" size={23} />
          </Pressable>
        ) : null}
      </View>
      <Text adjustsFontSizeToFit maxFontSizeMultiplier={1.1} numberOfLines={1} style={styles.title}>
        {title}
      </Text>
      <View style={[styles.side, styles.right]}>
        {rightContent ?? (
          rightLabel ? (
            <Text maxFontSizeMultiplier={1.08} numberOfLines={1} style={styles.rightLabel}>
              {rightLabel}
            </Text>
          ) : null
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: 12,
  },
  side: {
    width: 52,
  },
  right: {
    alignItems: 'flex-end',
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: colors.primarySoft,
  },
  title: {
    flex: 1,
    textAlign: 'center',
    color: colors.text,
    fontSize: 16,
    fontWeight: '800',
  },
  rightLabel: {
    color: colors.gold,
    fontSize: 11,
    fontWeight: '800',
  },
});
