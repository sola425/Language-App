import React, { useState, useEffect, useCallback, useRef } from 'react';
import { BoutiqueDashGame as BoutiqueDashGameProps, BoutiqueItem } from '../../types';
import { ArrowLeftIcon, ChloeAvatar, HeartIcon, LoadingSpinner, SpeakerIcon, CheckIcon, ShoppingBagIcon, XIcon } from '../Icons';
import { getPronunciationAudio, decodeAndPlayAudio } from '../../services/geminiService';

const CORRECT_SOUND_URL = 'https://cdn.pixabay.com/audio/2021/08/04/audio_12b0c744c4.mp3';
const INCORRECT_SOUND_URL = 'https://cdn.pixabay.com/audio/2022/03/10/audio_c8a789a640.mp3';

const playSound = (url: string) => {
    const audio = new Audio(url);
    audio.volume = 0.3;
    audio.play();
};

const GameHeader: React.FC<{ title: string; onExit: () => void }> = ({ title, onExit }) => (
    <header className="sticky top-0 bg-white/80 backdrop-blur-md z-20">
        <div className="container mx-auto px-4 py-3 flex items-center">
            <button onClick={onExit} className="p-2 -ml-2 text-slate-500 hover:text-violet-600">
                <ArrowLeftIcon className="w-6 h-6" />
            </button>
            <h1 className="flex-1 text-center text-lg font-bold text-text-primary mr-6 truncate">{title}</h1>
        </div>
    </header>
);

