import { Unit, FlashcardGame, PracticeScenario, MatchingPairGame } from './types';

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
          { english: 'Hello', french: 'Bonjour', phonetic: '/bɔ̃.ʒuʁ/' },
          { english: 'Good evening', french: 'Bonsoir', phonetic: '/bɔ̃.swaʁ/' },
          { english: 'Goodbye', french: 'Au revoir', phonetic: '/o ʁə.vwaʁ/' },
          { english: 'How are you?', french: 'Comment ça va?', phonetic: '/kɔ.mɑ̃ sa va/' },
          { english: 'My name is...', french: 'Je m\'appelle...', phonetic: '/ʒə ma.pɛl/' },
          { english: 'Yes / No', french: 'Oui / Non', phonetic: '/wi / nɔ̃/' },
          { english: 'Thank you', french: 'Merci', phonetic: '/mɛʁ.si/' },
          { english: 'Please', french: 'S\'il vous plaît', phonetic: '/sil vu plɛ/' },
          { english: 'Excuse me', french: 'Excusez-moi', phonetic: '/ɛk.sky.ze mwa/' },
          { english: 'Pleased to meet you', french: 'Enchanté(e)', phonetic: '/ɑ̃.ʃɑ̃.te/' },
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
          { english: 'I am', french: 'Je suis' },
          { english: 'You are (informal)', french: 'Tu es' },
          { english: 'He is', french: 'Il est' },
          { english: 'She is', french: 'Elle est' },
        ],
        feynmanPrompt: {
          concept: 'Gender of Nouns',
          promptText: 'In your own words, explain to Chloé why some French nouns use "le" or "un" and others use "la" or "une".',
        },
      },
      {
        id: 'numbers-time-basic',
        title: 'Numbers & Time',
        description: 'Learn to count and ask for the time.',
        emoji: '🕒',
        vocabulary: [
          { english: 'One, Two, Three', french: 'Un, Deux, Trois' },
          { english: 'Four, Five, Six', french: 'Quatre, Cinq, Six' },
          { english: 'Seven, Eight, Nine, Ten', french: 'Sept, Huit, Neuf, Dix' },
          { english: 'Twenty', french: 'Vingt' },
          { english: 'What time is it?', french: 'Quelle heure est-il?' },
          { english: 'It is 3 o\'clock', french: 'Il est trois heures' },
          { english: 'Today', french: 'Aujourd\'hui' },
          { english: 'Yesterday', french: 'Hier' },
          { english: 'Tomorrow', french: 'Demain' },
          { english: 'Minute', french: 'La minute' },
          { english: 'Hour', french: 'L\'heure' },
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
          { english: 'Wine', french: 'Le vin' },
          { english: 'Cheese', french: 'Le fromage' },
          { english: 'I would like...', french: 'Je voudrais...' },
          { english: 'The bill, please', french: 'L\'addition, s\'il vous plaît' },
          { english: 'Delicious', french: 'Délicieux' },
          { english: 'A table for two', french: 'Une table pour deux' },
          { english: 'The menu', french: 'La carte' },
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
          { english: 'What is your name?', french: 'Comment vous appelez-vous?' },
          { english: 'Where are you from?', french: 'D\'où venez-vous?' },
          { english: 'I am from...', french: 'Je viens de...' },
          { english: 'How old are you?', french: 'Quel âge avez-vous?' },
          { english: 'I am ... years old', french: 'J\'ai ... ans' },
          { english: 'What do you do for a living?', french: 'Qu\'est-ce que vous faites dans la vie?' },
          { english: 'I am a student', french: 'Je suis étudiant(e)' },
          { english: 'It\'s nice weather', french: 'Il fait beau' },
          { english: 'It\'s cold', french: 'Il fait froid' },
          { english: 'See you soon', french: 'À bientôt' },
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
          { english: 'The museum', french: 'Le musée' },
          { english: 'The toilets', french: 'Les toilettes' },
          { english: 'To the left', french: 'À gauche' },
          { english: 'To the right', french: 'À droite' },
          { english: 'Straight ahead', french: 'Tout droit' },
          { english: 'The metro', french: 'Le métro' },
          { english: 'Nearby', french: 'Près d\'ici' },
          { english: 'Far from here', french: 'Loin d\'ici' },
          { english: 'I am lost', french: 'Je suis perdu(e)' },
        ],
        feynmanPrompt: {
          concept: 'Asking for Directions',
          promptText: 'In simple terms, tell Chloé how you would ask for directions to the Louvre museum. What key phrases would you use?',
        },
      },
    ],
  },
  {
    title: 'Part III: Daily Life',
    lessons: [
        {
            id: 'daily-routines',
            title: 'Daily Routines',
            description: 'Talk about your everyday activities.',
            emoji: '☀️',
            vocabulary: [
                { english: 'To wake up', french: 'Se réveiller' },
                { english: 'To get up', french: 'Se lever' },
                { english: 'To wash', french: 'Se laver' },
                { english: 'To get dressed', french: 'S\'habiller' },
                { english: 'To eat breakfast', french: 'Prendre le petit-déjeuner' },
                { english: 'To go to work', french: 'Aller au travail' },
                { english: 'To have lunch', french: 'Déjeuner' },
                { english: 'To come home', french: 'Rentrer à la maison' },
                { english: 'To have dinner', french: 'Dîner' },
                { english: 'To go to bed', french: 'Se coucher' },
                { english: 'In the morning', french: 'Le matin' },
                { english: 'In the evening', french: 'Le soir' },
            ],
            feynmanPrompt: {
                concept: 'Reflexive Verbs',
                promptText: 'Explain to Chloé what makes a verb "reflexive" in French (like "se laver"). What does the "se" part mean?',
            },
        },
        {
            id: 'family-friends',
            title: 'Family & Friends',
            description: 'Describe the important people in your life.',
            emoji: '👨‍👩‍👧‍👦',
            vocabulary: [
                { english: 'The family', french: 'La famille' },
                { english: 'Mother / Father', french: 'La mère / Le père' },
                { english: 'Sister / Brother', french: 'La sœur / Le frère' },
                { english: 'Daughter / Son', french: 'La fille / Le fils' },
                { english: 'A friend (female/male)', french: 'Une amie / Un ami' },
                { english: 'My husband', french: 'Mon mari' },
                { english: 'My wife', french: 'Ma femme' },
                { english: 'The children', french: 'Les enfants' },
                { english: 'The parents', french: 'Les parents' },
                { english: 'I have...', french: 'J\'ai...' },
                { english: 'This is...', french: 'C\'est...' },
            ],
            feynmanPrompt: {
                concept: 'Possessive Adjectives (mon, ma, mes)',
                promptText: 'Explain to Chloé the difference between "mon", "ma", and "mes". Why do you say "mon ami" but "ma mère"?',
            },
        },
    ],
  },
  {
    title: 'Part IV: Travel Essentials',
    lessons: [
        {
            id: 'at-the-airport',
            title: 'At the Airport',
            description: 'Navigate the airport with confidence.',
            emoji: '✈️',
            vocabulary: [
                { english: 'The airport', french: 'L\'aéroport' },
                { english: 'A flight', french: 'Un vol' },
                { english: 'A ticket', french: 'Un billet' },
                { english: 'Passport', french: 'Le passeport' },
                { english: 'Baggage', french: 'Les bagages' },
                { english: 'The gate', french: 'La porte d\'embarquement' },
                { english: 'To check in', french: 'Enregistrer' },
                { english: 'Security check', french: 'Le contrôle de sécurité' },
                { english: 'The plane', french: 'L\'avion' },
                { english: 'To depart', french: 'Partir' },
                { english: 'To arrive', french: 'Arriver' },
                { english: 'Where is the gate...?', french: 'Où est la porte...?' },
            ],
            feynmanPrompt: {
                concept: 'Asking "Where is...?"',
                promptText: 'You need to find Gate 22B. Explain to Chloé exactly how you would ask an airport employee for directions.',
            },
        },
        {
            id: 'at-the-hotel',
            title: 'At the Hotel',
            description: 'Check in and get settled in your room.',
            emoji: '🏨',
            vocabulary: [
                { english: 'A hotel', french: 'Un hôtel' },
                { english: 'A reservation', french: 'Une réservation' },
                { english: 'I have a reservation', french: 'J\'ai une réservation' },
                { english: 'A room', french: 'Une chambre' },
                { english: 'The key', french: 'La clé' },
                { english: 'The lift / elevator', french: 'L\'ascenseur' },
                { english: 'For one night', french: 'Pour une nuit' },
                { english: 'Breakfast', french: 'Le petit-déjeuner' },
                { english: 'What time is breakfast?', french: 'À quelle heure est le petit-déjeuner?' },
                { english: 'The password for the Wi-Fi', french: 'Le mot de passe pour le Wi-Fi' },
                { english: 'To pay', french: 'Payer' },
            ],
            feynmanPrompt: {
                concept: 'Checking In',
                promptText: 'In your own words, explain to Chloé the 2-3 most important sentences you need to know to check into a hotel in French.',
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
    type: 'flashcards',
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
    type: 'flashcards',
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
  },
  {
    id: 'food-game',
    title: 'Food & Dining',
    description: 'Review essential vocabulary for eating out.',
    type: 'flashcards',
    cards: [
      { french: 'Le pain', english: 'Bread' },
      { french: 'L\'eau', english: 'Water' },
      { french: 'Le café', english: 'Coffee' },
      { french: 'Le vin', english: 'Wine' },
      { french: 'Le fromage', english: 'Cheese' },
      { french: 'Je voudrais...', english: 'I would like...' },
      { french: 'L\'addition, s\'il vous plaît', english: 'The bill, please' },
      { french: 'La carte', english: 'The menu' },
    ]
  },
  {
    id: 'travel-game',
    title: 'Travel 101',
    description: 'Practice key phrases for traveling.',
    type: 'flashcards',
    cards: [
      { french: 'L\'aéroport', english: 'The airport' },
      { french: 'Un vol', english: 'A flight' },
      { french: 'Le passeport', english: 'Passport' },
      { french: 'La gare', english: 'The train station' },
      { french: 'Un hôtel', english: 'A hotel' },
      { french: 'Une réservation', english: 'A reservation' },
      { french: 'La clé', english: 'The key' },
      { french: 'Où est...?', english: 'Where is...?' },
    ]
  }
];

export const MATCHING_GAMES: MatchingPairGame[] = [
  {
    id: 'basics-matching',
    title: 'Basics Matching',
    description: 'Match the French words to their English translation.',
    type: 'matching',
    pairs: [
        { french: 'Le garçon', english: 'The boy' },
        { french: 'La fille', english: 'The girl' },
        { french: 'Un livre', english: 'A book' },
        { french: 'Une maison', english: 'A house' },
        { french: 'Je suis', english: 'I am' },
        { french: 'Merci', english: 'Thank you' },
    ],
  }
];

export const PRACTICE_SCENARIOS: PracticeScenario[] = [
    { 
        id: 'cafe', 
        title: 'At a Café', 
        prompt: 'You are at a French café. Your goal is to successfully order a coffee and a croissant. Start by greeting the user who is playing the role of the barista.',
        emoji: '☕'
    },
    { 
        id: 'intro', 
        title: 'Meeting a Friend', 
        prompt: 'You are meeting a new person for the time at a casual party. Your goal is to ask their name, where they are from, and tell them your name. Start by saying "Bonjour!".',
        emoji: '🤝'
    },
    { 
        id: 'directions', 
        title: 'Asking for Directions', 
        prompt: 'You are a tourist in Paris and you are lost. Your goal is to ask for directions to the metro station. The user is a local Parisian. Start by saying "Excusez-moi!".',
        emoji: '🗺️'
    }
];