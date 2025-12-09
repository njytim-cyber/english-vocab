import { useState, useEffect, useRef } from 'react';
import { colors, borderRadius, shadows, spacing, typography } from '../styles/designTokens';
import PageLayout from './common/PageLayout';
import { triggerConfetti } from '../utils/effects';

/**
 * SpellingView - MD3 Expressive Focus Layout
 * Clean, minimal interface with clear hierarchy
 */
export default function SpellingView({
    words,
    onComplete,
    onBack,
    economy,
    spellingProgress
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
    const totalWords = Math.min(words.length, 10);
    const progress = ((currentIndex) / totalWords) * 100;

    useEffect(() => {
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
            triggerConfetti();
            if (economy) {
                const xp = attempts === 0 ? 20 : attempts === 1 ? 10 : 5;
                economy.addXP(xp);
                economy.addCoins(1);
            }
            if (spellingProgress && currentWord.wordId) {
                spellingProgress.recordSpelling(currentWord.wordId, true);
            }
        } else {
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
        return word.substring(0, hintLength) + '●'.repeat(word.length - hintLength);
    };

    // Generate blank line matching word length
    const getBlankLine = () => '_'.repeat(Math.min(currentWord.word.length, 12));

    if (!currentWord) {
        return <PageLayout title="Spelling" showBack={true} onBack={onBack}>Loading...</PageLayout>;
    }

    return (
        <PageLayout
            title="Spelling"
            showBack={true}
            onBack={onBack}
            maxWidth="500px"
        >
            {/* Linear Progress Bar - MD3 Style */}
            <div style={{
                width: '100%',
                height: '4px',
                background: colors.border,
                borderRadius: '2px',
                marginBottom: spacing.xl,
                overflow: 'hidden'
            }}>
                <div style={{
                    width: `${progress}%`,
                    height: '100%',
                    background: colors.primaryGradient,
                    transition: 'width 0.3s ease',
                    borderRadius: '2px'
                }} />
            </div>

            {/* Main Content - No Card Container */}
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: spacing.lg,
                padding: `${spacing.md} 0`
            }}>

                {/* Definition - Secondary, smaller */}
                <div style={{
                    fontSize: '0.95rem',
                    color: colors.textMuted,
                    textAlign: 'center',
                    maxWidth: '400px',
                    lineHeight: 1.5
                }}>
                    {currentWord.definition}
                </div>

                {/* Example Sentence - Primary Hero */}
                <div style={{
                    fontSize: '1.4rem',
                    fontWeight: '500',
                    color: colors.dark,
                    textAlign: 'center',
                    lineHeight: 1.6,
                    padding: `${spacing.md} 0`
                }}>
                    "{currentWord.example?.replace(
                        new RegExp(`\\b${currentWord.word}\\b`, 'gi'),
                        getBlankLine()
                    ) || currentWord.example}"
                </div>

                {/* Hint - Inline, monospace */}
                {showHint && !showResult && (
                    <div style={{
                        fontSize: '1.2rem',
                        fontFamily: 'monospace',
                        letterSpacing: '0.2em',
                        color: colors.primary,
                        fontWeight: '600'
                    }}>
                        {getHint()}
                    </div>
                )}

                {/* Input Area */}
                {!showResult ? (
                    <form onSubmit={handleSubmit} style={{
                        width: '100%',
                        maxWidth: '320px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: spacing.md
                    }}>
                        {/* Filled Text Field - MD3 Style */}
                        <div style={{ position: 'relative' }}>
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
                                    padding: `${spacing.md} ${spacing.lg}`,
                                    paddingRight: '50px',
                                    fontSize: '1.3rem',
                                    textAlign: 'center',
                                    background: colors.light,
                                    border: 'none',
                                    borderBottom: `2px solid ${userInput ? colors.primary : colors.border}`,
                                    borderRadius: `${borderRadius.lg} ${borderRadius.lg} 0 0`,
                                    outline: 'none',
                                    fontFamily: typography.fontFamily,
                                    transition: 'border-color 0.2s'
                                }}
                            />
                            {/* Hint Icon - Trailing */}
                            {!showHint && (
                                <button
                                    type="button"
                                    onClick={() => setShowHint(true)}
                                    style={{
                                        position: 'absolute',
                                        right: '12px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        background: 'none',
                                        border: 'none',
                                        fontSize: '1.2rem',
                                        cursor: 'pointer',
                                        padding: '4px'
                                    }}
                                    title="Show hint"
                                >
                                    💡
                                </button>
                            )}
                        </div>

                        {/* FAB-style Check Button */}
                        <button
                            type="submit"
                            disabled={!userInput.trim()}
                            style={{
                                padding: spacing.md,
                                background: userInput.trim() ? colors.primaryGradient : colors.border,
                                color: userInput.trim() ? 'white' : colors.textMuted,
                                border: 'none',
                                borderRadius: borderRadius.pill,
                                fontSize: '1.1rem',
                                fontWeight: '600',
                                cursor: userInput.trim() ? 'pointer' : 'not-allowed',
                                boxShadow: userInput.trim() ? shadows.md : 'none',
                                transition: 'all 0.2s'
                            }}
                        >
                            Check ✓
                        </button>
                    </form>
                ) : (
                    /* Result State */
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: spacing.lg,
                        width: '100%',
                        maxWidth: '320px'
                    }}>
                        {/* Result Icon */}
                        <div style={{
                            fontSize: '3rem',
                            lineHeight: 1
                        }}>
                            {isCorrect ? '✓' : '✗'}
                        </div>

                        {/* Correct Word Display */}
                        <div style={{
                            fontSize: '2rem',
                            fontWeight: 'bold',
                            color: isCorrect ? colors.success : colors.error,
                            letterSpacing: '0.05em'
                        }}>
                            {currentWord.word}
                        </div>

                        {/* User's Answer (if wrong) */}
                        {!isCorrect && (
                            <div style={{
                                fontSize: '0.9rem',
                                color: colors.textMuted
                            }}>
                                You typed: <span style={{ textDecoration: 'line-through' }}>{userInput}</span>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div style={{
                            display: 'flex',
                            gap: spacing.md,
                            width: '100%',
                            justifyContent: 'center'
                        }}>
                            {!isCorrect && attempts < 3 && (
                                <button
                                    onClick={handleTryAgain}
                                    style={{
                                        padding: `${spacing.sm} ${spacing.lg}`,
                                        background: 'transparent',
                                        color: colors.primary,
                                        border: `2px solid ${colors.primary}`,
                                        borderRadius: borderRadius.pill,
                                        fontSize: '0.95rem',
                                        fontWeight: '600',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Retry ({3 - attempts})
                                </button>
                            )}
                            <button
                                onClick={handleNext}
                                style={{
                                    padding: `${spacing.sm} ${spacing.lg}`,
                                    background: colors.primaryGradient,
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: borderRadius.pill,
                                    fontSize: '0.95rem',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    boxShadow: shadows.sm
                                }}
                            >
                                {currentIndex < totalWords - 1 ? 'Next →' : 'Done'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </PageLayout>
    );
}
