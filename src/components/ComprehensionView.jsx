import { useState, useEffect } from 'react';
import { colors, borderRadius, shadows, spacing, typography } from '../styles/designTokens';
import PageLayout from './common/PageLayout';
import { triggerConfetti } from '../utils/effects';
import BottomSheet from './common/BottomSheet';

/**
 * ComprehensionView - Reading comprehension with two-pane layout on desktop
 * Passage on left, questions on right for easy reference
 * Mobile: stacked layout with collapsible passage
 */
export default function ComprehensionView({
    passage,
    onComplete,
    onBack,
    economy
}) {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState(null);
    const [showResult, setShowResult] = useState(false);
    const [score, setScore] = useState({ correct: 0, total: 0 });
    const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 900);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 600); // Phones only
    const [completedQuestions, setCompletedQuestions] = useState({});

    const currentQuestion = passage.questions[currentQuestionIndex];
    const totalQuestions = passage.questions.length;
    const isCorrect = selectedOption === currentQuestion?.answer;

    useEffect(() => {
        const handleResize = () => {
            setIsDesktop(window.innerWidth >= 900);
            setIsMobile(window.innerWidth < 600);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleSelectOption = (option) => {
        if (showResult) return;
        setSelectedOption(option);
    };

    const handleSubmit = () => {
        if (!selectedOption) return;
        setShowResult(true);

        setCompletedQuestions(prev => ({
            ...prev,
            [currentQuestionIndex]: isCorrect
        }));

        if (isCorrect) {
            setScore(prev => ({ correct: prev.correct + 1, total: prev.total + 1 }));
            if (economy) {
                economy.addXP(15);
                economy.addCoins(1);
            }
        } else {
            setScore(prev => ({ ...prev, total: prev.total + 1 }));
        }
    };

    const handleNext = () => {
        if (currentQuestionIndex < totalQuestions - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
            setSelectedOption(null);
            setShowResult(false);
        } else {
            // All done
            if (score.correct === totalQuestions) {
                triggerConfetti();
            }
            onComplete?.();
        }
    };

    // Passage Content (for bottom sheet or side panel)
    const passageContent = (
        <>
            <div style={{
                display: 'flex',
                gap: spacing.xs,
                marginBottom: spacing.md,
                flexWrap: 'wrap'
            }}>
                <span style={{
                    padding: `${spacing.xs} ${spacing.sm}`,
                    background: '#e0f2fe',
                    borderRadius: borderRadius.md,
                    fontSize: '0.75rem',
                    color: '#0369a1'
                }}>
                    📊 Level {passage.difficulty}
                </span>
                <span style={{
                    padding: `${spacing.xs} ${spacing.sm}`,
                    background: '#fef3c7',
                    borderRadius: borderRadius.md,
                    fontSize: '0.75rem',
                    color: '#92400e'
                }}>
                    📚 {passage.theme}
                </span>
            </div>
            <div style={{
                fontSize: '1rem',
                lineHeight: '1.8',
                color: colors.dark,
                whiteSpace: 'pre-wrap'
            }}>
                {passage.passage}
            </div>
        </>
    );

    const renderPassagePane = () => (
        <div style={{
            flex: isDesktop ? '1 1 50%' : '1',
            background: colors.white,
            borderRadius: borderRadius.xl,
            padding: spacing.lg,
            boxShadow: shadows.md,
            overflow: 'auto',
            maxHeight: isDesktop ? 'calc(100vh - 200px)' : 'auto',
            marginBottom: isDesktop ? 0 : spacing.lg
        }}>
            <h2 style={{
                margin: 0,
                marginBottom: spacing.md,
                fontSize: '1.2rem',
                color: colors.dark
            }}>
                📖 {passage.title}
            </h2>
            {passageContent}
        </div>
    );

    const renderQuestionsPane = () => (
        <div style={{
            flex: isDesktop ? '1 1 50%' : '1',
            display: 'flex',
            flexDirection: 'column',
            gap: spacing.md
        }}>
            {/* Progress Bar */}
            <div style={{
                display: 'flex',
                gap: spacing.xs,
                justifyContent: 'center',
                marginBottom: spacing.sm
            }}>
                {passage.questions.map((_, idx) => (
                    <div key={idx} style={{
                        width: '30px',
                        height: '6px',
                        borderRadius: '3px',
                        background: completedQuestions[idx] === true ? colors.success :
                            completedQuestions[idx] === false ? colors.error :
                                idx === currentQuestionIndex ? colors.primary :
                                    colors.light,
                        transition: 'background 0.3s'
                    }} />
                ))}
            </div>

            {/* Question Card */}
            <div style={{
                background: colors.white,
                borderRadius: borderRadius.xl,
                padding: spacing.lg,
                boxShadow: shadows.md
            }}>
                <div style={{
                    fontSize: '0.85rem',
                    color: colors.textMuted,
                    marginBottom: spacing.sm
                }}>
                    Question {currentQuestionIndex + 1} of {totalQuestions}
                </div>

                <p style={{
                    fontSize: '1.1rem',
                    color: colors.dark,
                    marginBottom: spacing.lg,
                    lineHeight: '1.6'
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
                                            isSelected ? '#e0f2fe' :
                                                colors.light,
                                    border: `2px solid ${showCorrect ? colors.success :
                                        showWrong ? colors.error :
                                            isSelected ? '#0ea5e9' :
                                                'transparent'
                                        }`,
                                    borderRadius: borderRadius.lg,
                                    textAlign: 'left',
                                    fontSize: '0.95rem',
                                    cursor: showResult ? 'default' : 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: spacing.sm,
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                <span style={{
                                    width: '26px',
                                    height: '26px',
                                    borderRadius: borderRadius.round,
                                    background: isSelected ? '#0ea5e9' : colors.white,
                                    color: isSelected ? 'white' : colors.textMuted,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontWeight: 'bold',
                                    fontSize: '0.8rem',
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

            {/* Explanation (after answering) */}
            {showResult && (
                <div style={{
                    background: isCorrect ? '#d4edda' : '#fff3cd',
                    borderRadius: borderRadius.lg,
                    padding: spacing.md
                }}>
                    <div style={{
                        fontWeight: 'bold',
                        marginBottom: spacing.xs,
                        color: isCorrect ? colors.success : '#856404'
                    }}>
                        {isCorrect ? '✓ Correct!' : '✗ Not quite right'}
                    </div>
                    <p style={{
                        color: colors.dark,
                        fontSize: '0.9rem',
                        lineHeight: '1.6',
                        margin: 0
                    }}>
                        {currentQuestion.explanation}
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
                            background: selectedOption ? 'linear-gradient(135deg, #0ea5e9 0%, #0369a1 100%)' : colors.light,
                            color: selectedOption ? 'white' : colors.textMuted,
                            border: 'none',
                            borderRadius: borderRadius.lg,
                            fontSize: '1rem',
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
                            background: 'linear-gradient(135deg, #0ea5e9 0%, #0369a1 100%)',
                            color: 'white',
                            border: 'none',
                            borderRadius: borderRadius.lg,
                            fontSize: '1rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            boxShadow: shadows.md
                        }}
                    >
                        {currentQuestionIndex < totalQuestions - 1 ? 'Next Question' : 'Finish'}
                    </button>
                )}
            </div>

            {/* Score */}
            <div style={{
                textAlign: 'center',
                color: colors.textMuted,
                fontSize: '0.85rem'
            }}>
                Score: {score.correct} / {score.total}
            </div>
        </div>
    );

    return (
        <PageLayout
            title="Reading Comprehension"
            showBack={true}
            onBack={onBack}
            maxWidth={isDesktop ? '1200px' : '700px'}
        >
            <div style={{
                display: 'flex',
                flexDirection: isDesktop ? 'row' : 'column',
                gap: spacing.lg,
                alignItems: 'flex-start',
                paddingBottom: isMobile ? '60vh' : 0 // Space for bottom sheet on mobile
            }}>
                {/* Desktop: Side-by-side layout */}
                {isDesktop && renderPassagePane()}

                {/* All devices: Question pane (fixed on mobile) */}
                {renderQuestionsPane()}
            </div>

            {/* Mobile-only: Bottom sheet for passage */}
            {isMobile && (
                <BottomSheet
                    snapPoints={['30%', '50%', '85%']}
                    initialSnap="30%"
                    minHeight={120}
                >
                    <h3 style={{
                        margin: 0,
                        marginBottom: spacing.md,
                        fontSize: '1.1rem',
                        color: colors.dark
                    }}>
                        📖 {passage.title}
                    </h3>
                    {passageContent}
                </BottomSheet>
            )}
        </PageLayout>
    );
}
