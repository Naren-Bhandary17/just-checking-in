import React, { useRef, useEffect } from 'react';
import { Animated, Dimensions, Image } from 'react-native';

interface AnimatedOrbProps {
  isAnimating?: boolean; // Controls whether the pulse animation is active
}

export const AnimatedOrb: React.FC<AnimatedOrbProps> = ({
  isAnimating = true
}) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Get screen width for responsive sizing
  const screenWidth = Dimensions.get('window').width;
  const orbSize = screenWidth * 0.5; // 50% of screen width

  useEffect(() => {
    if (isAnimating) {
      // Create the breathing pulse animation
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.02, // Scale up to 102%
            duration: 1000, // 1 second to scale up
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 0.98, // Scale down to 98%
            duration: 1000, // 1 second to scale down
            useNativeDriver: true,
          }),
        ])
      );

      pulseAnimation.start();

      return () => {
        pulseAnimation.stop();
      };
    } else {
      // Reset to normal scale when not animating
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [isAnimating, pulseAnim]);

  return (
    <Animated.View
      style={{
        transform: [{ scale: pulseAnim }],
        width: orbSize,
        height: orbSize,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Image
        source={require('../assets/icon.png')}
        style={{
          width: orbSize,
          height: orbSize,
        }}
        resizeMode="contain"
      />
    </Animated.View>
  );
};