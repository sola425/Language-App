export interface TriviaQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  emoji: string;
  vocabulary: { english: string; french: string }[];
  feynmanPrompt: { concept: string; promptText: string };
}

export interface Unit {
  title: string;
  lessons: Lesson[];
}

export type GameState = 'not-started' | 'playing' | 'finished';

// Updated screen type and added game types
export type Screen = 'learn' | 'practice' | 'games' | 'profile';

export interface Flashcard {
  french: string;
  english: string;
}

export interface FlashcardGame {
  id: string;
  title: string;
  description: string;
  cards: Flashcard[];
}

export type QuestionType = 'multiple-choice-fr-en' | 'multiple-choice-en-fr' | 'listening';

export interface Question {
  type: QuestionType;
  prompt: string;
  options: string[];
  correctAnswer: string;
  audio?: string; // French word to play for listening questions
}

export interface AppContextType {
  xp: number;
  hearts: number;
  streak: number;
  completedLessons: string[];
  addXp: (amount: number) => void;
  setHearts: (value: number) => void;
  loseHeart: () => void;
  completeLesson: (lessonId: string) => void;
}
