import React, { useState, useMemo, createContext, useContext, useEffect, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";
import { UNITS, FLASHCARD_GAMES, MATCHING_GAMES, SCENARIOS } from './constants';
import { Screen, Lesson, Game, PracticeScenario, AppContextType, FlashcardGame, MatchingPairGame, LessonStage } from './types';
import { BookOpenIcon, UserIcon, TrophyIcon, SparklesIcon, HeartIcon, FireIcon, ArrowLeftIcon, StarIcon, SpeakerIcon, LoadingSpinner, CheckIcon, XIcon, LightbulbIcon, MicrophoneIcon, UserAvatar, ChloeAvatar } from './components/Icons';
import { MatchingPairGameScreen } from './components/MatchingPairGameScreen';
import { getPronunciationAudio, decodeAndPlayAudio, getFeynmanExplanation, getPronunciationFeedback } from './services/geminiService';
import AmbientSoundPlayer from './components/AmbientSoundPlayer';

// Sound effect for correct answers
const CORRECT_ANSWER_SOUND_URL = 'https://cdn.pixabay.com/audio/2022/03/15/audio_22183389d2.mp3';
const playSound = (soundUrl: string, volume: number = 0.5) => {
    try {
        const audio = new Audio(soundUrl);
        audio.volume = volume;
        audio.play().catch(error => {
            console.warn(`Audio playback failed for ${soundUrl}. Error: ${error.message}`);
        });
    } catch (error) {
        console.error(`Failed to create or play audio from ${soundUrl}.`, error);
    }
};

// --- App Context ---
const AppContext = createContext<AppContextType | null>(null);
const useApp = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useApp must be used within an AppProvider');
    }
    return context;
};

// --- Page Header ---
const PageHeader: React.FC<{ title: string, onExit: () => void, progress?: { current: number, total: number } }> = ({ title, onExit, progress }) => (
    <header className="sticky top-0 bg-white/80 backdrop-blur-md z-10">
        <div className="container mx-auto px-4 py-3 flex items-center">
            <button onClick={onExit} className="p-2 -ml-2 text-slate-500 hover:text-violet-600">
                <ArrowLeftIcon className="w-6 h-6" />
            </button>
            <div className="flex-1 text-center text-lg font-bold text-text-primary mr-10 truncate">{title}</div>
        </div>
        {progress && (
            <div className="w-full bg-slate-200 h-1.5">
                <div 
                    className="bg-green-500 h-1.5 transition-all duration-300" 
                    style={{ width: `${(progress.current / progress.total) * 100}%` }}
                />
            </div>
        )}
    </header>
);

// --- Simple Markdown Renderer ---
const SimpleMarkdown: React.FC<{ text: string }> = ({ text }) => {
    const paragraphs = text.split('\n').map((line, index) => (
        <p key={index} className="mb-2 last:mb-0">{line}</p>
    ));
    return <div>{paragraphs}</div>;
};

