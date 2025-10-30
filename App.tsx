
import React, { useState, useCallback, useRef, useContext, createContext, useEffect } from 'react';
// FIX: The `LiveSession` type is not exported from the "@google/genai" package.
// It is removed from the import and a local interface is defined below.
import { GoogleGenAI, LiveServerMessage, Modality, Blob as GenAI_Blob } from "@google/genai";
import { Lesson, Screen, AppContextType, Question, QuestionType, Unit, FlashcardGame } from './types';
import { UNITS, FLASHCARD_GAMES } from './constants';
import * as geminiService from './services/geminiService';
import { 
    SpeakerIcon, LoadingSpinner, CheckIcon, XIcon, LightbulbIcon, HeartIcon, BookOpenIcon, UserIcon, StarIcon, FireIcon, MicrophoneIcon, SparklesIcon, ArrowLeftIcon
} from './components/Icons';

/**
 * The `LiveSession` type is not exported from the SDK.
 * This interface defines the shape of the session object based on its usage
 * for type safety.
 */
interface LiveSession {
    sendRealtimeInput(input: { media: GenAI_Blob }): void;
    close(): void;
}

// --- LIVE API AUDIO HELPERS ---
function encode(bytes: Uint8Array) {
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

function decode(base64: string) {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
}

async function decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

    for (let channel = 0; channel < numChannels; channel++) {
        const channelData = buffer.getChannelData(channel);
        for (let i = 0; i < frameCount; i++) {
            channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
        }
    }
    return buffer;
}

function createBlob(data: Float32Array): GenAI_Blob {
    const l = data.length;
    const int16 = new Int16Array(l);
    for (let i = 0; i < l; i++) {
        int16[i] = data[i] * 32768;
    }
    return {
        data: encode(new Uint8Array(int16.buffer)),
        mimeType: 'audio/pcm;rate=16000',
    };
}


// --- UTILS & HELPERS ---
function shuffleArray<T>(array: T[]): T[] {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

const useLocalStorage = <T,>(key: string, initialValue: T): [T, (value: T) => void] => {
    const [storedValue, setStoredValue] = useState<T>(() => {
        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            console.error(error);
            return initialValue;
        }
    });

    const setValue = (value: T) => {
        try {
            setStoredValue(value);
            window.localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.error(error);
        }
    };
    return [storedValue, setValue];
};


// --- APP CONTEXT ---
const AppContext = createContext<AppContextType | null>(null);

const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [xp, setXp] = useLocalStorage('lingua-xp', 0);
    const [hearts, setHearts] = useLocalStorage('lingua-hearts', 5);
    const [streak, setStreak] = useLocalStorage('lingua-streak', 0);
    const [completedLessons, setCompletedLessons] = useLocalStorage<string[]>('lingua-completed', []);

    const addXp = (amount: number) => setXp(xp + amount);
    const loseHeart = () => setHearts(Math.max(0, hearts - 1));
    const completeLesson = (lessonId: string) => {
        if (!completedLessons.includes(lessonId)) {
            setCompletedLessons([...completedLessons, lessonId]);
        }
    };

    return (
        <AppContext.Provider value={{ xp, hearts, streak, completedLessons, addXp, setHearts, loseHeart, completeLesson }}>
            {children}
        </AppContext.Provider>
    );
};

const useAppContext = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useAppContext must be used within an AppProvider');
    }
    return context;
};

// --- CORE APP ---
const App: React.FC = () => {
    return (
        <AppProvider>
            <LinguaQuestApp />
        </AppProvider>
    );
};


