import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity, Alert, Animated, Image } from 'react-native';
import MaskedView from '@react-native-masked-view/masked-view';
import { useState, useRef, useEffect } from 'react';
import { useAudioRecorder, useAudioRecorderState } from 'expo-audio';
import * as Speech from 'expo-speech';
import { Audio } from 'expo-av';
import { Phone, ChevronLeft } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { GradientWaveAnimation } from './components/GradientWaveAnimation';
import { AnimatedOrb } from './components/AnimatedOrb';

export default function App() {
  console.log('=== APP COMPONENT RENDERING [v3-FIXED] ===');
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [lastCheckinTime, setLastCheckinTime] = useState<string | null>(null);
  const [isInCallMode, setIsInCallMode] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [hasRecording, setHasRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [isAISpeaking, setIsAISpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [silenceTimer, setSilenceTimer] = useState<NodeJS.Timeout | null>(null);
  const [audioLevel, setAudioLevel] = useState(0);
  const [silenceStartTime, setSilenceStartTime] = useState<number | null>(null);
  const [hasUserSpoken, setHasUserSpoken] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Audio recorder setup with metering enabled
  const recorder = useAudioRecorder({
    isMeteringEnabled: true,
    android: {
      extension: '.m4a',
      outputFormat: 'mpeg4',
      audioEncoder: 'aac',
    },
    ios: {
      extension: '.m4a',
      outputFormat: 'mpeg4',
      audioQuality: 'medium',
      sampleRate: 44100,
      numberOfChannels: 2,
    },
  });
  const recorderState = useAudioRecorderState(recorder);

  const questions = [
    "How are you feeling today?",
    "What are your main goals for today?",
    "Is there anything you need help with?"
  ];
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const finishedQuestionRef = useRef(-1); // Track which question was last finished
  const [showIncomingCallModal, setShowIncomingCallModal] = useState(true);

  // Check audio permissions and initialize recorder on app load
  useEffect(() => {
    const initializeAudio = async () => {
      try {
        const permission = await Audio.requestPermissionsAsync();
        setPermissionGranted(permission.granted);
        if (!permission.granted) {
          console.log('Audio permission not granted');
          return;
        }

        // Initialize recorder by doing a quick start/stop cycle
        console.log('[v4-INIT] Initializing recorder...');
        try {
          await Audio.setAudioModeAsync({
            allowsRecordingIOS: true,
            playsInSilentModeIOS: true,
          });

          await recorder.record();
          await new Promise(resolve => setTimeout(resolve, 100)); // Wait 100ms

          try {
            await recorder.stop();
            console.log('Recorder initialized successfully');
          } catch (stopError) {
            console.log('Init stop call rejected (this is often fine):', stopError.message);
          }
        } catch (initError) {
          console.log('Recorder initialization failed:', initError);
        }
      } catch (error) {
        console.error('Error checking audio permissions:', error);
      }
    };

    initializeAudio();
  }, []);

  // Monitor recorder state changes
  useEffect(() => {
    console.log('Recorder state changed:', {
      isRecording: recorderState.isRecording,
      durationMillis: recorderState.durationMillis,
      metering: recorderState.metering,
      localIsRecording: isRecording
    });
  }, [recorderState.isRecording, recorderState.durationMillis, isRecording]);

  // Start pulse animation when recording and track duration
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (recorderState.isRecording || isRecording) {
      // Start pulse animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Update recording duration using the actual recording duration or fallback to manual count
      interval = setInterval(() => {
        if (recorderState.durationMillis && recorderState.isRecording) {
          // Use real duration when available
          setRecordingDuration(Math.floor(recorderState.durationMillis / 1000));
        } else if (isRecording) {
          // Fallback to manual counter when recording locally but not reflected in recorderState yet
          setRecordingDuration(prev => prev + 1);
        }
      }, 1000);
    } else {
      // Reset animation and duration when not recording
      pulseAnim.setValue(1);
      setRecordingDuration(0);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [recorderState.isRecording, recorderState.durationMillis, isRecording, pulseAnim]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCheckin = () => {
    console.log('=== HANDLE CHECKIN CALLED ===');
    setIsInCallMode(true);
    setCurrentQuestion(0);
    console.log('States set, scheduling startAIConversation...');
    // Start AI conversation after a brief delay
    setTimeout(() => {
      console.log('Timeout fired, calling startAIConversation');
      startAIConversation();
    }, 1000);
  };

  const startAIConversation = async () => {
    console.log('=== START AI CONVERSATION CALLED ===');
    console.log('Current question index:', currentQuestion);
    await speakQuestion(currentQuestion);
  };

  const speakQuestion = async (questionIndex: number) => {
    setIsAISpeaking(true);

    const questionText = questions[questionIndex];

    console.log('=== TTS STARTING ===');
    console.log('Question index:', questionIndex);
    console.log('Question text:', questionText);

    Speech.speak(questionText, {
      // Removed iOS-specific voice to work on all platforms
      rate: 0.8, // Slightly slower for clarity
      pitch: 1.0,
      onDone: () => {
        console.log('=== TTS DONE CALLBACK SUCCESS ===');
        setIsAISpeaking(false);
        startListening();
      },
      onError: (error) => {
        console.log('=== TTS ERROR CALLBACK ===');
        console.log('TTS Error:', error);
        setIsAISpeaking(false);
        startListening();
      }
    });

    console.log('Speech.speak() called, waiting for callbacks...');
  };

  const startListening = async () => {
    console.log('startListening called');
    setIsListening(true);
    setHasUserSpoken(false); // Reset for new question
    setSilenceStartTime(null); // Reset silence tracking

    // Reset two-phase detection to Phase 1 for new question
    phaseRef.current = 'WAIT_FOR_SPEECH';
    speechDetectedRef.current = false;
    silenceStartRef.current = null;
    isTransitioningRef.current = false;
    console.log('🔄 Reset to PHASE 1: WAIT_FOR_SPEECH');

    try {
      await startRecording();
      console.log('Recording started successfully, two-phase detection will handle timing...');
    } catch (error) {
      console.log('Failed to start recording:', error);
      setIsListening(false);
    }
  };

  // Two-phase silence detection: Phase 1 (wait for speech) → Phase 2 (4s silence timer)
  // Uses refs to avoid useEffect restarts and maintain stable timing
  const phaseRef = useRef<'WAIT_FOR_SPEECH' | 'MONITOR_SILENCE'>('WAIT_FOR_SPEECH');
  const speechDetectedRef = useRef(false);
  const silenceStartRef = useRef<number | null>(null);
  const isTransitioningRef = useRef(false);

  useEffect(() => {
    console.log('🎯 TWO-PHASE SILENCE DETECTION STARTING - UNIFIED SOLUTION v1.0');

    // Update refs with current state (avoids stale closures)
    isTransitioningRef.current = isTransitioning;

    const interval = setInterval(() => {
      // Exit early if not in recording mode
      const isActuallyRecording = recorderState.isRecording || isRecording;
      if (!isListening || !isActuallyRecording || isTransitioningRef.current) {
        return;
      }

      // Get audio level
      const hasMetering = recorderState.metering !== undefined && recorderState.metering !== null;
      const currentMeteringLevel = hasMetering ? recorderState.metering : -20;
      const normalizedLevel = Math.max(0, Math.min(1, (currentMeteringLevel + 50) / 50));
      setAudioLevel(normalizedLevel);

      // Constants
      const SPEECH_THRESHOLD_DB = -15;
      const SILENCE_DURATION = 4000; // 4 seconds
      const currentTime = Date.now();

      // Determine if currently speaking
      const isSpeaking = currentMeteringLevel > SPEECH_THRESHOLD_DB;

      console.log(`📊 Phase: ${phaseRef.current}, Speaking: ${isSpeaking}, Level: ${currentMeteringLevel}dB`);

      if (phaseRef.current === 'WAIT_FOR_SPEECH') {
        // PHASE 1: Wait for user to start speaking (NO TIMER)
        if (isSpeaking) {
          console.log('🎤 PHASE 1→2: Speech detected! Transitioning to silence monitoring');
          phaseRef.current = 'MONITOR_SILENCE';
          speechDetectedRef.current = true;
          silenceStartRef.current = null; // Reset silence timer
          setHasUserSpoken(true);
        }
        // No auto-transition in Phase 1 - just wait for speech
      } else {
        // PHASE 2: Monitor for 4 seconds of silence after speech detected
        if (isSpeaking) {
          // Still speaking - reset silence timer
          console.log('🗣️ PHASE 2: Speech continues, resetting silence timer');
          silenceStartRef.current = null;
        } else {
          // Silence detected
          if (silenceStartRef.current === null) {
            console.log('🤫 PHASE 2: Silence started, beginning 4s countdown');
            silenceStartRef.current = currentTime;
          } else {
            const silenceDuration = currentTime - silenceStartRef.current;
            console.log(`⏱️ PHASE 2: Silence duration: ${silenceDuration}ms / ${SILENCE_DURATION}ms`);

            if (silenceDuration >= SILENCE_DURATION) {
              console.log('✅ PHASE 2: 4s silence completed - AUTO-TRANSITIONING');
              isTransitioningRef.current = true;
              finishCurrentQuestion();
            }
          }
        }
      }
    }, 200);

    return () => {
      clearInterval(interval);
    };
  }, [isListening, recorderState.isRecording, isRecording]); // Minimal dependencies - no state variables

  // Update transitioning ref when state changes
  useEffect(() => {
    isTransitioningRef.current = isTransitioning;
  }, [isTransitioning]);

  const finishCurrentQuestion = async () => {
    // Ultra-robust guard - check if this question was already finished
    if (finishedQuestionRef.current === currentQuestion) {
      console.log(`[v7-GUARD] Question ${currentQuestion} already finished, ignoring duplicate call`);
      return;
    }

    console.log(`[v7-GUARD] === FINISHING CURRENT QUESTION ${currentQuestion} ===`);
    finishedQuestionRef.current = currentQuestion; // Mark this question as finished
    setIsTransitioning(true);

    // Immediately stop silence detection to prevent more calls
    setIsListening(false);
    setSilenceStartTime(null);

    // Cleanup: useEffect will auto-cleanup interval when isListening becomes false
    if (silenceTimer) {
      clearTimeout(silenceTimer);
      setSilenceTimer(null);
    }

    // Force stop recording and reset all states
    await stopRecording();

    // Additional cleanup to ensure fresh state for next question
    setIsRecording(false);
    setHasRecording(false);
    setRecordingDuration(0);

    // Reset recorder to clean state for next question
    // Skip recorder reset - causes state corruption
    // await resetRecorderForNextQuestion();

    console.log('Question cleanup complete');

    // Move to next question or finish
    if (currentQuestion < questions.length - 1) {
      setTimeout(() => {
        console.log('=== MOVING TO NEXT QUESTION ===');
        const nextQuestion = currentQuestion + 1;
        setCurrentQuestion(nextQuestion);
        speakQuestion(nextQuestion);
        setIsTransitioning(false); // Reset guard after transition
      }, 2000); // Extended pause to ensure clean state
    } else {
      // Add delay before finishing to ensure question 3 completes properly
      setTimeout(() => {
        finishCheckin();
        setIsTransitioning(false); // Reset guard after finishing
      }, 1000);
    }
  };

  const resetRecorderForNextQuestion = async () => {
    console.log('[RECORDER-RESET] Resetting recorder for next question...');
    try {
      // Comprehensive recorder reset to ensure clean state
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      // Do a quick record/stop cycle to reset recorder state
      try {
        await recorder.record();
        await new Promise(resolve => setTimeout(resolve, 50)); // Wait 50ms
        await recorder.stop();
        console.log('[RECORDER-RESET] Recorder state reset successfully');
      } catch (resetError) {
        console.log('[RECORDER-RESET] State reset failed (might be fine):', resetError.message);
      }

      console.log('[RECORDER-RESET] Recorder reset complete');
    } catch (error) {
      console.log('[RECORDER-RESET] Reset failed (this might be fine):', error.message);
    }
  };

  const finishCheckin = () => {
    const now = new Date();
    const timeString = now.toLocaleTimeString();
    const dateString = now.toLocaleDateString();

    setIsCheckedIn(true);
    setLastCheckinTime(`${dateString} at ${timeString}`);
    setIsInCallMode(false);
    setHasRecording(false);

    Alert.alert(
      'Check-in Complete!',
      `You completed your voice check-in at ${timeString}`,
      [{ text: 'OK' }]
    );
  };

  const handleCheckout = () => {
    setIsCheckedIn(false);
    const now = new Date();
    const timeString = now.toLocaleTimeString();

    Alert.alert(
      'Check-out Successful!',
      `You checked out at ${timeString}`,
      [{ text: 'OK' }]
    );
  };

  const startRecording = async () => {
    try {
      console.log('Starting recording process...');

      // Check permissions first
      if (!permissionGranted) {
        console.log('Requesting permissions...');
        const permission = await Audio.requestPermissionsAsync();
        console.log('Permission result:', permission);
        if (!permission.granted) {
          Alert.alert('Permission Denied', 'Audio recording permission is required for voice check-ins');
          return;
        }
        setPermissionGranted(true);
      }

      // Set audio mode for recording
      console.log('Setting audio mode...');
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      // Check recorder state before starting
      console.log('Recorder state before starting:', recorderState);
      console.log('Recorder object:', recorder);

      // Prepare recorder first
      console.log('Preparing recorder...');
      if (!recorderState.canRecord) {
        console.log('Recorder cannot record, preparing...');
        // For expo-audio, we need to prepare by calling record() which returns the prepared state
      }

      // Start recording using expo-audio API
      console.log('Calling recorder.record()...');
      const result = await recorder.record();
      console.log('Recording started, result:', result);

      // Wait a moment for the state to update
      setTimeout(() => {
        console.log('Recorder state after start:', recorderState);
      }, 500);

      setIsRecording(true);
      console.log('Set isRecording to true');
    } catch (err) {
      console.error('Failed to start recording', err);
      console.error('Error details:', err.message, err.stack);
      Alert.alert('Recording Error', `Failed to start recording: ${err.message || 'Unknown error'}`);
    }
  };

  const stopRecording = async () => {
    console.log('[v4-FIXED] Attempting to stop recording...');
    console.log('Current states:', {
      recorderStateIsRecording: recorderState.isRecording,
      localIsRecording: isRecording
    });

    // Always reset local state first
    setIsRecording(false);

    // Only call recorder.stop() if we're actually recording
    if (!recorderState.isRecording && !isRecording) {
      console.log('No recording in progress to stop');
      return;
    }

    try {
      console.log('Calling recorder.stop()...');
      const result = await recorder.stop();
      console.log('Stop result:', result);

      setHasRecording(true);
      console.log('Recording stopped successfully');
    } catch (err) {
      console.log('Stop call rejected:', err.message);
      // Check if it's just "already stopped" - not a real error
      if (err.message && err.message.includes('has been rejected')) {
        console.log('Recorder was already stopped - this is fine');
      } else {
        console.error('Unexpected stop error:', err);
      }
    }
  };


  const handleDecline = () => {
    // Cleanup all monitoring and timers
    if (monitoringInterval) {
      clearInterval(monitoringInterval);
      setMonitoringInterval(null);
    }
    if (silenceTimer) {
      clearTimeout(silenceTimer);
      setSilenceTimer(null);
    }

    setIsInCallMode(false);
    setIsRecording(false);
    setHasRecording(false);
    setIsAISpeaking(false);
    setIsListening(false);
    setSilenceStartTime(null);

    if (recorderState.isRecording) {
      recorder.stop();
    }

    // Stop any ongoing speech
    Speech.stop();
  };

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      speakQuestion(currentQuestion - 1);
    } else {
      handleDecline(); // Exit if on first question
    }
  };

  if (isInCallMode) {
    return (
      <View style={styles.callContainer}>
        {/* Back Navigation - Figma Style */}
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <ChevronLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>

        {/* Question display with gradient text */}
        <View style={styles.questionContainer}>
          <MaskedView
            style={styles.maskedViewContainer}
            maskElement={
              <Text style={styles.questionTextMask}>{questions[currentQuestion]}</Text>
            }
          >
            <LinearGradient
              colors={['#67C8FF', '#A46AB9']}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={styles.gradientTextFill}
            />
          </MaskedView>
        </View>

        {/* Central Orb - Animated */}
        <View style={styles.orbContainer}>
          <AnimatedOrb
            isAnimating={isAISpeaking || isListening || isRecording}
          />
        </View>

        {/* Next Button - Figma Design */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.nextButton} onPress={finishCurrentQuestion}>
            <Text style={styles.buttonText}>
              {isAISpeaking ? 'AI is speaking...' :
               isListening ? 'Tap to continue' :
               (recorderState.isRecording || isRecording) ? 'Recording...' : 'Next'}
            </Text>
          </TouchableOpacity>
        </View>

        <StatusBar style="light" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {!showIncomingCallModal && (
        <>
          <Text style={styles.title}>Daily Check-in</Text>

          <View style={styles.statusContainer}>
            <Text style={styles.statusText}>
              Status: {isCheckedIn ? 'Checked In' : 'Not Checked In'}
            </Text>
            {lastCheckinTime && (
              <Text style={styles.timeText}>
                Last check-in: {lastCheckinTime}
              </Text>
            )}
          </View>

          {isCheckedIn && (
            <TouchableOpacity
              style={[styles.button, styles.checkoutButton]}
              onPress={handleCheckout}
            >
              <Text style={styles.buttonText}>Check Out</Text>
            </TouchableOpacity>
          )}
        </>
      )}

      <StatusBar style="auto" />

      {/* iOS-style Incoming Call Modal */}
      {showIncomingCallModal && (
        <View style={styles.incomingCallOverlay}>
          <View style={styles.incomingCallModal}>
            {/* Horizontal Layout: Icon - Text - Button */}
            <View style={styles.horizontalLayout}>
              {/* Profile Icon */}
              <View style={styles.profileImageContainer}>
                <Text style={styles.profileImagePlaceholder}>✓</Text>
              </View>

              {/* Text Section */}
              <View style={styles.textSection}>
                <Text style={styles.callerNameText}>Check-in</Text>
                <Text style={styles.mobileText}>mobile</Text>
              </View>

              {/* Answer Button */}
              <TouchableOpacity
                style={styles.answerButton}
                onPress={() => {
                  setShowIncomingCallModal(false);
                  handleCheckin();
                }}
              >
                <Phone
                  size={24}
                  color="white"
                  strokeWidth={2.5}
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 40,
    color: '#333',
  },
  statusContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  statusText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    color: '#555',
  },
  timeText: {
    fontSize: 14,
    color: '#777',
  },
  button: {
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 25,
    elevation: 3,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  checkinButton: {
    backgroundColor: '#4CAF50',
  },
  checkoutButton: {
    backgroundColor: '#f44336',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  // Modern call interface styles
  callContainer: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerContent: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  callerName: {
    fontSize: 24,
    fontWeight: '600',
    color: 'white',
    marginBottom: 4,
  },
  status: {
    fontSize: 14,
    color: '#8E8E93',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    gap: 8,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  progressDotActive: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#4CAF50',
  },
  progressDotCompleted: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  questionContainer: {
    position: 'absolute',
    left: 44,
    top: 140,
    width: 291,
    alignItems: 'flex-start',
  },
  questionNumber: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  questionText: {
    fontSize: 24,
    color: 'white',
    textAlign: 'center',
    lineHeight: 32,
    fontWeight: '400',
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
  maskedViewContainer: {
    height: 66,
    width: 291,
  },
  questionTextMask: {
    fontSize: 30,
    lineHeight: 33,
    fontWeight: '400',
    textAlign: 'left',
    backgroundColor: 'transparent',
    color: 'black', // This acts as the mask
  },
  gradientTextFill: {
    height: 66,
    width: 291,
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
    position: 'absolute',
    left: 27,
    bottom: 40,
    width: 327,
    height: 42,
  },
  nextButton: {
    width: 327,
    height: 42,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(103, 200, 255, 0.45)',
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '400',
    letterSpacing: 0.03 * 16,
    textAlign: 'center',
    lineHeight: 16,
  },
  visualizerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  visualizer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 60,
    gap: 3,
  },
  visualizerBar: {
    width: 4,
    borderRadius: 2,
    backgroundColor: 'white',
  },
  durationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    gap: 6,
  },
  durationText: {
    color: '#8E8E93',
    fontSize: 14,
  },
  recordingComplete: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    borderRadius: 16,
  },
  recordingCompleteText: {
    color: '#4CAF50',
    fontSize: 14,
  },
  tapToRecordText: {
    color: '#8E8E93',
    fontSize: 14,
  },
  recordingIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FF3B30',
    marginBottom: 8,
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
    gap: 20,
  },
  recordButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  recordingButton: {
    backgroundColor: '#FF3B30',
  },
  nextButton: {
    width: 327,
    height: 42,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(103, 200, 255, 0.45)',
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
  },
  nextText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  closeText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  clockIcon: {
    fontSize: 14,
    color: '#8E8E93',
  },
  micIcon: {
    fontSize: 24,
  },
  arrowIcon: {
    fontSize: 16,
    color: 'white',
    fontWeight: 'bold',
  },
  aiSpeakingContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  aiSpeakingText: {
    color: '#4CAF50',
    fontSize: 16,
    marginBottom: 16,
  },
  speakingAnimation: {
    flexDirection: 'row',
    gap: 8,
  },
  speakingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4CAF50',
  },
  listeningContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  listeningText: {
    color: '#FFD700',
    fontSize: 16,
    marginBottom: 8,
  },
  listeningSubtext: {
    color: '#8E8E93',
    fontSize: 12,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  conversationStatus: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  conversationText: {
    color: '#8E8E93',
    fontSize: 14,
    textAlign: 'center',
  },
  continueButton: {
    marginTop: 16,
    paddingVertical: 8,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  continueButtonText: {
    color: '#8E8E93',
    fontSize: 12,
  },
  debugText: {
    color: '#555',
    fontSize: 10,
    marginTop: 4,
    textAlign: 'center',
  },
  recordingVisualizerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },

  // iOS-style Incoming Call Modal Styles
  incomingCallOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 60,
  },
  incomingCallModal: {
    backgroundColor: 'rgba(74, 74, 74, 0.95)',
    borderRadius: 16,
    width: '92%',
    maxWidth: 380,
    paddingVertical: 16,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 12,
  },
  horizontalLayout: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  profileImageContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  profileImagePlaceholder: {
    color: 'white',
    fontSize: 20,
    fontWeight: '600',
  },
  textSection: {
    flex: 1,
    justifyContent: 'center',
  },
  callerNameText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 2,
  },
  mobileText: {
    color: '#CCCCCC',
    fontSize: 14,
    fontWeight: '400',
  },
  answerButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#34C759',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
});