// --- Learn Screen ---
const LearnScreen: React.FC<{ onSelectLesson: (lesson: Lesson) => void }> = ({ onSelectLesson }) => {
    const { completedLessons } = useApp();
    return (
        <div className="container mx-auto px-4 py-6">
            <h1 className="text-2xl font-bold mb-6">Your Learning Path</h1>
            {UNITS.map(unit => (
                <div key={unit.title} className="mb-8">
                    <h2 className="text-lg font-bold text-slate-600 mb-3 px-1">{unit.title}</h2>
                    <ul>
                        {unit.lessons.map(lesson => (
                            <li key={lesson.id} className="mb-2">
                                <button onClick={() => onSelectLesson(lesson)} className="w-full flex items-center p-4 bg-white rounded-xl shadow-sm border border-slate-200 hover:border-violet-400 hover:bg-violet-50 transition-all">
                                    <div className="text-3xl mr-4">{lesson.emoji}</div>
                                    <div className="flex-1 text-left">
                                        <p className="font-bold text-text-primary">{lesson.title}</p>
                                        <p className="text-sm text-slate-500">{lesson.description}</p>
                                    </div>
                                    {completedLessons.includes(lesson.id) && <div className="text-yellow-400"><StarIcon className="w-6 h-6"/></div>}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            ))}
        </div>
    );
};


// --- Games Screen ---
const GamesScreen: React.FC<{ onSelectGame: (game: Game) => void }> = ({ onSelectGame }) => {
    const allGames = [...FLASHCARD_GAMES, ...MATCHING_GAMES];
    return (
        <div className="container mx-auto px-4 py-6">
            <h1 className="text-2xl font-bold mb-6">Practice Games</h1>
            <ul>
                {allGames.map(game => (
                    <li key={game.id} className="mb-3">
                         <button onClick={() => onSelectGame(game)} className="w-full flex items-center p-4 bg-white rounded-xl shadow-sm border border-slate-200 hover:border-violet-400 hover:bg-violet-50 transition-all">
                             <div className="text-3xl mr-4">{game.type === 'flashcards' ? '🃏' : '🧩'}</div>
                            <div className="flex-1 text-left">
                                <p className="font-bold text-text-primary">{game.title}</p>
                                <p className="text-sm text-slate-500">{game.description}</p>
                            </div>
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

// --- Practice Screen ---
const PracticeScreen: React.FC<{ onSelectScenario: (scenario: PracticeScenario) => void }> = ({ onSelectScenario }) => {
    return (
        <div className="container mx-auto px-4 py-6">
            <h1 className="text-2xl font-bold mb-6">Role-play Scenarios</h1>
             <ul>
                {SCENARIOS.map(scenario => (
                    <li key={scenario.id} className="mb-3">
                         <button onClick={() => onSelectScenario(scenario)} className="w-full flex items-center p-4 bg-white rounded-xl shadow-sm border border-slate-200 hover:border-violet-400 hover:bg-violet-50 transition-all">
                             <div className="text-3xl mr-4">{scenario.icon}</div>
                            <div className="flex-1 text-left">
                                <p className="font-bold text-text-primary">{scenario.title}</p>
                                <p className="text-sm text-slate-500">{scenario.description}</p>
                            </div>
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
}

// --- Flashcard Game Screen ---
const FlashcardGameScreen: React.FC<{ game: FlashcardGame, onExit: () => void }> = ({ game, onExit }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [playingAudio, setPlayingAudio] = useState(false);
    const audioContextRef = useRef(new (window.AudioContext || (window as any).webkitAudioContext)());

    const card = game.cards[currentIndex];

    const handleNext = () => {
        setIsFlipped(false);
        setTimeout(() => {
            setCurrentIndex((prev) => (prev + 1) % game.cards.length);
        }, 150);
    };

    const handlePlayAudio = async (text: string) => {
        if (playingAudio) return;
        setPlayingAudio(true);
        try {
            const base64Audio = await getPronunciationAudio(text);
            await decodeAndPlayAudio(base64Audio, audioContextRef.current);
        } catch (error) {
            console.error("Failed to play audio", error);
        } finally {
            setPlayingAudio(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-100 flex flex-col">
            <PageHeader title={game.title} onExit={onExit} />
            <div className="flex-grow flex flex-col items-center justify-center p-4">
                <p className="text-slate-500 mb-4">Card {currentIndex + 1} of {game.cards.length}</p>
                <div className="w-full max-w-sm h-64 perspective-1000">
                    <button
                        className={`w-full h-full relative transition-transform duration-500 transform-style-preserve-3d ${isFlipped ? 'rotate-y-180' : ''}`}
                        onClick={() => setIsFlipped(prev => !prev)}
                    >
                        {/* Front of card: English */}
                        <div className="absolute w-full h-full backface-hidden bg-white rounded-xl shadow-lg flex items-center justify-center p-4">
                            <span className="text-3xl font-bold text-text-primary">{card.english}</span>
                        </div>
                        {/* Back of card: French + Audio button */}
                        <div className="absolute w-full h-full backface-hidden bg-violet-600 text-white rounded-xl shadow-lg flex items-center justify-center p-4 rotate-y-180">
                            <div className="flex flex-col items-center justify-center">
                                <span className="text-3xl font-bold">{card.french}</span>
                                <button
                                    onClick={(e) => { e.stopPropagation(); handlePlayAudio(card.french); }}
                                    className="text-white/80 hover:text-white mt-4 disabled:opacity-50"
                                    disabled={playingAudio}
                                >
                                    {playingAudio ? <LoadingSpinner className="w-7 h-7" /> : <SpeakerIcon className="w-7 h-7" />}
                                </button>
                            </div>
                        </div>
                    </button>
                </div>
                <button onClick={handleNext} className="mt-8 py-3 px-8 bg-violet-600 text-white font-bold rounded-xl shadow-md hover:bg-violet-700 transition-all">
                    Next Card
                </button>
            </div>
        </div>
    );
};

// --- Practice Scenario Screen ---
type ChatMessage = {
    speaker: 'user' | 'model';
    line: { french: string; english: string; };
};
type PracticeMode = 'walkthrough' | 'warmup' | 'chatting';

const PracticeScenarioScreen: React.FC<{ scenario: PracticeScenario, onExit: () => void }> = ({ scenario, onExit }) => {
    const [ai] = useState(() => new GoogleGenAI({ apiKey: process.env.API_KEY! }));
    const [mode, setMode] = useState<PracticeMode>('walkthrough');
    
    // Walkthrough state
    const [walkthroughStep, setWalkthroughStep] = useState(0);
    const [audioContext] = useState(() => new (window.AudioContext || (window as any).webkitAudioContext)());
    const [playingAudio, setPlayingAudio] = useState<string | null>(null);

    // Warmup state
    const [warmupIndex, setWarmupIndex] = useState(0);
    const [typingInput, setTypingInput] = useState('');
    const [isCorrectlyTyped, setIsCorrectlyTyped] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const [pronunciationFeedback, setPronunciationFeedback] = useState<{score: number; feedback: string} | null>(null);
    const [isProcessingAudio, setIsProcessingAudio] = useState(false);
    
    // Chat state
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (mode === 'chatting') {
            chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, mode]);

    useEffect(() => {
        if (warmupIndex >= scenario.warmup.length) {
            setMode('chatting');
        }
    }, [warmupIndex, scenario.warmup.length]);

    useEffect(() => {
        if (mode === 'warmup' && scenario.warmup[warmupIndex]?.type === 'typing') {
            const challenge = scenario.warmup[warmupIndex] as any;
            if (typingInput.toLowerCase() === challenge.french.toLowerCase()) {
                setIsCorrectlyTyped(true);
                playSound(CORRECT_ANSWER_SOUND_URL);
                setTimeout(() => {
                    setWarmupIndex(prev => prev + 1);
                    setTypingInput('');
                    setIsCorrectlyTyped(false);
                }, 1000);
            }
        }
    }, [typingInput, mode, warmupIndex, scenario.warmup]);
    
    const handlePlayAudio = async (text: string) => {
        if (playingAudio) return;
        setPlayingAudio(text);
        try {
            const base64Audio = await getPronunciationAudio(text);
            await decodeAndPlayAudio(base64Audio, audioContext);
        } catch (error) {
            console.error("Failed to play audio", error);
        } finally {
            setPlayingAudio(null);
        }
    };

    const handleSend = async () => {
        if (!userInput.trim() || isLoading) return;
        
        const newUserMessage: ChatMessage = { speaker: 'user', line: { french: userInput, english: '' } };
        setMessages(prev => [...prev, newUserMessage]);
        setUserInput('');
        setIsLoading(true);

        try {
            const chatHistory = messages.map(msg => ({
                role: msg.speaker,
                parts: [{ text: msg.line.french }]
            }));
            
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: `User's message: "${userInput}"`,
                config: {
                    systemInstruction: scenario.systemPrompt,
                },
            });
            const text = response.text;
            
            const frenchMatch = text.match(/\[FRENCH\]:\s*(.*)/);
            const englishMatch = text.match(/\[ENGLISH\]:\s*(.*)/);
            
            const french = frenchMatch ? frenchMatch[1].trim() : 'Sorry, I am not sure how to respond.';
            const english = englishMatch ? englishMatch[1].trim() : 'Translation not available.';
            
            const newModelMessage: ChatMessage = { speaker: 'model', line: { french, english } };
            setMessages(prev => [...prev, newModelMessage]);
        } catch (error) {
            console.error("Error calling Gemini API:", error);
            const errorMessage: ChatMessage = { speaker: 'model', line: { french: "Désolé, une erreur s'est produite.", english: "Sorry, an error occurred." } };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleStartRecording = async () => {
        setPronunciationFeedback(null);
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: 'audio/webm' });
                audioChunksRef.current = [];
                mediaRecorderRef.current.ondataavailable = event => {
                    audioChunksRef.current.push(event.data);
                };
                mediaRecorderRef.current.onstop = async () => {
                    const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                    setIsProcessingAudio(true);
                    try {
                        const challenge = scenario.warmup[warmupIndex] as any;
                        const feedback = await getPronunciationFeedback(ai, challenge.french, audioBlob);
                        setPronunciationFeedback(feedback);
                        if (feedback.score > 75) {
                            playSound(CORRECT_ANSWER_SOUND_URL);
                        }
                    } catch (error) {
                        console.error("Pronunciation feedback error:", error);
                        setPronunciationFeedback({ 
                            score: 0, 
                            feedback: "Sorry, Chloé had trouble analyzing your audio. Please try again." 
                        });
                    } finally {
                        setIsProcessingAudio(false);
                        stream.getTracks().forEach(track => track.stop());
                    }
                };
                mediaRecorderRef.current.start();
                setIsRecording(true);
            } catch (err) {
                console.error("Error accessing microphone:", err);
            }
        }
    };
    
    const handleStopRecording = () => {
        if (mediaRecorderRef.current) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };
    
    const renderWalkthrough = () => {
        const currentStep = scenario.walkthrough[walkthroughStep];
        const isThisAudioPlaying = playingAudio === currentStep.line.french;
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-4 bg-black/40">
                <div className="bg-white/95 backdrop-blur-sm p-6 rounded-xl shadow-lg w-full max-w-md text-center fade-in">
                    <h2 className="text-xl font-bold mb-2">Guided Walkthrough</h2>
                    <p className="text-slate-600 mb-6">Follow this example conversation to prepare.</p>
                    
                    <div className="text-left space-y-4 mb-8 p-4 bg-slate-50 rounded-lg min-h-[100px]">
                        <div className="flex items-start gap-3">
                            {currentStep.speaker === 'model' ? <ChloeAvatar /> : <UserAvatar />}
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <p className="font-bold text-lg text-slate-800">{currentStep.line.french}</p>
                                    <button 
                                        onClick={() => handlePlayAudio(currentStep.line.french)} 
                                        className="text-slate-500 hover:text-violet-600 disabled:opacity-50" 
                                        disabled={!!playingAudio}
                                        aria-label={`Play pronunciation for: ${currentStep.line.french}`}
                                    >
                                        {isThisAudioPlaying ? <LoadingSpinner className="w-5 h-5" /> : <SpeakerIcon className="w-5 h-5" />}
                                    </button>
                                </div>
                                <p className="text-sm italic text-slate-500">{currentStep.line.english}</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <button onClick={() => setWalkthroughStep(s => s - 1)} disabled={walkthroughStep === 0} className="py-2 px-5 bg-slate-200 text-slate-700 font-semibold rounded-lg disabled:opacity-50 transition-colors hover:bg-slate-300" aria-label="Previous step">Previous</button>
                        <p className="text-sm text-slate-500 font-medium">{walkthroughStep + 1} / {scenario.walkthrough.length}</p>
                        {walkthroughStep < scenario.walkthrough.length - 1 ? (
                            <button onClick={() => setWalkthroughStep(s => s + 1)} className="py-2 px-5 bg-slate-200 text-slate-700 font-semibold rounded-lg transition-colors hover:bg-slate-300" aria-label="Next step">Next</button>
                        ) : (
                            <button onClick={() => setMode('warmup')} className="py-2 px-5 bg-emerald-700 text-white font-bold rounded-lg hover:bg-emerald-800 transition-transform hover:scale-105" aria-label="Start practice session">Start Warm-up!</button>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    const renderWarmup = () => {
        const challenge = scenario.warmup[warmupIndex];
        if (!challenge) return null;

        const WarmupContainer: React.FC<{ children: React.ReactNode, title: string }> = ({ children, title }) => (
             <div className="flex-1 flex flex-col items-center justify-center p-4 bg-black/40">
                <div className="bg-white/95 backdrop-blur-sm p-6 rounded-xl shadow-lg w-full max-w-md fade-in">
                    <div className="flex justify-between items-center mb-4">
                       <h2 className="text-xl font-bold">{title}</h2>
                       <p className="text-sm font-semibold text-slate-500">{warmupIndex + 1} / {scenario.warmup.length}</p>
                    </div>
                    {children}
                </div>
            </div>
        );

        if (challenge.type === 'typing') {
            const isThisAudioPlaying = playingAudio === challenge.french;
            return (
                <WarmupContainer title="Type the phrase">
                    <p className="text-center text-slate-600 mb-4">"{challenge.english}"</p>
                    <div className="p-4 bg-slate-100 rounded-lg mb-4 text-center">
                        <div className="flex justify-center items-center gap-2 mb-2">
                            <p className="text-lg font-bold text-slate-800">{challenge.french}</p>
                            <button
                                onClick={() => handlePlayAudio(challenge.french)}
                                className="text-slate-500 hover:text-violet-600 disabled:opacity-50"
                                disabled={!!playingAudio}
                                aria-label={`Play pronunciation for: ${challenge.french}`}
                            >
                                {isThisAudioPlaying ? <LoadingSpinner className="w-5 h-5" /> : <SpeakerIcon className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>
                    <div className="relative">
                        <input
                            type="text"
                            value={typingInput}
                            onChange={(e) => setTypingInput(e.target.value)}
                            className={`w-full p-3 border-2 rounded-lg text-lg ${isCorrectlyTyped ? 'border-green-500 bg-green-50' : 'border-slate-300 focus:border-violet-500 focus:ring-violet-500'}`}
                            placeholder="Type in French..."
                            disabled={isCorrectlyTyped}
                        />
                        {isCorrectlyTyped && <CheckIcon className="w-6 h-6 text-green-500 absolute right-3 top-1/2 -translate-y-1/2" />}
                    </div>
                </WarmupContainer>
            );
        }

        if (challenge.type === 'pronunciation') {
            const isThisAudioPlaying = playingAudio === challenge.french;
            return (
                <WarmupContainer title="Pronunciation Practice">
                    <p className="text-center text-slate-600 mb-2">Tap to listen, then record yourself saying:</p>
                    <div className="p-4 bg-slate-100 rounded-lg mb-4 text-center">
                        <div className="flex justify-center items-center gap-2">
                            <p className="text-lg font-bold text-slate-800">{challenge.french}</p>
                            <button
                                onClick={() => handlePlayAudio(challenge.french)}
                                className="text-slate-500 hover:text-violet-600 disabled:opacity-50"
                                disabled={!!playingAudio}
                                aria-label={`Play pronunciation for: ${challenge.french}`}
                            >
                                {isThisAudioPlaying ? <LoadingSpinner className="w-5 h-5" /> : <SpeakerIcon className="w-5 h-5" />}
                            </button>
                        </div>
                        <p className="text-sm text-slate-500 italic">"{challenge.english}"</p>
                    </div>
                    
                    <div className="flex justify-center my-4">
                        <button 
                            onClick={isRecording ? handleStopRecording : handleStartRecording}
                            className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 ${isRecording ? 'bg-red-500 text-white animate-pulse' : 'bg-violet-600 text-white hover:bg-violet-700'}`}
                        >
                            {isProcessingAudio ? <LoadingSpinner className="w-8 h-8"/> : <MicrophoneIcon className="w-8 h-8" />}
                        </button>
                    </div>

                    {pronunciationFeedback && (
                        <div className="mt-4 p-4 bg-slate-50 rounded-lg border border-slate-200 fade-in">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="font-bold">Chloé's Feedback</h3>
                                <div className={`font-bold text-lg ${pronunciationFeedback.score >= 75 ? 'text-green-600' : pronunciationFeedback.score > 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                                    {pronunciationFeedback.score}/100
                                </div>
                            </div>
                            <p className="text-sm text-slate-700">{pronunciationFeedback.feedback}</p>
                             {pronunciationFeedback.score >= 75 ? (
                                <button onClick={() => { setWarmupIndex(prev => prev + 1); setPronunciationFeedback(null); }} className="mt-4 w-full py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition">
                                    Continue
                                </button>
                            ) : (
                                <button onClick={handleStartRecording} className="mt-4 w-full py-2 bg-violet-600 text-white font-bold rounded-lg hover:bg-violet-700 transition">
                                    Try Again
                                </button>
                            )}
                        </div>
                    )}
                </WarmupContainer>
            );
        }

        return null;
    };

    const renderChatting = () => {
        return (
            <div className="flex-1 flex flex-col p-4 bg-black/40">
                <div className="bg-white/95 backdrop-blur-md p-6 rounded-t-xl shadow-lg w-full max-w-md mx-auto text-center">
                    <h2 className="text-xl font-bold">Role-play Time!</h2>
                    <p className="text-slate-600">You are at a {scenario.title.toLowerCase()}. Start the conversation!</p>
                </div>
                <div className="flex-1 w-full max-w-md mx-auto bg-white/95 overflow-y-auto p-4 space-y-4">
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex items-start gap-3 ${msg.speaker === 'user' ? 'justify-end' : ''}`}>
                            {msg.speaker === 'model' && <ChloeAvatar />}
                            <div className={`p-3 rounded-xl max-w-xs ${msg.speaker === 'user' ? 'bg-violet-600 text-white' : 'bg-slate-100 text-slate-800'}`}>
                                <p className="font-medium">{msg.line.french}</p>
                                {msg.speaker === 'model' && <p className="text-xs text-slate-500 italic mt-1">{msg.line.english}</p>}
                            </div>
                            {msg.speaker === 'user' && <UserAvatar />}
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex items-start gap-3">
                            <ChloeAvatar />
                            <div className="p-3 rounded-xl bg-slate-100">
                                <LoadingSpinner className="w-5 h-5 text-slate-500" />
                            </div>
                        </div>
                    )}
                    <div ref={chatEndRef} />
                </div>
                <div className="bg-white/95 backdrop-blur-md p-4 rounded-b-xl shadow-lg w-full max-w-md mx-auto">
                    <div className="flex items-center gap-2">
                        <input 
                            type="text"
                            value={userInput}
                            onChange={(e) => setUserInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                            className="w-full p-2 border-2 border-slate-300 rounded-lg focus:border-violet-500 focus:ring-violet-500"
                            placeholder="Type your reply..."
                            disabled={isLoading}
                        />
                        <button onClick={handleSend} disabled={isLoading || !userInput.trim()} className="p-2 bg-violet-600 text-white rounded-lg disabled:bg-violet-300">
                            Send
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen flex flex-col bg-slate-50 relative">
            <img src={scenario.media.backgroundImage} alt={scenario.title} className="absolute inset-0 w-full h-full object-cover" />
            <AmbientSoundPlayer src={scenario.media.ambientSound} isPlaying={true} />
            <PageHeader title={scenario.title} onExit={onExit} />
            {mode === 'walkthrough' && renderWalkthrough()}
            {mode === 'warmup' && renderWarmup()}
            {mode === 'chatting' && renderChatting()}
        </div>
    );
};


// --- Confetti Component ---
const Confetti: React.FC = () => {
  const [pieces, setPieces] = useState<any[]>([]);

  useEffect(() => {
    const newPieces = Array.from({ length: 100 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      animationDuration: `${2 + Math.random() * 3}s`,
      animationDelay: `${Math.random() * 2}s`,
      backgroundColor: ['#7F56D9', '#00C48C', '#FFC107', '#FF4D4F'][Math.floor(Math.random() * 4)],
    }));
    setPieces(newPieces);
  }, []);

  return (
    <div className="confetti-container">
      {pieces.map(p => (
        <div
          key={p.id}
          className="confetti"
          style={{
            left: p.left,
            animation: `fall ${p.animationDuration} linear ${p.animationDelay} forwards`,
            backgroundColor: p.backgroundColor,
            transform: `rotate(${Math.random() * 360}deg)`
          }}
        />
      ))}
    </div>
  );
};


// --- Lesson Screen ---
const LessonScreen: React.FC<{ lesson: Lesson, onExit: () => void }> = ({ lesson, onExit }) => {
    const { completeLesson } = useApp();
    const [stage, setStage] = useState<LessonStage>('study');
    const [currentVocabIndex, setCurrentVocabIndex] = useState(0);
    const vocabItem = lesson.vocabulary[currentVocabIndex];

    // Audio states
    const [audioContext] = useState(() => new (window.AudioContext || (window as any).webkitAudioContext)());
    const [playingAudio, setPlayingAudio] = useState(false);
    
    // Pronunciation states
    const [ai] = useState(() => new GoogleGenAI({ apiKey: process.env.API_KEY! }));
    const [recordingStatus, setRecordingStatus] = useState<'idle' | 'recording' | 'processing' | 'feedback'>('idle');
    const [feedbackResult, setFeedbackResult] = useState<{ score: number; feedback: string } | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    
    // Feynman states
    const [feynmanInput, setFeynmanInput] = useState('');
    const [feynmanFeedback, setFeynmanFeedback] = useState<string | null>(null);
    const [isFeynmanLoading, setIsFeynmanLoading] = useState(false);

    const resetPronunciation = () => {
        setRecordingStatus('idle');
        setFeedbackResult(null);
    };

    const handleNextVocab = () => {
        resetPronunciation();
        setCurrentVocabIndex(prev => prev + 1);
    };

    const handlePrevVocab = () => {
        resetPronunciation();
        setCurrentVocabIndex(prev => prev - 1);
    };
    
    const handlePlayVocabAudio = async (text: string) => {
        if (playingAudio) return;
        setPlayingAudio(true);
        try {
            const base64Audio = await getPronunciationAudio(text);
            await decodeAndPlayAudio(base64Audio, audioContext);
        } catch (error) {
            console.error("Failed to play audio", error);
        } finally {
            setPlayingAudio(false);
        }
    };
    
    const handleStartRecording = async () => {
        resetPronunciation();
        setRecordingStatus('recording');
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: 'audio/webm' });
            audioChunksRef.current = [];
            mediaRecorderRef.current.ondataavailable = event => audioChunksRef.current.push(event.data);
            mediaRecorderRef.current.onstop = async () => {
                setRecordingStatus('processing');
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                try {
                    const feedback = await getPronunciationFeedback(ai, vocabItem.french, audioBlob);
                    setFeedbackResult(feedback);
                    setRecordingStatus('feedback');
                    if (feedback.score >= 75) playSound(CORRECT_ANSWER_SOUND_URL);
                } catch (error) {
                    setFeedbackResult({ score: 0, feedback: "Sorry, I couldn't analyze that. Please try again." });
                    setRecordingStatus('feedback');
                }
                stream.getTracks().forEach(track => track.stop());
            };
            mediaRecorderRef.current.start();
        } catch (err) {
            console.error("Mic error:", err);
            setRecordingStatus('idle');
        }
    };

    const handleStopRecording = () => {
        if (mediaRecorderRef.current) {
            mediaRecorderRef.current.stop();
        }
    };

    const handleFeynmanSubmit = async () => {
        if (!feynmanInput.trim()) return;
        setIsFeynmanLoading(true);
        setFeynmanFeedback(null);
        try {
            const feedback = await getFeynmanExplanation(lesson.feynmanPrompt.concept, feynmanInput);
            setFeynmanFeedback(feedback);
        } catch (error) {
            setFeynmanFeedback("Sorry, Chloé had trouble reviewing your explanation. Please try again.");
        } finally {
            setIsFeynmanLoading(false);
        }
    };

    const renderPronunciationPractice = () => {
        return (
            <div className="mt-4 border-t border-slate-200 pt-4">
                <h3 className="font-bold text-center text-slate-600 mb-2">Practice your pronunciation</h3>
                {recordingStatus === 'idle' && (
                    <div className="text-center">
                        <button onClick={handleStartRecording} className="py-3 px-6 bg-violet-100 text-violet-700 font-bold rounded-xl shadow-sm hover:bg-violet-200 transition-all flex items-center gap-2 mx-auto">
                            <MicrophoneIcon className="w-5 h-5" />
                            <span>Start Recording</span>
                        </button>
                    </div>
                )}
                {recordingStatus === 'recording' && (
                    <div className="text-center">
                         <button onClick={handleStopRecording} className="py-3 px-6 bg-red-500 text-white font-bold rounded-xl shadow-sm hover:bg-red-600 transition-all flex items-center gap-2 mx-auto animate-pulse">
                            <div className="w-2 h-2 bg-white rounded-full" />
                            <span>Stop Recording</span>
                        </button>
                    </div>
                )}
                {recordingStatus === 'processing' && (
                     <div className="text-center flex items-center justify-center gap-2 text-slate-500">
                        <LoadingSpinner className="w-5 h-5"/>
                        <span>Chloé is listening...</span>
                     </div>
                )}
                {recordingStatus === 'feedback' && feedbackResult && (
                    <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 fade-in">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="font-bold">Feedback</h3>
                            <div className={`font-bold text-lg ${feedbackResult.score >= 75 ? 'text-green-600' : feedbackResult.score > 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                                {feedbackResult.score}/100
                            </div>
                        </div>
                        <p className="text-sm text-slate-700">{feedbackResult.feedback}</p>
                        <button onClick={() => setRecordingStatus('idle')} className="mt-3 w-full text-center py-2 bg-slate-200 text-slate-700 font-bold rounded-lg hover:bg-slate-300 text-sm">
                            Try Again
                        </button>
                    </div>
                )}
            </div>
        );
    };

    const renderStudyStage = () => (
        <div className="flex-grow flex flex-col justify-between p-4">
            <div className="bg-white rounded-xl shadow-md p-6 w-full max-w-md mx-auto">
                <div className="text-center">
                    <h2 className="text-4xl font-bold text-violet-700 mb-1">{vocabItem.french}</h2>
                    <p className="text-lg text-slate-600 mb-2">{vocabItem.english}</p>
                    {vocabItem.phonetic && <p className="text-md text-slate-400 font-mono mb-4">{vocabItem.phonetic}</p>}
                    <button
                        onClick={() => handlePlayVocabAudio(vocabItem.french)}
                        className="text-slate-500 hover:text-violet-600 disabled:opacity-50 mx-auto"
                        disabled={playingAudio}
                    >
                        {playingAudio ? <LoadingSpinner className="w-8 h-8"/> : <SpeakerIcon className="w-8 h-8"/>}
                    </button>
                </div>
                {renderPronunciationPractice()}
            </div>
            
            <div className="flex justify-between items-center w-full max-w-md mx-auto mt-4">
                <button 
                    onClick={handlePrevVocab} 
                    disabled={currentVocabIndex === 0}
                    className="py-3 px-6 bg-white text-text-primary font-bold rounded-xl shadow-sm disabled:opacity-50 hover:bg-slate-50"
                >
                    Previous
                </button>
                <span className="text-slate-500 font-semibold">{currentVocabIndex + 1} / {lesson.vocabulary.length}</span>
                {currentVocabIndex < lesson.vocabulary.length - 1 ? (
                    <button 
                        onClick={handleNextVocab} 
                        className="py-3 px-6 bg-violet-600 text-white font-bold rounded-xl shadow-md hover:bg-violet-700"
                    >
                        Next
                    </button>
                ) : (
                    <button 
                        onClick={() => setStage('feynman')} 
                        className="py-3 px-6 bg-green-600 text-white font-bold rounded-xl shadow-md hover:bg-green-700"
                    >
                        Final Step
                    </button>
                )}
            </div>
        </div>
    );
    
    const renderFeynmanStage = () => (
        <div className="flex-grow flex flex-col justify-center items-center p-4">
            <div className="bg-white rounded-xl shadow-md p-6 w-full max-w-md mx-auto scale-in-anim">
                <div className="text-center mb-4">
                    <div className="text-3xl mb-2">💡</div>
                    <h2 className="text-xl font-bold">Explain It to Chloé</h2>
                    <p className="text-slate-600 mt-1">{lesson.feynmanPrompt.promptText}</p>
                </div>

                {!feynmanFeedback && !isFeynmanLoading && (
                    <>
                        <textarea
                            value={feynmanInput}
                            onChange={(e) => setFeynmanInput(e.target.value)}
                            className="w-full h-32 p-3 border-2 border-slate-200 rounded-lg focus:border-violet-500 focus:ring-violet-500"
                            placeholder="Explain the concept in your own words..."
                        />
                        <button onClick={handleFeynmanSubmit} disabled={!feynmanInput.trim()} className="mt-4 w-full py-3 bg-violet-600 text-white font-bold rounded-xl shadow-md hover:bg-violet-700 transition disabled:opacity-50">
                            Get Feedback
                        </button>
                    </>
                )}
                
                {isFeynmanLoading && (
                    <div className="text-center py-8">
                        <LoadingSpinner className="w-8 h-8 mx-auto text-violet-600"/>
                        <p className="mt-2 text-slate-500">Chloé is thinking...</p>
                    </div>
                )}

                {feynmanFeedback && (
                    <div className="fade-in">
                        <div className="mt-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
                             <div className="flex items-start gap-3">
                                <ChloeAvatar />
                                <div className="flex-1">
                                    <h3 className="font-bold text-slate-800">Chloé's Feedback</h3>
                                    <SimpleMarkdown text={feynmanFeedback} />
                                </div>
                            </div>
                        </div>
                        <button onClick={() => setStage('complete')} className="mt-4 w-full py-3 bg-green-600 text-white font-bold rounded-xl shadow-md hover:bg-green-700 transition pulse-anim">
                            Finish Lesson
                        </button>
                    </div>
                )}
            </div>
        </div>
    );

    const renderCompletionStage = () => (
        <div className="flex-grow flex flex-col justify-center items-center p-4 text-center">
            <Confetti />
            <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-sm mx-auto scale-in-anim">
                <div className="text-6xl mb-4">🎉</div>
                <h2 className="text-3xl font-bold text-text-primary">Lesson Complete!</h2>
                <p className="text-lg text-slate-600 mt-2">Great job solidifying your knowledge.</p>
                <div className="mt-6 bg-yellow-100 text-yellow-800 font-bold py-3 px-5 rounded-lg inline-block">
                    +50 XP
                </div>
                <button onClick={() => completeLesson(lesson.id)} className="mt-8 w-full py-3 bg-violet-600 text-white font-bold rounded-xl shadow-md hover:bg-violet-700 transition">
                    Continue
                </button>
            </div>
        </div>
    );
    
    const totalStages = lesson.vocabulary.length + 2; // Vocab items + Feynman + Complete
    const currentProgress = stage === 'study' ? currentVocabIndex + 1 : stage === 'feynman' ? lesson.vocabulary.length + 1 : totalStages;

    return (
        <div className="min-h-screen bg-slate-100 flex flex-col">
             <PageHeader 
                title={lesson.title} 
                onExit={onExit} 
                progress={{ current: currentProgress, total: totalStages }} 
            />
            {stage === 'study' && renderStudyStage()}
            {stage === 'feynman' && renderFeynmanStage()}
            {stage === 'complete' && renderCompletionStage()}
        </div>
    );
};


// --- Profile Screen ---
const ProfileScreen: React.FC = () => {
    const { xp, streak, completedLessons } = useApp();
    const totalLessons = UNITS.flatMap(u => u.lessons).length;
    return (
        <div className="container mx-auto px-4 py-6">
            <h1 className="text-2xl font-bold mb-6">Your Profile</h1>
            <div className="bg-white rounded-xl shadow-sm p-6 grid grid-cols-2 gap-6">
                <div className="text-center">
                    <StarIcon className="w-10 h-10 text-yellow-400 mx-auto mb-2"/>
                    <p className="text-2xl font-bold">{xp}</p>
                    <p className="text-sm text-slate-500">Total XP</p>
                </div>
                 <div className="text-center">
                    <FireIcon className="w-10 h-10 text-orange-500 mx-auto mb-2"/>
                    <p className="text-2xl font-bold">{streak}</p>
                    <p className="text-sm text-slate-500">Day Streak</p>
                </div>
                <div className="text-center col-span-2 border-t pt-6">
                    <BookOpenIcon className="w-10 h-10 text-violet-500 mx-auto mb-2"/>
                    <p className="text-2xl font-bold">{completedLessons.length} / {totalLessons}</p>
                    <p className="text-sm text-slate-500">Lessons Completed</p>
                </div>
            </div>
        </div>
    );
};


// --- Main App Component & Provider ---
const App: React.FC = () => {
    // App State
    const [currentView, setCurrentView] = useState<Screen>('learn');
    const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
    const [currentGame, setCurrentGame] = useState<Game | null>(null);
    const [currentScenario, setCurrentScenario] = useState<PracticeScenario | null>(null);
    
    // User Stats
    const [xp, setXp] = useState(1250);
    const [hearts, setHearts] = useState(5);
    const [streak, setStreak] = useState(12);
    const [completedLessons, setCompletedLessons] = useState<string[]>(['greetings-pronunciation']);

    const addXp = (amount: number) => setXp(prev => prev + amount);
    const loseHeart = () => setHearts(prev => Math.max(0, prev - 1));
    
    const completeLesson = (lessonId: string) => {
        if (!completedLessons.includes(lessonId)) {
            setCompletedLessons(prev => [...prev, lessonId]);
            addXp(50);
        }
        setCurrentLesson(null);
        setCurrentView('learn');
    };

    const appContextValue: AppContextType = {
        xp,
        hearts,
        streak,
        completedLessons,
        addXp,
        setHearts,
        loseHeart,
        completeLesson,
    };
    
    const handleSelectLesson = (lesson: Lesson) => {
        setCurrentLesson(lesson);
        setCurrentView('learn'); // This seems redundant, but ensures we are on the 'learn' tab logically
    };
    
    const handleSelectGame = (game: Game) => {
        setCurrentGame(game);
        setCurrentView('games');
    };

    const handleSelectScenario = (scenario: PracticeScenario) => {
        setCurrentScenario(scenario);
        setCurrentView('practice');
    }

    const exitSubView = () => {
        setCurrentLesson(null);
        setCurrentGame(null);
        setCurrentScenario(null);
    };

    const renderContent = () => {
        if (currentLesson) {
            return <LessonScreen lesson={currentLesson} onExit={exitSubView} />;
        }
        if (currentGame) {
            if (currentGame.type === 'flashcards') {
                return <FlashcardGameScreen game={currentGame} onExit={exitSubView} />;
            }
            if (currentGame.type === 'matching') {
                return <MatchingPairGameScreen game={currentGame} onExit={exitSubView} />;
            }
        }
        if (currentScenario) {
            return <PracticeScenarioScreen scenario={currentScenario} onExit={exitSubView} />;
        }

        switch (currentView) {
            case 'learn':
                return <LearnScreen onSelectLesson={handleSelectLesson} />;
            case 'practice':
                return <PracticeScreen onSelectScenario={handleSelectScenario} />;
            case 'games':
                return <GamesScreen onSelectGame={handleSelectGame} />;
            case 'profile':
                return <ProfileScreen />;
            default:
                return <LearnScreen onSelectLesson={handleSelectLesson} />;
        }
    };
    
    const isSubViewActive = !!currentLesson || !!currentGame || !!currentScenario;

    return (
        <AppProvider value={appContextValue}>
            <div className="flex flex-col h-screen">
                {!isSubViewActive && <TopBar />}
                <main className={`flex-grow ${!isSubViewActive ? 'pb-20' : ''} bg-slate-50`}>
                    {renderContent()}
                </main>
                {!isSubViewActive && <BottomNav activeScreen={currentView} setScreen={setCurrentView} />}
            </div>
        </AppProvider>
    );
};

const AppProvider: React.FC<{ children: React.ReactNode, value: AppContextType }> = ({ children, value }) => {
    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

const TopBar: React.FC = () => {
    const { xp, hearts, streak } = useApp();
    return (
        <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-10">
            <div className="container mx-auto px-4 py-3 flex justify-between items-center">
                <h1 className="text-xl font-bold text-violet-700 font-heading">LinguaQuest</h1>
                <div className="flex items-center space-x-4">
                    <div className="flex items-center font-bold text-yellow-500">
                        <StarIcon className="w-5 h-5 mr-1" /> {xp}
                    </div>
                    <div className="flex items-center font-bold text-orange-500">
                        <FireIcon className="w-5 h-5 mr-1" /> {streak}
                    </div>
                    <div className="flex items-center font-bold text-red-500">
                        <HeartIcon className="w-5 h-5 mr-1" /> {hearts}
                    </div>
                </div>
            </div>
        </header>
    );
};

const BottomNav: React.FC<{ activeScreen: Screen; setScreen: (screen: Screen) => void; }> = ({ activeScreen, setScreen }) => {
    const navItems = [
        { screen: 'learn', icon: BookOpenIcon, label: 'Learn' },
        { screen: 'practice', icon: SparklesIcon, label: 'Practice' },
        { screen: 'games', icon: TrophyIcon, label: 'Games' },
        { screen: 'profile', icon: UserIcon, label: 'Profile' },
    ] as const;

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-slate-200">
            <div className="container mx-auto px-4 flex justify-around">
                {navItems.map(item => (
                    <button
                        key={item.screen}
                        onClick={() => setScreen(item.screen)}
                        className={`flex flex-col items-center py-2 px-3 text-sm transition-colors ${activeScreen === item.screen ? 'text-violet-600 font-bold' : 'text-slate-500 hover:text-violet-500'}`}
                    >
                        <item.icon className="w-7 h-7 mb-0.5" />
                        <span>{item.label}</span>
                    </button>
                ))}
            </div>
        </nav>
    );
};

export default App;
