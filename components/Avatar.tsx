import React from 'react';
import { Image, ImageSourcePropType, StyleSheet, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

interface AvatarProps {
  source?: ImageSourcePropType;
  size?: number;
}

const Avatar: React.FC<AvatarProps> = ({ source, size = 40 }) => {
  if (source) {
    return (
      <Image
        source={source}
        style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }]}
      />
    );
  }

  return (
    <View style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }]}>
      <Svg width={size} height={size} viewBox="0 0 200 200" fill="none">
        <Circle cx="100" cy="100" r="100" fill="#E0E0E0" />
        <Circle cx="100" cy="80" r="40" fill="#9E9E9E" />
        <Path d="M100 130C122.091 130 140 147.909 140 170H60C60 147.909 77.9086 130 100 130Z" fill="#9E9E9E" />
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  avatar: {
    overflow: 'hidden',
    backgroundColor: '#E0E0E0',
  },
});

export default Avatar;
