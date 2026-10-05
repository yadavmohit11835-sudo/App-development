import React from 'react';
import { Image, StyleSheet, View, ViewStyle, ImageStyle } from 'react-native';

interface KeyPrimeLogoProps {
  size?: 'small' | 'medium' | 'large' | 'hero';
  width?: number;
  style?: ViewStyle;
  imageStyle?: ImageStyle;
}

// Original dimensions: 738 x 240 (Aspect ratio: 3.075)
const ASPECT_RATIO = 738 / 240;

export const KeyPrimeLogo: React.FC<KeyPrimeLogoProps> = ({
  size = 'medium',
  width: customWidth,
  style,
  imageStyle,
}) => {
  let logoWidth = 180;
  if (customWidth) {
    logoWidth = customWidth;
  } else {
    switch (size) {
      case 'small':
        logoWidth = 120;
        break;
      case 'medium':
        logoWidth = 170;
        break;
      case 'large':
        logoWidth = 240;
        break;
      case 'hero':
        logoWidth = 290;
        break;
    }
  }

  const logoHeight = logoWidth / ASPECT_RATIO;

  return (
    <View style={[styles.container, style]}>
      <Image
        source={require('../assets/images/keyprime-logo.png')}
        style={[
          {
            width: logoWidth,
            height: logoHeight,
          },
          imageStyle,
        ]}
        resizeMode="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default KeyPrimeLogo;
