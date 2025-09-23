import React, { useEffect, useRef } from 'react';
import { View, Animated, Dimensions, StyleSheet } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';

interface GradientWaveAnimationProps {
  isAnimating: boolean;
  colors: string[];
  amplitude?: number;
  frequency?: number;
  speed?: number;
  audioLevel?: number;
}

const { width: screenWidth } = Dimensions.get('window');

export const GradientWaveAnimation: React.FC<GradientWaveAnimationProps> = ({
  isAnimating,
  colors,
  amplitude = 30,
  frequency = 2,
  speed = 1,
  audioLevel = 0
}) => {
  // Single wave animation value
  const waveAnim = useRef(new Animated.Value(0)).current;

  // Opacity animation
  const opacity = useRef(new Animated.Value(0)).current;

  // Scale animation for audio responsiveness
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isAnimating) {
      // Fade in
      Animated.timing(opacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();

      // Create smooth wave animation
      const waveAnimation = Animated.loop(
        Animated.timing(waveAnim, {
          toValue: 1,
          duration: (3000 / speed), // 3 second cycle
          useNativeDriver: false, // Need to use layout animations for path
        })
      );

      waveAnimation.start();

      return () => {
        waveAnimation.stop();
        waveAnim.setValue(0);
      };
    } else {
      // Fade out
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [isAnimating, speed]);

  // React to audio level
  useEffect(() => {
    if (audioLevel > 0.1) {
      Animated.spring(scale, {
        toValue: 1 + (audioLevel * 0.3),
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start();
    } else {
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start();
    }
  }, [audioLevel]);

  if (!isAnimating) return null;

  // Generate smooth wave path
  const generateWavePath = (phase: number = 0) => {
    const width = screenWidth * 0.8;
    const height = 80;
    const centerY = height / 2;

    let path = `M 0 ${centerY}`;

    // Create smooth sine wave
    for (let x = 0; x <= width; x += 2) {
      const progress = x / width;
      const waveY = Math.sin((progress * frequency * Math.PI * 2) + phase) * amplitude;
      const y = centerY + waveY;
      path += ` L ${x} ${y}`;
    }

    // Close the path for fill
    path += ` L ${width} ${height} L 0 ${height} Z`;

    return path;
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity,
          transform: [{ scale }]
        }
      ]}
    >
      <Animated.View style={styles.svgContainer}>
        <Svg width={screenWidth * 0.8} height={80} viewBox={`0 0 ${screenWidth * 0.8} 80`}>
          <Defs>
            <LinearGradient id="waveGradient" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0%" stopColor={colors[0] || '#FF6B6B'} stopOpacity="0.8" />
              <Stop offset="50%" stopColor={colors[1] || colors[0] || '#FF6B6B'} stopOpacity="0.6" />
              <Stop offset="100%" stopColor={colors[2] || colors[0] || '#FF6B6B'} stopOpacity="0.4" />
            </LinearGradient>
          </Defs>

          <Animated.View>
            {waveAnim.addListener && (
              <Path
                d={waveAnim._value ? generateWavePath(waveAnim._value * Math.PI * 2) : generateWavePath(0)}
                fill="url(#waveGradient)"
                stroke={colors[0] || '#FF6B6B'}
                strokeWidth="2"
                strokeOpacity="0.8"
              />
            )}
          </Animated.View>
        </Svg>
      </Animated.View>

      {/* Fallback animated bars for better performance */}
      <View style={styles.fallbackContainer}>
        {[...Array(12)].map((_, i) => (
          <Animated.View
            key={i}
            style={[
              styles.fallbackBar,
              {
                backgroundColor: colors[0] || '#FF6B6B',
                height: waveAnim.interpolate({
                  inputRange: [0, 0.5, 1],
                  outputRange: [
                    5 + Math.sin((i * 0.5) + 0) * amplitude * 0.3,
                    5 + Math.sin((i * 0.5) + Math.PI) * amplitude,
                    5 + Math.sin((i * 0.5) + Math.PI * 2) * amplitude * 0.3,
                  ],
                }),
                opacity: waveAnim.interpolate({
                  inputRange: [0, 0.5, 1],
                  outputRange: [0.4, 0.8, 0.4],
                }),
                transform: [{
                  scaleY: waveAnim.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [0.8, 1.5, 0.8],
                  })
                }]
              }
            ]}
          />
        ))}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 80,
    width: screenWidth * 0.8,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 20,
  },
  svgContainer: {
    position: 'absolute',
    opacity: 0, // Hide SVG for now, use fallback
  },
  fallbackContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 60,
    gap: 4,
  },
  fallbackBar: {
    width: 6,
    minHeight: 8,
    borderRadius: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
});