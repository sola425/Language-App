
import { Unit, FlashcardGame } from './types';

export const UNITS: Unit[] = [
  {
    title: 'Part I: Getting Started',
    lessons: [
      {
        id: 'greetings-pronunciation',
        title: 'Greetings & Pronunciation',
        description: 'Learn basic greetings and the sounds of French.',
        emoji: '👋',
        vocabulary: [
          { english: 'Hello', french: 'Bonjour' },
          { english: 'Good evening', french: 'Bonsoir' },
          { english: 'Goodbye', french: 'Au revoir' },
          { english: 'How are you?', french: 'Comment ça va?' },
          { english: 'My name is...', french: 'Je m\'appelle...' },
          { english: 'Yes / No', french: 'Oui / Non' },
          { english: 'Thank you', french: 'Merci' },
        ],
        feynmanPrompt: {
          concept: 'Liaison in French Pronunciation',
          promptText: 'Explain to Chloé what a "liaison" is in French. For example, in "vous êtes" (you are). When does it happen?',
        },
      },
      {
        id: 'grammar-basics',
        title: 'Grammar Basics',
        description: 'Understand nouns, articles, and gender.',
        emoji: '📝',
        vocabulary: [
          { english: 'The boy', french: 'Le garçon' },
          { english: 'The girl', french: 'La fille' },
          { english: 'The water', french: 'L\'eau' },
          { english: 'A book', french: 'Un livre' },
          { english: 'A house', french: 'Une maison' },
          { english: 'The students', french: 'Les étudiants' },
        ],
        feynmanPrompt: {
          concept: 'Gender of Nouns',
          promptText: 'In your own words, explain to Chloé why some French nouns use "le" or "un" and others use "la" or "une".',
        },
      },
      {
        id: 'numbers-time',
        title: 'Numbers & Time',
        description: 'Learn to count and ask for the time.',
        emoji: '🕒',
        vocabulary: [
          { english: 'One, Two, Three', french: 'Un, Deux, Trois' },
          { english: 'Ten', french: 'Dix' },
          { english: 'Twenty', french: 'Vingt' },
          { english: 'What time is it?', french: 'Quelle heure est-il?' },
          { english: 'It is 3 o\'clock', french: 'Il est trois heures' },
          { english: 'Today', french: 'Aujourd\'hui' },
        ],
        feynmanPrompt: {
          concept: 'Telling Time',
          promptText: 'Explain to Chloé the basic way to tell time in French. For example, how would you say "It is 5 o\'clock"?',
        },
      },
    ],
  },
  {
    title: 'Part II: French in Action',
    lessons: [
      {
        id: 'food-dining',
        title: 'Food & Dining',
        description: 'Essential vocabulary for eating out.',
        emoji: '🥐',
        vocabulary: [
          { english: 'Bread', french: 'Le pain' },
          { english: 'Water', french: 'L\'eau' },
          { english: 'Coffee', french: 'Le café' },
          { english: 'I would like...', french: 'Je voudrais...' },
          { english: 'The bill, please', french: 'L\'addition, s\'il vous plaît' },
          { english: 'Delicious', french: 'Délicieux' },
        ],
        feynmanPrompt: {
          concept: 'Partitive Articles (du, de la)',
          promptText: 'Explain to Chloé why you use "du", "de la", "de l\'" when talking about having some food (like "du pain"). Give an example.',
        },
      },
      {
        id: 'small-talk',
        title: 'Small Talk',
        description: 'Learn polite expressions and basic questions.',
        emoji: '💬',
        vocabulary: [
          { english: 'Please', french: 'S\'il vous plaît' },
          { english: 'Excuse me', french: 'Excusez-moi' },
          { english: 'What is your name?', french: 'Comment vous appelez-vous?' },
          { english: 'Where are you from?', french: 'D\'où venez-vous?' },
          { english: 'I am from...', french: 'Je viens de...' },
          { english: 'Pleased to meet you', french: 'Enchanté(e)' },
        ],
        feynmanPrompt: {
          concept: 'Formal vs. Informal "You" (tu/vous)',
          promptText: 'In your own words, explain the difference between "tu" and "vous" to Chloé. When would you use each one?',
        },
      },
      {
        id: 'directions',
        title: 'Asking for Directions',
        description: 'Navigate your way around a French-speaking city.',
        emoji: '🗺️',
        vocabulary: [
          { english: 'Where is...?', french: 'Où est...?' },
          { english: 'The train station', french: 'La gare' },
          { english: 'To the left', french: 'À gauche' },
          { english: 'To the right', french: 'À droite' },
          { english: 'Straight ahead', french: 'Tout droit' },
          { english: 'The metro', french: 'Le métro' },
        ],
        feynmanPrompt: {
          concept: 'Asking for Directions',
          promptText: 'In simple terms, tell Chloé how you would ask for directions to the Louvre museum. What key phrases would you use?',
        },
      },
    ],
  },
];

export const FLASHCARD_GAMES: FlashcardGame[] = [
  {
    id: 'greetings-game',
    title: 'Greetings Flashcards',
    description: 'Practice common greetings and polite phrases.',
    cards: [
      { french: 'Bonjour', english: 'Hello' },
      { french: 'Bonsoir', english: 'Good evening' },
      { french: 'Au revoir', english: 'Goodbye' },
      { french: 'Comment ça va?', english: 'How are you?' },
      { french: 'Merci', english: 'Thank you' },
      { french: 'Oui / Non', english: 'Yes / No' },
      { french: 'S\'il vous plaît', english: 'Please' },
      { french: 'Excusez-moi', english: 'Excuse me' },
    ]
  },
  {
    id: 'numbers-game',
    title: 'Numbers 1-10',
    description: 'Test your knowledge of the first ten numbers.',
    cards: [
      { french: 'Un', english: 'One' },
      { french: 'Deux', english: 'Two' },
      { french: 'Trois', english: 'Three' },
      { french: 'Quatre', english: 'Four' },
      { french: 'Cinq', english: 'Five' },
      { french: 'Six', english: 'Six' },
      { french: 'Sept', english: 'Seven' },
      { french: 'Huit', english: 'Eight' },
      { french: 'Neuf', english: 'Nine' },
      { french: 'Dix', english: 'Ten' },
    ]
  }
];
