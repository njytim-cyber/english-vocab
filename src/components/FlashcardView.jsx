import { useState, useEffect } from 'react';
import { colors, borderRadius, shadows, spacing } from '../styles/designTokens';
import PageLayout from './common/PageLayout';
import { triggerConfetti } from '../utils/effects';

/**
 * FlashcardView - Quick review with flip cards
 * Shows definition, user recalls the word, then reveals answer
 * Supports swipe gestures and keyboard navigation
 */
export default function FlashcardView({
    words,  // Array of {word, definition, example}
    onComplete,
    onBack,
    economy,
    engine  // For spaced rep tracking
}) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [score, setScore] = useState({ correct: 0, wrong: 0 });
    const [showResults, setShowResults] = useState(false);

    const currentWord = words[currentIndex];
    const totalWords = words.length;
    const progress = ((currentIndex) / totalWords) * 100;

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === ' ' || e.key === 'Enter') {
                e.preventDefault();
                setIsFlipped(f => !f);
            } else if (e.key === 'ArrowRight' && isFlipped) {
                handleKnew();
            } else if (e.key === 'ArrowLeft' && isFlipped) {
                handleDidntKnow();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isFlipped, currentIndex]);

    const handleKnew = () => {
        setScore(prev => ({ ...prev, correct: prev.correct + 1 }));

        // Update spaced rep
        if (engine?.spacedRep && currentWord.wordId) {
            engine.spacedRep.recordAnswer(currentWord.wordId, true);
        }

        if (economy) {
            economy.addXP(5);
        }

        nextCard();
    };

    const handleDidntKnow = () => {
        setScore(prev => ({ ...prev, wrong: prev.wrong + 1 }));

        // Update spaced rep
        if (engine?.spacedRep && currentWord.wordId) {
            engine.spacedRep.recordAnswer(currentWord.wordId, false);
        }

        nextCard();
    };

    const nextCard = () => {
        if (currentIndex < totalWords - 1) {
            setCurrentIndex(prev => prev + 1);
            setIsFlipped(false);
        } else {
            setShowResults(true);
            if (score.correct >= totalWords * 0.8) {
                triggerConfetti();
            }
        }
    };

    if (showResults) {
        const percentage = Math.round((score.correct / totalWords) * 100);
        return (
            <PageLayout title="Flashcard Results" showBack={true} onBack={onBack} maxWidth="500px">
                <div style={{
                    background: colors.white,
                    borderRadius: borderRadius.xl,
                    padding: spacing.xl,
                    textAlign: 'center',
                    boxShadow: shadows.lg
                }}>
                    <div style={{ fontSize: '4rem', marginBottom: spacing.md }}>
                        {percentage >= 80 ? '🎉' : percentage >= 50 ? '👍' : '💪'}
                    </div>
                    <h2 style={{ margin: 0, marginBottom: spacing.md, color: colors.dark }}>
                        {score.correct} / {totalWords} recalled
                    </h2>
                    <p style={{ color: colors.textMuted, marginBottom: spacing.lg }}>
                        {percentage}% accuracy
                    </p>
                    <div style={{ display: 'flex', gap: spacing.md, justifyContent: 'center' }}>
                        <button
                            onClick={onComplete}
                            style={{
                                padding: `${spacing.md} ${spacing.xl}`,
                                background: colors.primaryGradient,
                                color: 'white',
                                border: 'none',
                                borderRadius: borderRadius.lg,
                                fontWeight: '600',
                                cursor: 'pointer'
                            }}
                        >
                            Continue
                        </button>
                    </div>
                </div>
            </PageLayout>
        );
    }

    if (!currentWord) {
        return <PageLayout title="Flashcards" showBack={true} onBack={onBack}>No words to review</PageLayout>;
    }

    return (
        <PageLayout
            title="Flashcards"
            showBack={true}
            onBack={onBack}
            maxWidth="500px"
        >
            {/* Progress Bar */}
            <div style={{
                background: colors.light,
                borderRadius: borderRadius.round,
                height: '8px',
                marginBottom: spacing.lg,
                overflow: 'hidden'
            }}>
                <div style={{
                    background: colors.primaryGradient,
                    height: '100%',
                    width: `${progress}%`,
                    transition: 'width 0.3s'
                }} />
            </div>

            {/* Counter */}
            <div style={{
                textAlign: 'center',
                marginBottom: spacing.md,
                color: colors.textMuted,
                fontSize: '0.9rem'
            }}>
                Card {currentIndex + 1} of {totalWords}
            </div>

            {/* Flashcard */}
            <div
                onClick={() => setIsFlipped(f => !f)}
                style={{
                    perspective: '1000px',
                    cursor: 'pointer',
                    marginBottom: spacing.lg
                }}
            >
                <div style={{
                    position: 'relative',
                    width: '100%',
                    height: '280px',
                    transformStyle: 'preserve-3d',
                    transition: 'transform 0.6s',
                    transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0)'
                }}>
                    {/* Front - Definition */}
                    <div style={{
                        position: 'absolute',
                        width: '100%',
                        height: '100%',
                        backfaceVisibility: 'hidden',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        borderRadius: borderRadius.xl,
                        padding: spacing.xl,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        textAlign: 'center',
                        color: 'white',
                        boxShadow: shadows.lg
                    }}>
                        <div style={{ fontSize: '0.9rem', opacity: 0.8, marginBottom: spacing.sm }}>
                            Tap to reveal
                        </div>
                        <div style={{ fontSize: '1.2rem', lineHeight: '1.6' }}>
                            {currentWord.definition}
                        </div>
                        {currentWord.example && (
                            <div style={{
                                fontSize: '0.9rem',
                                opacity: 0.8,
                                marginTop: spacing.md,
                                fontStyle: 'italic'
                            }}>
                                "{currentWord.example}"
                            </div>
                        )}
                    </div>

                    {/* Back - Answer */}
                    <div style={{
                        position: 'absolute',
                        width: '100%',
                        height: '100%',
                        backfaceVisibility: 'hidden',
                        transform: 'rotateY(180deg)',
                        background: colors.white,
                        borderRadius: borderRadius.xl,
                        padding: spacing.xl,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        textAlign: 'center',
                        boxShadow: shadows.lg,
                        border: `3px solid ${colors.primary}`
                    }}>
                        <div style={{
                            fontSize: '2.5rem',
                            fontWeight: 'bold',
                            color: colors.dark,
                            marginBottom: spacing.md
                        }}>
                            {currentWord.word}
                        </div>
                        <div style={{
                            fontSize: '0.9rem',
                            color: colors.textMuted
                        }}>
                            Did you recall this word?
                        </div>
                    </div>
                </div>
            </div>

            {/* Action Buttons (shown when flipped) */}
            {isFlipped && (
                <div style={{
                    display: 'flex',
                    gap: spacing.md,
                    justifyContent: 'center'
                }}>
                    <button
                        onClick={handleDidntKnow}
                        style={{
                            flex: 1,
                            padding: spacing.md,
                            background: '#fee2e2',
                            color: '#dc2626',
                            border: '2px solid #fca5a5',
                            borderRadius: borderRadius.lg,
                            fontSize: '1rem',
                            fontWeight: '600',
                            cursor: 'pointer'
                        }}
                    >
                        ✗ Didn't Know
                    </button>
                    <button
                        onClick={handleKnew}
                        style={{
                            flex: 1,
                            padding: spacing.md,
                            background: '#d1fae5',
                            color: '#059669',
                            border: '2px solid #6ee7b7',
                            borderRadius: borderRadius.lg,
                            fontSize: '1rem',
                            fontWeight: '600',
                            cursor: 'pointer'
                        }}
                    >
                        ✓ Knew It!
                    </button>
                </div>
            )}

            {/* Keyboard hints */}
            <div style={{
                textAlign: 'center',
                marginTop: spacing.lg,
                fontSize: '0.8rem',
                color: colors.textMuted
            }}>
                Keyboard: Space = Flip | ← = Didn't Know | → = Knew It
            </div>
        </PageLayout>
    );
}
