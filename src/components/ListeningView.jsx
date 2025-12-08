
import { useState, useEffect, useRef } from 'react';
import { colors, borderRadius, shadows, spacing } from '../styles/designTokens';
import PageLayout from './common/PageLayout';
import { triggerConfetti } from '../utils/effects';
import { useIsMobile } from '../hooks/useIsMobile';

/**
 * ListeningView - Audio-based comprehension with scrollable question list
 * - Sticky audio player at top
 * - All questions visible
 * - Submit all at once
 */
export default function ListeningView({
    passage,
    onComplete,
    onBack,
    economy
}) {
    const isMobile = useIsMobile();
    const [answers, setAnswers] = useState({});
    const [submitted, setSubmitted] = useState(false);
    const [score, setScore] = useState({ correct: 0, total: 0 });
    const [showTranscript, setShowTranscript] = useState(false);
    const [hasPlayedOnce, setHasPlayedOnce] = useState(false);

    const audioRef = useRef(null);
    const totalQuestions = passage.questions.length;

    // Reset state when passage changes
    useEffect(() => {
        setAnswers({});
        setSubmitted(false);
        setScore({ correct: 0, total: 0 });
        setShowTranscript(false);
        setHasPlayedOnce(false);
    }, [passage.id]);

    const handleSelectOption = (questionIndex, option) => {
        if (submitted) return;
        setAnswers(prev => ({
            ...prev,
            [questionIndex]: option
        }));
    };

    const handlePlayEvidence = (timestamp) => {
        if (audioRef.current && timestamp !== undefined) {
            audioRef.current.currentTime = timestamp;
            audioRef.current.play();
        }
    };

    const handleSubmit = () => {
        if (submitted) {
            // Already submitted, move to next
            onComplete?.();
            return;
        }

        // Calculate score
        let correctCount = 0;
        passage.questions.forEach((q, idx) => {
            if (answers[idx] === q.answer) {
                correctCount++;
            }
        });

        const newScore = { correct: correctCount, total: totalQuestions };
        setScore(newScore);
        setSubmitted(true);

        // Awards
        if (newScore.correct > 0) {
            if (newScore.correct === totalQuestions) {
                triggerConfetti();
            }
            if (economy) {
                economy.addXP(newScore.correct * 15);
                economy.addCoins(newScore.correct * 1);
            }
        }

        // Scroll to top to see score? Or show score at bottom?
        // Let's show score at bottom near the button for context
    };

    const handleAudioEnded = () => {
        setHasPlayedOnce(true);
    };

    // Calculate how many answered
    const answeredCount = Object.keys(answers).length;
    const isAllAnswered = answeredCount === totalQuestions;

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
                gap: spacing.lg,
                position: 'relative' // Context for local sticky if needed
            }}>
                {/* Sticky Audio Player */}
                <div style={{
                    position: 'sticky',
                    top: isMobile ? '70px' : '90px', // Offset for PageLayout header
                    zIndex: 100,
                    background: colors.white,
                    borderRadius: borderRadius.xl,
                    padding: spacing.md,
                    boxShadow: shadows.md,
                    border: `1px solid ${colors.border}`,
                    marginLeft: '-4px', // Slight visual expansion
                    width: 'calc(100% + 8px)'
                }}>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: spacing.sm
                    }}>
                        <h2 style={{
                            margin: 0,
                            fontSize: '1rem',
                            color: colors.dark,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            maxWidth: '70%'
                        }}>
                            {passage.title}
                        </h2>
                        <span style={{
                            fontSize: '0.8rem',
                            color: colors.textMuted
                        }}>
                            Level {passage.level}
                        </span>
                    </div>

                    <audio
                        ref={audioRef}
                        controls
                        onEnded={handleAudioEnded}
                        style={{
                            width: '100%',
                            marginBottom: spacing.xs,
                            height: '40px',
                            borderRadius: borderRadius.md
                        }}
                    >
                        <source src={passage.audio_url} type="audio/mpeg" />
                    </audio>

                    <button
                        onClick={() => setShowTranscript(!showTranscript)}
                        style={{
                            width: '100%',
                            padding: spacing.xs,
                            background: showTranscript ? colors.primary : 'transparent',
                            color: showTranscript ? 'white' : colors.primary,
                            border: `1px solid ${colors.primary}`,
                            borderRadius: borderRadius.md,
                            cursor: 'pointer',
                            fontSize: '0.8rem',
                            fontWeight: '600'
                        }}
                    >
                        {showTranscript ? 'Hide Transcript' : 'Show Transcript'}
                    </button>

                    {/* Transcript Overlay */}
                    {showTranscript && (
                        <div style={{
                            marginTop: spacing.sm,
                            maxHeight: '200px',
                            overflowY: 'auto',
                            padding: spacing.sm,
                            background: colors.light,
                            borderRadius: borderRadius.md,
                            fontSize: '0.9rem',
                            lineHeight: '1.6',
                            color: colors.dark,
                            border: `1px solid ${colors.border}`
                        }}>
                            {passage.transcript.full_text}
                        </div>
                    )}
                </div>

                {/* Questions List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.xl }}>
                    {passage.questions.map((q, idx) => {
                        const isSelected = (val) => answers[idx] === val;
                        const isCorrectAnswer = (val) => val === q.answer;
                        const hasAnswer = answers[idx] !== undefined;

                        const isCardCorrect = answers[idx] === q.answer;

                        return (
                            <div key={idx} style={{
                                background: colors.white,
                                borderRadius: borderRadius.xl,
                                padding: spacing.lg,
                                boxShadow: shadows.sm,
                                border: submitted
                                    ? `2px solid ${isCardCorrect ? colors.success : colors.error}`
                                    : `1px solid ${colors.border}`
                            }}>
                                <div style={{
                                    fontSize: '0.85rem',
                                    color: colors.textMuted,
                                    marginBottom: spacing.sm,
                                    display: 'flex',
                                    justifyContent: 'space-between'
                                }}>
                                    <span>Question {idx + 1}</span>
                                    {submitted && (
                                        <span style={{
                                            color: isCardCorrect ? colors.success : colors.error,
                                            fontWeight: 'bold'
                                        }}>
                                            {isCardCorrect ? 'Correct' : 'Incorrect'}
                                        </span>
                                    )}
                                </div>

                                <p style={{
                                    fontSize: '1.1rem',
                                    color: colors.dark,
                                    marginBottom: spacing.lg,
                                    lineHeight: '1.5'
                                }}>
                                    {q.question}
                                </p>

                                {hasPlayedOnce && q.evidence_timestamp !== undefined && (
                                    <button
                                        onClick={() => handlePlayEvidence(q.evidence_timestamp)}
                                        style={{
                                            marginBottom: spacing.md,
                                            padding: `${spacing.xs} ${spacing.sm}`,
                                            background: '#eff6ff',
                                            color: '#2563eb',
                                            border: 'none',
                                            borderRadius: borderRadius.md,
                                            fontSize: '0.8rem',
                                            fontWeight: '600',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: spacing.xs
                                        }}
                                    >
                                        🔊 Replay hint
                                    </button>
                                )}

                                <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.sm }}>
                                    {Object.entries(q.options).map(([key, value]) => {
                                        const selected = isSelected(value);
                                        const correct = isCorrectAnswer(value);

                                        let bg = colors.light;
                                        let border = 'transparent';

                                        if (submitted) {
                                            if (correct) {
                                                bg = '#dcfce7'; // green-100
                                                border = colors.success;
                                            } else if (selected && !correct) {
                                                bg = '#fee2e2'; // red-100
                                                border = colors.error;
                                            } else if (selected) {
                                                // Should not happen if correct is handled above, but specific logic for selected correct
                                                bg = '#e0f2fe';
                                            }
                                        } else {
                                            if (selected) {
                                                bg = '#e0f2fe'; // sky-100
                                                border = '#0ea5e9'; // sky-500
                                            }
                                        }

                                        return (
                                            <button
                                                key={key}
                                                onClick={() => handleSelectOption(idx, value)}
                                                disabled={submitted}
                                                style={{
                                                    padding: spacing.md,
                                                    background: bg,
                                                    border: `2px solid ${border}`,
                                                    borderRadius: borderRadius.lg,
                                                    textAlign: 'left',
                                                    cursor: submitted ? 'default' : 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: spacing.md,
                                                    transition: 'all 0.2s',
                                                    opacity: (submitted && !correct && !selected) ? 0.6 : 1
                                                }}
                                            >
                                                <span style={{
                                                    width: '24px',
                                                    height: '24px',
                                                    borderRadius: '50%',
                                                    background: 'white',
                                                    border: `1px solid ${colors.textMuted}`,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontSize: '0.8rem',
                                                    fontWeight: 'bold',
                                                    color: colors.textMuted
                                                }}>
                                                    {key}
                                                </span>
                                                <span style={{ flex: 1 }}>{value}</span>
                                                {submitted && correct && <span>✅</span>}
                                                {submitted && selected && !correct && <span>❌</span>}
                                            </button>
                                        )
                                    })}
                                </div>

                                {submitted && (
                                    <div style={{
                                        marginTop: spacing.md,
                                        padding: spacing.md,
                                        background: '#f8fafc',
                                        borderRadius: borderRadius.lg,
                                        fontSize: '0.9rem',
                                        color: colors.textMuted
                                    }}>
                                        <strong>Explanation:</strong> {q.explanation}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Footer / Submit Area */}
                <div style={{
                    position: 'sticky',
                    bottom: 0,
                    background: 'white',
                    padding: spacing.md,
                    borderTop: `1px solid ${colors.border}`,
                    marginLeft: '-1rem',
                    width: 'calc(100% + 2rem)',
                    boxShadow: shadows.lg,
                    textAlign: 'center',
                    zIndex: 100
                }}>
                    {!submitted ? (
                        <button
                            onClick={handleSubmit}
                            disabled={!hasPlayedOnce || answeredCount === 0}
                            style={{
                                width: '100%',
                                padding: spacing.md,
                                background: hasPlayedOnce ? colors.primaryGradient : colors.surfaceVariant,
                                color: hasPlayedOnce ? 'white' : colors.textMuted,
                                border: 'none',
                                borderRadius: borderRadius.lg,
                                fontWeight: 'bold',
                                fontSize: '1.1rem',
                                cursor: hasPlayedOnce ? 'pointer' : 'not-allowed',
                                boxShadow: hasPlayedOnce ? shadows.md : 'none'
                            }}
                        >
                            {!hasPlayedOnce ? 'Play Audio First' :
                                answeredCount < totalQuestions ? `Submit (${answeredCount}/${totalQuestions})` : 'Submit All Answers'}
                        </button>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.sm }}>
                            <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: colors.dark }}>
                                Score: {score.correct} / {score.total}
                            </div>
                            <button
                                onClick={onComplete}
                                style={{
                                    width: '100%',
                                    padding: spacing.md,
                                    background: colors.success,
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: borderRadius.lg,
                                    fontWeight: 'bold',
                                    fontSize: '1.1rem',
                                    cursor: 'pointer',
                                    boxShadow: shadows.md
                                }}
                            >
                                Next Passage →
                            </button>
                        </div>
                    )}
                </div>

            </div>
        </PageLayout>
    );
}
