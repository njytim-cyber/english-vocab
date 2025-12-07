import React, { useState } from 'react';
import { colors, borderRadius } from '../../styles/designTokens';

/**
 * ProgressMarkers - Visual progress tracker for MCQ quizzes
 * Shows 10 markers with correct/wrong indicators
 * Allows clicking to review past questions
 */
export default function ProgressMarkers({
    questionHistory = [],
    currentIndex = 0,
    totalQuestions = 10,
    onReviewQuestion
}) {
    return (
        <div style={{
            display: 'flex',
            gap: '8px',
            justifyContent: 'center',
            padding: '16px',
            marginBottom: '16px',
            flexWrap: 'wrap'
        }}>
            {Array.from({ length: totalQuestions }).map((_, i) => {
                const answered = questionHistory.find(h => h.questionIndex === i);
                const isCurrent = i === currentIndex;
                const isAnswered = !!answered;

                return (
                    <button
                        key={i}
                        onClick={() => isAnswered && onReviewQuestion && onReviewQuestion(i)}
                        disabled={!isAnswered}
                        style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            border: `2px solid ${answered?.isCorrect ? '#28a745' :
                                answered ? '#dc3545' :
                                    '#dee2e6'
                                }`,
                            background: answered?.isCorrect ? '#28a745' :
                                answered ? '#dc3545' :
                                    '#e9ecef',
                            color: 'white',
                            cursor: isAnswered ? 'pointer' : 'not-allowed',
                            opacity: isAnswered ? 1 : 0.4,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '18px',
                            fontWeight: 'bold',
                            transition: 'all 0.3s',
                            boxShadow: isCurrent ? '0 0 0 4px rgba(102, 126, 234, 0.3)' : 'none',
                            transform: isCurrent ? 'scale(1.1)' : 'scale(1)',
                            animation: isCurrent ? 'pulse 1.5s infinite' : 'none'
                        }}
                        title={
                            answered ? `Question ${i + 1}: ${answered.isCorrect ? 'Correct ✓' : 'Wrong ✗'}` :
                                isCurrent ? 'Current question' :
                                    'Not answered yet'
                        }
                    >
                        {answered?.isCorrect ? '✓' : answered ? '✗' : ''}
                    </button>
                );
            })}

            <style>{`
                @keyframes pulse {
                    0%, 100% {
                        box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.3);
                    }
                    50% {
                        box-shadow: 0 0 0 8px rgba(102, 126, 234, 0.1);
                    }
                }
            `}</style>
        </div>
    );
}

/**
 * QuestionReviewModal - Shows a previously answered question
 * Read-only, highlights correct/wrong answers
 */
export function QuestionReviewModal({ questionData, onClose }) {
    if (!questionData) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '16px'
        }}>
            <div style={{
                background: 'white',
                borderRadius: borderRadius.lg,
                padding: '24px',
                maxWidth: '600px',
                width: '100%',
                maxHeight: '80vh',
                overflow: 'auto'
            }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '16px'
                }}>
                    <h3 style={{ margin: 0, color: colors.dark }}>
                        Question {questionData.questionIndex + 1}
                    </h3>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'none',
                            border: 'none',
                            fontSize: '24px',
                            cursor: 'pointer',
                            color: colors.textMuted
                        }}
                    >
                        ×
                    </button>
                </div>

                <p style={{
                    fontSize: '1.1rem',
                    marginBottom: '24px',
                    color: colors.dark
                }}>
                    {questionData.question.question}
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {Object.entries(questionData.question.options).map(([key, opt]) => {
                        const isCorrect = opt === questionData.correctAnswer;
                        const isUserAnswer = opt === questionData.selectedAnswer;

                        return (
                            <div
                                key={key}
                                style={{
                                    padding: '16px',
                                    borderRadius: borderRadius.md,
                                    border: `2px solid ${isCorrect ? '#28a745' :
                                        isUserAnswer ? '#dc3545' :
                                            '#dee2e6'
                                        }`,
                                    background: isCorrect ? '#d4edda' :
                                        isUserAnswer ? '#f8d7da' :
                                            '#fff',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}
                            >
                                <span style={{ flex: 1 }}>{opt}</span>
                                {isCorrect && (
                                    <span style={{ color: '#28a745', fontWeight: 'bold', marginLeft: '8px' }}>
                                        ✓ Correct
                                    </span>
                                )}
                                {isUserAnswer && !isCorrect && (
                                    <span style={{ color: '#dc3545', fontWeight: 'bold', marginLeft: '8px' }}>
                                        ✗ Your answer
                                    </span>
                                )}
                            </div>
                        );
                    })}
                </div>

                <button
                    onClick={onClose}
                    style={{
                        marginTop: '24px',
                        width: '100%',
                        padding: '12px',
                        background: colors.primary,
                        color: 'white',
                        border: 'none',
                        borderRadius: borderRadius.md,
                        fontSize: '16px',
                        fontWeight: 'bold',
                        cursor: 'pointer'
                    }}
                >
                    Back to Quiz
                </button>
            </div>
        </div>
    );
}