export const BoutiqueDashGame: React.FC<{ game: BoutiqueDashGameProps, onExit: () => void }> = ({ game, onExit }) => {
    const { level } = game;
    const [gameState, setGameState] = useState<'playing' | 'paused' | 'finished'>('playing');
    const [score, setScore] = useState(0);
    const [lives, setLives] = useState(3);
    const [timeLeft, setTimeLeft] = useState(60);
    const [currentOrderIndex, setCurrentOrderIndex] = useState(0);
    const [bag, setBag] = useState<Map<string, number>>(new Map());
    const [isListening, setIsListening] = useState(true);
    const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);

    const audioContextRef = useRef(new (window.AudioContext || (window as any).webkitAudioContext)());

    const currentOrder = level.customerOrders[currentOrderIndex];

    const playOrderAudio = useCallback(async () => {
        if (!currentOrder) return;
        setIsListening(true);
        try {
            const audio = await getPronunciationAudio(currentOrder.frenchAudio);
            await decodeAndPlayAudio(audio, audioContextRef.current);
        } catch (error) {
            console.error("Failed to play order audio:", error);
        } finally {
            setIsListening(false);
        }
    }, [currentOrder]);
    
    useEffect(() => {
        playOrderAudio();
    }, [playOrderAudio]);
    
    useEffect(() => {
        if (gameState !== 'playing') return;
        if (timeLeft <= 0 || lives <= 0) {
            setGameState('finished');
            return;
        }
        const timer = setInterval(() => {
            setTimeLeft(prev => prev - 1);
        }, 1000);
        return () => clearInterval(timer);
    }, [timeLeft, lives, gameState]);

    const addToBag = (item: BoutiqueItem) => {
        if (feedback) return;
        const newBag = new Map(bag);
        // FIX: The value from a Map's get() can be undefined. Coalesce to 0 before adding.
        newBag.set(item.id, (newBag.get(item.id) || 0) + 1);
        setBag(newBag);
    };
    
    const clearBag = () => {
        setBag(new Map());
        setFeedback(null);
    };

    const handleServe = () => {
        if (feedback) return;
        
        let isCorrect = true;
        if (bag.size !== currentOrder.items.length) {
            isCorrect = false;
        } else {
            for (const orderItem of currentOrder.items) {
                if (bag.get(orderItem.itemId) !== orderItem.quantity) {
                    isCorrect = false;
                    break;
                }
            }
        }
        
        setFeedback(isCorrect ? 'correct' : 'incorrect');

        if (isCorrect) {
            playSound(CORRECT_SOUND_URL);
            setScore(prev => prev + 100);
            setTimeout(() => {
                const nextIndex = currentOrderIndex + 1;
                if (nextIndex >= level.customerOrders.length) {
                    setGameState('finished');
                } else {
                    setCurrentOrderIndex(nextIndex);
                    setBag(new Map());
                }
                setFeedback(null);
            }, 1000);
        } else {
            playSound(INCORRECT_SOUND_URL);
            setLives(prev => prev - 1);
            // Shake animation is handled by CSS class
        }
    };

    const getBagContents = () => {
        const contents: BoutiqueItem[] = [];
        bag.forEach((quantity, itemId) => {
            const item = level.possibleItems.find(p => p.id === itemId);
            if (item) {
                for(let i=0; i < quantity; i++) {
                    contents.push(item);
                }
            }
        });
        return contents;
    };

    if (gameState === 'finished') {
        return (
            <div className="min-h-screen bg-slate-100 flex flex-col">
                <GameHeader title={level.title} onExit={onExit} />
                 <div className="flex-grow flex flex-col items-center justify-center p-5 text-center">
                    <h2 className="text-3xl font-bold mb-2">{lives > 0 ? "Level Complete!" : "Game Over"}</h2>
                    <div className="text-6xl my-4">{lives > 0 ? '🎉' : '💔'}</div>
                    <p className="text-xl text-text-secondary mb-6">Your final score is: <span className="font-bold text-violet-600">{score}</span></p>
                    <div className="flex space-x-4">
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
            <GameHeader title={level.title} onExit={onExit} />
            <div className="p-4 bg-white shadow-md">
                <div className="container mx-auto flex justify-between items-center text-lg font-bold">
                    <div>Score: <span className="text-violet-600">{score}</span></div>
                    <div>Time: <span className={timeLeft < 10 ? 'text-red-500' : ''}>{timeLeft}</span></div>
                    <div className="flex items-center">
                        {Array.from({ length: 3 }).map((_, i) => (
                           <HeartIcon key={i} className={`w-6 h-6 ${i < lives ? 'text-red-500' : 'text-slate-300'}`} />
                        ))}
                    </div>
                </div>
            </div>

            <div className="flex-grow flex flex-col p-4 container mx-auto">
                {/* Customer Area */}
                <div className="relative mb-4 p-4 bg-white rounded-xl shadow-sm">
                    <div className="flex items-center gap-4">
                        <ChloeAvatar />
                        <div className="flex-1 min-h-[50px] bg-slate-100 rounded-lg p-3 text-lg font-medium text-slate-700 italic flex items-center justify-center">
                            {isListening ? <LoadingSpinner className="w-6 h-6 text-violet-500"/> : `"${currentOrder.frenchAudio}"`}
                        </div>
                        <button onClick={playOrderAudio} disabled={isListening} className="p-2 text-slate-500 hover:text-violet-600 disabled:opacity-50">
                            <SpeakerIcon className="w-7 h-7" />
                        </button>
                    </div>
                </div>
                
                {/* Counter Area */}
                <div className="mb-4 p-4 bg-white rounded-xl shadow-sm">
                    <h2 className="text-center font-bold text-slate-500 mb-3">Counter</h2>
                    <div className="grid grid-cols-4 gap-4">
                        {level.possibleItems.map(item => (
                            <button key={item.id} onClick={() => addToBag(item)} className="aspect-square bg-slate-100 rounded-lg flex flex-col items-center justify-center hover:bg-violet-100 transition-colors">
                                <span className="text-4xl">{item.icon}</span>
                                <span className="text-sm font-semibold">{item.name}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Bag Area */}
                <div className={`flex-grow p-4 bg-white rounded-xl shadow-sm flex flex-col ${feedback === 'incorrect' ? 'shake-anim border-2 border-red-500' : ''}`}>
                    <div className="flex justify-between items-center mb-2">
                        <h2 className="font-bold text-slate-500 flex items-center gap-2"><ShoppingBagIcon className="w-5 h-5" /> Your Bag</h2>
                        {feedback === 'correct' && <CheckIcon className="w-6 h-6 text-green-500" />}
                        {feedback === 'incorrect' && <XIcon className="w-6 h-6 text-red-500" />}
                    </div>
                    <div className="min-h-[60px] flex-grow bg-slate-100 rounded-lg p-2 flex flex-wrap items-start gap-2">
                        {getBagContents().map((item, index) => (
                            <span key={index} className="text-3xl scale-in-anim">{item.icon}</span>
                        ))}
                    </div>
                </div>

                {/* Controls */}
                <div className="mt-4 grid grid-cols-2 gap-4">
                    <button onClick={clearBag} className="py-3 bg-slate-200 text-slate-700 font-bold rounded-xl shadow-sm hover:bg-slate-300">Clear Bag</button>
                    <button onClick={handleServe} disabled={bag.size === 0 || !!feedback} className="py-3 bg-green-600 text-white font-bold rounded-xl shadow-md hover:bg-green-700 disabled:bg-green-300">Serve Customer</button>
                </div>
            </div>
        </div>
    );
};
