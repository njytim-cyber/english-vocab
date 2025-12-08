import { useState } from 'react';
import { colors, borderRadius, shadows, spacing } from '../styles/designTokens';
import PageLayout from './common/PageLayout';
import { triggerConfetti } from '../utils/effects';
import { sfx } from '../utils/soundEffects';
import DragDropAnswerInput from './common/DragDropAnswerInput';

/**
 * SynthesisView - Synthesis & Transformation Quiz Component
 * Displays two sentences that need to be combined using specific grammatical transformations
 */
export default function SynthesisView({
    questions,
    currentIndex = 0,
    onComplete,
    onBack,
    economy,
    spacedRep
}) {
    const currentQuestion = questions[currentIndex];
    const [userAnswer, setUserAnswer] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);
    const [showHint, setShowHint] = useState(false);

    // Normalize text for comparison (lenient on whitespace/capitalization/contractions)
    const normalizeText = (text) => {
        return text
            .trim()
            .toLowerCase()
            .replace(/\s+/g, ' ')  // normalize whitespace
            .replace(/n't/g, ' not')  // expand contractions
            .replace(/'/g, '')  // remove apostrophes for consistency
            .trim();
    };

    const handleSubmit = () => {
        if (!userAnswer.trim()) {
            alert('Please enter your answer before submitting.');
            return;
        }

        // Normalize both answers for comparison (LENIENT: ignore punctuation, whitespace, capitalization)
        const normalizedUserAnswer = normalizeText(userAnswer).replace(/[.,!?;:]/g, '');
        const normalizedCorrectAnswer = normalizeText(currentQuestion.answer).replace(/[.,!?;:]/g, '');

        const correct = normalizedUserAnswer === normalizedCorrectAnswer;
        setIsCorrect(correct);
        setSubmitted(true);

        if (correct) {
            sfx.playCorrect();
            triggerConfetti();

            // Award rewards
            const xpEarned = 15;
            const starsEarned = 2;

            if (economy) {
                economy.addXP(xpEarned);
                economy.addCoins(starsEarned);
            }
        } else {
            sfx.playWrong();
        }

        // Update spaced repetition if available
        if (spacedRep && currentQuestion.id) {
            spacedRep.updateProgress(currentQuestion.id, correct);
        }
    };

    const handleNext = () => {
        if (currentIndex < questions.length - 1) {
            // Move to next question
            setUserAnswer('');
            setSubmitted(false);
            setIsCorrect(false);
            setShowHint(false);
            onComplete(currentIndex + 1);
        } else {
            // Quiz complete
            onComplete(-1);
        }
    };

    const handleTryAgain = () => {
        setUserAnswer('');
        setSubmitted(false);
        setIsCorrect(false);
    };

    const getDifficultyColor = (difficulty) => {
        if (difficulty <= 3) return '#28a745';
        if (difficulty <= 6) return '#ffc107';
        return '#dc3545';
    };

    const getDifficultyLabel = (difficulty) => {
        if (difficulty <= 3) return 'Basic';
        if (difficulty <= 6) return 'Intermediate';
        return 'Advanced';
    };

    return (
        <PageLayout
            title="Synthesis & Transformation"
            showBack={true}
            onBack={onBack}
            maxWidth="800px"
        >
            {/* Progress Indicator */}
            <div style={{
                marginBottom: spacing.lg,
                padding: spacing.md,
                background: colors.light,
                borderRadius: borderRadius.lg,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <div style={{ fontSize: '0.9rem', fontWeight: '600', color: colors.dark }}>
                    Question {currentIndex + 1} of {questions.length}
                </div>
                <div style={{
                    fontSize: '0.85rem',
                    padding: `${spacing.xs} ${spacing.sm}`,
                    background: getDifficultyColor(currentQuestion.difficulty),
                    color: 'white',
                    borderRadius: borderRadius.md,
                    fontWeight: '600'
                }}>
                    {getDifficultyLabel(currentQuestion.difficulty)} (Level {currentQuestion.difficulty})
                </div>
            </div>

            {/* Category & Subcategory Info */}
            <div style={{
                display: 'flex',
                gap: spacing.sm,
                marginBottom: spacing.lg,
                flexWrap: 'wrap'
            }}>
                <span style={{
                    padding: `${spacing.xs} ${spacing.md}`,
                    background: colors.primary + '20',
                    borderRadius: borderRadius.md,
                    fontSize: '0.85rem',
                    color: colors.primary,
                    fontWeight: '600'
                }}>
                    📚 {currentQuestion.category}
                </span>
                <span style={{
                    padding: `${spacing.xs} ${spacing.md}`,
                    background: colors.light,
                    borderRadius: borderRadius.md,
                    fontSize: '0.85rem',
                    color: colors.textMuted
                }}>
                    {currentQuestion.subcategory}
                </span>
            </div>

            {/* Question Card */}
            <div style={{
                background: colors.white,
                padding: spacing.xl,
                borderRadius: borderRadius.xl,
                boxShadow: shadows.md,
                marginBottom: spacing.lg
            }}>
                <h3 style={{
                    margin: '0 0 1rem 0',
                    color: colors.dark,
                    fontSize: '1.1rem'
                }}>
                    ✏️ Combine these sentences:
                </h3>

                <div style={{
                    background: colors.light,
                    padding: spacing.lg,
                    borderRadius: borderRadius.lg,
                    marginBottom: spacing.md
                }}>
                    <p style={{
                        fontSize: '1.15rem',
                        lineHeight: '1.8',
                        color: colors.dark,
                        margin: 0,
                        fontWeight: '500'
                    }}>
                        {currentQuestion.question}
                    </p>
                </div>

                {/* Constraint / Trigger Word */}
                {(currentQuestion.trigger_used || (currentQuestion.triggers && currentQuestion.triggers.length > 0)) && (
                    <div style={{
                        marginBottom: spacing.lg,
                        padding: spacing.md,
                        background: '#e3f2fd',
                        borderRadius: borderRadius.lg,
                        borderLeft: `4px solid ${colors.primary}`,
                        color: '#0d47a1',
                        fontSize: '1rem',
                        fontWeight: '500'
                    }}>
                        <strong>Constraint:</strong> Use the word
                        <span style={{
                            background: 'white',
                            padding: '2px 8px',
                            borderRadius: '4px',
                            margin: '0 6px',
                            border: '1px solid #bbdefb',
                            fontWeight: 'bold'
                        }}>
                            {currentQuestion.trigger_used || currentQuestion.triggers[0]}
                        </span>
                        in your answer.
                    </div>
                )}

                {/* Hint Button */}
                {!submitted && currentQuestion.logic && (
                    <button
                        onClick={() => setShowHint(!showHint)}
                        style={{
                            padding: `${spacing.xs} ${spacing.md}`,
                            background: colors.white,
                            border: `2px solid ${colors.border}`,
                            borderRadius: borderRadius.md,
                            fontSize: '0.85rem',
                            cursor: 'pointer',
                            marginBottom: spacing.md,
                            color: colors.textMuted
                        }}
                    >
                        💡 {showHint ? 'Hide' : 'Show'} Hint
                    </button>
                )}

                {/* Hint Display */}
                {showHint && !submitted && currentQuestion.logic && (
                    <div style={{
                        background: '#fff3cd',
                        padding: spacing.md,
                        borderRadius: borderRadius.lg,
                        marginBottom: spacing.md,
                        fontSize: '0.9rem',
                        color: '#856404'
                    }}>
                        <strong>Logic:</strong> {currentQuestion.logic}
                    </div>
                )}

                {/* Answer Input */}
                <div>
                    <label style={{
                        display: 'block',
                        marginBottom: spacing.sm,
                        fontWeight: '600',
                        color: colors.dark,
                        fontSize: '0.95rem'
                    }}>
                        Your Answer:
                    </label>
                    {currentQuestion.answerParts ? (
                        <DragDropAnswerInput
                            answerParts={currentQuestion.answerParts}
                            onChange={setUserAnswer}
                            disabled={submitted}
                        />
                    ) : (
                        <textarea
                            value={userAnswer}
                            onChange={(e) => setUserAnswer(e.target.value)}
                            disabled={submitted}
                            placeholder="Type your combined sentence here..."
                            style={{
                                width: '100%',
                                minHeight: '100px',
                                padding: spacing.md,
                                fontSize: '1.05rem',
                                borderRadius: borderRadius.lg,
                                border: `2px solid ${submitted
                                    ? isCorrect
                                        ? colors.success
                                        : colors.error
                                    : colors.border
                                    }`,
                                background: submitted
                                    ? isCorrect
                                        ? '#d4edda'
                                        : '#f8d7da'
                                    : colors.white,
                                color: colors.dark,
                                resize: 'vertical',
                                fontFamily: 'inherit',
                                lineHeight: '1.6'
                            }}
                        />
                    )}
                </div>

                {/* Feedback */}
                {submitted && (
                    <div style={{
                        marginTop: spacing.md,
                        padding: spacing.md,
                        background: isCorrect ? '#d4edda' : '#f8d7da',
                        borderRadius: borderRadius.lg,
                        border: `2px solid ${isCorrect ? colors.success : colors.error}`
                    }}>
                        <div style={{
                            fontSize: '1.1rem',
                            fontWeight: '600',
                            color: isCorrect ? '#155724' : '#721c24',
                            marginBottom: spacing.xs
                        }}>
                            {isCorrect ? '✅ Correct!' : '❌ Not quite right'}
                        </div>
                        {!isCorrect && (
                            <>
                                <div style={{
                                    fontSize: '0.95rem',
                                    color: '#721c24',
                                    marginTop: spacing.sm
                                }}>
                                    <strong>Correct Answer:</strong>
                                </div>
                                <div style={{
                                    padding: spacing.sm,
                                    background: 'white',
                                    borderRadius: borderRadius.md,
                                    marginTop: spacing.xs,
                                    fontSize: '1.05rem',
                                    color: colors.dark
                                }}>
                                    {currentQuestion.answer}
                                </div>
                            </>
                        )}
                        {isCorrect && (
                            <div style={{
                                fontSize: '0.9rem',
                                color: '#155724',
                                marginTop: spacing.xs
                            }}>
                                +15 XP • +2 ⭐
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Action Buttons */}
            <div style={{
                display: 'flex',
                gap: spacing.md,
                justifyContent: 'center',
                flexWrap: 'wrap'
            }}>
                {!submitted ? (
                    <button
                        onClick={handleSubmit}
                        style={{
                            padding: `${spacing.md} ${spacing.xl}`,
                            background: colors.primaryGradient,
                            color: 'white',
                            border: 'none',
                            borderRadius: borderRadius.lg,
                            fontSize: '1.1rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            boxShadow: shadows.md
                        }}
                    >
                        Check Answer
                    </button>
                ) : (
                    <>
                        {!isCorrect && (
                            <button
                                onClick={handleTryAgain}
                                style={{
                                    padding: `${spacing.md} ${spacing.xl}`,
                                    background: colors.white,
                                    color: colors.dark,
                                    border: `2px solid ${colors.border}`,
                                    borderRadius: borderRadius.lg,
                                    fontSize: '1.1rem',
                                    fontWeight: '600',
                                    cursor: 'pointer'
                                }}
                            >
                                Try Again
                            </button>
                        )}
                        <button
                            onClick={handleNext}
                            style={{
                                padding: `${spacing.md} ${spacing.xl}`,
                                background: colors.primaryGradient,
                                color: 'white',
                                border: 'none',
                                borderRadius: borderRadius.lg,
                                fontSize: '1.1rem',
                                fontWeight: '600',
                                cursor: 'pointer',
                                boxShadow: shadows.md
                            }}
                        >
                            {currentIndex < questions.length - 1 ? 'Next Question →' : 'Complete Quiz'}
                        </button>
                    </>
                )}
            </div>
        </PageLayout>
    );
}
