import React, { useRef, useEffect } from 'react';
import { Animated, Dimensions, View, Image, Easing } from 'react-native';

interface AnimatedOrbProps {
  isAnimating?: boolean; // Controls whether the pulse animation is active
}

export const AnimatedOrb: React.FC<AnimatedOrbProps> = ({
  isAnimating = true
}) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0.7)).current;

  // Get screen width for responsive sizing
  const screenWidth = Dimensions.get('window').width;
  const orbSize = screenWidth * 0.5; // 50% of screen width

  // Create truly smooth continuous animation using native driver
  useEffect(() => {
    // Use a single long animation that naturally loops
    const createSmoothAnimation = () => {
      return Animated.loop(
        Animated.timing(pulseAnim, {
          toValue: 1, // This won't be used, we'll override with custom interpolation
          duration: 2000, // 2 second full cycle
          easing: Easing.linear, // Linear for smooth sine wave calculation
          useNativeDriver: true,
        }),
        { iterations: -1 }
      );
    };

    // Override with smooth sine wave interpolation
    let animationId: number;
    let startTime = Date.now();

    const smoothAnimate = () => {
      const elapsed = (Date.now() - startTime) % 2000; // 2 second cycle
      const progress = elapsed / 2000; // 0 to 1
      const sineValue = Math.sin(progress * Math.PI * 2); // Perfect sine wave
      const scale = 1 + (sineValue * 0.02); // 0.98 to 1.02 smoothly

      pulseAnim.setValue(scale);
      animationId = requestAnimationFrame(smoothAnimate);
    };

    smoothAnimate();

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, []); // Never restart

  return (
    <View style={{
      width: orbSize,
      height: orbSize,
      justifyContent: 'center',
      alignItems: 'center',
    }}>
      {/* Main orb with the exact image */}
      <Animated.View
        style={{
          transform: [{ scale: pulseAnim }],
          width: orbSize,
          height: orbSize,
          borderRadius: orbSize / 2,
          overflow: 'hidden',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.3,
          shadowRadius: 16,
          elevation: 8,
        }}
      >
        <Image
          source={require('../assets/icon.png')}
          style={{
            width: '100%',
            height: '100%',
            borderRadius: orbSize / 2,
          }}
          resizeMode="cover"
          onError={(error) => console.log('🚨 Image load error:', error)}
          onLoad={() => console.log('✅ Image loaded successfully')}
        />
      </Animated.View>
    </View>
  );
};