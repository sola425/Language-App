
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { MatchingPairGame } from '../types';
import { ArrowLeftIcon } from './Icons';

// --- UTILS & HELPERS ---
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

function shuffleArray<T>(array: T[]): T[] {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

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

interface Card {
    id: number;
    pairId: string;
    content: string;
}

export const MatchingPairGameScreen: React.FC<{ game: MatchingPairGame, onExit: () => void }> = ({ game, onExit }) => {
    const [cards, setCards] = useState<Card[]>([]);
    const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
    const [matchedPairs, setMatchedPairs] = useState<string[]>([]);
    const [isChecking, setIsChecking] = useState(false);
    const [justMatchedPairId, setJustMatchedPairId] = useState<string | null>(null);

    const isDone = useMemo(() => matchedPairs.length === game.pairs.length, [matchedPairs, game.pairs]);

    const generateCards = useCallback(() => {
        const gameCards: Omit<Card, 'id'>[] = [];
        game.pairs.forEach(pair => {
            gameCards.push({ pairId: pair.french, content: pair.french });
            gameCards.push({ pairId: pair.french, content: pair.english });
        });
        setCards(shuffleArray(gameCards).map((card, index) => ({ ...card, id: index })));
        setFlippedIndices([]);
        setMatchedPairs([]);
        setJustMatchedPairId(null);
    }, [game]);
    
    useEffect(() => {
        generateCards();
    }, [generateCards]);

    const handleCardClick = (index: number) => {
        if (isChecking || flippedIndices.includes(index) || matchedPairs.includes(cards[index].pairId)) {
            return;
        }

        const newFlippedIndices = [...flippedIndices, index];
        setFlippedIndices(newFlippedIndices);

        if (newFlippedIndices.length === 2) {
            setIsChecking(true);
            const [firstIndex, secondIndex] = newFlippedIndices;
            const firstCard = cards[firstIndex];
            const secondCard = cards[secondIndex];

            if (firstCard.pairId === secondCard.pairId) {
                playSound(CORRECT_ANSWER_SOUND_URL);
                setMatchedPairs(prev => [...prev, firstCard.pairId]);
                setFlippedIndices([]);
                setJustMatchedPairId(firstCard.pairId);
                setIsChecking(false);
                setTimeout(() => {
                    setJustMatchedPairId(null);
                }, 500);
            } else {
                setTimeout(() => {
                    setFlippedIndices([]);
                    setIsChecking(false);
                }, 1000);
            }
        }
    };
    
    if (isDone) {
        return (
            <div className="min-h-screen bg-slate-100 flex flex-col">
                <GameHeader title={game.title} onExit={onExit} />
                 <div className="flex-grow flex flex-col items-center justify-center p-5 text-center">
                    <h2 className="text-2xl font-bold mb-4">You found all pairs!</h2>
                    <div className="text-7xl mb-8">🎉</div>
                    <p className="text-lg text-text-secondary mb-8">Excellent memory work!</p>
                    <div className="flex space-x-4">
                         <button
                            onClick={generateCards}
                            className="py-3 px-6 bg-white border border-slate-300 text-text-primary font-bold rounded-xl shadow-sm hover:bg-slate-100 transition-all"
                        >
                            Play Again
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
            <div className="flex-grow p-4 flex flex-col items-center">
                <p className="text-text-secondary mb-4">Pairs found: {matchedPairs.length} / {game.pairs.length}</p>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 w-full max-w-lg">
                    {cards.map((card, index) => {
                        const isFlipped = flippedIndices.includes(index);
                        const isMatched = matchedPairs.includes(card.pairId);
                        const isJustMatched = justMatchedPairId === card.pairId;
                        
                        return (
                             <button
                                key={card.id}
                                onClick={() => handleCardClick(index)}
                                disabled={isMatched}
                                className={`aspect-square rounded-lg flex items-center justify-center p-2 text-center font-semibold transition-all duration-300 shadow-sm
                                    ${(isFlipped || isMatched) ? 'bg-white text-text-primary' : 'bg-violet-600 text-violet-600'}
                                    ${isMatched ? 'bg-green-700 border-green-800 text-white opacity-100 cursor-default' : ''}
                                    ${isJustMatched ? 'match-success-anim' : ''}
                                `}
                            >
                                <span className={`transition-opacity duration-300 ${(isFlipped || isMatched) ? 'opacity-100' : 'opacity-0'}`}>
                                    {card.content}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
