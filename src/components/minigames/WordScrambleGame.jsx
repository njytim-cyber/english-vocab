import { useState, useEffect, useCallback } from 'react';
import { triggerConfetti } from '../../utils/effects';
import { speak } from '../../utils/audio';
import { sfx } from '../../utils/soundEffects';
import GameTutorialModal from '../common/GameTutorialModal';
import GameSummaryModal from '../common/GameSummaryModal';
import balance from '../../data/balance.json';
import GameLayout from '../common/GameLayout';
import { colors, borderRadius, shadows, spacing } from '../../styles/designTokens';

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



    return (
        <GameLayout
            title="Word Scramble"
            icon="🌪️"
            onBack={onBack}
            onHelp={() => setShowTutorial(true)}
        >
            <p style={{ fontStyle: 'italic', marginBottom: spacing.xxl, textAlign: 'center', fontSize: '1.1rem', color: colors.text }}>
                Hint: {currentQuestion.question.replace(currentQuestion.answer, '_____')}
            </p>

            {/* User Guess Area */}
            <div style={{
                display: 'flex',
                gap: spacing.sm,
                marginBottom: spacing.xl,
                minHeight: '60px',
                padding: spacing.lg,
                background: colors.light,
                borderRadius: borderRadius.xl,
                flexWrap: 'wrap',
                justifyContent: 'center',
                width: '100%',
                boxShadow: shadows.sm
            }}>
                {userGuess.map(l => (
                    <button
                        key={l.id}
                        onClick={() => handleLetterClick(l, false)}
                        className="animate-pop"
                        style={{
                            width: '50px',
                            height: '50px',
                            borderRadius: borderRadius.md,
                            border: 'none',
                            background: colors.primary,
                            color: colors.white,
                            fontSize: '1.5rem',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            boxShadow: `0 4px 0 ${colors.primaryDark}`,
                            transition: 'all 0.2s ease'
                        }}
                    >
                        {l.char}
                    </button>
                ))}
            </div>

            {/* Scrambled Letters Area */}
            <div style={{
                display: 'flex',
                gap: spacing.sm,
                marginBottom: spacing.xxl,
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
                            borderRadius: borderRadius.md,
                            border: `2px solid ${colors.border}`,
                            background: colors.white,
                            color: colors.dark,
                            fontSize: '1.5rem',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            boxShadow: shadows.sm,
                            transition: 'all 0.2s ease'
                        }}
                    >
                        {l.char}
                    </button>
                ))}
            </div>

            {/* Controls */}
            {gameStatus === 'won' && !showSummary ? (
                <div className="animate-pop" style={{ textAlign: 'center' }}>
                    <h3 style={{ fontSize: '2rem', color: colors.success, marginBottom: spacing.md }}>Correct!</h3>
                </div>
            ) : (
                <button
                    onClick={checkAnswer}
                    disabled={userGuess.length === 0}
                    style={{
                        padding: `${spacing.md} ${spacing.xxl}`,
                        fontSize: '1.2rem',
                        background: userGuess.length > 0 ? colors.primaryGradient : colors.textMuted,
                        color: colors.white,
                        border: 'none',
                        borderRadius: borderRadius.xl,
                        cursor: userGuess.length > 0 ? 'pointer' : 'not-allowed',
                        transition: 'all 0.3s ease',
                        boxShadow: userGuess.length > 0 ? shadows.primary : 'none',
                        fontWeight: 'bold'
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
                        "Tap letters to move them to your answer.",
                        "Type letters or use backspace on keyboard.",
                        "Press Enter or 'Check Answer' to submit.",
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
        </GameLayout>
    );
}