const LinguaQuestApp: React.FC = () => {
    const [activeScreen, setActiveScreen] = useState<Screen>('learn');
    const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
    const [activeGame, setActiveGame] = useState<FlashcardGame | null>(null);

    const startLesson = (lesson: Lesson) => {
        setActiveLesson(lesson);
    };

    const exitLesson = () => {
        setActiveLesson(null);
    };

    const startGame = (game: FlashcardGame) => {
        setActiveGame(game);
    };

    const exitGame = () => {
        setActiveGame(null);
    }

    if (activeLesson) {
        return <LessonScreen lesson={activeLesson} onExit={exitLesson} />;
    }
    
    if (activeGame) {
        return <FlashcardGameScreen game={activeGame} onExit={exitGame} />;
    }

    return (
        <div className="min-h-screen bg-slate-100 text-slate-800 flex flex-col" style={{ paddingBottom: '80px' }}>
            <Header />
            <main className="flex-grow flex flex-col">
                {activeScreen === 'learn' && <HomeScreen onStartLesson={startLesson} />}
                {activeScreen === 'practice' && <PracticeScreen />}
                {activeScreen === 'games' && <GameListScreen onStartGame={startGame} />}
                {activeScreen === 'profile' && <ProfileScreen />}
            </main>
            <BottomNav active={activeScreen} onChange={setActiveScreen} />
        </div>
    );
};

// --- LAYOUT COMPONENTS ---
const Header: React.FC = () => {
    const { xp, hearts } = useAppContext();
    return (
         <header className="sticky top-0 bg-white/80 backdrop-blur-md shadow-sm z-10">
            <div className="container mx-auto px-4 py-3 flex justify-between items-center">
                <h1 className="text-2xl font-bold text-violet-700">
                    LinguaQuest
                </h1>
                <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1 font-bold text-yellow-500 bg-yellow-100/50 px-3 py-1 rounded-full">
                        <StarIcon className="w-5 h-5" />
                        <span>{xp}</span>
                    </div>
                     <div className="flex items-center space-x-1 font-bold text-red-500">
                        <HeartIcon className="w-6 h-6" />
                        <span>{hearts}</span>
                    </div>
                </div>
            </div>
        </header>
    );
};

const BottomNav: React.FC<{ active: Screen, onChange: (screen: Screen) => void }> = ({ active, onChange }) => {
    const navItems: { id: Screen, label: string, icon: React.ReactNode }[] = [
        { id: 'learn', label: 'Learn', icon: <BookOpenIcon /> },
        { id: 'practice', label: 'Practice', icon: <MicrophoneIcon /> },
        { id: 'games', label: 'Games', icon: <SparklesIcon /> },
        { id: 'profile', label: 'Profile', icon: <UserIcon /> },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
            <div className="container mx-auto px-4 flex justify-around">
                {navItems.map(item => {
                    const isActive = active === item.id;
                    return (
                        <button 
                            key={item.id} 
                            onClick={() => onChange(item.id)}
                            className={`flex flex-col items-center justify-center py-2 px-4 transition-colors duration-200 w-24 ${isActive ? 'text-violet-600' : 'text-slate-500 hover:text-violet-500'}`}
                        >
                            <span className="w-7 h-7">{item.icon}</span>
                            <span className="text-xs font-semibold mt-1">{item.label}</span>
                             {isActive && <div className="w-8 h-1 bg-violet-600 rounded-full mt-1"></div>}
                        </button>
                    );
                })}
            </div>
        </nav>
    );
};

// --- SCREENS ---
const HomeScreen: React.FC<{ onStartLesson: (lesson: Lesson) => void }> = ({ onStartLesson }) => {
    const { completedLessons } = useAppContext();
    const allLessons = UNITS.flatMap(unit => unit.lessons);

    const isLessonUnlocked = (lessonId: string) => {
        const lessonIndex = allLessons.findIndex(l => l.id === lessonId);
        if (lessonIndex === 0) return true;
        const previousLesson = allLessons[lessonIndex - 1];
        return completedLessons.includes(previousLesson.id);
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h2 className="text-3xl font-bold text-center mb-8">Your French Path</h2>
            <div className="relative max-w-sm mx-auto">
                <div className="lesson-path-line"></div>
                {UNITS.map((unit) => (
                    <div key={unit.title} className="mb-8">
                        <h3 className="text-xl font-bold text-slate-600 bg-slate-200/80 backdrop-blur-sm p-3 rounded-lg mb-8 text-center sticky top-[68px] z-10">{unit.title}</h3>
                        {unit.lessons.map((lesson) => {
                             const isUnlocked = isLessonUnlocked(lesson.id);
                             const isCompleted = completedLessons.includes(lesson.id);
                             
                             return (
                                 <div key={lesson.id} className="mb-12 flex flex-col items-center">
                                    <button
                                        onClick={() => isUnlocked && onStartLesson(lesson)}
                                        disabled={!isUnlocked}
                                        className={`relative w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-105
                                            ${isUnlocked ? 'bg-violet-600 shadow-lg' : 'bg-slate-400'}
                                            ${isCompleted ? 'bg-green-500' : ''}`}
                                    >
                                        <span className="text-4xl">{lesson.emoji}</span>
                                        {isCompleted && (
                                            <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-1 shadow">
                                                <CheckIcon className="w-5 h-5 text-green-500" />
                                            </div>
                                        )}
                                    </button>
                                    <h4 className={`mt-3 text-center font-bold ${isUnlocked ? 'text-slate-800' : 'text-slate-500'}`}>{lesson.title}</h4>
                                     <p className={`text-sm text-center max-w-xs ${isUnlocked ? 'text-slate-600' : 'text-slate-500'}`}>{lesson.description}</p>
                                 </div>
                             );
                        })}
                    </div>
                ))}
            </div>
        </div>
    );
};

