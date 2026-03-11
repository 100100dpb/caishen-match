import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useState, useRef } from 'react';
import { QUIZ_QUESTIONS } from '../../constants/quiz';
import { calculateMatch } from '../../lib/godMatcher';
import { useUserStore } from '../../store/userStore';

const { width } = Dimensions.get('window');

export default function QuizScreen() {
  const router = useRouter();
  const { completeQuiz } = useUserStore();
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const progressAnim = useRef(new Animated.Value(0)).current;

  const question = QUIZ_QUESTIONS[currentQ];
  const total = QUIZ_QUESTIONS.length;
  const progress = (currentQ / total) * 100;

  function selectOption(optIdx: number) {
    const newAnswers = { ...answers, [currentQ]: optIdx };
    setAnswers(newAnswers);

    Animated.timing(progressAnim, {
      toValue: ((currentQ + 1) / total) * 100,
      duration: 300,
      useNativeDriver: false,
    }).start();

    if (currentQ < total - 1) {
      setTimeout(() => setCurrentQ(q => q + 1), 200);
    } else {
      // All done — calculate result
      const result = calculateMatch(newAnswers);
      completeQuiz(result.topGods, result.favoredElement, result.primaryDesire);
      router.replace('/(tabs)/result');
    }
  }

  function goBack() {
    if (currentQ > 0) {
      setCurrentQ(q => q - 1);
      Animated.timing(progressAnim, {
        toValue: ((currentQ - 1) / total) * 100,
        duration: 200,
        useNativeDriver: false,
      }).start();
    }
  }

  return (
    <View style={styles.container}>
      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBg}>
          <Animated.View
            style={[
              styles.progressFill,
              {
                width: progressAnim.interpolate({
                  inputRange: [0, 100],
                  outputRange: ['0%', '100%'],
                }),
              },
            ]}
          />
        </View>
        <Text style={styles.progressText}>
          {currentQ + 1} / {total}
        </Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Question */}
        <View style={styles.questionBlock}>
          <Text style={styles.questionNum}>第 {currentQ + 1} 题</Text>
          <Text style={styles.questionTitle}>{question.title}</Text>
          {question.subtitle && (
            <Text style={styles.questionSubtitle}>{question.subtitle}</Text>
          )}
        </View>

        {/* Options */}
        <View style={styles.optionsBlock}>
          {question.options.map((opt, idx) => {
            const selected = answers[currentQ] === idx;
            return (
              <TouchableOpacity
                key={idx}
                style={[styles.option, selected && styles.optionSelected]}
                onPress={() => selectOption(idx)}
                activeOpacity={0.75}
              >
                <View style={[styles.optionDot, selected && styles.optionDotSelected]} />
                <Text style={[styles.optionText, selected && styles.optionTextSelected]}>
                  {opt.text}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        {currentQ > 0 ? (
          <TouchableOpacity style={styles.backBtn} onPress={goBack}>
            <Text style={styles.backBtnText}>上一题</Text>
          </TouchableOpacity>
        ) : (
          <View />
        )}
        <Text style={styles.footerHint}>点击选项自动下一题</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFEF8' },

  progressContainer: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressBg: {
    flex: 1,
    height: 6,
    backgroundColor: '#F0E8D0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: '#C9A84C', borderRadius: 3 },
  progressText: { fontSize: 12, color: '#8B6914', width: 36, textAlign: 'right' },

  scroll: { flex: 1 },
  scrollContent: { padding: 24, paddingTop: 8 },

  questionBlock: { marginBottom: 32 },
  questionNum: { fontSize: 13, color: '#C9A84C', fontWeight: '600', marginBottom: 8 },
  questionTitle: { fontSize: 24, fontWeight: '700', color: '#2C1810', lineHeight: 32 },
  questionSubtitle: { fontSize: 14, color: '#8B6914', marginTop: 6 },

  optionsBlock: { gap: 12 },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#E8DFC8',
    borderRadius: 14,
    padding: 16,
    gap: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
  },
  optionSelected: {
    borderColor: '#C9A84C',
    backgroundColor: '#FFF8E7',
  },
  optionDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#D0C0A0',
  },
  optionDotSelected: {
    borderColor: '#C9A84C',
    backgroundColor: '#C9A84C',
  },
  optionText: { flex: 1, fontSize: 15, color: '#444', lineHeight: 22 },
  optionTextSelected: { color: '#8B4513', fontWeight: '600' },

  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 32,
    paddingTop: 12,
  },
  backBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#C9A84C',
  },
  backBtnText: { color: '#C9A84C', fontSize: 14 },
  footerHint: { fontSize: 12, color: '#B8A88A' },
});
