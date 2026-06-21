import { StyleSheet, Text, View } from 'react-native';

type BrandLogoProps = {
  width?: number;
};

/**
 * Logo dựng bằng primitive của React Native nên hiển thị ngay khi component mount,
 * không phụ thuộc quá trình giải mã PNG ở từng màn xác thực.
 */
export function BrandLogo({ width = 170 }: BrandLogoProps) {
  const height = width * 0.42;
  return (
    <View
      accessibilityLabel="Napas"
      accessibilityRole="image"
      style={[styles.logo, { width, height }]}
    >
      <Text
        style={[
          styles.wordmark,
          {
            fontSize: width * 0.225,
            letterSpacing: width * -0.012,
          },
        ]}
      >
        napas
      </Text>
      <View style={[styles.symbol, { width: width * 0.2, height: width * 0.2 }]}>
        <View style={[styles.diamond, styles.greenDiamond, { width: width * 0.09, height: width * 0.09 }]} />
        <View style={[styles.diamond, styles.blueDiamond, { width: width * 0.085, height: width * 0.085 }]} />
        <View style={[styles.diamond, styles.yellowDiamond, { width: width * 0.055, height: width * 0.055 }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  logo: {
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  wordmark: {
    color: '#294B8C',
    fontStyle: 'italic',
    fontWeight: '900',
  },
  symbol: {
    position: 'relative',
    marginLeft: 4,
  },
  diamond: {
    position: 'absolute',
    transform: [{ rotate: '45deg' }],
  },
  greenDiamond: {
    top: '4%',
    left: '7%',
    backgroundColor: '#76B82A',
  },
  blueDiamond: {
    right: '2%',
    bottom: '8%',
    backgroundColor: '#1A74B8',
  },
  yellowDiamond: {
    top: '39%',
    left: '36%',
    backgroundColor: '#F2C500',
  },
});
