import React, { useState } from 'react';
import { View, Alert } from 'react-native';
import { Question1 } from './components/Question1';

export default function TestQuestion1() {
  const [currentQuestion, setCurrentQuestion] = useState(0);

  const questions = [
    "What was the best thing about today?",
    "How are you feeling today?",
    "What are your main goals for today?",
    "Is there anything you need help with?"
  ];

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      Alert.alert('Complete', 'You have finished all questions!');
    }
  };

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    } else {
      Alert.alert('Back', 'This is the first question');
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <Question1
        questionText={questions[currentQuestion]}
        onNext={handleNext}
        onBack={handleBack}
      />
    </View>
  );
}