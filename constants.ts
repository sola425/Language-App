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

export const SCENARIOS: PracticeScenario[] = [
  {
    id: 'cafe',
    title: 'At a Café',
    description: 'Order a coffee and a croissant.',
    icon: '☕',
    systemPrompt: "You are Chloé, a friendly and patient barista at a Parisian café. Your goal is to role-play with a beginner-level French learner. Keep your responses short, use simple vocabulary, and ask questions to keep the conversation going. If the user struggles or speaks English, gently guide them back to French. Your text response *must* be in the format: `[FRENCH]: Your French reply.\n[ENGLISH]: Your English translation.`",
    media: {
      backgroundImage: 'https://images.unsplash.com/photo-1511920183353-3c7c9c225852?q=80&w=2787&auto=format&fit=crop',
      ambientSound: 'https://cdn.pixabay.com/audio/2023/09/17/audio_59a243a37a.mp3'
    },
    walkthrough: [
      { speaker: 'model', line: { french: "Bonjour! Qu'est-ce que je vous sers?", english: 'Hello! What can I get for you?' } },
      { speaker: 'user', line: { french: "Je voudrais un café et un croissant, s'il vous plaît.", english: 'I would like a coffee and a croissant, please.' } },
      { speaker: 'model', line: { french: 'Très bien. Sur place ou à emporter?', english: 'Very good. For here or to go?' } },
      { speaker: 'user', line: { french: 'Sur place, s\'il vous plaît.', english: 'For here, please.' } },
      { speaker: 'model', line: { french: 'Parfait. Ça fera 4 euros 50.', english: 'Perfect. That will be 4 euros 50.' } }
    ],
    warmup: [
      {
        type: 'pronunciation',
        french: 'Bonjour! Je voudrais un café.',
        english: 'Hello! I would like a coffee.',
        phonetic: '/bɔ̃.ʒuʁ! ʒə vu.dʁɛ ɛ̃ ka.fe/'
      },
      {
        type: 'typing',
        english: 'And a croissant, please.',
        french: 'Et un croissant, s\'il vous plaît.'
      },
      {
        type: 'pronunciation',
        french: 'Sur place, s\'il vous plaît.',
        english: 'For here, please.',
        phonetic: '/syʁ plas, sil vu plɛ/'
      }
    ]
  },
  {
    id: 'directions',
    title: 'Asking for Directions',
    description: 'Ask a local for directions to the metro.',
    icon: '🗺️',
    systemPrompt: "You are Chloé, a helpful local Parisian. A tourist (the user) has stopped you to ask for directions. Be friendly, clear, and use simple language. If they are confused, try to simplify your directions. Your text response *must* be in the format: `[FRENCH]: Your French reply.\n[ENGLISH]: Your English translation.`",
    media: {
      backgroundImage: 'https://images.unsplash.com/photo-1522093018152-a913f019c45e?q=80&w=2835&auto=format&fit=crop',
      ambientSound: 'https://cdn.pixabay.com/audio/2022/10/22/audio_1204a0018d.mp3'
    },
    walkthrough: [
        { speaker: 'user', line: { french: "Excusez-moi, je suis perdu. Où est la station de métro?", english: 'Excuse me, I am lost. Where is the metro station?' } },
        { speaker: 'model', line: { french: "Bonjour! Ce n'est pas loin. Allez tout droit.", english: 'Hello! It is not far. Go straight ahead.' } },
        { speaker: 'user', line: { french: "Tout droit? D'accord.", english: 'Straight ahead? Okay.' } },
        { speaker: 'model', line: { french: "Oui, et puis, tournez à gauche à la boulangerie.", english: 'Yes, and then, turn left at the bakery.' } },
        { speaker: 'user', line: { french: "Merci beaucoup!", english: 'Thank you very much!' } },
        { speaker: 'model', line: { french: "De rien. Bonne journée!", english: 'You\'re welcome. Have a good day!' } }
    ],
    warmup: [
      {
        type: 'pronunciation',
        french: 'Où est la station de métro?',
        english: 'Where is the metro station?',
        phonetic: '/u ɛ la sta.sjɔ̃ də me.tʁo/'
      },
      {
        type: 'typing',
        english: 'Go straight ahead.',
        french: 'Allez tout droit.'
      },
      {
        type: 'pronunciation',
        french: 'Merci beaucoup!',
        english: 'Thank you very much!',
        phonetic: '/mɛʁ.si bo.ku/'
      }
    ]
  },
  {
    id: 'market',
    title: 'At the Market',
    description: 'Buy some fruit from a market stall.',
    icon: '🍎',
    systemPrompt: "You are Chloé, a cheerful vendor at an outdoor market in France. A customer (the user) is approaching your stall to buy some fruit. Be friendly and helpful. Your text response *must* be in the format: `[FRENCH]: Your French reply.\n[ENGLISH]: Your English translation.`",
    media: {
      backgroundImage: 'https://images.unsplash.com/photo-1590301476994-0a25691d5750?q=80&w=2787&auto=format&fit=crop',
      ambientSound: 'https://cdn.pixabay.com/audio/2022/01/24/audio_24905d5423.mp3'
    },
    walkthrough: [
        { speaker: 'model', line: { french: "Bonjour monsieur/madame! Vous désirez?", english: 'Hello sir/ma\'am! What would you like?' } },
        { speaker: 'user', line: { french: "Bonjour. Je voudrais des pommes, s'il vous plaît.", english: 'Hello. I would like some apples, please.' } },
        { speaker: 'model', line: { french: "Bien sûr. Combien de pommes?", english: 'Of course. How many apples?' } },
        { speaker: 'user', line: { french: "Trois pommes, s'il vous plaît.", english: 'Three apples, please.' } },
        { speaker: 'model', line: { french: "Voilà. Et avec ça?", english: 'Here you are. Anything else?' } },
        { speaker: 'user', line: { french: "Non, c'est tout. Merci.", english: 'No, that is all. Thank you.' } }
    ],
    warmup: [
      {
        type: 'pronunciation',
        french: 'Je voudrais des pommes, s\'il vous plaît.',
        english: 'I would like some apples, please.',
        phonetic: '/ʒə vu.dʁɛ dɛ pɔm, sil vu plɛ./'
      },
      {
        type: 'pronunciation',
        french: 'Combien de pommes?',
        english: 'How many apples?',
        phonetic: '/kɔ̃.bjɛ̃ də pɔm/'
      },
      {
        type: 'typing',
        english: 'No, that is all. Thank you.',
        french: 'Non, c\'est tout. Merci.'
      }
    ]
  },
  {
    id: 'bookstore',
    title: 'The Bookstore',
    description: 'Find and purchase a specific book from a bookstore.',
    icon: '📚',
    systemPrompt: "You are Chloé, a knowledgeable and friendly clerk at a cozy Parisian bookstore. A customer (the user) is looking for a book. Help them find it, and handle the purchase. Use simple, encouraging French. Your text response *must* be in the format: `[FRENCH]: Your French reply.\n[ENGLISH]: Your English translation.`",
    media: {
      backgroundImage: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?q=80&w=2787&auto=format&fit=crop',
      ambientSound: 'https://cdn.pixabay.com/audio/2023/02/10/audio_f68a7b629e.mp3'
    },
    walkthrough: [
      { speaker: 'user', line: { french: "Bonjour, excusez-moi. Je cherche un livre.", english: 'Hello, excuse me. I am looking for a book.' } },
      { speaker: 'model', line: { french: "Bonjour! Bien sûr. Quel livre cherchez-vous?", english: 'Hello! Of course. What book are you looking for?' } },
      { speaker: 'user', line: { french: "Je cherche 'Le Petit Prince'.", english: 'I am looking for \'The Little Prince\'.' } },
      { speaker: 'model', line: { french: "Ah, un excellent choix! C'est par ici. Voilà.", english: 'Ah, an excellent choice! It\'s over here. Here you are.' } },
      { speaker: 'user', line: { french: "Merci. Combien ça coûte?", english: 'Thank you. How much does it cost?' } },
      { speaker: 'model', line: { french: "Ça coûte 12 euros.", english: 'It costs 12 euros.' } }
    ],
    warmup: [
      {
        type: 'pronunciation',
        french: 'Je cherche un livre.',
        english: 'I am looking for a book.',
        phonetic: '/ʒə ʃɛʁʃ œ̃ livʁ/'
      },
      {
        type: 'typing',
        english: "I am looking for 'The Little Prince'.",
        french: "Je cherche 'Le Petit Prince'."
      },
      {
        type: 'pronunciation',
        french: 'Combien ça coûte?',
        english: 'How much does it cost?',
        phonetic: '/kɔ̃.bjɛ̃ sa kut/'
      }
    ]
  },
  {
    id: 'restaurant',
    title: 'At the Restaurant',
    description: 'Order a full meal, from appetizer to dessert.',
    icon: '🍽️',
    systemPrompt: "You are Chloé, a friendly and professional waitress at a French bistro. Guide the user (a customer) through ordering a meal. Be patient, offer suggestions if they're unsure, and maintain a polite tone. Your text response *must* be in the format: `[FRENCH]: Your French reply.\n[ENGLISH]: Your English translation.`",
    media: {
      backgroundImage: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=2874&auto=format&fit=crop',
      ambientSound: 'https://cdn.pixabay.com/audio/2024/04/10/audio_49b183424d.mp3'
    },
    walkthrough: [
      { speaker: 'model', line: { french: "Bonsoir! Voici la carte. Que voulez-vous boire?", english: 'Good evening! Here is the menu. What would you like to drink?' } },
      { speaker: 'user', line: { french: "Je vais prendre un verre de vin rouge, s'il vous plaît.", english: 'I will have a glass of red wine, please.' } },
      { speaker: 'model', line: { french: "Très bon choix. Êtes-vous prêt à commander?", english: 'Very good choice. Are you ready to order?' } },
      { speaker: 'user', line: { french: "Oui, je voudrais le steak-frites.", english: 'Yes, I would like the steak and fries.' } },
      { speaker: 'model', line: { french: "Parfait. Et comme dessert?", english: 'Perfect. And for dessert?' } },
      { speaker: 'user', line: { french: "La crème brûlée, s'il vous plaît.", english: 'The crème brûlée, please.' } }
    ],
    warmup: [
      {
        type: 'pronunciation',
        french: 'Une table pour deux, s\'il vous plaît.',
        english: 'A table for two, please.',
        phonetic: '/yn tabl puʁ dø, sil vu plɛ/'
      },
      {
        type: 'typing',
        english: 'I will have a glass of red wine.',
        french: 'Je vais prendre un verre de vin rouge.'
      },
      {
        type: 'pronunciation',
        french: 'L\'addition, s\'il vous plaît.',
        english: 'The bill, please.',
        phonetic: '/la.di.sjɔ̃, sil vu plɛ/'
      }
    ]
  },
  {
    id: 'train-station',
    title: 'At the Train Station',
    description: 'Buy a train ticket to another city.',
    icon: '🚆',
    systemPrompt: "You are Chloé, a helpful ticket agent at the Gare de Lyon train station in Paris. The user wants to buy a ticket. Ask them for their destination, if they want one-way or round-trip, and guide them through the payment process. Be clear and efficient. Your text response *must* be in the format: `[FRENCH]: Your French reply.\n[ENGLISH]: Your English translation.`",
    media: {
      backgroundImage: 'https://images.unsplash.com/photo-1526129318478-62ed806ebdf9?q=80&w=2787&auto=format&fit=crop',
      ambientSound: 'https://cdn.pixabay.com/audio/2022/03/07/audio_c89b6a7a7d.mp3'
    },
    walkthrough: [
      { speaker: 'user', line: { french: "Bonjour, je voudrais un billet pour Lyon.", english: 'Hello, I would like a ticket to Lyon.' } },
      { speaker: 'model', line: { french: "Bonjour. Un aller simple ou un aller-retour?", english: 'Hello. A one-way or a round-trip?' } },
      { speaker: 'user', line: { french: "Un aller simple, s'il vous plaît.", english: 'A one-way, please.' } },
      { speaker: 'model', line: { french: "D'accord. Le prochain train part à 14h30 du quai numéro 5.", english: 'Okay. The next train leaves at 2:30 PM from platform 5.' } },
      { speaker: 'user', line: { french: "Merci. Je peux payer par carte?", english: 'Thank you. Can I pay by card?' } },
      { speaker: 'model', line: { french: "Bien sûr. Ça fait 58 euros.", english: 'Of course. That will be 58 euros.' } }
    ],
    warmup: [
      {
        type: 'pronunciation',
        french: 'Je voudrais un billet pour Lyon.',
        english: 'I would like a ticket for Lyon.',
        phonetic: '/ʒə vu.dʁɛ ɛ̃ bi.jɛ puʁ ljɔ̃/'
      },
      {
        type: 'typing',
        english: 'A one-way, please.',
        french: 'Un aller simple, s\'il vous plaît.'
      },
      {
        type: 'pronunciation',
        french: 'De quel quai part le train?',
        english: 'From which platform does the train leave?',
        phonetic: '/də kɛl kɛ paʁ lə tʁɛ̃/'
      }
    ]
  },
  {
    id: 'trip-planning',
    title: 'Planning a Trip',
    description: 'Discuss weekend travel plans with a friend.',
    icon: '✈️',
    systemPrompt: "You are Chloé, the user's enthusiastic and friendly French friend. You are both planning a weekend trip together. Suggest ideas, ask for the user's opinion, and be generally cheerful and encouraging. Your text response *must* be in the format: `[FRENCH]: Your French reply.\n[ENGLISH]: Your English translation.`",
    media: {
      backgroundImage: 'https://images.unsplash.com/photo-1522199755839-a2bacb67c546?q=80&w=2942&auto=format&fit=crop',
      ambientSound: 'https://cdn.pixabay.com/audio/2023/09/17/audio_59a243a37a.mp3'
    },
    walkthrough: [
      { speaker: 'model', line: { french: "Salut! Alors, où est-ce qu'on va ce week-end?", english: 'Hey! So, where are we going this weekend?' } },
      { speaker: 'user', line: { french: "J'aimerais aller à la mer. Peut-être à Nice?", english: 'I would like to go to the sea. Maybe to Nice?' } },
      { speaker: 'model', line: { french: "Bonne idée! On peut prendre le train ou louer une voiture.", english: 'Good idea! We can take the train or rent a car.' } },
      { speaker: 'user', line: { french: "Le train, c'est plus facile. Qu'est-ce qu'on va faire là-bas?", english: 'The train is easier. What are we going to do there?' } },
      { speaker: 'model', line: { french: "On peut visiter la vieille ville et aller à la plage!", english: 'We can visit the old town and go to the beach!' } }
    ],
    warmup: [
      {
        type: 'typing',
        english: 'I would like to go to the sea.',
        french: 'J\'aimerais aller à la mer.'
      },
      {
        type: 'pronunciation',
        french: 'On peut prendre le train?',
        english: 'Can we take the train?',
        phonetic: '/ɔ̃ pø pʁɑ̃dʁ lə tʁɛ̃/'
      },
      {
        type: 'typing',
        english: 'What are we going to do there?',
        french: 'Qu\'est-ce qu\'on va faire là-bas?'
      }
    ]
  },
  {
    id: 'hotel',
    title: 'At the Hotel',
    description: 'Check into your hotel and ask for the Wi-Fi password.',
    icon: '🏨',
    systemPrompt: "You are Chloé, a friendly and efficient receptionist at a hotel in Paris. A guest (the user) is checking in. Guide them through the process, ask for their name, confirm their reservation, and answer their questions. Your text response *must* be in the format: `[FRENCH]: Your French reply.\n[ENGLISH]: Your English translation.`",
    media: {
      backgroundImage: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2940&auto=format&fit=crop',
      ambientSound: 'https://cdn.pixabay.com/audio/2022/02/01/audio_58f6d32578.mp3'
    },
    walkthrough: [
      { speaker: 'user', line: { french: "Bonjour, j'ai une réservation au nom de Smith.", english: 'Hello, I have a reservation under the name Smith.' } },
      { speaker: 'model', line: { french: "Bonjour Monsieur/Madame Smith. Bienvenue! Je peux voir votre passeport, s'il vous plaît?", english: 'Hello Mr./Ms. Smith. Welcome! Can I see your passport, please?' } },
      { speaker: 'user', line: { french: "Oui, bien sûr. Voici mon passeport.", english: 'Yes, of course. Here is my passport.' } },
      { speaker: 'model', line: { french: "Merci. Voici votre clé pour la chambre 305. L'ascenseur est à droite.", english: 'Thank you. Here is your key for room 305. The elevator is on the right.' } },
      { speaker: 'user', line: { french: "Merci. Quel est le mot de passe pour le Wi-Fi?", english: 'Thank you. What is the password for the Wi-Fi?' } },
      { speaker: 'model', line: { french: "Le mot de passe est 'HOTELPARIS'. Bon séjour!", english: "The password is 'HOTELPARIS'. Have a nice stay!" } }
    ],
    warmup: [
      {
        type: 'pronunciation',
        french: 'J\'ai une réservation.',
        english: 'I have a reservation.',
        phonetic: '/ʒe yn ʁe.zɛʁ.va.sjɔ̃/'
      },
      {
        type: 'typing',
        english: 'Here is your key.',
        french: 'Voici votre clé.'
      },
      {
        type: 'pronunciation',
        french: 'Quel est le mot de passe pour le Wi-Fi?',
        english: 'What is the password for the Wi-Fi?',
        phonetic: '/kɛl ɛ lə mo də pas puʁ lə wi.fi/'
      }
    ]
  },
  {
    id: 'shopping',
    title: 'Shopping for Clothes',
    description: 'Find a shirt in your size and ask to try it on.',
    icon: '👕',
    systemPrompt: "You are Chloé, a helpful and stylish shop assistant in a clothing boutique in Marseille. A customer (the user) is looking for clothes. Help them find what they want, suggest sizes, and direct them to the fitting rooms. Your text response *must* be in the format: `[FRENCH]: Your French reply.\n[ENGLISH]: Your English translation.`",
    media: {
      backgroundImage: 'https://images.unsplash.com/photo-1595935270695-b747b042a5a2?q=80&w=2895&auto=format&fit=crop',
      ambientSound: 'https://cdn.pixabay.com/audio/2021/11/24/audio_75f369324b.mp3'
    },
    walkthrough: [
      { speaker: 'model', line: { french: "Bonjour! Je peux vous aider?", english: 'Hello! Can I help you?' } },
      { speaker: 'user', line: { french: "Oui, je cherche une chemise bleue.", english: 'Yes, I am looking for a blue shirt.' } },
      { speaker: 'model', line: { french: "Les chemises bleues sont ici. Quelle taille faites-vous?", english: 'The blue shirts are here. What size are you?' } },
      { speaker: 'user', line: { french: "Je fais du M (moyen).", english: 'I am a size M (medium).' } },
      { speaker: 'model', line: { french: "Voici une chemise en taille M. Vous voulez l'essayer?", english: 'Here is a shirt in size M. Do you want to try it on?' } },
      { speaker: 'user', line: { french: "Oui, s'il vous plaît. Où sont les cabines d'essayage?", english: 'Yes, please. Where are the fitting rooms?' } },
      { speaker: 'model', line: { french: "Elles sont au fond, à gauche.", english: 'They are at the back, on the left.' } }
    ],
    warmup: [
      {
        type: 'typing',
        english: 'I am looking for a blue shirt.',
        french: 'Je cherche une chemise bleue.'
      },
      {
        type: 'pronunciation',
        french: 'Quelle taille faites-vous?',
        english: 'What size are you?',
        phonetic: '/kɛl taj fɛt vu/'
      },
      {
        type: 'pronunciation',
        french: "Où sont les cabines d'essayage?",
        english: 'Where are the fitting rooms?',
        phonetic: '/u sɔ̃ le ka.bin de.sɛ.jaʒ/'
      }
    ]
  }
];