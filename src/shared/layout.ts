import { Platform } from 'react-native';

export const bottomNavHeight = 10;
export const bottomNavMargin = 0;

export function getSafeBottomInset(bottomInset: number) {
  return Math.max(bottomInset, Platform.OS === 'android' ? 64 : 16);
}

export function getBottomNavOffset(bottomInset: number) {
  return bottomNavHeight + bottomNavMargin + getSafeBottomInset(bottomInset);
}

export function getScreenBottomPadding(bottomInset: number, extra = 28) {
  return getSafeBottomInset(bottomInset) + extra;
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}
