import React, { useState, useEffect } from 'react';
import { triggerConfetti } from '../utils/effects';
import { speak } from '../utils/audio';

export default function QuizView({ engine, economy, onFinish }) {
    const [currentQuestion, setCurrentQuestion] = useState(engine.getCurrentQuestion());
    const [state, setState] = useState(engine.getState());
    const [selectedOption, setSelectedOption] = useState(null);
    const [feedback, setFeedback] = useState(null); // 'correct' | 'incorrect'
    const [shakeOption, setShakeOption] = useState(null); // Option to shake
    const [avatarState, setAvatarState] = useState('idle'); // 'idle' | 'happy' | 'sad'

    useEffect(() => {
        updateState();
    }, []);

    // Speak question when it changes
    useEffect(() => {
        if (currentQuestion?.question) {
            // speak(currentQuestion.question);
        }
    }, [currentQuestion]);

    const updateState = () => {
        setCurrentQuestion(engine.getCurrentQuestion());
        setState(engine.getState());
    };

    const handleAnswer = (option) => {
        if (selectedOption) return; // Prevent double clicks
        setSelectedOption(option);

        const isCorrect = engine.answer(option);
        setFeedback(isCorrect ? 'correct' : 'incorrect');

        if (isCorrect) {
            triggerConfetti();
            speak("Correct!");
            setAvatarState('happy');
            if (economy) {
                economy.addCoins(10); // Award 10 coins
            }
        } else {
            speak("Oops, try again next time.");
            setShakeOption(option);
            setAvatarState('sad');
        }

        setTimeout(() => {
            if (engine.getState().isFinished) {
                onFinish();
            } else {
                updateState();
                setSelectedOption(null);
                setFeedback(null);
                setShakeOption(null);
                setAvatarState('idle');
            }
        }, 1500);
    };

    // Dynamic Background Gradient based on score
    const getBackground = () => {
        if (state.score < 50) return 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)';
        if (state.score < 100) return 'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)';
        return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    };

    // On Fire Mode
    const isOnFire = state.streak >= 3;

    // Reactive Avatar Emojis
    const getAvatarEmoji = () => {
        if (avatarState === 'happy') return '😃';
        if (avatarState === 'sad') return '😢';
        return '🦊'; // Default
    };

    if (!currentQuestion) {
        return (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'red' }}>
                <h2>Error: No Questions Available</h2>
                <p>Engine State: {JSON.stringify(state)}</p>
                <p>Questions Loaded: {engine.questions ? engine.questions.length : '0'}</p>
                <button onClick={() => window.location.reload()}>Reload</button>
            </div>
        );
    }

    return (
        <div className="quiz-container" style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '2rem',
            paddingBottom: '100px', // Space for NavBar
            background: getBackground(),
            color: 'var(--dark)'
        }}>
            <div style={{ width: '100%', maxWidth: '600px', display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>Score: {state.score}</div>
                <div style={{ fontWeight: 'bold', fontSize: '1.2rem', color: 'var(--primary)' }}>
                    Question {state.currentQuestionIndex + 1} / {engine.questions.length}
                </div>
                <div style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>Streak: {state.streak} 🔥</div>
            </div>

            {/* Header */}
            <div className="quiz-header">
                <div className={`card stat-badge ${isOnFire ? 'on-fire' : ''}`}>
                    <span role="img" aria-label="Streak">🔥</span> <strong>{state.streak}</strong>
                </div>
                <div className="card stat-badge">
                    <span role="img" aria-label="Score">⭐</span> <strong>{state.score}</strong>
                </div>
            </div>

            {/* Avatar */}
            <div className="avatar-display">
                <span role="img" aria-label="Avatar">{getAvatarEmoji()}</span>
            </div>

            {/* Question Card */}
            <div className={`card question-card animate-pop ${isOnFire ? 'on-fire' : ''}`}>
                <h2 className="question-text">
                    {currentQuestion.question}
                </h2>

                <div className="options-grid">
                    {/* Normalize options to array if it's an object */}
                    {(Array.isArray(currentQuestion.options)
                        ? currentQuestion.options
                        : Object.values(currentQuestion.options)
                    ).map((option, idx) => {
                        let btnClass = 'option-btn';
                        if (selectedOption === option) {
                            btnClass += ' selected';
                            if (feedback === 'correct') btnClass += ' correct';
                            else btnClass += ' incorrect';
                        }
                        if (shakeOption === option) btnClass += ' shake';

                        return (
                            <button
                                key={idx}
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