const PracticeScreen: React.FC = () => {
    const [status, setStatus] = useState<'idle' | 'connecting' | 'connected' | 'error'>('idle');
    const [transcripts, setTranscripts] = useState<{ sender: 'user' | 'model' | 'system', text: string }[]>([]);
    
    const chatContainerRef = useRef<HTMLDivElement>(null);

    const sessionPromiseRef = useRef<Promise<LiveSession> | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const inputAudioContextRef = useRef<AudioContext | null>(null);
    const outputAudioContextRef = useRef<AudioContext | null>(null);
    const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
    const sourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);
    const nextStartTimeRef = useRef(0);
    const sourcesRef = useRef(new Set<AudioBufferSourceNode>());

    const currentInputTranscriptionRef = useRef('');
    const currentOutputTranscriptionRef = useRef('');

    const aiRef = useRef(new GoogleGenAI({ apiKey: process.env.API_KEY as string }));

    const stopConversation = useCallback(() => {
        sourcesRef.current.forEach(source => source.stop());
        sourcesRef.current.clear();
        nextStartTimeRef.current = 0;

        sessionPromiseRef.current?.then(session => session.close());
        sessionPromiseRef.current = null;
        
        scriptProcessorRef.current?.disconnect();
        sourceNodeRef.current?.disconnect();
        streamRef.current?.getTracks().forEach(track => track.stop());
        
        inputAudioContextRef.current?.close().catch(console.error);
        outputAudioContextRef.current?.close().catch(console.error);

        scriptProcessorRef.current = null;
        sourceNodeRef.current = null;
        streamRef.current = null;
        inputAudioContextRef.current = null;
        outputAudioContextRef.current = null;

        setStatus('idle');
    }, []);

    const startConversation = async () => {
        setStatus('connecting');
        setTranscripts([{ sender: 'system', text: "Let's practice your French! Chloé is listening." }]);
        currentInputTranscriptionRef.current = '';
        currentOutputTranscriptionRef.current = '';

        try {
            inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
            outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });

            sessionPromiseRef.current = aiRef.current.live.connect({
                model: 'gemini-2.5-flash-native-audio-preview-09-2025',
                callbacks: {
                    onopen: () => {
                        setStatus('connected');
                        if (!streamRef.current || !inputAudioContextRef.current) return;
                        
                        sourceNodeRef.current = inputAudioContextRef.current.createMediaStreamSource(streamRef.current);
                        scriptProcessorRef.current = inputAudioContextRef.current.createScriptProcessor(4096, 1, 1);
                        
                        scriptProcessorRef.current.onaudioprocess = (audioProcessingEvent) => {
                            const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                            const pcmBlob = createBlob(inputData);
                            sessionPromiseRef.current?.then((session) => {
                                session.sendRealtimeInput({ media: pcmBlob });
                            });
                        };
                        
                        sourceNodeRef.current.connect(scriptProcessorRef.current);
                        scriptProcessorRef.current.connect(inputAudioContextRef.current.destination);
                    },
                    onmessage: async (message: LiveServerMessage) => {
                        if (message.serverContent?.outputTranscription) {
                            currentOutputTranscriptionRef.current += message.serverContent.outputTranscription.text;
                        } else if (message.serverContent?.inputTranscription) {
                            currentInputTranscriptionRef.current += message.serverContent.inputTranscription.text;
                        }
            
                        if (message.serverContent?.turnComplete) {
                            const userInput = currentInputTranscriptionRef.current.trim();
                            const modelOutput = currentOutputTranscriptionRef.current.trim();
            
                            setTranscripts(prev => {
                                const newLog = [...prev];
                                if (userInput) newLog.push({ sender: 'user', text: userInput });
                                if (modelOutput) newLog.push({ sender: 'model', text: modelOutput });
                                return newLog;
                            });
            
                            currentInputTranscriptionRef.current = '';
                            currentOutputTranscriptionRef.current = '';
                        }
            
                        const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData.data;
                        if (base64Audio && outputAudioContextRef.current) {
                            const outputCtx = outputAudioContextRef.current;
                            nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputCtx.currentTime);
                            const audioBuffer = await decodeAudioData(decode(base64Audio), outputCtx, 24000, 1);
                            const source = outputCtx.createBufferSource();
                            source.buffer = audioBuffer;
                            source.connect(outputCtx.destination);
                            source.addEventListener('ended', () => { sourcesRef.current.delete(source); });
                            source.start(nextStartTimeRef.current);
                            nextStartTimeRef.current += audioBuffer.duration;
                            sourcesRef.current.add(source);
                        }
                        
                        if (message.serverContent?.interrupted) {
                            sourcesRef.current.forEach(source => source.stop());
                            sourcesRef.current.clear();
                            nextStartTimeRef.current = 0;
                        }
                    },
                    onerror: (e: ErrorEvent) => {
                        console.error('Live session error:', e);
                        setTranscripts(prev => [...prev, { sender: 'system', text: 'Sorry, a connection error occurred.' }]);
                        setStatus('error');
                    },
                    onclose: (e: CloseEvent) => {
                        stopConversation();
                    },
                },
                config: {
                    responseModalities: [Modality.AUDIO],
                    outputAudioTranscription: {},
                    inputAudioTranscription: {},
                    systemInstruction: "You are Chloé, a friendly and patient French tutor. Your goal is to have a simple, encouraging conversation with a beginner-level French learner. Keep your responses short, use simple vocabulary, and ask questions to keep the conversation going. If the user struggles or speaks English, gently guide them back to French.",
                },
            });
        } catch (error) {
            console.error('Failed to start conversation:', error);
            setTranscripts(prev => [...prev, { sender: 'system', text: 'Could not start the practice session. Please check your microphone permissions.' }]);
            setStatus('error');
        }
    };
    
    useEffect(() => {
        chatContainerRef.current?.scrollTo(0, chatContainerRef.current.scrollHeight);
    }, [transcripts]);

    useEffect(() => {
        return () => { stopConversation(); };
    }, [stopConversation]);

    const handleButtonClick = () => {
        if (status === 'connected') {
            stopConversation();
        } else {
            startConversation();
        }
    };

    const getButtonContent = () => {
        switch (status) {
            case 'idle':
            case 'error':
                return <> <MicrophoneIcon className="w-6 h-6 mr-2"/> Start Practice</>;
            case 'connecting':
                return <><LoadingSpinner className="w-6 h-6 mr-2" /> Connecting...</>;
            case 'connected':
                return <> <XIcon className="w-6 h-6 mr-2"/> End Practice</>;
        }
    };

    return (
        <div className="flex flex-col flex-grow p-4">
            <h2 className="text-2xl font-bold text-center mb-4">Practice with Chloé</h2>
            <div ref={chatContainerRef} className="flex-grow overflow-y-auto bg-white/50 p-4 rounded-lg space-y-4 shadow-inner">
                {transcripts.map((item, index) => (
                    <div key={index} className={`flex ${item.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {item.sender === 'system' ? (
                            <p className="text-sm text-slate-500 italic text-center w-full">{item.text}</p>
                        ) : (
                            <div className={`max-w-xs md:max-w-md p-3 rounded-2xl ${item.sender === 'user' ? 'bg-violet-600 text-white rounded-br-none' : 'bg-slate-200 text-slate-800 rounded-bl-none'}`}>
                                <p>{item.text}</p>
                            </div>
                        )}
                    </div>
                ))}
            </div>
            <div className="pt-4">
                <button 
                    onClick={handleButtonClick}
                    disabled={status === 'connecting'}
                    className={`w-full py-4 px-6 font-bold rounded-xl flex items-center justify-center transition-all duration-200 text-lg
                        ${status === 'connected' ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-violet-600 hover:bg-violet-700 text-white'}
                        disabled:bg-slate-400`}
                >
                    {getButtonContent()}
                </button>
            </div>
        </div>
    );
};

const GameListScreen: React.FC<{ onStartGame: (game: FlashcardGame) => void }> = ({ onStartGame }) => {
    return (
        <div className="container mx-auto px-4 py-8">
            <h2 className="text-3xl font-bold text-center mb-8">Practice Games</h2>
            <div className="max-w-2xl mx-auto space-y-4">
                {FLASHCARD_GAMES.map((game) => (
                    <button
                        key={game.id}
                        onClick={() => onStartGame(game)}
                        className="w-full text-left p-5 bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-md hover:border-violet-300 transition-all duration-200 flex items-center space-x-4"
                    >
                        <SparklesIcon className="w-8 h-8 text-violet-500" />
                        <div>
                             <h3 className="text-lg font-semibold text-violet-800">{game.title}</h3>
                             <p className="text-sm text-slate-600 mt-1">{game.description}</p>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
};

const ProfileScreen: React.FC = () => {
    const { xp, streak } = useAppContext();
    return (
        <div className="container mx-auto px-4 py-8 text-center">
            <h2 className="text-3xl font-bold mb-8">Your Progress</h2>
            <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-lg space-y-6">
                <div className="flex items-center justify-center p-4 bg-yellow-100 rounded-lg">
                    <StarIcon className="w-10 h-10 text-yellow-500 mr-4" />
                    <div>
                        <p className="text-slate-600 text-lg">Total XP</p>
                        <p className="text-4xl font-bold text-slate-800">{xp}</p>
                    </div>
                </div>
                 <div className="flex items-center justify-center p-4 bg-orange-100 rounded-lg">
                    <FireIcon className="w-10 h-10 text-orange-500 mr-4" />
                    <div>
                        <p className="text-slate-600 text-lg">Day Streak</p>
                        <p className="text-4xl font-bold text-slate-800">{streak}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};


// --- LESSON & GAME SUB-SCREENS ---

const GameHeader: React.FC<{ title: string, onExit: () => void }> = ({ title, onExit }) => (
    <header className="sticky top-0 bg-white/80 backdrop-blur-md shadow-sm z-10">
        <div className="container mx-auto px-4 py-3 flex items-center">
            <button onClick={onExit} className="p-2 -ml-2 text-slate-500 hover:text-violet-600">
                <ArrowLeftIcon className="w-6 h-6" />
            </button>
            <h1 className="flex-1 text-center text-lg font-bold text-slate-800 mr-6 truncate">{title}</h1>
        </div>
    </header>
);

const FlashcardGameScreen: React.FC<{ game: FlashcardGame, onExit: () => void }> = ({ game, onExit }) => {
    const [cards, setCards] = useState(() => shuffleArray(game.cards));
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [isDone, setIsDone] = useState(false);

    const handleFlip = () => {
        if (!isDone) setIsFlipped(!isFlipped);
    };

    const handleNext = () => {
        if (currentIndex + 1 < cards.length) {
            setCurrentIndex(currentIndex + 1);
            setIsFlipped(false);
        } else {
            setIsDone(true);
        }
    };
  
    const handleReset = () => {
        setCards(shuffleArray(game.cards));
        setCurrentIndex(0);
        setIsFlipped(false);
        setIsDone(false);
    }

    const card = cards[currentIndex];

    if (isDone) {
        return (
            <div className="min-h-screen bg-slate-100 flex flex-col">
                <GameHeader title={game.title} onExit={onExit} />
                 <div className="flex-grow flex flex-col items-center justify-center p-5 text-center">
                    <h2 className="text-2xl font-bold mb-4">Deck Complete!</h2>
                    <div className="text-7xl mb-8">🎉</div>
                    <p className="text-lg text-slate-700 mb-6">Bon travail! (Good job!)</p>
                    <button
                        onClick={handleReset}
                        className="py-3 px-6 bg-violet-600 text-white font-bold rounded-xl shadow-lg transform transition-transform duration-200 hover:scale-105"
                    >
                        Practice Again
                    </button>
                 </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-100 flex flex-col">
            <GameHeader title={game.title} onExit={onExit} />
            <div className="flex-grow p-5 flex flex-col justify-between">
                <div className="text-sm text-slate-500 mb-4 text-center">
                    Card {currentIndex + 1} of {cards.length}
                </div>
                
                <div 
                    className="relative w-full max-w-md mx-auto aspect-[3/2] rounded-xl shadow-lg cursor-pointer mb-6"
                    onClick={handleFlip}
                    style={{ perspective: '1000px' }}
                >
                    {/* Front (French) */}
                    <div 
                        className={`absolute w-full h-full p-6 flex items-center justify-center text-center bg-white rounded-xl border-2 border-violet-300 transition-transform duration-500 ease-in-out ${isFlipped ? 'transform -rotate-y-180' : ''}`}
                        style={{ backfaceVisibility: 'hidden' }}
                    >
                        <h3 className="text-3xl sm:text-4xl font-bold text-violet-700">{card.french}</h3>
                    </div>
                    {/* Back (English) */}
                    <div 
                        className={`absolute w-full h-full p-6 flex items-center justify-center text-center bg-violet-600 text-white rounded-xl transition-transform duration-500 ease-in-out ${isFlipped ? '' : 'transform rotate-y-180'}`}
                        style={{ backfaceVisibility: 'hidden' }}
                    >
                        <h3 className="text-3xl sm:text-4xl font-semibold">{card.english}</h3>
                    </div>
                </div>

                <div>
                    {!isFlipped ? (
                    <button
                        onClick={handleFlip}
                        className="w-full max-w-sm mx-auto py-4 bg-slate-200 text-slate-700 font-bold rounded-xl shadow-sm transform transition-transform duration-200 hover:scale-105"
                    >
                        Tap to Flip
                    </button>
                    ) : (
                    <button
                        onClick={handleNext}
                        className="w-full max-w-sm mx-auto py-4 bg-green-500 text-white font-bold rounded-xl shadow-lg transform transition-transform duration-200 hover:scale-105 hover:bg-green-600"
                    >
                        Next Card
                    </button>
                    )}
                </div>
            </div>
        </div>
    );
};

// --- LESSON SCREEN & LOGIC ---
const LESSON_LENGTH = 10;
const XP_PER_QUESTION = 10;

const QUESTION_TYPES: QuestionType[] = ['multiple-choice-en-fr', 'multiple-choice-fr-en', 'listening'];

const generateQuestionsForLesson = (lesson: Lesson): Question[] => {
    const questions: Question[] = [];
    const vocab = lesson.vocabulary;

    for (let i = 0; i < LESSON_LENGTH; i++) {
        const questionType = QUESTION_TYPES[i % 3];
        const wordPair = vocab[Math.floor(Math.random() * vocab.length)];

        const getOptions = (correctAnswer: string, isFrench: boolean) => {
            const options = new Set<string>([correctAnswer]);
            const source = isFrench ? vocab.map(v => v.french) : vocab.map(v => v.english);
            while(options.size < 4 && options.size < source.length) {
                options.add(source[Math.floor(Math.random() * source.length)]);
            }
            return shuffleArray(Array.from(options));
        };
        
        switch(questionType) {
            case 'multiple-choice-en-fr':
                questions.push({
                    type: questionType,
                    prompt: `What is "${wordPair.english}"?`,
                    correctAnswer: wordPair.french,
                    options: getOptions(wordPair.french, true)
                });
                break;
            case 'multiple-choice-fr-en':
                 questions.push({
                    type: questionType,
                    prompt: `What is "${wordPair.french}"?`,
                    correctAnswer: wordPair.english,
                    options: getOptions(wordPair.english, false)
                });
                break;
            case 'listening':
                questions.push({
                    type: questionType,
                    prompt: `Listen and select the correct word.`,
                    correctAnswer: wordPair.french,
                    options: getOptions(wordPair.french, true),
                    audio: wordPair.french
                });
                break;
        }
    }
    return shuffleArray(questions);
}

const FeynmanChallenge: React.FC<{
    prompt: { concept: string, promptText: string };
    onComplete: () => void;
}> = ({ prompt, onComplete }) => {
    const [explanation, setExplanation] = useState('');
    const [feedback, setFeedback] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async () => {
        if (!explanation.trim()) {
            setError('Please write an explanation first!');
            return;
        }
        setError('');
        setIsLoading(true);
        setFeedback('');
        try {
            const result = await geminiService.getFeynmanExplanation(prompt.concept, explanation);
            setFeedback(result);
        } catch (e: any) {
            setError(e.message || 'An error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-sky-50 flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-2xl bg-white p-6 sm:p-8 rounded-2xl shadow-xl">
                <div className="flex items-center text-sky-700 mb-4">
                    <LightbulbIcon className="w-8 h-8 mr-3" />
                    <h2 className="text-xl sm:text-2xl font-bold">Test Your Understanding</h2>
                </div>
                <p className="text-slate-600 mb-2">To master a concept, try to explain it in your own words.</p>
                <p className="font-semibold text-slate-800 mb-4">{prompt.promptText}</p>
                
                {!feedback ? (
                    <>
                        <textarea
                            value={explanation}
                            onChange={(e) => setExplanation(e.target.value)}
                            placeholder="Explain it here..."
                            className="w-full h-40 p-3 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition"
                            disabled={isLoading}
                        />
                        {error && <p className="text-red-500 mt-2">{error}</p>}
                        <button
                            onClick={handleSubmit}
                            disabled={isLoading}
                            className="w-full mt-4 py-3 px-6 bg-sky-600 text-white font-bold rounded-xl flex items-center justify-center hover:bg-sky-700 disabled:bg-sky-300 transition-colors"
                        >
                            {isLoading ? <LoadingSpinner /> : 'Ask Chloé for Feedback'}
                        </button>
                    </>
                ) : (
                    <>
                        <div className="mt-6 p-4 bg-violet-50 border-l-4 border-violet-400 rounded-r-lg">
                            <h3 className="font-bold text-violet-800">Chloé's Feedback:</h3>
                            <p className="text-violet-700 whitespace-pre-wrap">{feedback}</p>
                        </div>
                        <button
                            onClick={onComplete}
                            className="w-full mt-6 py-3 px-6 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-colors"
                        >
                            Finish Lesson
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};


const LessonScreen: React.FC<{ lesson: Lesson, onExit: () => void }> = ({ lesson, onExit }) => {
    const { hearts, loseHeart, setHearts, addXp, completeLesson } = useAppContext();
    const [questions, setQuestions] = useState<Question[]>(() => generateQuestionsForLesson(lesson));
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
    type LessonStage = 'quiz' | 'feynman' | 'complete' | 'failed';
    const [stage, setStage] = useState<LessonStage>('quiz');
    
    const audioContextRef = useRef<AudioContext | null>(null);

    const handleAnswer = (answer: string) => {
        if (selectedAnswer) return;
        setSelectedAnswer(answer);
        const correct = answer === questions[currentIndex].correctAnswer;
        setIsCorrect(correct);
        if (!correct) {
            loseHeart();
        } else {
            addXp(XP_PER_QUESTION);
        }
    };

    const handleContinue = () => {
        if(hearts <= 0 && isCorrect === false) {
             setStage('failed');
             return;
        }

        if (currentIndex < questions.length - 1) {
            setCurrentIndex(prev => prev + 1);
            setSelectedAnswer(null);
            setIsCorrect(null);
        } else {
            setStage('feynman');
        }
    };

    const handleFeynmanComplete = () => {
        completeLesson(lesson.id);
        setStage('complete');
    }

    const handlePlayAudio = async (text: string) => {
        try {
             if (!audioContextRef.current) {
                audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
            }
            const audioData = await geminiService.getPronunciationAudio(text);
            await geminiService.decodeAndPlayAudio(audioData, audioContextRef.current);
        } catch(e) {
            console.error("Failed to play audio", e);
        }
    }
    
    const resetLesson = () => {
        setHearts(5);
        setCurrentIndex(0);
        setSelectedAnswer(null);
        setIsCorrect(null);
        setStage('quiz');
        setQuestions(generateQuestionsForLesson(lesson));
    }

    if (stage === 'feynman') {
        return <FeynmanChallenge prompt={lesson.feynmanPrompt} onComplete={handleFeynmanComplete} />
    }
    
    if(stage === 'complete' || stage === 'failed') {
        const success = stage === 'complete';
        return (
            <div className={`min-h-screen flex flex-col items-center justify-center p-4 ${success ? 'bg-blue-50' : 'bg-red-50'}`}>
                <h2 className="text-4xl font-bold mb-4">{success ? 'Lesson Complete!' : 'Oh no!'}</h2>
                <p className="text-lg text-slate-600 mb-8">{success ? `You earned ${LESSON_LENGTH * XP_PER_QUESTION} XP!` : 'You ran out of hearts.'}</p>
                <div className="flex space-x-4">
                    <button onClick={onExit} className="py-3 px-6 bg-slate-200 text-slate-800 font-bold rounded-xl">Back to Path</button>
                    {!success && <button onClick={resetLesson} className="py-3 px-6 bg-violet-600 text-white font-bold rounded-xl">Try Again</button>}
                </div>
            </div>
        )
    }

    const currentQuestion = questions[currentIndex];
    const progress = ((currentIndex) / questions.length) * 100;

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            {/* Lesson Header */}
            <div className="p-4 border-b">
                <div className="flex items-center gap-4">
                    <button onClick={onExit}><XIcon className="w-7 h-7 text-slate-400" /></button>
                    <div className="w-full bg-slate-200 rounded-full h-4">
                        <div className="bg-green-500 h-4 rounded-full transition-all duration-300" style={{width: `${progress}%`}}></div>
                    </div>
                     <div className="flex items-center text-red-500">
                        <HeartIcon className="w-7 h-7" />
                        <span className="font-bold text-lg ml-1">{hearts}</span>
                    </div>
                </div>
            </div>

            {/* Question Body */}
            <div className="flex-grow flex flex-col p-4 sm:p-6 justify-between">
                <div>
                     <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-6">{currentQuestion.prompt}</h2>
                     {currentQuestion.type === 'listening' && (
                         <div className="text-center mb-6">
                            <button onClick={() => handlePlayAudio(currentQuestion.audio!)} className="p-6 bg-violet-600 text-white rounded-full shadow-lg transform active:scale-95 transition-transform">
                                <SpeakerIcon className="w-12 h-12" />
                            </button>
                         </div>
                     )}
                    <div className="grid grid-cols-2 gap-3">
                        {currentQuestion.options.map(option => {
                            const isSelected = selectedAnswer === option;
                            const isCorrectOption = option === currentQuestion.correctAnswer;
                            let stateClass = 'bg-white border-slate-200 hover:bg-slate-100';

                            if (isSelected) {
                                stateClass = isCorrect ? 'bg-green-100 border-green-500 text-green-700' : 'bg-red-100 border-red-500 text-red-700';
                            } else if (selectedAnswer && isCorrectOption) {
                                stateClass = 'bg-green-100 border-green-500 text-green-700';
                            }

                             return (
                                <button
                                    key={option}
                                    onClick={() => handleAnswer(option)}
                                    disabled={!!selectedAnswer}
                                    className={`p-4 rounded-xl border-2 font-semibold text-lg text-center transition-all duration-200 ${stateClass}`}
                                >
                                    {option}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Footer / Feedback */}
            {selectedAnswer && (
                <div className={`p-4 border-t-2 ${isCorrect ? 'bg-green-100 border-green-500' : 'bg-red-100 border-red-500'}`}>
                    <div className="container mx-auto flex items-center justify-between">
                         <div>
                            <p className={`font-bold text-xl ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                                {isCorrect ? 'Correct!' : 'Incorrect'}
                            </p>
                            {!isCorrect && <p className="text-red-700">Correct answer: {currentQuestion.correctAnswer}</p>}
                        </div>
                        <button onClick={handleContinue} className={`py-3 px-8 rounded-xl font-bold text-lg text-white ${isCorrect ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}>
                            Continue
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};


export default App;