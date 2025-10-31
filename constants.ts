import { Unit, FlashcardGame, PracticeScenario, MatchingPairGame, BoutiqueDashLevel, SentenceSnapLevel, GameInfo } from './types';

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
          { english: 'One', french: 'Un' },
          { english: 'Two', french: 'Deux' },
          { english: 'Three', french: 'Trois' },
          { english: 'Four', french: 'Quatre' },
          { english: 'Five', french: 'Cinq' },
          { english: 'Six', french: 'Six' },
          { english: 'Seven', french: 'Sept' },
          { english: 'Eight', french: 'Huit' },
          { english: 'Nine', french: 'Neuf' },
          { english: 'Ten', french: 'Dix' },
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

export const SCENARIOS: PracticeScenario[] = [
  {
    id: 'cafe',
    title: 'At a Café',
    description: 'Order a coffee and a croissant.',
    icon: '☕',
    systemPrompt: "You are a friendly café barista in Paris named Chloé. The user is a beginner French learner. Keep your responses short, simple, and encouraging. Wait for the user to start the conversation. Your entire response MUST be in the following format, with nothing before or after:\n[FRENCH]: Your short French response.\n[ENGLISH]: An English translation of your response.",
    media: {
      backgroundImage: 'https://images.pexels.com/photos/1449775/pexels-photo-1449775.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      ambientSound: 'https://cdn.pixabay.com/audio/2022/05/27/audio_39cba415f3.mp3'
    },
    walkthrough: [
      { speaker: 'model', line: { french: "Bonjour! Qu'est-ce que je vous sers ?", english: "Hello! What can I get for you?" } },
      { speaker: 'user', line: { french: "Bonjour. Je voudrais un café, s'il vous plaît.", english: "Hello. I would like a coffee, please." } },
      { speaker: 'model', line: { french: "Un café. Très bien. Et avec ceci ?", english: "One coffee. Very good. Anything else?" } },
      { speaker: 'user', line: { french: "Je voudrais aussi un croissant.", english: "I would also like a croissant." } },
      { speaker: 'model', line: { french: "D'accord. Un café et un croissant. Ça sera 5 euros.", english: "Okay. A coffee and a croissant. That will be 5 euros." } }
    ],
    warmup: [
      {
        type: 'typing',
        english: 'I would like a coffee, please.',
        french: 'Je voudrais un café, s\'il vous plaît.'
      },
      {
        type: 'pronunciation',
        english: 'And a croissant.',
        french: 'Et un croissant.',
        phonetic: '/e ɛ̃ kʁwa.sɑ̃/'
      }
    ]
  }
];


// --- NEW GAMES CONTENT ---

export const BOUTIQUE_DASH_LEVELS: BoutiqueDashLevel[] = [
  {
    id: 'lvl1-market',
    level: 1,
    title: 'Le Marché',
    storeType: 'Market',
    possibleItems: [
      { id: 'pomme', name: 'Pomme', icon: '🍎' },
      { id: 'banane', name: 'Banane', icon: '🍌' },
      { id: 'orange', name: 'Orange', icon: '🍊' },
      { id: 'fraise', name: 'Fraise', icon: '🍓' },
    ],
    customerOrders: [
      { id: 'order1', frenchAudio: 'Je voudrais une pomme.', items: [{ itemId: 'pomme', quantity: 1 }] },
      { id: 'order2', frenchAudio: 'Deux bananes, s\'il vous plaît.', items: [{ itemId: 'banane', quantity: 2 }] },
      { id: 'order3', frenchAudio: 'Une pomme et une orange.', items: [{ itemId: 'pomme', quantity: 1 }, { itemId: 'orange', quantity: 1 }] },
      { id: 'order4', frenchAudio: 'Trois fraises.', items: [{ itemId: 'fraise', quantity: 3 }] },
      { id: 'order5', frenchAudio: 'Une banane et deux pommes.', items: [{ itemId: 'banane', quantity: 1 }, { itemId: 'pomme', quantity: 2 }] },
    ]
  }
];

export const SENTENCE_SNAP_LEVELS: SentenceSnapLevel[] = [
  {
    id: 'snap1',
    level: 1,
    englishHint: 'The girl is eating an apple.',
    slots: ['Subject', 'Verb', 'Object'],
    chunks: [
      { word: 'mange', slot: 'Verb' },
      { word: 'une pomme', slot: 'Object' },
      { word: 'La fille', slot: 'Subject' },
    ]
  },
  {
    id: 'snap2',
    level: 2,
    englishHint: 'The boy is reading a book.',
    slots: ['Subject', 'Verb', 'Object'],
    chunks: [
        { word: 'Le garçon', slot: 'Subject' },
        { word: 'lit', slot: 'Verb' },
        { word: 'un livre', slot: 'Object' },
    ]
  },
];

export const GAMES_HUB_LIST: GameInfo[] = [
  {
    id: 'boutique-dash',
    title: 'Boutique Dash',
    description: 'Fulfill customer orders in this fast-paced listening game!',
    type: 'boutique-dash',
    illustration: '🛒'
  },
  {
    id: 'sentence-snap',
    title: 'Sentence Snap',
    description: 'Piece together sentences in this grammatical puzzle game.',
    type: 'sentence-snap',
    illustration: '🧩'
  }
];