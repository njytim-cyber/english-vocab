import { useState, useEffect } from 'react';
import { colors, borderRadius, shadows, spacing, typography } from '../styles/designTokens';
import PageLayout from './common/PageLayout';
import { triggerConfetti } from '../utils/effects';

/**
 * GrammarQuizView - Grammar MCQ component
 * Displays grammar questions with explanation after answering
 */
export default function GrammarQuizView({
    questions,
    onComplete,
    onBack,
    economy
}) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState(null);
    const [showResult, setShowResult] = useState(false);
    const [score, setScore] = useState({ correct: 0, total: 0 });
    const [showFinalResults, setShowFinalResults] = useState(false);

    const currentQuestion = questions[currentIndex];
    const isCorrect = selectedOption === currentQuestion?.answer;
    const totalQuestions = questions.length;

    const handleSelectOption = (option) => {
        if (showResult) return;
        setSelectedOption(option);
    };

    const handleSubmit = () => {
        if (!selectedOption) return;

        setShowResult(true);

        if (isCorrect) {
            setScore(prev => ({ ...prev, correct: prev.correct + 1 }));
            // Award XP for correct answer
            if (economy) {
                economy.addXP(10 * currentQuestion.difficulty);
                economy.addCoins(1);
            }
        }

        setScore(prev => ({ ...prev, total: prev.total + 1 }));
    };

    const handleNext = () => {
        if (currentIndex < totalQuestions - 1) {
            setCurrentIndex(prev => prev + 1);
            setSelectedOption(null);
            setShowResult(false);
        } else {
            // Show final results
            setShowFinalResults(true);
            if (score.correct === totalQuestions) {
                triggerConfetti();
            }
        }
    };

    if (showFinalResults) {
        const percentage = Math.round((score.correct / score.total) * 100);
        return (
            <PageLayout title="Grammar Quiz Results" showBack={true} onBack={onBack} maxWidth="600px">
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
                    <h2 style={{
                        color: colors.dark,
                        fontSize: '2rem',
                        marginBottom: spacing.md
                    }}>
                        {score.correct} / {score.total}
                    </h2>
                    <p style={{ color: colors.textMuted, marginBottom: spacing.lg }}>
                        {percentage}% correct
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
                                fontSize: '1rem',
                                fontWeight: '600',
                                cursor: 'pointer'
                            }}
                        >
                            Try Another Quiz
                        </button>
                        <button
                            onClick={onBack}
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
                            Back to Learn
                        </button>
                    </div>
                </div>
            </PageLayout>
        );
    }

    if (!currentQuestion) {
        return <PageLayout title="Grammar Quiz" showBack={true} onBack={onBack}>Loading...</PageLayout>;
    }

    return (
        <PageLayout
            title="Grammar Quiz"
            showBack={true}
            onBack={onBack}
            maxWidth="700px"
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
                    background: colors.light,
                    borderRadius: borderRadius.md,
                    fontSize: '0.85rem',
                    color: colors.textMuted
                }}>
                    📚 {currentQuestion.subunit}
                </span>
                <span style={{
                    padding: `${spacing.xs} ${spacing.sm}`,
                    background: colors.light,
                    borderRadius: borderRadius.md,
                    fontSize: '0.85rem',
                    color: colors.textMuted
                }}>
                    Question {currentIndex + 1} / {totalQuestions}
                </span>
            </div>

            {/* Question Card */}
            <div style={{
                background: colors.white,
                borderRadius: borderRadius.xl,
                padding: spacing.xl,
                boxShadow: shadows.md,
                marginBottom: spacing.lg
            }}>
                {/* Question Text */}
                <p style={{
                    fontSize: '1.2rem',
                    lineHeight: '1.8',
                    color: colors.dark,
                    marginBottom: spacing.xl
                }}>
                    {currentQuestion.question}
                </p>

                {/* Options */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.sm }}>
                    {Object.entries(currentQuestion.options).map(([key, value]) => {
                        const isSelected = selectedOption === value;
                        const isCorrectOption = value === currentQuestion.answer;
                        const showCorrect = showResult && isCorrectOption;
                        const showWrong = showResult && isSelected && !isCorrectOption;

                        return (
                            <button
                                key={key}
                                onClick={() => handleSelectOption(value)}
                                disabled={showResult}
                                style={{
                                    padding: spacing.md,
                                    background: showCorrect ? '#d4edda' :
                                        showWrong ? '#f8d7da' :
                                            isSelected ? colors.primaryLight :
                                                colors.light,
                                    border: `2px solid ${showCorrect ? colors.success :
                                            showWrong ? colors.error :
                                                isSelected ? colors.primary :
                                                    'transparent'
                                        }`,
                                    borderRadius: borderRadius.lg,
                                    textAlign: 'left',
                                    fontSize: '1rem',
                                    cursor: showResult ? 'default' : 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: spacing.sm,
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                <span style={{
                                    width: '28px',
                                    height: '28px',
                                    borderRadius: borderRadius.round,
                                    background: isSelected ? colors.primary : colors.white,
                                    color: isSelected ? 'white' : colors.textMuted,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontWeight: 'bold',
                                    fontSize: '0.85rem',
                                    flexShrink: 0
                                }}>
                                    {key}
                                </span>
                                <span style={{ color: colors.dark }}>{value}</span>
                                {showCorrect && <span style={{ marginLeft: 'auto' }}>✓</span>}
                                {showWrong && <span style={{ marginLeft: 'auto' }}>✗</span>}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Explanation (shown after answering) */}
            {showResult && (
                <div style={{
                    background: isCorrect ? '#d4edda' : '#fff3cd',
                    borderRadius: borderRadius.lg,
                    padding: spacing.lg,
                    marginBottom: spacing.lg
                }}>
                    <div style={{
                        fontWeight: 'bold',
                        marginBottom: spacing.sm,
                        color: isCorrect ? colors.success : '#856404'
                    }}>
                        {isCorrect ? '✓ Correct!' : '✗ Not quite right'}
                    </div>
                    <p style={{
                        color: colors.dark,
                        marginBottom: spacing.sm,
                        lineHeight: '1.6'
                    }}>
                        <strong>Explanation:</strong> {currentQuestion.explanation}
                    </p>
                    <p style={{
                        color: colors.textMuted,
                        fontStyle: 'italic',
                        fontSize: '0.9rem'
                    }}>
                        <strong>Example:</strong> {currentQuestion.example}
                    </p>
                </div>
            )}

            {/* Action Button */}
            <div style={{ textAlign: 'center' }}>
                {!showResult ? (
                    <button
                        onClick={handleSubmit}
                        disabled={!selectedOption}
                        style={{
                            padding: `${spacing.md} ${spacing.xl}`,
                            background: selectedOption ? colors.primaryGradient : colors.light,
                            color: selectedOption ? 'white' : colors.textMuted,
                            border: 'none',
                            borderRadius: borderRadius.lg,
                            fontSize: '1.1rem',
                            fontWeight: '600',
                            cursor: selectedOption ? 'pointer' : 'not-allowed',
                            boxShadow: selectedOption ? shadows.md : 'none'
                        }}
                    >
                        Check Answer
                    </button>
                ) : (
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
                        {currentIndex < totalQuestions - 1 ? 'Next Question' : 'See Results'}
                    </button>
                )}
            </div>
        </PageLayout>
    );
}
