import React, { useState, useCallback, useRef, useContext, createContext, useEffect, useMemo } from 'react';
// FIX: The `LiveSession` type is not exported from the "@google/genai" package.
// It is removed from the import and a local interface is defined below.
import { GoogleGenAI, LiveServerMessage, Modality, Blob as GenAI_Blob } from "@google/genai";
// FIX: Import PracticeScenario to fix 'Cannot find name' errors.
import { Lesson, Screen, AppContextType, Question, QuestionType, Unit, Game, LessonStage, FlashcardGame, PracticeScenario } from './types';
import { UNITS, FLASHCARD_GAMES, PRACTICE_SCENARIOS, MATCHING_GAMES } from './constants';
import * as geminiService from './services/geminiService';
import { 
    SpeakerIcon, LoadingSpinner, CheckIcon, XIcon, LightbulbIcon, HeartIcon, BookOpenIcon, 
    UserIcon, StarIcon, FireIcon, MicrophoneIcon, SparklesIcon, ArrowLeftIcon, BookmarkIcon,
    UserAvatar, ChloeAvatar
} from './components/Icons';
import { MatchingPairGameScreen } from './components/MatchingPairGameScreen';


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

// FIX: The custom `useLocalStorage` hook's setter function did not support
// functional updates (e.g., `setState(c => c + 1)`), which caused a type error
// when trying to update state based on its previous value. The hook has been
// updated to correctly handle both value and function updates, mirroring
// React's `useState` behavior and ensuring type compatibility and safe state updates.
const useLocalStorage = <T,>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] => {
    const [storedValue, setStoredValue] = useState<T>(() => {
        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            console.error(error);
            return initialValue;
        }
    });

    const setValue: React.Dispatch<React.SetStateAction<T>> = (value) => {
        try {
            if (value instanceof Function) {
                setStoredValue(prevState => {
                    const newState = value(prevState);
                    window.localStorage.setItem(key, JSON.stringify(newState));
                    return newState;
                });
            } else {
                setStoredValue(value);
                window.localStorage.setItem(key, JSON.stringify(value));
            }
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

    // FIX: Updated state setters to use the functional update form
    // to prevent bugs from stale state closures. This was necessary
    // after updating useLocalStorage to support this pattern.
    const addXp = (amount: number) => setXp(prevXp => prevXp + amount);
    const loseHeart = () => setHearts(h => Math.max(0, h - 1));
    const completeLesson = (lessonId: string) => {
        setCompletedLessons(prevLessons => {
            if (!prevLessons.includes(lessonId)) {
                return [...prevLessons, lessonId];
            }
            return prevLessons;
        });
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
    const [activeGame, setActiveGame] = useState<Game | null>(null);

    const startLesson = (lesson: Lesson) => {
        setActiveLesson(lesson);
    };

    const exitLesson = () => {
        setActiveLesson(null);
    };

    const startGame = (game: Game) => {
        setActiveGame(game);
    };

    const exitGame = () => {
        setActiveGame(null);
    }

    if (activeLesson) {
        return <LessonScreen key={activeLesson.id} lesson={activeLesson} onExit={exitLesson} />;
    }
    
    if (activeGame) {
        if (activeGame.type === 'flashcards') {
            return <FlashcardGameScreen key={activeGame.id} game={activeGame} onExit={exitGame} />;
        }
        if (activeGame.type === 'matching') {
            return <MatchingPairGameScreen key={activeGame.id} game={activeGame} onExit={exitGame} />;
        }
    }
    
    const renderScreen = () => {
        switch (activeScreen) {
            case 'learn':
                return <HomeScreen key="learn" onStartLesson={startLesson} />;
            case 'practice':
                return <PracticeScreen key="practice" />;
            case 'games':
                return <GameListScreen key="games" onStartGame={startGame} />;
            case 'review':
                return <ReviewScreen key="review" />;
            case 'profile':
                return <ProfileScreen key="profile" />;
            default:
                return <HomeScreen key="default" onStartLesson={startLesson} />;
        }
    }

    return (
        <div className="min-h-screen bg-ui-bg text-text-primary flex flex-col" style={{ paddingBottom: '80px' }}>
            <Header />
            <main className="flex-grow flex flex-col">
                <div className="fade-in">
                    {renderScreen()}
                </div>
            </main>
            <BottomNav active={activeScreen} onChange={setActiveScreen} />
        </div>
    );
};

// --- LAYOUT COMPONENTS ---
const Header: React.FC = () => {
    const { xp, hearts } = useAppContext();
    return (
         <header className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-slate-200 z-20">
            <div className="container mx-auto px-4 py-3 flex justify-between items-center">
                <h1 className="text-2xl font-bold text-violet-600" style={{ fontFamily: 'var(--font-heading)'}}>
                    LinguaQuest
                </h1>
                <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1 font-bold text-yellow-600 bg-yellow-400/30 px-3 py-1 rounded-full">
                        <StarIcon className="w-5 h-5 text-yellow-500" />
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
        { id: 'review', label: 'Review', icon: <BookmarkIcon /> },
        { id: 'profile', label: 'Profile', icon: <UserIcon /> },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-slate-200 shadow-[0_-2px_10px_rgba(0,0,0,0.05)] z-20">
            <div className="container mx-auto px-2 flex justify-around">
                {navItems.map(item => {
                    const isActive = active === item.id;
                    return (
                        <button 
                            key={item.id} 
                            onClick={() => onChange(item.id)}
                            className={`flex flex-col items-center justify-center py-2 transition-colors duration-300 w-20 relative ${isActive ? 'text-violet-600' : 'text-text-secondary hover:text-violet-600'}`}
                        >
                            <div className={`relative p-3 rounded-full transition-colors duration-300 ${isActive ? 'bg-violet-100' : ''}`}>
                                <span className="w-7 h-7 block">{item.icon}</span>
                            </div>
                            <span className="text-xs font-semibold mt-0.5">{item.label}</span>
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
                        <h3 className="text-xl font-bold text-slate-700 bg-slate-200/80 backdrop-blur-sm p-3 rounded-lg mb-8 text-center sticky top-[68px] z-10">{unit.title}</h3>
                        {unit.lessons.map((lesson, index) => {
                             const isUnlocked = isLessonUnlocked(lesson.id);
                             const isCompleted = completedLessons.includes(lesson.id);
                             const alignmentClass = index % 2 === 0 ? 'self-start -ml-16' : 'self-end -mr-16';
                             
                             return (
                                <div key={lesson.id} className="mb-12 flex flex-col items-center" style={{ animation: `fadeIn 0.5s ${index * 0.1}s ease-out both` }}>
                                   <div className={`flex flex-col items-center ${alignmentClass}`}>
                                        <button
                                            onClick={() => isUnlocked && onStartLesson(lesson)}
                                            disabled={!isUnlocked}
                                            className={`relative w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-105 shadow-lg
                                                ${isCompleted ? 'bg-emerald-500' : isUnlocked ? 'bg-violet-600' : 'bg-slate-400 cursor-not-allowed'}
                                            `}
                                        >
                                            <span className="text-4xl">{lesson.emoji}</span>
                                            {isCompleted && (
                                                <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-1 shadow">
                                                    <CheckIcon className="w-5 h-5 text-emerald-500" />
                                                </div>
                                            )}
                                        </button>
                                        <h4 className={`mt-3 text-center font-bold max-w-[120px] ${isUnlocked ? 'text-text-primary' : 'text-text-secondary'}`}>{lesson.title}</h4>
                                    </div>
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
    const [selectedScenario, setSelectedScenario] = useState<PracticeScenario | null>(null);
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
        // Do not reset scenario, so user can see chat log
    }, []);

    const startConversation = async (scenario: PracticeScenario) => {
        setStatus('connecting');
        setTranscripts([{ sender: 'system', text: `Starting scenario: ${scenario.title}` }]);
        currentInputTranscriptionRef.current = '';
        currentOutputTranscriptionRef.current = '';

        try {
            inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
            outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });

            const systemInstruction = `You are Chloé, a friendly and patient French tutor. Your goal is to role-play a scenario with a beginner-level French learner. Keep your responses short, use simple vocabulary, and ask questions to keep the conversation going. If the user struggles or speaks English, gently guide them back to French. The current scenario is: "${scenario.prompt}"`;

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
                    systemInstruction,
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
    
    if (!selectedScenario) {
        return (
            <div className="p-4">
                <h2 className="text-2xl font-bold text-center mb-2">Practice with Chloé</h2>
                <p className="text-center text-text-secondary mb-6">Choose a scenario to start a conversation.</p>
                <div className="space-y-3">
                    {PRACTICE_SCENARIOS.map(scenario => (
                        <button 
                            key={scenario.id}
                            onClick={() => setSelectedScenario(scenario)}
                            className="w-full flex items-center p-4 bg-ui-card rounded-xl shadow-sm border border-slate-200 hover:border-violet-600 hover:shadow-md transition-all duration-200"
                        >
                            <span className="text-3xl mr-4">{scenario.emoji}</span>
                            <div>
                                <h3 className="font-semibold text-left text-text-primary">{scenario.title}</h3>
                                <p className="text-sm text-left text-text-secondary">{scenario.prompt.split('.')[1]}</p>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        );
    }
    
    const handleButtonClick = () => {
        if (status === 'connected') {
            stopConversation();
        } else if (selectedScenario) {
            startConversation(selectedScenario);
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
        <div className="flex flex-col flex-grow p-4 h-[calc(100vh-140px)]">
            <div className="flex items-center mb-4">
                <button onClick={() => { stopConversation(); setSelectedScenario(null); }} className="p-2 -ml-2 text-slate-500 hover:text-violet-600">
                    <ArrowLeftIcon className="w-6 h-6" />
                </button>
                <h2 className="text-xl font-bold text-center flex-1 -ml-6">{selectedScenario.title}</h2>
            </div>

            <div ref={chatContainerRef} className="flex-grow overflow-y-auto bg-white/50 p-4 rounded-lg space-y-4 shadow-inner">
                {transcripts.map((item, index) => (
                    <div key={index} className={`flex items-end gap-2 ${item.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                       {item.sender === 'model' && <ChloeAvatar />}
                        {item.sender === 'system' ? (
                            <p className="text-sm text-slate-500 italic text-center w-full">{item.text}</p>
                        ) : (
                            <div className={`max-w-xs md:max-w-md p-3 rounded-2xl ${item.sender === 'user' ? 'bg-violet-600 text-white rounded-br-none' : 'bg-slate-200 text-text-primary rounded-bl-none'}`}>
                                <p>{item.text}</p>
                            </div>
                        )}
                        {item.sender === 'user' && <UserAvatar />}
                    </div>
                ))}
            </div>
            <div className="pt-4">
                <button 
                    onClick={handleButtonClick}
                    disabled={status === 'connecting'}
                    className={`w-full py-4 px-6 font-bold rounded-xl flex items-center justify-center transition-all duration-200 text-lg shadow-md
                        ${status === 'connected' ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-violet-600 hover:bg-violet-700 text-white'}
                        disabled:bg-slate-400`}
                >
                    {getButtonContent()}
                </button>
            </div>
        </div>
    );
};

const GameListScreen: React.FC<{ onStartGame: (game: Game) => void }> = ({ onStartGame }) => {
    const allGames = [...FLASHCARD_GAMES, ...MATCHING_GAMES];
    return (
        <div className="container mx-auto px-4 py-8">
            <h2 className="text-3xl font-bold text-center mb-8">Practice Games</h2>
            <div className="max-w-2xl mx-auto space-y-4">
                {allGames.map((game) => (
                    <button
                        key={game.id}
                        onClick={() => onStartGame(game)}
                        className="w-full text-left p-5 bg-ui-card rounded-xl shadow-sm border border-slate-200 hover:shadow-md hover:border-violet-600 transition-all duration-200 flex items-center space-x-4"
                    >
                        <SparklesIcon className="w-8 h-8 text-violet-600" />
                        <div>
                             <h3 className="text-lg font-semibold text-violet-600">{game.title}</h3>
                             <p className="text-sm text-text-secondary mt-1">{game.description}</p>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
};

const ReviewScreen: React.FC = () => {
    const { completedLessons } = useAppContext();
    const [searchTerm, setSearchTerm] = useState('');

    const allLearnedVocab = useMemo(() => {
        const vocabSet = new Map<string, string>();
        const completedSet = new Set(completedLessons);

        UNITS.flatMap(unit => unit.lessons)
            .filter(lesson => completedSet.has(lesson.id))
            .flatMap(lesson => lesson.vocabulary)
            .forEach(vocab => {
                if (!vocabSet.has(vocab.french)) {
                    vocabSet.set(vocab.french, vocab.english);
                }
            });
        
        return Array.from(vocabSet.entries()).map(([french, english]) => ({ french, english }));
    }, [completedLessons]);
    
    const filteredVocab = allLearnedVocab.filter(
        v => v.french.toLowerCase().includes(searchTerm.toLowerCase()) || 
             v.english.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="container mx-auto px-4 py-8">
            <h2 className="text-3xl font-bold text-center mb-4">Review Vocabulary</h2>
            <p className="text-center text-text-secondary mb-6">All the words you've learned so far.</p>
            <div className="sticky top-[68px] z-10 mb-6">
                <input 
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search words..."
                    className="w-full p-3 rounded-xl border-2 border-slate-300 focus:ring-2 focus:ring-violet-600 focus:border-violet-600 transition"
                />
            </div>
            <div className="space-y-2">
                {filteredVocab.length > 0 ? (
                    filteredVocab.map(vocab => (
                        <div key={vocab.french} className="flex justify-between items-center p-4 bg-ui-card rounded-lg shadow-sm">
                            <p className="font-semibold text-text-primary">{vocab.french}</p>
                            <p className="text-text-secondary">{vocab.english}</p>
                        </div>
                    ))
                ) : (
                    <p className="text-center text-text-secondary mt-8">
                        {allLearnedVocab.length === 0 ? "Complete some lessons to see your vocabulary here!" : "No words match your search."}
                    </p>
                )}
            </div>
        </div>
    );
};


const ProfileScreen: React.FC = () => {
    const { xp, streak } = useAppContext();
    return (
        <div className="container mx-auto px-4 py-8 text-center">
            <h2 className="text-3xl font-bold mb-8">Your Progress</h2>
            <div className="max-w-md mx-auto bg-ui-card p-6 rounded-lg shadow-lg space-y-6">
                <div className="flex items-center justify-center p-4 bg-yellow-100 rounded-lg">
                    <StarIcon className="w-10 h-10 text-yellow-500 mr-4" />
                    <div>
                        <p className="text-text-secondary text-lg">Total XP</p>
                        <p className="text-4xl font-bold text-text-primary">{xp}</p>
                    </div>
                </div>
                 <div className="flex items-center justify-center p-4 bg-orange-100 rounded-lg">
                    <FireIcon className="w-10 h-10 text-orange-500 mr-4" />
                    <div>
                        <p className="text-text-secondary text-lg">Day Streak</p>
                        <p className="text-4xl font-bold text-text-primary">{streak}</p>
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
            <h1 className="flex-1 text-center text-lg font-bold text-text-primary mr-6 truncate">{title}</h1>
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
                    <p className="text-lg text-text-secondary mb-8">Great job reviewing your vocabulary!</p>
                    <div className="flex space-x-4">
                         <button
                            onClick={handleReset}
                            className="py-3 px-6 bg-white border border-slate-300 text-text-primary font-bold rounded-xl shadow-sm hover:bg-slate-100 transition-all"
                        >
                            Practice Again
                        </button>
                        <button
                            onClick={onExit}
                            className="py-3 px-8 bg-violet-600 text-white font-bold rounded-xl shadow-md hover:bg-violet-700 transition-all"
                        >
                            Done
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-100 flex flex-col">
            <GameHeader title={game.title} onExit={onExit} />
            <div className="flex-grow flex flex-col items-center justify-center p-5 space-y-8">
                {/* Progress bar */}
                <div className="w-full max-w-sm">
                    <div className="h-2 bg-slate-300 rounded-full">
                        <div 
                            className="h-2 bg-emerald-500 rounded-full transition-all duration-300"
                            style={{ width: `${((currentIndex + 1) / cards.length) * 100}%`}}
                        ></div>
                    </div>
                    <p className="text-sm text-text-secondary text-center mt-2">{currentIndex + 1} / {cards.length}</p>
                </div>
                
                {/* Card */}
                <div 
                    className="w-full max-w-sm h-64 rounded-xl shadow-lg cursor-pointer bg-violet-200 flex items-center justify-center text-center p-6"
                    onClick={handleFlip}
                    style={{
                        transformStyle: 'preserve-3d',
                        transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                        transition: 'transform 0.6s'
                    }}
                >
                    <div className="absolute inset-0 w-full h-full flex flex-col items-center justify-center p-6" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(0deg)' }}>
                        <p className="text-xs text-text-secondary mb-2">French</p>
                        <p className="text-3xl font-bold text-text-primary">{card.french}</p>
                    </div>
                    <div className="absolute inset-0 w-full h-full flex flex-col items-center justify-center p-6" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
                         <p className="text-xs text-text-secondary mb-2">English</p>
                        <p className="text-3xl font-bold text-text-primary">{card.english}</p>
                    </div>
                </div>

                {/* Navigation */}
                <button
                    onClick={handleNext}
                    className={`w-full max-w-sm py-4 px-6 font-bold rounded-xl shadow-md transition-all disabled:bg-slate-400 ${
                        isFlipped 
                        ? 'bg-emerald-500 hover:bg-green-600 text-white' 
                        : 'bg-violet-600 hover:bg-violet-700 text-white'
                    }`}
                >
                    {currentIndex + 1 < cards.length ? 'Next Card' : 'Finish Deck'}
                </button>
            </div>
        </div>
    );
};

const LessonScreen: React.FC<{ lesson: Lesson, onExit: () => void }> = ({ lesson, onExit }) => {
    const { hearts, loseHeart, addXp, completeLesson } = useAppContext();
    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [answerState, setAnswerState] = useState<'correct' | 'incorrect' | 'idle'>('idle');
    const [stage, setStage] = useState<LessonStage>('study');
    const [feynmanInput, setFeynmanInput] = useState('');
    const [feynmanResponse, setFeynmanResponse] = useState('');
    const [feynmanStatus, setFeynmanStatus] = useState<'idle' | 'loading' | 'done'>('idle');
    const [fillInBlankInput, setFillInBlankInput] = useState('');

    const audioCtxRef = useRef<AudioContext | null>(null);
    const timeoutRef = useRef<number | null>(null);
    
    useEffect(() => {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        return () => {
            audioCtxRef.current?.close().catch(console.error);
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        }
    }, []);

    const generateQuestionsForLesson = useCallback((lesson: Lesson): Question[] => {
        const generated: Question[] = [];
        const vocab = shuffleArray(lesson.vocabulary);

        vocab.forEach(v => {
            const wrongOptionsEn = shuffleArray(vocab.filter(w => w.french !== v.french)).slice(0, 3).map(w => w.english);
            generated.push({
                type: 'multiple-choice-fr-en',
                prompt: `What is the meaning of "${v.french}"?`,
                options: shuffleArray([v.english, ...wrongOptionsEn]),
                correctAnswer: v.english
            });

            generated.push({
                type: 'listening',
                prompt: 'Listen and choose the correct meaning.',
                options: shuffleArray([v.english, ...wrongOptionsEn]),
                correctAnswer: v.english,
                audio: v.french
            });

            const parts = v.french.split(' ');
            if (parts.length > 1) {
                const blankIndex = Math.floor(Math.random() * parts.length);
                const answer = parts[blankIndex];
                const promptPart1 = parts.slice(0, blankIndex).join(' ');
                const promptPart2 = parts.slice(blankIndex + 1).join(' ');
                generated.push({
                    type: 'fill-in-the-blank',
                    prompt: [`${promptPart1} ____ ${promptPart2}`.trim(), v.english],
                    options: [],
                    correctAnswer: answer
                });
            }
        });

        return shuffleArray(generated).slice(0, 10);
    }, []);

    useEffect(() => {
        setQuestions(generateQuestionsForLesson(lesson));
    }, [lesson, generateQuestionsForLesson]);

    const handlePlayAudio = async (text: string) => {
        if (audioCtxRef.current) {
            try {
                const audioData = await geminiService.getPronunciationAudio(text);
                await geminiService.decodeAndPlayAudio(audioData, audioCtxRef.current);
            } catch (error) {
                console.error("Error playing audio:", error);
                alert("Could not play audio.");
            }
        }
    };
    
    const handleCheckAnswer = () => {
        if (answerState !== 'idle' || hearts <= 0) return;
        
        const currentQuestion = questions[currentQuestionIndex];
        const isCorrect = (currentQuestion.type === 'fill-in-the-blank' 
            ? fillInBlankInput.trim().toLowerCase() === currentQuestion.correctAnswer.toLowerCase()
            : selectedAnswer === currentQuestion.correctAnswer);

        if (isCorrect) {
            setAnswerState('correct');
            addXp(10);
        } else {
            setAnswerState('incorrect');
            loseHeart();
        }
    };
    
    const handleContinue = () => {
        const isCorrect = answerState === 'correct';
        setAnswerState('idle');
        setSelectedAnswer(null);
        setFillInBlankInput('');

        if (hearts - (isCorrect ? 0 : 1) > 0) {
             if (currentQuestionIndex + 1 < questions.length) {
                setCurrentQuestionIndex(currentQuestionIndex + 1);
            } else {
                setStage('feynman');
            }
        } else {
            // Out of hearts, could show a summary screen
            onExit(); 
        }
    };
    
    const handleFeynmanSubmit = async () => {
        if (!feynmanInput.trim()) return;
        setFeynmanStatus('loading');
        try {
            const response = await geminiService.getFeynmanExplanation(lesson.feynmanPrompt.concept, feynmanInput);
            setFeynmanResponse(response);
            setFeynmanStatus('done');
        } catch(e) {
            setFeynmanResponse("Sorry, Chloé couldn't respond right now. Let's continue!");
            setFeynmanStatus('done');
        }
    };

    const finishLesson = () => {
        addXp(50);
        completeLesson(lesson.id);
        setStage('complete');
        for (let i = 0; i < 50; i++) {
            createConfetti();
        }
        timeoutRef.current = window.setTimeout(() => onExit(), 3000);
    };
    
    const createConfetti = () => {
        const container = document.getElementById('root');
        if (!container) return;
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = `${Math.random() * 100}vw`;
        confetti.style.animationDuration = `${Math.random() * 2 + 3}s`;
        const colors = ['--brand-accent', '--brand-primary', '--brand-warning'];
        confetti.style.backgroundColor = `var(${colors[Math.floor(Math.random() * colors.length)]})`;
        container.appendChild(confetti);
        setTimeout(() => confetti.remove(), 5000);
    };

    if (questions.length === 0 && stage !== 'study') {
        return (
             <div className="flex-grow flex items-center justify-center p-4">
                <div className="text-center">
                    <LoadingSpinner className="w-12 h-12 text-violet-600 mx-auto" />
                    <p className="mt-4 text-lg text-text-secondary">Preparing your lesson...</p>
                </div>
            </div>
        );
    }
    
    if (stage === 'complete') {
        return (
            <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center text-center p-4">
                 <div className="confetti-container"></div>
                 <h2 className="text-4xl font-bold mb-4 text-text-primary">Lesson Complete!</h2>
                 <div className="text-8xl mb-6">🏆</div>
                 <p className="text-xl text-emerald-500 font-semibold">+ {10 * questions.length + 50} XP</p>
            </div>
        )
    }

    if (stage === 'study') {
        return (
            <div className="min-h-screen bg-slate-100 flex flex-col">
                <GameHeader title={lesson.title} onExit={onExit} />
                <div className="flex-grow p-4 overflow-y-auto" style={{ paddingBottom: '100px' }}>
                    <h2 className="text-3xl font-bold text-center mb-6">Study the Vocabulary</h2>
                    <div className="max-w-lg mx-auto space-y-3">
                        {lesson.vocabulary.map((item) => (
                            <div key={item.french} className="bg-white p-4 rounded-lg shadow-sm flex items-center justify-between">
                                <div>
                                    <p className="text-xl font-bold text-text-primary">{item.french}</p>
                                    <p className="text-text-secondary">{item.english}</p>
                                    {item.phonetic && <p className="text-sm text-slate-500 font-mono">{item.phonetic}</p>}
                                </div>
                                <button
                                    onClick={() => handlePlayAudio(item.french)}
                                    className="p-3 text-violet-600 rounded-full hover:bg-violet-100 transition-colors"
                                    aria-label={`Play audio for ${item.french}`}
                                >
                                    <SpeakerIcon className="w-6 h-6" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-md border-t border-slate-200">
                    <button
                        onClick={() => setStage('quiz')}
                        className="w-full max-w-lg mx-auto py-4 text-xl font-bold bg-violet-600 text-white rounded-xl shadow-md transition-all hover:bg-violet-700"
                    >
                        Start Quiz
                    </button>
                </div>
            </div>
        );
    }

    if (stage === 'feynman') {
        return (
            <div className="min-h-screen bg-slate-100 flex flex-col">
                <GameHeader title="Explain This!" onExit={onExit} />
                <div className="flex-grow p-4 flex flex-col items-center justify-center">
                     <div className="bg-ui-card p-6 rounded-xl shadow-lg max-w-lg w-full text-center">
                        <LightbulbIcon className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                        <h2 className="text-xl font-bold mb-2">{lesson.feynmanPrompt.concept}</h2>
                        <p className="text-text-secondary mb-4">{lesson.feynmanPrompt.promptText}</p>
                        <textarea
                            value={feynmanInput}
                            onChange={(e) => setFeynmanInput(e.target.value)}
                            className="w-full h-32 p-3 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-600 focus:border-violet-600 transition"
                            placeholder="Explain it in your own words..."
                            disabled={feynmanStatus !== 'idle'}
                        />
                        <button
                            onClick={handleFeynmanSubmit}
                            disabled={feynmanStatus !== 'idle' || !feynmanInput.trim()}
                            className="mt-4 w-full py-3 bg-violet-600 text-white font-bold rounded-xl shadow-md hover:bg-violet-700 transition disabled:bg-slate-400"
                        >
                            {feynmanStatus === 'loading' ? <LoadingSpinner className="mx-auto" /> : "Submit to Chloé"}
                        </button>

                        {feynmanStatus === 'done' && (
                            <div className="mt-6 p-4 bg-violet-100 text-left rounded-lg fade-in">
                                <p className="font-bold text-violet-600 mb-2">Chloé says:</p>
                                <p className="text-text-primary whitespace-pre-wrap">{feynmanResponse}</p>
                                <button
                                    onClick={finishLesson}
                                    className="mt-4 w-full py-3 bg-emerald-500 text-white font-bold rounded-xl shadow-md hover:bg-green-600 transition"
                                >
                                    Finish Lesson
                                </button>
                            </div>
                        )}
                     </div>
                </div>
            </div>
        )
    }

    const currentQuestion = questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex) / questions.length) * 100;

    return (
        <div className="min-h-screen bg-slate-100 flex flex-col">
            <GameHeader title={lesson.title} onExit={onExit} />
            
            <div className="w-full px-4 pt-4">
                 <div className="h-2 bg-slate-300 rounded-full">
                    <div className="h-2 bg-emerald-500 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
                </div>
            </div>

            <div className="flex-grow p-5 flex flex-col justify-between">
                <div className="w-full max-w-md mx-auto">
                    <div className="text-center">
                         {currentQuestion.type === 'listening' ? (
                            <>
                                <h2 className="text-2xl font-bold text-text-primary mb-4">{currentQuestion.prompt}</h2>
                                <button onClick={() => handlePlayAudio(currentQuestion.audio!)} className="p-4 bg-violet-600 text-white rounded-full shadow-lg transition-transform hover:scale-105">
                                    <SpeakerIcon className="w-10 h-10" />
                                </button>
                            </>
                        ) : currentQuestion.type === 'fill-in-the-blank' ? (
                            <>
                                <h2 className="text-xl font-bold text-text-primary mb-2">Fill in the blank:</h2>
                                <p className="text-lg text-text-secondary mb-2 italic">({(currentQuestion.prompt as [string, string])[1]})</p>
                                <p className="text-2xl my-4 bg-white p-4 rounded-lg">{(currentQuestion.prompt as [string, string])[0]}</p>
                            </>
                        ) : (
                            <h2 className="text-2xl font-bold text-text-primary">{currentQuestion.prompt}</h2>
                        )}
                    </div>

                    <div className="mt-8 space-y-3">
                         {currentQuestion.type === 'fill-in-the-blank' ? (
                             <input 
                                type="text"
                                value={fillInBlankInput}
                                onChange={(e) => setFillInBlankInput(e.target.value)}
                                disabled={answerState !== 'idle'}
                                className="w-full text-center p-4 text-lg border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-violet-600 focus:border-violet-600 transition"
                                placeholder="Type your answer"
                             />
                         ) : (
                            currentQuestion.options.map((option) => {
                                const isSelected = selectedAnswer === option;
                                const isCorrect = option === currentQuestion.correctAnswer;
                                
                                let buttonClass = "bg-ui-card border-slate-200 hover:bg-slate-100";
                                if (answerState !== 'idle') {
                                    if (isSelected) {
                                        buttonClass = isCorrect ? "bg-green-200 border-green-600 text-green-800 ring-2 ring-green-500" : "bg-red-200 border-red-500 text-red-700 ring-2 ring-red-400";
                                    } else if (isCorrect) {
                                        buttonClass = "bg-green-200 border-green-600 text-green-800 ring-2 ring-green-500";
                                    } else {
                                        buttonClass += " opacity-50 grayscale";
                                    }
                                }

                                let animClass = '';
                                if (answerState === 'correct' && isCorrect) animClass = 'pulse-anim';
                                if (answerState === 'incorrect' && isSelected) animClass = 'shake-anim';

                                return (
                                    <button
                                        key={option}
                                        onClick={() => setSelectedAnswer(option)}
                                        disabled={answerState !== 'idle'}
                                        className={`w-full p-4 text-lg font-semibold text-left border-2 rounded-xl shadow-sm transition-all duration-300 flex items-center justify-between ${buttonClass} ${animClass}`}
                                    >
                                        <span>{option}</span>
                                        {answerState !== 'idle' && isSelected && (isCorrect ? <CheckIcon className="text-emerald-500" /> : <XIcon className="text-red-500" />)}
                                    </button>
                                );
                            })
                         )}
                    </div>
                </div>

                 <div className={`fixed bottom-0 left-0 right-0 p-4 transition-transform duration-300 transform ${answerState !== 'idle' ? 'translate-y-0' : 'translate-y-full'} ${answerState === 'correct' ? 'bg-green-600 border-green-700' : 'bg-red-600 border-red-700'}`}>
                    <div className="container mx-auto flex items-center justify-between">
                        <div className="flex items-center text-white font-bold text-lg">
                            {answerState === 'correct' ? <><CheckIcon className="w-6 h-6 mr-2" />Correct!</> : <><XIcon className="w-6 h-6 mr-2" />Incorrect!</>}
                        </div>
                        <button
                            onClick={handleContinue}
                            className={`font-bold py-3 px-8 rounded-lg ${answerState === 'correct' ? 'bg-white text-green-700' : 'bg-white text-red-700'}`}>
                            Continue
                        </button>
                    </div>
                </div>

                <div className="w-full max-w-md mx-auto mt-6">
                    {answerState === 'idle' && (
                        <button
                            onClick={handleCheckAnswer}
                            disabled={answerState !== 'idle' || (currentQuestion.type !== 'fill-in-the-blank' && !selectedAnswer) || hearts <= 0}
                            className="w-full py-4 text-xl font-bold bg-violet-600 text-white rounded-xl shadow-md transition-all hover:bg-violet-700 disabled:bg-slate-400 disabled:cursor-not-allowed"
                        >
                            Check
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default App;