import { useState, useEffect, useRef } from 'react';
import { colors, borderRadius, shadows, spacing, typography } from '../styles/designTokens';
import PageLayout from './common/PageLayout';
import { triggerConfetti } from '../utils/effects';

/**
 * SpellingView - Spelling practice for younger students
 * Shows definition + example, student types the word
 * Tracks spelling progress separately from vocab mastery
 */
export default function SpellingView({
    words,  // Array of {word, definition, example, difficulty}
    onComplete,
    onBack,
    economy,
    spellingProgress  // Separate from vocab spaced rep
}) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [userInput, setUserInput] = useState('');
    const [showResult, setShowResult] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);
    const [score, setScore] = useState({ correct: 0, total: 0 });
    const [showHint, setShowHint] = useState(false);
    const [attempts, setAttempts] = useState(0);
    const inputRef = useRef(null);

    const currentWord = words[currentIndex];
    const totalWords = Math.min(words.length, 10); // 10 words per session

    useEffect(() => {
        // Auto-focus input on new word
        if (inputRef.current && !showResult) {
            inputRef.current.focus();
        }
    }, [currentIndex, showResult]);

    const normalizeWord = (w) => w.toLowerCase().trim();

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!userInput.trim()) return;

        const correct = normalizeWord(userInput) === normalizeWord(currentWord.word);
        setIsCorrect(correct);
        setShowResult(true);
        setAttempts(prev => prev + 1);

        if (correct) {
            setScore(prev => ({ correct: prev.correct + 1, total: prev.total + 1 }));

            // Award XP based on attempts
            if (economy) {
                const xp = attempts === 0 ? 20 : attempts === 1 ? 10 : 5;
                economy.addXP(xp);
                economy.addCoins(1);
            }

            // Update spelling progress (separate from vocab)
            if (spellingProgress && currentWord.wordId) {
                spellingProgress.recordSpelling(currentWord.wordId, true);
            }
        } else {
            // Record failed attempt
            if (spellingProgress && currentWord.wordId) {
                spellingProgress.recordSpelling(currentWord.wordId, false);
            }
        }
    };

    const handleNext = () => {
        if (currentIndex < totalWords - 1) {
            setCurrentIndex(prev => prev + 1);
            setUserInput('');
            setShowResult(false);
            setShowHint(false);
            setAttempts(0);
            setIsCorrect(false);
        } else {
            // Session complete
            if (score.correct === totalWords) {
                triggerConfetti();
            }
            onComplete?.();
        }
    };

    const handleTryAgain = () => {
        setUserInput('');
        setShowResult(false);
    };

    const getHint = () => {
        const word = currentWord.word;
        const hintLength = Math.ceil(word.length / 3);
        return word.substring(0, hintLength) + '_'.repeat(word.length - hintLength);
    };

    if (!currentWord) {
        return <PageLayout title="Spelling" showBack={true} onBack={onBack}>Loading...</PageLayout>;
    }

    return (
        <PageLayout
            title="Spelling Practice"
            showBack={true}
            onBack={onBack}
            maxWidth="600px"
        >
            {/* Progress */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: spacing.lg
            }}>
                <span style={{
                    padding: `${spacing.xs} ${spacing.sm}`,
                    background: '#dbeafe',
                    borderRadius: borderRadius.md,
                    fontSize: '0.85rem',
                    color: '#1e40af'
                }}>
                    🔤 Difficulty {currentWord.difficulty}
                </span>
                <span style={{
                    padding: `${spacing.xs} ${spacing.sm}`,
                    background: colors.light,
                    borderRadius: borderRadius.md,
                    fontSize: '0.85rem',
                    color: colors.textMuted
                }}>
                    Word {currentIndex + 1} / {totalWords}
                </span>
            </div>

            {/* Word Card */}
            <div style={{
                background: colors.white,
                borderRadius: borderRadius.xl,
                padding: spacing.xl,
                boxShadow: shadows.md,
                marginBottom: spacing.lg,
                textAlign: 'center'
            }}>
                {/* Definition */}
                <div style={{
                    fontSize: '1.3rem',
                    color: colors.dark,
                    marginBottom: spacing.lg,
                    lineHeight: '1.6'
                }}>
                    <strong>Definition:</strong> {currentWord.definition}
                </div>

                {/* Example Sentence (with blank) */}
                <div style={{
                    fontSize: '1.1rem',
                    color: colors.textMuted,
                    marginBottom: spacing.xl,
                    fontStyle: 'italic',
                    background: colors.light,
                    padding: spacing.md,
                    borderRadius: borderRadius.lg
                }}>
                    "{currentWord.example}"
                </div>

                {/* Hint Button */}
                {!showResult && (
                    <button
                        onClick={() => setShowHint(true)}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: colors.primary,
                            cursor: 'pointer',
                            marginBottom: spacing.md,
                            fontSize: '0.9rem'
                        }}
                    >
                        💡 Show hint
                    </button>
                )}

                {showHint && !showResult && (
                    <div style={{
                        fontSize: '1.5rem',
                        fontFamily: 'monospace',
                        letterSpacing: '0.3em',
                        marginBottom: spacing.lg,
                        color: colors.textMuted
                    }}>
                        {getHint()}
                    </div>
                )}

                {/* Input Form */}
                {!showResult ? (
                    <form onSubmit={handleSubmit}>
                        <input
                            ref={inputRef}
                            type="text"
                            value={userInput}
                            onChange={(e) => setUserInput(e.target.value)}
                            placeholder="Type the word..."
                            autoComplete="off"
                            autoCapitalize="off"
                            spellCheck="false"
                            style={{
                                width: '100%',
                                padding: spacing.md,
                                fontSize: '1.5rem',
                                textAlign: 'center',
                                border: `2px solid ${colors.border}`,
                                borderRadius: borderRadius.lg,
                                outline: 'none',
                                fontFamily: typography.fontFamily,
                                marginBottom: spacing.md
                            }}
                        />
                        <button
                            type="submit"
                            disabled={!userInput.trim()}
                            style={{
                                padding: `${spacing.md} ${spacing.xl}`,
                                background: userInput.trim() ? 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)' : colors.light,
                                color: userInput.trim() ? 'white' : colors.textMuted,
                                border: 'none',
                                borderRadius: borderRadius.lg,
                                fontSize: '1.1rem',
                                fontWeight: '600',
                                cursor: userInput.trim() ? 'pointer' : 'not-allowed',
                                boxShadow: userInput.trim() ? shadows.md : 'none'
                            }}
                        >
                            Check Spelling
                        </button>
                    </form>
                ) : (
                    <div>
                        {/* Result Display */}
                        <div style={{
                            padding: spacing.lg,
                            borderRadius: borderRadius.lg,
                            background: isCorrect ? '#d4edda' : '#f8d7da',
                            marginBottom: spacing.lg
                        }}>
                            <div style={{ fontSize: '2rem', marginBottom: spacing.sm }}>
                                {isCorrect ? '✓ Correct!' : '✗ Not quite'}
                            </div>
                            <div style={{
                                fontSize: '1.8rem',
                                fontWeight: 'bold',
                                color: isCorrect ? '#155724' : '#721c24',
                                letterSpacing: '0.1em'
                            }}>
                                {currentWord.word}
                            </div>
                            {!isCorrect && (
                                <div style={{
                                    fontSize: '1rem',
                                    color: '#856404',
                                    marginTop: spacing.sm
                                }}>
                                    You typed: <strike>{userInput}</strike>
                                </div>
                            )}
                        </div>

                        {/* Action Buttons */}
                        <div style={{ display: 'flex', gap: spacing.md, justifyContent: 'center' }}>
                            {!isCorrect && attempts < 3 && (
                                <button
                                    onClick={handleTryAgain}
                                    style={{
                                        padding: `${spacing.md} ${spacing.xl}`,
                                        background: colors.white,
                                        color: colors.dark,
                                        border: `2px solid ${colors.border}`,
                                        borderRadius: borderRadius.lg,
                                        fontSize: '1rem',
                                        fontWeight: '600',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Try Again ({3 - attempts} left)
                                </button>
                            )}
                            <button
                                onClick={handleNext}
                                style={{
                                    padding: `${spacing.md} ${spacing.xl}`,
                                    background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: borderRadius.lg,
                                    fontSize: '1rem',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    boxShadow: shadows.md
                                }}
                            >
                                {currentIndex < totalWords - 1 ? 'Next Word' : 'Finish'}
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Score Display */}
            <div style={{
                textAlign: 'center',
                color: colors.textMuted,
                fontSize: '0.9rem'
            }}>
                Score: {score.correct} / {score.total}
            </div>
        </PageLayout>
    );
}
