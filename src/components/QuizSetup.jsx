import React, { useState, useEffect } from 'react';
import DifficultyBadge from './common/DifficultyBadge';

const THEMES = ['All', 'Emotions', 'Nature', 'Description', 'Personality', 'Behavior', 'Action', 'Ability', 'Social Interaction', 'Importance'];
const DIFFICULTIES = ['All', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];

export default function QuizSetup({ onStart, onBack, engine }) {
    const [theme, setTheme] = useState('All');
    const [difficulty, setDifficulty] = useState('All');
    const [themes, setThemes] = useState(['All']);

    useEffect(() => {
        if (engine) {
            setThemes(engine.getThemes());
        }
    }, [engine]);

    const getMasteryStars = (themeName) => {
        if (!engine || themeName === 'All') return null;
        const mastery = engine.getThemeMastery(themeName);
        return '⭐'.repeat(mastery) + '☆'.repeat(5 - mastery);
    };

    return (
        <div style={{
            minHeight: '100vh',
            padding: '2rem',
            paddingBottom: '100px',
            background: 'var(--light)',
            color: 'var(--dark)',
            display: 'flex',
            flexDirection: 'column'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2rem' }}>
                <button
                    onClick={onBack}
                    style={{ background: 'none', fontSize: '2rem', marginRight: '1rem', border: 'none', cursor: 'pointer' }}
                >
                    ⬅️
                </button>
                <h1>Setup Mission 🚀</h1>
            </div>

            <div className="card" style={{ padding: '1.5rem', flex: 1 }}>
                <div style={{ marginBottom: '2rem' }}>
                    <label style={{ display: 'block', marginBottom: '1rem', fontWeight: 'bold', fontSize: '1.2rem' }}>
                        Select Theme
                    </label>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                        gap: '0.8rem',
                        maxHeight: '40vh',
                        overflowY: 'auto',
                        padding: '0.5rem'
                    }}>
                        {themes.map(t => (
                            <button
                                key={t}
                                onClick={() => setTheme(t)}
                                style={{
                                    padding: '1rem',
                                    borderRadius: '12px',
                                    border: theme === t ? '3px solid var(--primary)' : '1px solid #ddd',
                                    background: theme === t ? 'white' : '#f9f9f9',
                                    cursor: 'pointer',
                                    textAlign: 'left',
                                    transition: 'all 0.2s',
                                    transform: theme === t ? 'scale(1.02)' : 'scale(1)'
                                }}
                            >
                                <div style={{ fontWeight: 'bold', marginBottom: '0.3rem' }}>{t}</div>
                                <div style={{ fontSize: '0.8rem', color: '#666' }}>{getMasteryStars(t)}</div>
                            </button>
                        ))}
                    </div>
                </div>

                <div style={{ marginBottom: '2rem' }}>
                    <label style={{ display: 'block', marginBottom: '1rem', fontWeight: 'bold', fontSize: '1.2rem' }}>
                        Difficulty Level
                    </label>
                    <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                        {DIFFICULTIES.map(d => (
                            <button
                                key={d}
                                onClick={() => setDifficulty(d)}
                                style={{
                                    padding: '0.8rem 1.2rem',
                                    borderRadius: '20px',
                                    border: difficulty === d ? '2px solid var(--secondary)' : '1px solid #ddd',
                                    background: difficulty === d ? 'var(--secondary)' : 'white',
                                    color: difficulty === d ? 'white' : 'var(--dark)',
                                    cursor: 'pointer',
                                    fontWeight: 'bold',
                                    minWidth: '60px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                {d === 'All' ? 'All' : <DifficultyBadge level={parseInt(d)} />}
                            </button>
                        ))}
                    </div>
                </div>

                <button
                    onClick={() => onStart(theme, difficulty)}
                    style={{
                        width: '100%',
                        padding: '1.2rem',
                        fontSize: '1.5rem',
                        background: 'linear-gradient(to right, var(--primary), var(--secondary))',
                        color: 'white',
                        borderRadius: '15px',
                        border: 'none',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
                    }}
                >
                    Start Quiz!
                </button>
            </div>
        </div>
    );
}
