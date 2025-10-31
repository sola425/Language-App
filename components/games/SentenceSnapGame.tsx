import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { SentenceSnapGame as SentenceSnapGameProps, SentenceSnapChunk, GrammaticalSlot } from '../../types';
import { ArrowLeftIcon, CheckIcon } from '../Icons';

function shuffleArray<T>(array: T[]): T[] {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

const CORRECT_SOUND_URL = 'https://cdn.pixabay.com/audio/2022/01/21/audio_39cc61b17b.mp3';
const playSound = (url: string) => {
    const audio = new Audio(url);
    audio.volume = 0.4;
    audio.play();
};

const GameHeader: React.FC<{ title: string; onExit: () => void }> = ({ title, onExit }) => (
    <header className="sticky top-0 bg-white/80 backdrop-blur-md z-20">
        <div className="container mx-auto px-4 py-3 flex items-center">
            <button onClick={onExit} className="p-2 -ml-2 text-slate-500 hover:text-violet-600">
                <ArrowLeftIcon className="w-6 h-6" />
            </button>
            <h1 className="flex-1 text-center text-lg font-bold text-text-primary mr-6 truncate">Level {title}</h1>
        </div>
    </header>
);

type SlottedChunks = { [key in GrammaticalSlot]?: SentenceSnapChunk };

export const SentenceSnapGame: React.FC<{ game: SentenceSnapGameProps, onExit: () => void }> = ({ game, onExit }) => {
    const { level } = game;
    const [bankChunks, setBankChunks] = useState<SentenceSnapChunk[]>([]);
    const [slottedChunks, setSlottedChunks] = useState<SlottedChunks>({});
    const [shakeSlot, setShakeSlot] = useState<GrammaticalSlot | null>(null);

    const initializeLevel = useCallback(() => {
        setBankChunks(shuffleArray(level.chunks));
        const initialSlots: SlottedChunks = {};
        level.slots.forEach(slot => initialSlots[slot] = undefined);
        setSlottedChunks(initialSlots);
    }, [level]);

    useEffect(() => {
        initializeLevel();
    }, [initializeLevel]);

    const isComplete = useMemo(() => bankChunks.length === 0, [bankChunks]);

    const handleDragStart = (e: React.DragEvent<HTMLButtonElement>, chunk: SentenceSnapChunk) => {
        e.dataTransfer.setData('text/plain', JSON.stringify(chunk));
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>, slot: GrammaticalSlot) => {
        e.preventDefault();
        try {
            const chunk = JSON.parse(e.dataTransfer.getData('text/plain')) as SentenceSnapChunk;
            
            if (slottedChunks[slot] !== undefined) return;

            if (chunk.slot === slot) {
                playSound(CORRECT_SOUND_URL);
                setSlottedChunks(prev => ({ ...prev, [slot]: chunk }));
                setBankChunks(prev => prev.filter(c => c.word !== chunk.word));
            } else {
                setShakeSlot(slot);
                setTimeout(() => setShakeSlot(null), 500);
            }
        } catch (error) {
            console.error("Error parsing dropped data:", error);
        }
    };
    
    if (isComplete) {
        return (
            <div className="min-h-screen bg-slate-100 flex flex-col">
                <GameHeader title={`${level.level}`} onExit={onExit} />
                 <div className="flex-grow flex flex-col items-center justify-center p-5 text-center">
                    <h2 className="text-3xl font-bold mb-2">Level Complete!</h2>
                    <div className="text-6xl my-4">🎉</div>
                    <div className="p-4 bg-white rounded-lg shadow-inner w-full max-w-md">
                        <p className="font-bold text-xl text-violet-700">{level.slots.map(s => slottedChunks[s]?.word).join(' ')}</p>
                        <p className="text-slate-600 mt-1">{level.englishHint}</p>
                    </div>
                    <div className="flex space-x-4 mt-8">
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
            <GameHeader title={`${level.level}`} onExit={onExit} />
            <div className="flex-grow flex flex-col p-4 container mx-auto">
                <div className="text-center mb-4 p-4 bg-white rounded-xl shadow-sm">
                    <p className="font-semibold text-slate-500">Translate this sentence:</p>
                    <p className="text-xl font-bold text-text-primary">{level.englishHint}</p>
                </div>

                {/* Sentence Diagram (Drop Zone) */}
                <div className="mb-6 p-4 bg-white rounded-xl shadow-sm space-y-3">
                    {level.slots.map(slot => (
                        <div key={slot} className="flex items-center gap-2">
                            <span className="font-semibold text-slate-500 w-20 text-right">{slot}</span>
                            <div 
                                onDragOver={handleDragOver}
                                onDrop={(e) => handleDrop(e, slot)}
                                className={`flex-1 min-h-[50px] bg-slate-200 border-2 border-dashed border-slate-300 rounded-lg flex items-center justify-center
                                    ${shakeSlot === slot ? 'shake-anim border-red-500' : ''}
                                    ${slottedChunks[slot] ? 'border-solid !border-green-500 bg-green-50' : ''}
                                `}
                            >
                                {slottedChunks[slot] ? (
                                    <div className="py-2 px-4 bg-white text-violet-700 font-bold rounded-lg shadow-sm">
                                        {slottedChunks[slot]?.word}
                                    </div>
                                ) : (
                                    <span className="text-slate-400">Drop here</span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Word Bank (Drag Source) */}
                <div className="flex-grow p-4 bg-white rounded-xl shadow-sm">
                     <h2 className="text-center font-bold text-slate-500 mb-3">Word Bank</h2>
                     <div className="flex flex-wrap items-center justify-center gap-3">
                        {bankChunks.map(chunk => (
                            <button
                                key={chunk.word}
                                draggable
                                onDragStart={(e) => handleDragStart(e, chunk)}
                                className="py-2 px-4 bg-violet-600 text-white font-bold rounded-lg shadow-md cursor-grab active:cursor-grabbing"
                            >
                                {chunk.word}
                            </button>
                        ))}
                     </div>
                </div>

            </div>
        </div>
    );
};
