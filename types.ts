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
  vocabulary: { english: string; french:string; phonetic?: string }[];
  feynmanPrompt: { concept: string; promptText: string };
}

export interface Unit {
  title: string;
  lessons: Lesson[];
}

export type GameState = 'not-started' | 'playing' | 'finished';

// Updated screen type and added game types
export type Screen = 'learn' | 'practice' | 'games' | 'review' | 'profile';

export interface Flashcard {
  french: string;
  english: string;
}

export interface FlashcardGame {
  id: string;
  title: string;
  description: string;
  type: 'flashcards';
  cards: Flashcard[];
}

export interface MatchingPairGame {
  id: string;
  title: string;
  description: string;
  type: 'matching';
  pairs: { french: string; english: string }[];
}

// --- Boutique Dash Game Types ---
export interface BoutiqueItem {
  id: string;
  name: string;
  icon: string;
}

export interface CustomerOrder {
  id: string;
  frenchAudio: string;
  items: { itemId: string; quantity: number }[];
}

export interface BoutiqueDashLevel {
  id: string;
  level: number;
  title: string;
  storeType: 'Bakery' | 'Market';
  possibleItems: BoutiqueItem[];
  customerOrders: CustomerOrder[];
}

export interface BoutiqueDashGame {
  id: string;
  type: 'boutique-dash';
  level: BoutiqueDashLevel;
}

// --- Sentence Snap Game Types ---
export type GrammaticalSlot = 'Subject' | 'Verb' | 'Object' | 'Adjective' | 'Conjunction';

export interface SentenceSnapChunk {
  word: string;
  slot: GrammaticalSlot;
}

export interface SentenceSnapLevel {
  id: string;
  level: number;
  englishHint: string;
  slots: GrammaticalSlot[];
  chunks: SentenceSnapChunk[];
}

export interface SentenceSnapGame {
    id: string;
    type: 'sentence-snap';
    level: SentenceSnapLevel;
}

// --- Game Hub Types ---
export interface GameInfo {
  id: string;
  title: string;
  description: string;
  type: 'boutique-dash' | 'sentence-snap';
  illustration: string;
}


export type Game = FlashcardGame | MatchingPairGame | BoutiqueDashGame | SentenceSnapGame;

export type QuestionType = 'multiple-choice-fr-en' | 'multiple-choice-en-fr' | 'listening' | 'fill-in-the-blank';
export type LessonStage = 'study' | 'quiz' | 'feynman' | 'complete' | 'failed';

export interface Question {
  type: QuestionType;
  prompt: string | [string, string]; // e.g., "What is 'Hello'?" or ["Je ____ un garçon.", "suis"]
  options: string[];
  correctAnswer: string;
  audio?: string; // French word to play for listening questions
}

// A single step in the new "Guided Mode"
export interface ScenarioWalkthroughStep {
  speaker: 'user' | 'model'; // Who is talking
  line: {
    french: string;
    english: string;
  };
}

// A "word typing" challenge
export interface TypingChallenge {
  type: 'typing';
  english: string; // e.g., "I would like a coffee"
  french: string;  // e.g., "Je voudrais un café"
}

// A "pronunciation" challenge
export interface PronunciationChallenge {
  type: 'pronunciation';
  french: string;
  english: string;
  phonetic: string; // e.g., "/ʒə vu.dʁɛ ɛ̃ ka.fe/"
}

// A union type for the new warmup
export type PracticeWarmupStep = TypingChallenge | PronunciationChallenge;


// The new, upgraded Scenario definition
export interface PracticeScenario {
  id: string;
  title: string;
  description: string;
  icon: string;
  systemPrompt: string; // The specific system prompt for this scenario
  media: {
    backgroundImage: string; // e.g., '/images/scenarios/cafe.jpg'
    ambientSound: string;  // e.g., '/audio/ambience/cafe-chatter.mp3'
  };
  // The new "Guided Mode" content
  walkthrough: ScenarioWalkthroughStep[];
  // The new "Warm-Up" challenges
  warmup: PracticeWarmupStep[];
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
