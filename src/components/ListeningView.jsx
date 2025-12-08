import { useState, useEffect, useRef } from 'react';
import { colors, borderRadius, shadows, spacing } from '../styles/designTokens';
import PageLayout from './common/PageLayout';
import { triggerConfetti } from '../utils/effects';

/**
 * ListeningView - Audio-based comprehension with question answering
 * Plays audio passage with optional transcript
 * Shows questions with multiple choice options
 * Supports replay of evidence timestamps for each question
 */
export default function ListeningView({
    passage,
    onComplete,
    onBack,
    economy
}) {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState(null);
    const [showResult, setShowResult] = useState(false);
    const [score, setScore] = useState({ correct: 0, total: 0 });
    const [showTranscript, setShowTranscript] = useState(false);
    const [completedQuestions, setCompletedQuestions] = useState({});
    const [hasPlayedOnce, setHasPlayedOnce] = useState(false);

    const audioRef = useRef(null);
    const currentQuestion = passage.questions[currentQuestionIndex];
    const totalQuestions = passage.questions.length;
    const isCorrect = selectedOption === currentQuestion?.answer;

    // Reset state when passage changes
    useEffect(() => {
        setCurrentQuestionIndex(0);
        setSelectedOption(null);
        setShowResult(false);
        setScore({ correct: 0, total: 0 });
        setShowTranscript(false);
        setCompletedQuestions({});
        setHasPlayedOnce(false);
    }, [passage.id]);

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

    const handlePlayEvidence = () => {
        if (audioRef.current && currentQuestion.evidence_timestamp !== undefined) {
            audioRef.current.currentTime = currentQuestion.evidence_timestamp;
            audioRef.current.play();
        }
    };

    const handleAudioEnded = () => {
        setHasPlayedOnce(true);
    };

    return (
        <PageLayout
            title="Listening Comprehension"
            showBack={true}
            onBack={onBack}
            maxWidth="800px"
        >
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: spacing.lg
            }}>
                {/* Audio Player Card */}
                <div style={{
                    background: colors.white,
                    borderRadius: borderRadius.xl,
                    padding: spacing.lg,
                    boxShadow: shadows.md
                }}>
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
                            🎧 Level {passage.level}
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
                        <span style={{
                            padding: `${spacing.xs} ${spacing.sm}`,
                            background: '#f3e8ff',
                            borderRadius: borderRadius.md,
                            fontSize: '0.75rem',
                            color: '#6b21a8'
                        }}>
                            ⏱️ {passage.duration_seconds}s
                        </span>
                    </div>

                    <h2 style={{
                        margin: 0,
                        marginBottom: spacing.md,
                        fontSize: '1.2rem',
                        color: colors.dark
                    }}>
                        {passage.title}
                    </h2>

                    {/* Audio Element */}
                    <audio
                        ref={audioRef}
                        controls
                        onEnded={handleAudioEnded}
                        style={{
                            width: '100%',
                            marginBottom: spacing.md,
                            borderRadius: borderRadius.md
                        }}
                    >
                        <source src={passage.audio_url} type="audio/mpeg" />
                        Your browser does not support the audio element.
                    </audio>

                    {/* Transcript Toggle */}
                    <button
                        onClick={() => setShowTranscript(!showTranscript)}
                        style={{
                            padding: `${spacing.sm} ${spacing.md}`,
                            background: showTranscript ? colors.primary : colors.light,
                            color: showTranscript ? 'white' : colors.dark,
                            border: 'none',
                            borderRadius: borderRadius.lg,
                            cursor: 'pointer',
                            fontSize: '0.9rem',
                            fontWeight: '600',
                            marginBottom: showTranscript ? spacing.md : 0
                        }}
                    >
                        {showTranscript ? '📖 Hide Transcript' : '📖 Show Transcript'}
                    </button>

                    {/* Transcript */}
                    {showTranscript && (
                        <div style={{
                            background: colors.light,
                            borderRadius: borderRadius.lg,
                            padding: spacing.md,
                            fontSize: '0.95rem',
                            lineHeight: '1.7',
                            color: colors.dark,
                            whiteSpace: 'pre-wrap'
                        }}>
                            {passage.transcript.full_text}
                        </div>
                    )}
                </div>

                {/* Progress Bar */}
                <div style={{
                    display: 'flex',
                    gap: spacing.xs,
                    justifyContent: 'center'
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

                    {/* Replay Evidence Button */}
                    {hasPlayedOnce && currentQuestion.evidence_timestamp !== undefined && (
                        <button
                            onClick={handlePlayEvidence}
                            style={{
                                padding: `${spacing.xs} ${spacing.md}`,
                                background: '#dbeafe',
                                color: '#1e40af',
                                border: 'none',
                                borderRadius: borderRadius.md,
                                cursor: 'pointer',
                                fontSize: '0.85rem',
                                marginBottom: spacing.md,
                                fontWeight: '600'
                            }}
                        >
                            🔊 Replay relevant section
                        </button>
                    )}

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
                            disabled={!selectedOption || !hasPlayedOnce}
                            style={{
                                padding: `${spacing.md} ${spacing.xl}`,
                                background: (selectedOption && hasPlayedOnce) ? 'linear-gradient(135deg, #0ea5e9 0%, #0369a1 100%)' : colors.light,
                                color: (selectedOption && hasPlayedOnce) ? 'white' : colors.textMuted,
                                border: 'none',
                                borderRadius: borderRadius.lg,
                                fontSize: '1rem',
                                fontWeight: '600',
                                cursor: (selectedOption && hasPlayedOnce) ? 'pointer' : 'not-allowed',
                                boxShadow: (selectedOption && hasPlayedOnce) ? shadows.md : 'none'
                            }}
                        >
                            {!hasPlayedOnce ? '🎧 Listen first' : 'Check Answer'}
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
        </PageLayout>
    );
}
