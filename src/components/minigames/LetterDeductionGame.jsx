import { useState, useEffect, useCallback } from 'react';
import { triggerConfetti } from '../../utils/effects';
import { speak } from '../../utils/audio';
import { sfx } from '../../utils/soundEffects';
import GameTutorialModal from '../common/GameTutorialModal';
import GameSummaryModal from '../common/GameSummaryModal';
import balance from '../../data/balance.json';
import GameLayout from '../common/GameLayout';
import { colors, borderRadius, shadows, spacing } from '../../styles/designTokens';

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

    return (
        <GameLayout
            title="Letter Deduction"
            icon="🕵️"
            onBack={onBack}
            onHelp={() => setShowTutorial(true)}
        >
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: spacing.lg, fontSize: '1.2rem' }}>
                Lives: {'❤️'.repeat(MAX_LIVES - wrongGuesses)}
            </div>

            <p style={{ fontStyle: 'italic', marginBottom: spacing.xl, textAlign: 'center', fontSize: '1.1rem', color: colors.text }}>
                Hint: {currentQuestion.question.replace(currentQuestion.answer, '_____')}
            </p>

            {/* Word Display */}
            <div className="word-display" style={{
                display: 'flex',
                gap: spacing.sm,
                marginBottom: spacing.xxl,
                flexWrap: 'wrap',
                justifyContent: 'center'
            }}>
                {getWordDisplay().map((char, idx) => (
                    <div key={idx} style={{
                        width: '40px',
                        height: '50px',
                        borderBottom: `3px solid ${colors.primary}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '2rem',
                        fontWeight: 'bold',
                        color: wrongGuesses >= MAX_LIVES && !guessedLetters.has(currentQuestion.answer[idx].toUpperCase()) ? colors.error : 'inherit'
                    }}>
                        {char}
                    </div>
                ))}
            </div>

            {/* Game Over / Win Message */}
            {gameStatus !== 'playing' && !showSummary && (
                <div className="animate-pop" style={{ marginBottom: spacing.xl, textAlign: 'center' }}>
                    <h3 style={{ fontSize: '2rem', color: gameStatus === 'won' ? colors.success : colors.error }}>
                        {gameStatus === 'won' ? 'You Got It!' : 'Out of Lives!'}
                    </h3>
                </div>
            )}

            {/* Keyboard */}
            <div className="keyboard" style={{ display: 'flex', flexDirection: 'column', gap: spacing.sm, alignItems: 'center' }}>
                {keyboardLayout.map((row, rowIdx) => (
                    <div key={rowIdx} style={{ display: 'flex', gap: spacing.sm }}>
                        {row.split('').map(char => {
                            const isGuessed = guessedLetters.has(char);
                            const isCorrect = currentQuestion.answer.toUpperCase().includes(char);

                            let bg = colors.white;
                            let color = colors.dark;
                            if (isGuessed) {
                                bg = isCorrect ? colors.success : colors.border;
                                color = isCorrect ? colors.white : colors.textMuted;
                            }

                            return (
                                <button
                                    key={char}
                                    onClick={() => handleGuess(char)}
                                    disabled={isGuessed || gameStatus !== 'playing'}
                                    style={{
                                        width: '40px',
                                        height: '50px',
                                        borderRadius: borderRadius.md,
                                        border: `2px solid ${isGuessed && isCorrect ? colors.success : colors.border}`,
                                        background: bg,
                                        color: color,
                                        fontSize: '1.2rem',
                                        fontWeight: 'bold',
                                        cursor: isGuessed ? 'default' : 'pointer',
                                        boxShadow: isGuessed ? 'none' : shadows.sm,
                                        transition: 'all 0.2s ease'
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
                        "Type on your keyboard or tap letters on screen.",
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
        </GameLayout>
    );
}
