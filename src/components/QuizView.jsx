import { useState, useEffect, useCallback, useMemo } from 'react';
import { triggerConfetti } from '../utils/effects';
import { speak } from '../utils/audio';
import balance from '../data/balance.json';
import { colors, shadows, borderRadius, spacing } from '../styles/designTokens';

export default function QuizView({ engine, economy, onFinish }) {
    // console.log('QuizView rendered', { state: engine.getState() }); // Cleaned up log
    const [currentQuestion, setCurrentQuestion] = useState(engine.getCurrentQuestion());
    const [state, setState] = useState(engine.getState());
    const [selectedOption, setSelectedOption] = useState(null);
    const [feedback, setFeedback] = useState(null); // 'correct' | 'incorrect'
    const [shakeOption, setShakeOption] = useState(null); // Option to shake

    const options = useMemo(() => {
        if (!currentQuestion) return [];

        let opts = [];
        if (currentQuestion.type === 'ClozePassage') {
            opts = [...(currentQuestion.word_bank || [])];
        } else {
            // Handle both array and object formats
            opts = Array.isArray(currentQuestion.options)
                ? [...currentQuestion.options]
                : Object.values(currentQuestion.options || {});
        }

        // Shuffle options to prevent answer position bias
        return opts.sort(() => Math.random() - 0.5);
    }, [currentQuestion]);

    // Memoize Cloze segments parsing to prevent re-parsing on every timer tick/render
    const clozeSegments = useMemo(() => {
        if (currentQuestion && currentQuestion.type === 'ClozePassage' && currentQuestion.formatted_text) {
            return currentQuestion.formatted_text.split('____');
        }
        return [];
    }, [currentQuestion]);

    const updateState = useCallback(() => {
        setCurrentQuestion(engine.getCurrentQuestion());
        setState(engine.getState());
    }, [engine]);

    useEffect(() => {
        updateState();
    }, [updateState]);

    const handleAnswer = (option) => {
        if (selectedOption) return; // Prevent double clicks
        setSelectedOption(option);

        const isCorrect = engine.answer(option);
        setFeedback(isCorrect ? 'correct' : 'incorrect');

        if (isCorrect) {
            triggerConfetti();
            speak("Correct!");

            if (economy) {
                economy.addCoins(balance.rewards.quiz.correctAnswer);
            }
        } else {
            speak("Oops, try again next time.");
            setShakeOption(option);

        }

        setTimeout(() => {
            if (engine.getState().isFinished) {
                onFinish();
            } else {
                updateState();
                setSelectedOption(null);
                setFeedback(null);
                setShakeOption(null);

            }
        }, 1500);
    };

    // Dynamic Background Gradient based on score
    const getBackground = () => {
        if (state.score < 50) return 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)';
        if (state.score < 100) return 'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)';
        return colors.primaryGradient;
    };

    // On Fire Mode
    const isOnFire = state.streak >= 3;

    if (!currentQuestion) {
        return (
            <div style={styles.errorContainer}>
                <h2>Error: No Questions Available</h2>
                <p>Engine State: {JSON.stringify(state)}</p>
                <p>Questions Loaded: {engine.questions ? engine.questions.length : '0'}</p>
                <button onClick={() => window.location.reload()}>Reload</button>
            </div>
        );
    }

    return (
        <div className="quiz-container" style={{
            ...styles.container,
            background: getBackground()
        }}>
            {/* Clean minimal header - just essential info */}
            <div style={styles.header}>
                {/* Streak indicator - only show when on fire */}
                <div style={{
                    ...styles.streakBadge,
                    visibility: isOnFire ? 'visible' : 'hidden'
                }}>
                    🔥 {state.streak}
                </div>

                {/* Question counter - center */}
                <div style={styles.counterBadge}>
                    {state.currentQuestionIndex + 1} / {engine.questions.length}
                </div>

                {/* Stars earned */}
                <div style={styles.starBadge}>
                    <span>⭐</span> {state.score}
                </div>
            </div>

            {/* Question Card */}
            <div className={`card question-card animate-pop ${isOnFire ? 'on-fire' : ''}`}>
                <h2 className="question-text">
                    {currentQuestion.type === 'ClozePassage' ? (
                        <span>
                            {clozeSegments.map((part, i, arr) => (
                                <span key={i}>
                                    {part}
                                    {i < arr.length - 1 && (
                                        <span style={styles.clozeBlank}>
                                            {selectedOption && feedback === 'correct' ? currentQuestion.answer : '____'}
                                        </span>
                                    )}
                                </span>
                            ))}
                        </span>
                    ) : (
                        currentQuestion.question
                    )}
                </h2>

                <div className="options-grid">
                    {options.map((option, idx) => {
                        let btnClass = 'option-btn';
                        if (selectedOption === option) {
                            btnClass += ' selected';
                            if (feedback === 'correct') btnClass += ' correct';
                            else btnClass += ' incorrect';
                        }
                        if (shakeOption === option) btnClass += ' shake';

                        return (
                            <button
                                key={option} // Stable key if options are unique
                                onClick={() => handleAnswer(option)}
                                className={btnClass}
                                aria-label={`Answer option: ${option}`}
                            >
                                {option}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Progress */}
            <div className="progress-bar-container">
                <div
                    className="progress-bar-fill"
                    style={{ width: `${((state.currentQuestionIndex) / engine.questions.length) * 100}%` }}
                />
            </div>
        </div>
    );
}

const styles = {
    container: {
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '2rem',
        paddingBottom: '100px', // Space for NavBar
        color: colors.dark,
        transition: 'background 0.5s ease-in-out' // Smooth gradient transition
    },
    errorContainer: {
        padding: '2rem',
        textAlign: 'center',
        color: colors.error
    },
    header: {
        width: '100%',
        maxWidth: '600px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1.5rem',
        padding: '0 0.5rem'
    },
    streakBadge: {
        minWidth: '60px',
        background: 'linear-gradient(135deg, #ff6b35 0%, #f7931e 100%)',
        padding: '0.4rem 0.8rem',
        borderRadius: borderRadius.xl,
        color: colors.white,
        fontWeight: 'bold',
        fontSize: '0.9rem',
        boxShadow: '0 2px 8px rgba(255,107,53,0.3)'
    },
    counterBadge: {
        fontWeight: '600',
        fontSize: '1rem',
        color: colors.primary,
        background: colors.white,
        padding: '0.5rem 1rem',
        borderRadius: borderRadius.xl,
        boxShadow: shadows.sm
    },
    starBadge: {
        background: colors.white,
        padding: '0.4rem 0.8rem',
        borderRadius: borderRadius.xl,
        fontWeight: 'bold',
        fontSize: '0.9rem',
        boxShadow: shadows.sm,
        display: 'flex',
        alignItems: 'center',
        gap: '0.3rem'
    },
    clozeBlank: {
        display: 'inline-block',
        width: '100px',
        borderBottom: `2px solid ${colors.primary}`,
        margin: '0 5px',
        textAlign: 'center',
        color: colors.primary,
        fontWeight: 'bold'
    }
};

