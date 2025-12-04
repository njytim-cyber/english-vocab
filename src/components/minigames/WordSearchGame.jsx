import React, { useState, useEffect, useRef } from 'react';
import { triggerConfetti } from '../../utils/effects';
import { speak } from '../../utils/audio';
import { sfx } from '../../utils/soundEffects';
import GameTutorialModal from '../common/GameTutorialModal';
import GameSummaryModal from '../common/GameSummaryModal';

export default function WordSearchGame({ engine, onBack }) {
    const [grid, setGrid] = useState([]);
    const [words, setWords] = useState([]);
    const [foundWords, setFoundWords] = useState(new Set());
    const [selectedCells, setSelectedCells] = useState([]);
    const [isSelecting, setIsSelecting] = useState(false);
    const [showTutorial, setShowTutorial] = useState(false);
    const [showSummary, setShowSummary] = useState(false);
    const [rewards, setRewards] = useState({ xp: 0, coins: 0 });

    const GRID_SIZE = 10;

    useEffect(() => {
        startNewRound();

        // Check tutorial status
        const hasSeenTutorial = localStorage.getItem('tutorial_wordsearch');
        if (!hasSeenTutorial) {
            setShowTutorial(true);
        }
    }, []);

    const closeTutorial = () => {
        sfx.playClick();
        setShowTutorial(false);
        localStorage.setItem('tutorial_wordsearch', 'true');
    };

    const startNewRound = () => {
        // Get words
        const qs = engine.getReinforcementQuestions(5);
        const wordList = qs.map(q => q.answer.toUpperCase());
        setWords(wordList);
        setFoundWords(new Set());
        setSelectedCells([]);
        setShowSummary(false);

        // Generate Grid
        const newGrid = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(''));

        // Place words
        wordList.forEach(word => {
            let placed = false;
            let attempts = 0;
            while (!placed && attempts < 100) {
                const dir = Math.random() > 0.5 ? 'H' : 'V';
                const r = Math.floor(Math.random() * GRID_SIZE);
                const c = Math.floor(Math.random() * GRID_SIZE);

                if (canPlace(newGrid, word, r, c, dir)) {
                    placeWord(newGrid, word, r, c, dir);
                    placed = true;
                }
                attempts++;
            }
        });

        // Fill empty
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        for (let i = 0; i < GRID_SIZE; i++) {
            for (let j = 0; j < GRID_SIZE; j++) {
                if (newGrid[i][j] === '') {
                    newGrid[i][j] = chars[Math.floor(Math.random() * chars.length)];
                }
            }
        }
        setGrid(newGrid);
    };

    const canPlace = (g, word, r, c, dir) => {
        if (dir === 'H') {
            if (c + word.length > GRID_SIZE) return false;
            for (let i = 0; i < word.length; i++) {
                if (g[r][c + i] !== '' && g[r][c + i] !== word[i]) return false;
            }
        } else {
            if (r + word.length > GRID_SIZE) return false;
            for (let i = 0; i < word.length; i++) {
                if (g[r + i][c] !== '' && g[r + i][c] !== word[i]) return false;
            }
        }
        return true;
    };

    const placeWord = (g, word, r, c, dir) => {
        for (let i = 0; i < word.length; i++) {
            if (dir === 'H') g[r][c + i] = word[i];
            else g[r + i][c] = word[i];
        }
    };

    const handleMouseDown = (r, c) => {
        setIsSelecting(true);
        setSelectedCells([{ r, c }]);
        sfx.playClick();
    };

    const handleMouseEnter = (r, c) => {
        if (!isSelecting) return;
        // Simple line check
        const start = selectedCells[0];
        if (r === start.r || c === start.c || Math.abs(r - start.r) === Math.abs(c - start.c)) {
            // Re-calculate selection from start to current
            const newSelection = [];
            const dr = Math.sign(r - start.r);
            const dc = Math.sign(c - start.c);
            let currR = start.r;
            let currC = start.c;

            while (currR !== r + dr || currC !== c + dc) {
                newSelection.push({ r: currR, c: currC });
                currR += dr;
                currC += dc;
                if (newSelection.length > GRID_SIZE) break; // Safety
            }
            setSelectedCells(newSelection);
        }
    };

    const handleMouseUp = () => {
        setIsSelecting(false);
        const selectedWord = selectedCells.map(cell => grid[cell.r][cell.c]).join('');

        if (words.includes(selectedWord) && !foundWords.has(selectedWord)) {
            // Found!
            const newFound = new Set(foundWords);
            newFound.add(selectedWord);
            setFoundWords(newFound);
            triggerConfetti();
            sfx.playCorrect();
            speak(selectedWord);

            if (newFound.size === words.length) {
                sfx.playWin();
                const xpEarned = 50;
                const coinsEarned = 25;
                setRewards({ xp: xpEarned, coins: coinsEarned });
                setTimeout(() => setShowSummary(true), 1000);
            }
        } else {
            // Invalid
            setSelectedCells([]);
        }
    };

    return (
        <div className="word-search-game" style={{
            padding: '2rem',
            maxWidth: '800px',
            margin: '0 auto',
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            color: 'var(--dark)',
            userSelect: 'none'
        }} onMouseUp={handleMouseUp}>
            <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <button onClick={() => { sfx.playClick(); onBack(); }} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>
                    ← Back
                </button>
                <h2 style={{ margin: 0 }}>Word Search 🔍</h2>
                <button
                    onClick={() => { sfx.playClick(); setShowTutorial(true); }}
                    style={{
                        background: 'white',
                        border: 'none',
                        borderRadius: '50%',
                        width: '36px',
                        height: '36px',
                        cursor: 'pointer',
                        fontSize: '1.2rem',
                        fontWeight: 'bold',
                        color: '#4ECDC4',
                        boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                    }}
                >
                    ?
                </button>
            </div>

            <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                {/* Grid */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: `repeat(${GRID_SIZE}, 40px)`,
                    gap: '2px',
                    background: '#ddd',
                    padding: '5px',
                    borderRadius: '5px',
                    cursor: 'pointer'
                }}>
                    {grid.map((row, r) => row.map((char, c) => {
                        const isSelected = selectedCells.some(cell => cell.r === r && cell.c === c);
                        // Check if part of found word (would need more complex tracking, skipping for now)

                        return (
                            <div
                                key={`${r}-${c}`}
                                onMouseDown={() => handleMouseDown(r, c)}
                                onMouseEnter={() => handleMouseEnter(r, c)}
                                style={{
                                    width: '40px',
                                    height: '40px',
                                    background: isSelected ? 'var(--secondary)' : 'white',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontWeight: 'bold',
                                    fontSize: '1.2rem',
                                    color: isSelected ? 'white' : 'var(--dark)'
                                }}
                            >
                                {char}
                            </div>
                        );
                    }))}
                </div>

                {/* Word List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <h3>Find these words:</h3>
                    {words.map(word => {
                        // Find the question object for this word to get definition/example
                        const question = engine.allQuestions.find(q => q.answer.toUpperCase() === word);

                        return (
                            <div key={word} className="tooltip-container" style={{
                                fontSize: '1.2rem',
                                textDecoration: foundWords.has(word) ? 'line-through' : 'none',
                                color: foundWords.has(word) ? '#aaa' : 'var(--dark)',
                                fontWeight: foundWords.has(word) ? 'normal' : 'bold',
                                position: 'relative',
                                cursor: 'help',
                                width: 'fit-content'
                            }}>
                                {word}
                                {question && (
                                    <div className="tooltip">
                                        <div style={{ fontSize: '0.9rem', marginBottom: '0.5rem', fontStyle: 'italic' }}>
                                            "{question.question}"
                                        </div>
                                        {question.example && (
                                            <div style={{ fontSize: '0.8rem', opacity: 0.9 }}>
                                                Ex: {question.example}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Tutorial Modal */}
            {showTutorial && (
                <GameTutorialModal
                    title="How to Play"
                    instructions={[
                        "Find the hidden words in the grid.",
                        "Words can be horizontal or vertical.",
                        "Click and drag to select a word.",
                        "Find all words to win!"
                    ]}
                    onClose={closeTutorial}
                />
            )}

            {/* Summary Modal */}
            {showSummary && (
                <GameSummaryModal
                    score={null}
                    xp={rewards.xp}
                    coins={rewards.coins}
                    onReplay={startNewRound}
                    onBack={onBack}
                />
            )}
        </div>
    );
}
