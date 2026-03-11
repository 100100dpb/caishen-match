import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GodId } from '../constants/gods';
import { GodScore } from '../lib/godMatcher';

export interface UserProfile {
  godRanking: GodScore[];         // Top 5 matched gods from quiz
  favoredElement: string;         // e.g. 'fire', 'water'
  primaryDesire: string;          // e.g. '正财', '偏财'
  notificationsEnabled: boolean;
  quizCompleted: boolean;
  lastQuizDate: string | null;
  birthYear?: number;
  birthMonth?: number;
  birthDay?: number;
}

interface UserStore {
  profile: UserProfile;
  setGodRanking: (ranking: GodScore[]) => void;
  setFavoredElement: (element: string) => void;
  setPrimaryDesire: (desire: string) => void;
  setNotificationsEnabled: (enabled: boolean) => void;
  completeQuiz: (ranking: GodScore[], element: string, desire: string) => void;
  setBirthdate: (year: number, month: number, day: number) => void;
  reset: () => void;
}

const defaultProfile: UserProfile = {
  godRanking: [],
  favoredElement: 'earth',
  primaryDesire: '财富',
  notificationsEnabled: false,
  quizCompleted: false,
  lastQuizDate: null,
};

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      profile: defaultProfile,

      setGodRanking: (ranking) =>
        set((s) => ({ profile: { ...s.profile, godRanking: ranking } })),

      setFavoredElement: (element) =>
        set((s) => ({ profile: { ...s.profile, favoredElement: element } })),

      setPrimaryDesire: (desire) =>
        set((s) => ({ profile: { ...s.profile, primaryDesire: desire } })),

      setNotificationsEnabled: (enabled) =>
        set((s) => ({ profile: { ...s.profile, notificationsEnabled: enabled } })),

      completeQuiz: (ranking, element, desire) =>
        set((s) => ({
          profile: {
            ...s.profile,
            godRanking: ranking,
            favoredElement: element,
            primaryDesire: desire,
            quizCompleted: true,
            lastQuizDate: new Date().toISOString(),
          },
        })),

      setBirthdate: (year, month, day) =>
        set((s) => ({
          profile: { ...s.profile, birthYear: year, birthMonth: month, birthDay: day },
        })),

      reset: () => set({ profile: defaultProfile }),
    }),
    {
      name: 'caishen-user-profile',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
