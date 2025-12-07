import React from 'react';
import PageLayout from './common/PageLayout';
import { colors, borderRadius, shadows } from '../styles/designTokens';

export default function ResultsView({ engine, onRestart }) {
    const state = engine.getState();
    const history = engine.getSessionHistory();
    const incorrectItems = history.filter(item => !item.isCorrect);
    const correctCount = history.filter(item => item.isCorrect).length;
    const accuracy = history.length > 0 ? Math.round((correctCount / history.length) * 100) : 0;

    const handleRetry = () => {
        const questionsToRetry = incorrectItems.map(item => item.question);
        engine.startRetryGame(questionsToRetry);
        onRestart();
    };

    const getEmoji = () => {
        if (accuracy >= 90) return '🌟';
        if (accuracy >= 70) return '🎉';
        if (accuracy >= 50) return '👍';
        return '💪';
    };

    const getMessage = () => {
        if (accuracy >= 90) return 'Outstanding!';
        if (accuracy >= 70) return 'Great Job!';
        if (accuracy >= 50) return 'Good Effort!';
        return 'Keep Practicing!';
    };

    return (
        <PageLayout maxWidth="600px">
            {/* Hero Section */}
            <div style={{
                textAlign: 'center',
                marginBottom: '2rem'
            }}>
                <div className="animate-pop" style={{ fontSize: '4rem', marginBottom: '0.5rem' }}>
                    {getEmoji()}
                </div>
                <h1 style={{
                    fontSize: '2rem',
                    color: colors.dark,
                    marginBottom: '0.5rem'
                }}>
                    {getMessage()}
                </h1>
                <p style={{ color: colors.textMuted, fontSize: '1rem' }}>
                    {accuracy}% Accuracy
                </p>
            </div>

            {/* Stats Card */}
            <div style={{
                background: colors.white,
                borderRadius: borderRadius.lg,
                padding: '1.5rem',
                marginBottom: '1.5rem',
                boxShadow: shadows.sm
            }}>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '1rem',
                    textAlign: 'center',
                    marginBottom: '1.5rem'
                }}>
                    <div>
                        <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: colors.primary }}>{state.score}</div>
                        <div style={{ fontSize: '0.8rem', color: colors.textMuted }}>Score</div>
                    </div>
                    <div>
                        <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: colors.success }}>{correctCount}</div>
                        <div style={{ fontSize: '0.8rem', color: colors.textMuted }}>Correct</div>
                    </div>
                    <div>
                        <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: colors.error }}>{incorrectItems.length}</div>
                        <div style={{ fontSize: '0.8rem', color: colors.textMuted }}>To Review</div>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button
                        onClick={() => { engine.reset(); onRestart(); }}
                        aria-label="Start new quiz"
                        style={{
                            flex: 1,
                            padding: '0.9rem',
                            fontSize: '1rem',
                            background: colors.primaryGradient,
                            color: 'white',
                            borderRadius: borderRadius.md,
                            border: 'none',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            boxShadow: shadows.primary
                        }}
                    >
                        Play Again
                    </button>

                    {incorrectItems.length > 0 && (
                        <button
                            onClick={handleRetry}
                            aria-label={`Review ${incorrectItems.length} incorrect ${incorrectItems.length === 1 ? 'answer' : 'answers'}`}
                            style={{
                                flex: 1,
                                padding: '0.9rem',
                                fontSize: '1rem',
                                background: colors.white,
                                color: colors.primary,
                                borderRadius: borderRadius.md,
                                border: `2px solid ${colors.primary}`,
                                cursor: 'pointer',
                                fontWeight: 'bold'
                            }}
                        >
                            Review ({incorrectItems.length})
                        </button>
                    )}
                </div>
            </div>

            {/* Session Summary */}
            <div>
                <h3 style={{
                    marginBottom: '1rem',
                    color: colors.dark,
                    fontSize: '1.1rem'
                }}>
                    Session Summary
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {history.map((item, idx) => (
                        <div key={idx} style={{
                            background: colors.white,
                            padding: '1rem',
                            borderRadius: borderRadius.md,
                            borderLeft: `4px solid ${item.isCorrect ? colors.success : colors.error}`,
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            boxShadow: shadows.sm
                        }}>
                            <div>
                                <div style={{ fontWeight: '600', color: colors.dark, fontSize: '0.95rem' }}>
                                    {item.question.question}
                                </div>
                                <div style={{ fontSize: '0.85rem', color: colors.textMuted, marginTop: '0.2rem' }}>
                                    {item.question.answer}
                                    {!item.isCorrect && (
                                        <span style={{ color: colors.error, marginLeft: '0.5rem' }}>
                                            (You: {item.userAnswer})
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div style={{ fontSize: '1.3rem' }}>
                                {item.isCorrect ? '✅' : '❌'}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </PageLayout>
    );
}
