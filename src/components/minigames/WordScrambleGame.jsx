import { useState, useEffect, useCallback } from 'react';
import { triggerConfetti } from '../../utils/effects';
import { speak } from '../../utils/audio';
import { sfx } from '../../utils/soundEffects';
import GameTutorialModal from '../common/GameTutorialModal';
import GameSummaryModal from '../common/GameSummaryModal';
import balance from '../../data/balance.json';

export default function WordScrambleGame({ engine, onBack }) {
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [scrambledWord, setScrambledWord] = useState([]);
    const [userGuess, setUserGuess] = useState([]);
    const [gameStatus, setGameStatus] = useState('playing'); // 'playing', 'won'
    const [showTutorial, setShowTutorial] = useState(false);
    const [showSummary, setShowSummary] = useState(false);
    const [rewards, setRewards] = useState({ xp: 0, coins: 0 });

    const closeTutorial = () => {
        sfx.playClick();
        setShowTutorial(false);
        localStorage.setItem('tutorial_wordscramble', 'true');
    };

    const startNewRound = useCallback(() => {
        const q = engine.getReinforcementQuestions(1)[0];
        setCurrentQuestion(q);

        // Scramble
        const letters = q.answer.toUpperCase().split('').map((char, i) => ({ id: i, char }));
        for (let i = letters.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [letters[i], letters[j]] = [letters[j], letters[i]];
        }

        setScrambledWord(letters);
        setUserGuess([]);
        setGameStatus('playing');
        setShowSummary(false);
    }, [engine]);

    const checkAnswer = useCallback(() => {
        const guess = userGuess.map(l => l.char).join('');
        if (guess === currentQuestion.answer.toUpperCase()) {
            setGameStatus('won');
            sfx.playWin();
            triggerConfetti();
            speak("Correct!");
            const { xp, stars } = balance.rewards.minigames.wordScramble;
            setRewards({ xp, coins: stars });
            setTimeout(() => setShowSummary(true), 1000);
        } else {
            sfx.playWrong();
            speak("Try again");
            // Shake effect could be added here
        }
    }, [userGuess, currentQuestion]);

    const handleLetterClick = useCallback((letterObj, isScrambled) => {
        sfx.playClick();
        if (isScrambled) {
            setScrambledWord(prev => prev.filter(l => l.id !== letterObj.id));
            setUserGuess(prev => [...prev, letterObj]);
        } else {
            setUserGuess(prev => prev.filter(l => l.id !== letterObj.id));
            setScrambledWord(prev => [...prev, letterObj]);
        }
    }, []);

    // Initialization Effect - ONLY run on mount
    useEffect(() => {
        startNewRound();

        const hasSeenTutorial = localStorage.getItem('tutorial_wordscramble');
        if (!hasSeenTutorial) {
            setShowTutorial(true);
        }
    }, [startNewRound]);

    // Keyboard Handler Effect
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (gameStatus !== 'playing') return;

            if (e.key === 'Enter') {
                checkAnswer();
            } else if (e.key === 'Backspace') {
                if (userGuess.length > 0) {
                    const lastChar = userGuess[userGuess.length - 1];
                    handleLetterClick(lastChar, false);
                }
            } else if (/^[a-zA-Z]$/.test(e.key)) {
                // Find first matching letter in scrambled
                const char = e.key.toUpperCase();
                const match = scrambledWord.find(l => l.char === char);
                if (match) {
                    handleLetterClick(match, true);
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [gameStatus, userGuess, scrambledWord, checkAnswer, handleLetterClick]);



    if (!currentQuestion) return <div>Loading...</div>;

    return (
        <div className="word-scramble-game" style={{
            padding: '2rem',
            maxWidth: '800px',
            margin: '0 auto',
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            color: 'var(--dark)'
        }}>
            <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <button onClick={() => { sfx.playClick(); onBack(); }} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>
                    ← Back
                </button>
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

            <h2 style={{ marginBottom: '1rem' }}>Word Scramble 🌪️</h2>
            <p style={{ fontStyle: 'italic', marginBottom: '3rem', textAlign: 'center' }}>
                Hint: {currentQuestion.question.replace(currentQuestion.answer, '_____')}
            </p>

            {/* User Guess Area */}
            <div style={{
                display: 'flex',
                gap: '0.5rem',
                marginBottom: '2rem',
                minHeight: '60px',
                padding: '1rem',
                background: '#f5f5f5',
                borderRadius: '10px',
                flexWrap: 'wrap',
                justifyContent: 'center',
                width: '100%'
            }}>
                {userGuess.map(l => (
                    <button
                        key={l.id}
                        onClick={() => handleLetterClick(l, false)}
                        className="animate-pop"
                        style={{
                            width: '50px',
                            height: '50px',
                            borderRadius: '8px',
                            border: 'none',
                            background: 'var(--primary)',
                            color: 'white',
                            fontSize: '1.5rem',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            boxShadow: '0 4px 0 #2c3e50'
                        }}
                    >
                        {l.char}
                    </button>
                ))}
            </div>

            {/* Scrambled Letters Area */}
            <div style={{
                display: 'flex',
                gap: '0.5rem',
                marginBottom: '3rem',
                flexWrap: 'wrap',
                justifyContent: 'center'
            }}>
                {scrambledWord.map(l => (
                    <button
                        key={l.id}
                        onClick={() => handleLetterClick(l, true)}
                        className="animate-pop"
                        style={{
                            width: '50px',
                            height: '50px',
                            borderRadius: '8px',
                            border: '1px solid #ddd',
                            background: 'white',
                            color: 'var(--dark)',
                            fontSize: '1.5rem',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                        }}
                    >
                        {l.char}
                    </button>
                ))}
            </div>

            {/* Controls */}
            {gameStatus === 'won' && !showSummary ? (
                <div className="animate-pop" style={{ textAlign: 'center' }}>
                    <h3 style={{ fontSize: '2rem', color: 'green', marginBottom: '1rem' }}>Correct!</h3>
                </div>
            ) : (
                <button
                    onClick={checkAnswer}
                    disabled={userGuess.length === 0}
                    style={{
                        padding: '1rem 3rem',
                        fontSize: '1.2rem',
                        background: userGuess.length > 0 ? 'var(--secondary)' : '#ccc',
                        color: 'white',
                        border: 'none',
                        borderRadius: '20px',
                        cursor: userGuess.length > 0 ? 'pointer' : 'not-allowed',
                        transition: 'all 0.2s'
                    }}
                >
                    Check Answer
                </button>
            )}

            {/* Tutorial Modal */}
            {showTutorial && (
                <GameTutorialModal
                    title="How to Play"
                    instructions={[
                        "Unscramble the letters to form the correct word.",
                        "Type letters to move them up.",
                        "Backspace to remove them.",
                        "Enter to submit.",
                        "Use the hint sentence for help!"
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
