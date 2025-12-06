import { useState } from 'react';
import { colors, borderRadius, shadows, spacing } from '../styles/designTokens';
import PageLayout from './common/PageLayout';
import { triggerConfetti } from '../utils/effects';

/**
 * GrammarClozeView - Grammar Cloze Passage component
 * Reuses ClozeView patterns but adds explanation display after each blank
 * and category-based theming
 */
export default function GrammarClozeView({
    passage,
    onComplete,
    onBack,
    economy
}) {
    const [answers, setAnswers] = useState({});
    const [submitted, setSubmitted] = useState(false);
    const [results, setResults] = useState(null);

    // Collect all blanks from all paragraphs
    const allBlanks = passage.paragraphs.flatMap(p => p.blanks);

    const handleSelectOption = (blankId, option) => {
        if (submitted) return;
        setAnswers(prev => ({ ...prev, [blankId]: option }));
    };

    const handleSubmit = () => {
        if (Object.keys(answers).length < allBlanks.length) {
            alert('Please fill in all blanks before submitting.');
            return;
        }

        let correct = 0;
        const blankResults = {};

        allBlanks.forEach(blank => {
            const isCorrect = answers[blank.id] === blank.answer;
            blankResults[blank.id] = isCorrect;
            if (isCorrect) correct++;
        });

        const xpEarned = correct * 15; // Grammar earns more XP
        const starsEarned = Math.floor(correct / 2);

        if (economy) {
            economy.addXP(xpEarned);
            economy.addCoins(starsEarned);
        }

        setResults({
            correct,
            total: allBlanks.length,
            percentage: Math.round((correct / allBlanks.length) * 100),
            blankResults,
            xpEarned,
            starsEarned
        });

        setSubmitted(true);

        if (correct === allBlanks.length) {
            triggerConfetti();
        }
    };

    const renderParagraph = (paragraph, paragraphIndex) => {
        const parts = paragraph.text.split(/(__\d+__)/);

        return (
            <div key={paragraphIndex} style={{ marginBottom: spacing.lg }}>
                <p style={{
                    fontSize: '1.1rem',
                    lineHeight: '2',
                    color: colors.dark,
                    marginBottom: spacing.sm
                }}>
                    {parts.map((part, i) => {
                        const blankMatch = part.match(/__(\d+)__/);
                        if (blankMatch) {
                            const blankId = parseInt(blankMatch[1]);
                            const blank = paragraph.blanks.find(b => b.id === blankId);
                            if (!blank) return part;

                            const selectedOption = answers[blankId];
                            const isCorrect = submitted && selectedOption === blank.answer;
                            const isWrong = submitted && selectedOption && selectedOption !== blank.answer;

                            return (
                                <span key={i} style={{ position: 'relative', display: 'inline-block' }}>
                                    <select
                                        value={selectedOption || ''}
                                        onChange={(e) => handleSelectOption(blankId, e.target.value)}
                                        disabled={submitted}
                                        style={{
                                            padding: '4px 24px 4px 8px',
                                            fontSize: '1rem',
                                            fontWeight: '600',
                                            borderRadius: borderRadius.md,
                                            border: `2px solid ${isCorrect ? colors.success :
                                                    isWrong ? colors.error :
                                                        selectedOption ? '#f59e0b' : // Amber for grammar
                                                            colors.border
                                                }`,
                                            background: isCorrect ? '#d4edda' :
                                                isWrong ? '#f8d7da' :
                                                    colors.white,
                                            color: colors.dark,
                                            cursor: submitted ? 'default' : 'pointer',
                                            minWidth: '110px',
                                            appearance: 'none',
                                            WebkitAppearance: 'none'
                                        }}
                                    >
                                        <option value="">({blankId})</option>
                                        {blank.options.map(opt => (
                                            <option key={opt} value={opt}>{opt}</option>
                                        ))}
                                    </select>
                                    <span style={{
                                        position: 'absolute',
                                        right: '8px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        pointerEvents: 'none',
                                        fontSize: '0.8rem'
                                    }}>▼</span>
                                    {isWrong && (
                                        <span style={{
                                            marginLeft: '4px',
                                            color: colors.success,
                                            fontWeight: '600',
                                            fontSize: '0.9rem'
                                        }}>
                                            → {blank.answer}
                                        </span>
                                    )}
                                </span>
                            );
                        }
                        return <span key={i}>{part}</span>;
                    })}
                </p>

                {/* Show explanations after submission */}
                {submitted && (
                    <div style={{
                        background: '#fffbeb',
                        borderLeft: `4px solid #f59e0b`,
                        padding: spacing.sm,
                        marginTop: spacing.xs,
                        borderRadius: `0 ${borderRadius.md} ${borderRadius.md} 0`,
                        fontSize: '0.9rem'
                    }}>
                        {paragraph.blanks.map(blank => (
                            <div key={blank.id} style={{
                                marginBottom: spacing.xs,
                                color: results?.blankResults[blank.id] ? colors.success : colors.error
                            }}>
                                <strong>({blank.id}) {blank.answer}:</strong>{' '}
                                <span style={{ color: colors.textMuted }}>{blank.explanation}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <PageLayout
            title={passage.title}
            showBack={true}
            onBack={onBack}
            maxWidth="800px"
        >
            {/* Passage Info */}
            <div style={{
                display: 'flex',
                gap: spacing.sm,
                marginBottom: spacing.lg,
                flexWrap: 'wrap'
            }}>
                <span style={{
                    padding: `${spacing.xs} ${spacing.sm}`,
                    background: '#fef3c7',
                    borderRadius: borderRadius.md,
                    fontSize: '0.85rem',
                    color: '#92400e'
                }}>
                    ✏️ {passage.category}
                </span>
                <span style={{
                    padding: `${spacing.xs} ${spacing.sm}`,
                    background: colors.light,
                    borderRadius: borderRadius.md,
                    fontSize: '0.85rem',
                    color: colors.textMuted
                }}>
                    📊 Level {passage.difficulty}
                </span>
                <span style={{
                    padding: `${spacing.xs} ${spacing.sm}`,
                    background: colors.light,
                    borderRadius: borderRadius.md,
                    fontSize: '0.85rem',
                    color: colors.textMuted
                }}>
                    📝 {passage.totalBlanks} blanks
                </span>
            </div>

            {/* Passage Content */}
            <div style={{
                background: colors.white,
                padding: spacing.xl,
                borderRadius: borderRadius.xl,
                boxShadow: shadows.md,
                marginBottom: spacing.lg
            }}>
                {passage.paragraphs.map((p, i) => renderParagraph(p, i))}
            </div>

            {/* Results */}
            {results && (
                <div style={{
                    background: results.percentage >= 80 ? '#d4edda' :
                        results.percentage >= 50 ? '#fff3cd' : '#f8d7da',
                    padding: spacing.lg,
                    borderRadius: borderRadius.lg,
                    marginBottom: spacing.lg,
                    textAlign: 'center'
                }}>
                    <div style={{ fontSize: '2rem', marginBottom: spacing.sm }}>
                        {results.percentage >= 80 ? '🎉' : results.percentage >= 50 ? '👍' : '💪'}
                    </div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: colors.dark }}>
                        {results.correct} / {results.total} correct ({results.percentage}%)
                    </div>
                    <div style={{
                        marginTop: spacing.sm,
                        fontSize: '1rem',
                        color: colors.textMuted
                    }}>
                        +{results.xpEarned} XP • +{results.starsEarned} ⭐
                    </div>
                </div>
            )}

            {/* Action Buttons */}
            <div style={{
                display: 'flex',
                gap: spacing.md,
                justifyContent: 'center'
            }}>
                {!submitted ? (
                    <button
                        onClick={handleSubmit}
                        style={{
                            padding: `${spacing.md} ${spacing.xl}`,
                            background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                            color: 'white',
                            border: 'none',
                            borderRadius: borderRadius.lg,
                            fontSize: '1.1rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            boxShadow: shadows.md
                        }}
                    >
                        Submit Answers
                    </button>
                ) : (
                    <>
                        <button
                            onClick={onComplete}
                            style={{
                                padding: `${spacing.md} ${spacing.xl}`,
                                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                                color: 'white',
                                border: 'none',
                                borderRadius: borderRadius.lg,
                                fontSize: '1.1rem',
                                fontWeight: '600',
                                cursor: 'pointer',
                                boxShadow: shadows.md
                            }}
                        >
                            Next Passage
                        </button>
                        <button
                            onClick={onBack}
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
                            Back to Learn
                        </button>
                    </>
                )}
            </div>
        </PageLayout>
    );
}
