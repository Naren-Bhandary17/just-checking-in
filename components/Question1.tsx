import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  Dimensions,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronLeft } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

interface Question1Props {
  onNext?: () => void;
  onBack?: () => void;
  questionText?: string;
}

export function Question1({
  onNext,
  onBack,
  questionText = "What was the best thing about today?"
}: Question1Props) {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />

      {/* Back Navigation */}
      <TouchableOpacity style={styles.backButton} onPress={onBack}>
        <ChevronLeft size={24} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Question Text with Gradient */}
      <View style={styles.questionContainer}>
        <LinearGradient
          colors={['#67C8FF', '#A46AB9']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.gradientTextContainer}
        >
          <Text style={styles.questionText}>
            {questionText}
          </Text>
        </LinearGradient>
      </View>

      {/* Central Orb Container */}
      <View style={styles.orbContainer}>
        {/* Outer Glow Effect */}
        <View style={styles.outerGlow}>
          <View style={styles.innerGlow}>
            {/* AI Orb Image - using placeholder for now */}
            <Image
              source={require('../assets/icon.png')}
              style={styles.orbImage}
              resizeMode="contain"
            />
          </View>
        </View>
      </View>

      {/* Next Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.nextButton} onPress={onNext}>
          <LinearGradient
            colors={['rgba(103, 200, 255, 0.45)', 'rgba(103, 200, 255, 0.1)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.buttonGradientBorder}
          >
            <View style={styles.buttonInner}>
              <Text style={styles.buttonText}>Next</Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 20,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  questionContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingTop: 80,
  },
  gradientTextContainer: {
    borderRadius: 8,
  },
  questionText: {
    fontSize: 30,
    fontWeight: '400',
    textAlign: 'center',
    lineHeight: 36,
    fontFamily: 'System',
    color: 'transparent',
    backgroundColor: 'transparent',
  },
  orbContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -80,
  },
  outerGlow: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(103, 200, 255, 0.1)',
    shadowColor: '#67C8FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerGlow: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(164, 106, 185, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  orbImage: {
    width: 140,
    height: 140,
  },
  buttonContainer: {
    alignItems: 'center',
    paddingBottom: 20,
  },
  nextButton: {
    width: width - 54,
    height: 42,
  },
  buttonGradientBorder: {
    flex: 1,
    borderRadius: 8,
    padding: 1.4,
  },
  buttonInner: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 6.6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '400',
    letterSpacing: 0.48,
    fontFamily: 'System',
  },
});

export default Question1;