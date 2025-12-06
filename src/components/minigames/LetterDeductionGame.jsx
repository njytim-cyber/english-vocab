import { useState, useEffect, useCallback } from 'react';
import { triggerConfetti } from '../../utils/effects';
import { speak } from '../../utils/audio';
import { sfx } from '../../utils/soundEffects';
import GameTutorialModal from '../common/GameTutorialModal';
import GameSummaryModal from '../common/GameSummaryModal';
import balance from '../../data/balance.json';

export default function LetterDeductionGame({ engine, onBack }) {
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [guessedLetters, setGuessedLetters] = useState(new Set());
    const [wrongGuesses, setWrongGuesses] = useState(0);
    const [gameStatus, setGameStatus] = useState('playing'); // 'playing', 'won', 'lost'
    const [showTutorial, setShowTutorial] = useState(false);
    const [showSummary, setShowSummary] = useState(false);
    const [rewards, setRewards] = useState({ xp: 0, coins: 0 });

    const MAX_LIVES = 6;
    const keyboardLayout = ["QWERTYUIOP", "ASDFGHJKL", "ZXCVBNM"];

    const closeTutorial = () => {
        sfx.playClick();
        setShowTutorial(false);
        localStorage.setItem('tutorial_letterdeduction', 'true');
    };

    const startNewRound = useCallback(() => {
        const q = engine.getReinforcementQuestions(1)[0];
        setCurrentQuestion(q);
        setGuessedLetters(new Set());
        setWrongGuesses(0);
        setGameStatus('playing');
        setShowSummary(false);
    }, [engine]);

    const handleGuess = useCallback((char) => {
        if (guessedLetters.has(char) || gameStatus !== 'playing') return;

        sfx.playClick();
        const newGuessed = new Set(guessedLetters);
        newGuessed.add(char);
        setGuessedLetters(newGuessed);

        const answer = currentQuestion.answer.toUpperCase();
        if (answer.includes(char)) {
            sfx.playCorrect();
            // Check win
            const isWon = answer.split('').every(c => newGuessed.has(c));
            if (isWon) {
                setGameStatus('won');
                sfx.playWin();
                triggerConfetti();
                speak(currentQuestion.answer);
                const { xp, stars } = balance.rewards.minigames.letterDeduction;
                setRewards({ xp, coins: stars });
                setTimeout(() => setShowSummary(true), 1000);
            }
        } else {
            sfx.playWrong();
            const newWrong = wrongGuesses + 1;
            setWrongGuesses(newWrong);
            if (newWrong >= MAX_LIVES) {
                setGameStatus('lost');
                speak(`The word was ${currentQuestion.answer}`);
                setTimeout(() => setShowSummary(true), 1000);
            }
        }
    }, [guessedLetters, gameStatus, currentQuestion, wrongGuesses]);

    // Initialization Effect
    useEffect(() => {
        startNewRound();

        const hasSeenTutorial = localStorage.getItem('tutorial_letterdeduction');
        if (!hasSeenTutorial) {
            setShowTutorial(true);
        }
    }, [startNewRound]);

    // Keyboard Listener Effect
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (gameStatus !== 'playing') return;
            const char = e.key.toUpperCase();
            if (/^[A-Z]$/.test(char)) {
                handleGuess(char);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [gameStatus, handleGuess]);

    const getWordDisplay = () => {
        if (!currentQuestion) return [];
        return currentQuestion.answer.split('').map(char =>
            guessedLetters.has(char.toUpperCase()) || gameStatus === 'lost' ? char : '_'
        );
    };

    if (!currentQuestion) return <div>Loading...</div>;

    return (
        <div className="letter-deduction-game" style={{
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
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
            </div>
            <div style={{ fontSize: '1.2rem', alignSelf: 'flex-end', marginRight: '1rem' }}>Lives: {'❤️'.repeat(MAX_LIVES - wrongGuesses)}</div>

            <h2 style={{ marginBottom: '1rem' }}>Letter Deduction 🕵️</h2>
            <p style={{ fontStyle: 'italic', marginBottom: '2rem', textAlign: 'center' }}>
                Hint: {currentQuestion.question.replace(currentQuestion.answer, '_____')}
            </p>

            {/* Word Display */}
            <div className="word-display" style={{
                display: 'flex',
                gap: '0.5rem',
                marginBottom: '3rem',
                flexWrap: 'wrap',
                justifyContent: 'center'
            }}>
                {getWordDisplay().map((char, idx) => (
                    <div key={idx} style={{
                        width: '40px',
                        height: '50px',
                        borderBottom: '3px solid var(--primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '2rem',
                        fontWeight: 'bold',
                        color: wrongGuesses >= MAX_LIVES && !guessedLetters.has(currentQuestion.answer[idx].toUpperCase()) ? 'red' : 'inherit'
                    }}>
                        {char}
                    </div>
                ))}
            </div>

            {/* Game Over / Win Message */}
            {gameStatus !== 'playing' && !showSummary && (
                <div className="animate-pop" style={{ marginBottom: '2rem', textAlign: 'center' }}>
                    <h3 style={{ fontSize: '2rem', color: gameStatus === 'won' ? 'green' : 'red' }}>
                        {gameStatus === 'won' ? 'You Got It!' : 'Out of Lives!'}
                    </h3>
                </div>
            )}

            {/* Keyboard */}
            <div className="keyboard" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center' }}>
                {keyboardLayout.map((row, rowIdx) => (
                    <div key={rowIdx} style={{ display: 'flex', gap: '0.5rem' }}>
                        {row.split('').map(char => {
                            const isGuessed = guessedLetters.has(char);
                            const isCorrect = currentQuestion.answer.toUpperCase().includes(char);

                            let bg = 'white';
                            let color = 'var(--dark)';
                            if (isGuessed) {
                                bg = isCorrect ? '#4caf50' : '#e0e0e0';
                                color = isCorrect ? 'white' : '#9e9e9e';
                            }

                            return (
                                <button
                                    key={char}
                                    onClick={() => handleGuess(char)}
                                    disabled={isGuessed || gameStatus !== 'playing'}
                                    style={{
                                        width: '40px',
                                        height: '50px',
                                        borderRadius: '8px',
                                        border: '1px solid #ddd',
                                        background: bg,
                                        color: color,
                                        fontSize: '1.2rem',
                                        fontWeight: 'bold',
                                        cursor: isGuessed ? 'default' : 'pointer',
                                        boxShadow: isGuessed ? 'none' : '0 2px 4px rgba(0,0,0,0.1)'
                                    }}
                                >
                                    {char}
                                </button>
                            );
                        })}
                    </div>
                ))}
            </div>

            {/* Tutorial Modal */}
            {showTutorial && (
                <GameTutorialModal
                    title="How to Play"
                    instructions={[
                        "Guess the hidden word one letter at a time.",
                        "Type on your keyboard or tap the screen.",
                        "Use the hint sentence for clues.",
                        "You have 6 lives (hearts).",
                        "Incorrect guesses lose a life!"
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
