import { act, renderHook } from '@testing-library/react-native';
import { useUserStore } from '../store/userStore';
import { GodScore } from '../lib/godMatcher';
import { GODS } from '../constants/gods';

// AsyncStorage is mocked globally in jest.setup.js

const mockRanking: GodScore[] = [
  { godId: 'zhao', god: GODS.zhao, score: 10, matchPercent: 100 },
  { godId: 'guan', god: GODS.guan, score: 7, matchPercent: 70 },
];

describe('userStore', () => {
  beforeEach(() => {
    // Reset store state between tests
    const { result } = renderHook(() => useUserStore());
    act(() => { result.current.reset(); });
  });

  it('starts with quizCompleted = false', () => {
    const { result } = renderHook(() => useUserStore());
    expect(result.current.profile.quizCompleted).toBe(false);
  });

  it('completeQuiz sets ranking, element, desire, and quizCompleted', () => {
    const { result } = renderHook(() => useUserStore());

    act(() => {
      result.current.completeQuiz(mockRanking, 'fire', '正财');
    });

    expect(result.current.profile.quizCompleted).toBe(true);
    expect(result.current.profile.godRanking).toHaveLength(2);
    expect(result.current.profile.godRanking[0].godId).toBe('zhao');
    expect(result.current.profile.favoredElement).toBe('fire');
    expect(result.current.profile.primaryDesire).toBe('正财');
    expect(result.current.profile.lastQuizDate).not.toBeNull();
  });

  it('setNotificationsEnabled updates the flag', () => {
    const { result } = renderHook(() => useUserStore());

    act(() => { result.current.setNotificationsEnabled(true); });
    expect(result.current.profile.notificationsEnabled).toBe(true);

    act(() => { result.current.setNotificationsEnabled(false); });
    expect(result.current.profile.notificationsEnabled).toBe(false);
  });

  it('reset clears all profile data', () => {
    const { result } = renderHook(() => useUserStore());

    act(() => {
      result.current.completeQuiz(mockRanking, 'water', '偏财');
    });
    expect(result.current.profile.quizCompleted).toBe(true);

    act(() => { result.current.reset(); });
    expect(result.current.profile.quizCompleted).toBe(false);
    expect(result.current.profile.godRanking).toHaveLength(0);
  });

  it('setBirthdate stores year/month/day', () => {
    const { result } = renderHook(() => useUserStore());

    act(() => { result.current.setBirthdate(1990, 8, 15); });
    expect(result.current.profile.birthYear).toBe(1990);
    expect(result.current.profile.birthMonth).toBe(8);
    expect(result.current.profile.birthDay).toBe(15);
  });
});
