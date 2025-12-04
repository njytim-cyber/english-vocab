import React from 'react';

export default function ResultsView({ engine, onRestart }) {
    const state = engine.getState();
    const history = engine.getSessionHistory();
    const incorrectItems = history.filter(item => !item.isCorrect);

    const handleRetry = () => {
        const questionsToRetry = incorrectItems.map(item => item.question);
        engine.startRetryGame(questionsToRetry);
        onRestart(); // This will trigger the view switch to 'quiz' in App.jsx
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '2rem',
            background: 'var(--light)',
            color: 'var(--dark)'
        }}>
            <h1 className="animate-pop" style={{ fontSize: '3rem', marginBottom: '1rem' }}>
                {state.score > 50 ? '🎉 Amazing!' : '👍 Good Job!'}
            </h1>

            <div className="card" style={{ padding: '2rem', textAlign: 'center', marginBottom: '2rem', width: '100%', maxWidth: '500px' }}>
                <p style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Score: <strong>{state.score}</strong></p>
                <p style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>XP Earned: <strong>{state.xp}</strong></p>

                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                    <button
                        onClick={() => { engine.reset(); onRestart(); }}
                        style={{
                            padding: '1rem 2rem',
                            fontSize: '1.2rem',
                            background: 'var(--secondary)',
                            color: 'white',
                            borderRadius: '12px'
                        }}
                    >
                        Play Again
                    </button>

                    {incorrectItems.length > 0 && (
                        <button
                            onClick={handleRetry}
                            style={{
                                padding: '1rem 2rem',
                                fontSize: '1.2rem',
                                background: 'var(--primary)',
                                color: 'white',
                                borderRadius: '12px'
                            }}
                        >
                            Retry Mistakes ({incorrectItems.length})
                        </button>
                    )}
                </div>
            </div>

            <div style={{ width: '100%', maxWidth: '600px' }}>
                <h3 style={{ marginBottom: '1rem' }}>Session Summary</h3>
                {history.map((item, idx) => (
                    <div key={idx} className="card" style={{
                        marginBottom: '1rem',
                        padding: '1rem',
                        borderLeft: `5px solid ${item.isCorrect ? 'var(--secondary)' : 'var(--primary)'}`,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <div>
                            <div style={{ fontWeight: 'bold' }}>{item.question.question}</div>
                            <div style={{ fontSize: '0.9rem', color: '#666' }}>
                                Answer: {item.question.answer}
                                {!item.isCorrect && <span style={{ color: 'var(--primary)' }}> (You said: {item.userAnswer})</span>}
                            </div>
                        </div>
                        <div style={{ fontSize: '1.5rem' }}>
                            {item.isCorrect ? '✅' : '❌'}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
