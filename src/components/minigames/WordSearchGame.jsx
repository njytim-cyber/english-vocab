import { useState, useEffect, useCallback } from 'react';
import { triggerConfetti } from '../../utils/effects';
import { speak } from '../../utils/audio';
import { sfx } from '../../utils/soundEffects';
import GameTutorialModal from '../common/GameTutorialModal';
import GameSummaryModal from '../common/GameSummaryModal';
import balance from '../../data/balance.json';

export default function WordSearchGame({ engine, onBack }) {
    const [grid, setGrid] = useState([]);
    const [words, setWords] = useState([]);
    const [foundWords, setFoundWords] = useState(new Set());
    const [foundWordCells, setFoundWordCells] = useState({}); // { word: { cells: [{r, c}], color: string } }
    const [selectedCells, setSelectedCells] = useState([]);
    const [isSelecting, setIsSelecting] = useState(false);
    const [showTutorial, setShowTutorial] = useState(false);
    const [showSummary, setShowSummary] = useState(false);
    const [rewards, setRewards] = useState({ xp: 0, coins: 0 });

    const GRID_SIZE = 10;

    // Color palette for found words
    const WORD_COLORS = [
        '#4ECDC4', // Teal
        '#FF6B6B', // Coral
        '#95E1D3', // Mint
        '#F38181', // Salmon
        '#AA96DA', // Lavender
        '#FFE66D', // Yellow
        '#A8E6CF', // Light green
        '#DDA0DD'  // Plum
    ];

    const closeTutorial = () => {
        sfx.playClick();
        setShowTutorial(false);
        localStorage.setItem('tutorial_wordsearch', 'true');
    };

    const startNewRound = useCallback(() => {
        // Get words
        const qs = engine.getReinforcementQuestions(5);
        const wordList = qs.map(q => q.answer.toUpperCase());
        // setWords(wordList); // Moved to after placement to ensure only placed words are listed
        setFoundWords(new Set());
        setFoundWordCells({});
        setSelectedCells([]);
        setShowSummary(false);

        // Generate Grid
        const newGrid = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(''));

        // Place words
        // Place words
        const placedWords = [];
        wordList.forEach(word => {
            let placed = false;
            let attempts = 0;
            while (!placed && attempts < 100) {
                const dirs = ['H', 'V', 'D'];
                const dir = dirs[Math.floor(Math.random() * dirs.length)];
                const r = Math.floor(Math.random() * GRID_SIZE);
                const c = Math.floor(Math.random() * GRID_SIZE);

                if (canPlace(newGrid, word, r, c, dir)) {
                    placeWord(newGrid, word, r, c, dir);
                    placed = true;
                    placedWords.push(word);
                }
                attempts++;
            }
        });

        setWords(placedWords);

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
    }, [engine]);

    useEffect(() => {
        startNewRound();

        // Check tutorial status
        const hasSeenTutorial = localStorage.getItem('tutorial_wordsearch');
        if (!hasSeenTutorial) {
            setShowTutorial(true);
        }
    }, []); // Run ONCE on mount

    const canPlace = (g, word, r, c, dir) => {
        if (dir === 'H') {
            if (c + word.length > GRID_SIZE) return false;
            for (let i = 0; i < word.length; i++) {
                if (g[r][c + i] !== '' && g[r][c + i] !== word[i]) return false;
            }
        } else if (dir === 'V') {
            if (r + word.length > GRID_SIZE) return false;
            for (let i = 0; i < word.length; i++) {
                if (g[r + i][c] !== '' && g[r + i][c] !== word[i]) return false;
            }
        } else if (dir === 'D') {
            if (r + word.length > GRID_SIZE || c + word.length > GRID_SIZE) return false;
            for (let i = 0; i < word.length; i++) {
                if (g[r + i][c + i] !== '' && g[r + i][c + i] !== word[i]) return false;
            }
        }
        return true;
    };

    const placeWord = (g, word, r, c, dir) => {
        for (let i = 0; i < word.length; i++) {
            if (dir === 'H') g[r][c + i] = word[i];
            else if (dir === 'V') g[r + i][c] = word[i];
            else if (dir === 'D') g[r + i][c + i] = word[i];
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

            // Store the cells and assign a color
            const colorIndex = Object.keys(foundWordCells).length % WORD_COLORS.length;
            setFoundWordCells(prev => ({
                ...prev,
                [selectedWord]: {
                    cells: [...selectedCells],
                    color: WORD_COLORS[colorIndex]
                }
            }));

            triggerConfetti();
            sfx.playCorrect();
            speak(selectedWord);

            if (newFound.size === words.length) {
                sfx.playWin();
                const { xp, stars } = balance.rewards.minigames.wordSearch;
                setRewards({ xp, coins: stars });
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

                        let cellBackground = 'white';
                        let cellColor = 'var(--dark)';

                        // Check found words
                        for (const wordData of Object.values(foundWordCells)) {
                            if (wordData.cells.some(cell => cell.r === r && cell.c === c)) {
                                cellBackground = wordData.color;
                                cellColor = 'white'; // White text on colored background
                                break;
                            }
                        }

                        if (isSelected) {
                            cellBackground = 'var(--secondary)';
                            cellColor = 'white';
                        }

                        return (
                            <div
                                key={`${r}-${c}`}
                                onMouseDown={() => handleMouseDown(r, c)}
                                onMouseEnter={() => handleMouseEnter(r, c)}
                                style={{
                                    width: '40px',
                                    height: '40px',
                                    background: cellBackground,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontWeight: 'bold',
                                    fontSize: '1.2rem',
                                    color: cellColor,
                                    transition: 'background 0.2s',
                                    borderRadius: '4px'
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
                                fontWeight: 'normal',
                                position: 'relative',
                                cursor: 'help',
                                width: 'fit-content'
                            }}>
                                {word}
                                {question && question.example && (
                                    <div className="tooltip">
                                        <div style={{ fontSize: '0.9rem', fontStyle: 'italic' }}>
                                            {question.example}
                                        </div>
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
