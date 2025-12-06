import { useState, useEffect } from 'react';
import PageLayout from './common/PageLayout';
import DualRangeSlider from './common/DualRangeSlider';
import { colors, borderRadius, shadows, icons } from '../styles/designTokens';

/**
 * QuizSetup - Configure and start a new quiz
 * 
 * Props:
 * - mode: 'new' (default) or 'practice' (20-word revision)
 */
export default function QuizSetup({ onStart, onStartRevision, onBack, engine, mode = 'new' }) {
    console.log('QuizSetup rendered', { engineExists: !!engine, mode });
    const [theme, setTheme] = useState('All');
    const [minDifficulty, setMinDifficulty] = useState(1);
    const [maxDifficulty, setMaxDifficulty] = useState(9);
    const [themes, setThemes] = useState(['All']);
    const [revisionCount, setRevisionCount] = useState(0);

    useEffect(() => {
        if (engine) {
            setThemes(engine.getThemes());
            setRevisionCount(engine.getRevisionList().length);
        }
    }, [engine]);

    // If practice mode, auto-start revision
    useEffect(() => {
        if (mode === 'practice' && revisionCount > 0) {
            // Small delay to show the UI briefly
            const timer = setTimeout(() => onStartRevision(), 500);
            return () => clearTimeout(timer);
        }
    }, [mode, revisionCount, onStartRevision]);

    const getMasteryStars = (themeName) => {
        if (!engine || themeName === 'All') return null;
        const mastery = engine.getThemeMastery(themeName);
        return icons.mastery.filled.repeat(mastery) + icons.mastery.empty.repeat(5 - mastery);
    };

    const handleDifficultyChange = (newMin, newMax) => {
        setMinDifficulty(newMin);
        setMaxDifficulty(newMax);
    };

    const handleStart = () => {
        // Pass difficulty range as "min-max" or "All"
        const difficultyRange = minDifficulty === 1 && maxDifficulty === 9
            ? 'All'
            : `${minDifficulty}-${maxDifficulty}`;
        onStart(theme, difficultyRange);
    };

    // Practice mode - show loading or redirect
    if (mode === 'practice') {
        return (
            <PageLayout title="Practice Mode 🔄" onBack={onBack} maxWidth="600px">
                <div style={{
                    textAlign: 'center',
                    padding: '3rem',
                    background: colors.primaryGradient,
                    borderRadius: borderRadius.xl,
                    color: 'white'
                }}>
                    {revisionCount > 0 ? (
                        <>
                            <h2 style={{ margin: 0, fontSize: '1.5rem' }}>🌟 Loading Practice...</h2>
                            <p style={{ margin: '1rem 0 0 0', opacity: 0.9 }}>
                                Preparing {Math.min(revisionCount, 20)} words for review
                            </p>
                        </>
                    ) : (
                        <>
                            <h2 style={{ margin: 0, fontSize: '1.5rem' }}>🎉 All Caught Up!</h2>
                            <p style={{ margin: '1rem 0', opacity: 0.9 }}>
                                No words need practice right now. Start a new quiz to learn more!
                            </p>
                            <button
                                onClick={onBack}
                                style={{
                                    padding: '0.8rem 2rem',
                                    background: 'white',
                                    color: colors.primary,
                                    border: 'none',
                                    borderRadius: borderRadius.lg,
                                    fontWeight: 'bold',
                                    cursor: 'pointer'
                                }}
                            >
                                Go Back
                            </button>
                        </>
                    )}
                </div>
            </PageLayout>
        );
    }

    return (
        <PageLayout title="New Quiz 📝" onBack={onBack} maxWidth="600px">
            {/* Revision Block - Show if words need practice */}
            {revisionCount > 0 && (
                <div style={{
                    marginBottom: '1.5rem',
                    padding: '1.25rem',
                    background: 'linear-gradient(135deg, #2ecc71 0%, #27ae60 100%)',
                    borderRadius: borderRadius.lg,
                    color: 'white',
                    boxShadow: shadows.sm,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <div>
                        <h3 style={{ margin: 0, fontSize: '1.1rem' }}>🔄 Need Practice?</h3>
                        <p style={{ margin: '0.3rem 0 0 0', opacity: 0.9, fontSize: '0.85rem' }}>
                            {revisionCount} words ready for review
                        </p>
                    </div>
                    <button
                        onClick={onStartRevision}
                        style={{
                            padding: '0.5rem 1rem',
                            background: 'white',
                            color: '#27ae60',
                            border: 'none',
                            borderRadius: borderRadius.md,
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            fontSize: '0.85rem'
                        }}
                    >
                        Quick Practice
                    </button>
                </div>
            )}

            <div style={{ background: colors.white, padding: '1.5rem', borderRadius: borderRadius.lg, boxShadow: shadows.sm }}>
                {/* Theme Selection */}
                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: 'bold', fontSize: '1.1rem', color: colors.dark }}>
                        Select Theme
                    </label>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
                        gap: '0.6rem',
                        maxHeight: '35vh',
                        overflowY: 'auto',
                        padding: '0.3rem'
                    }}>
                        {themes.map(t => (
                            <button
                                key={t}
                                onClick={() => setTheme(t)}
                                style={{
                                    padding: '0.8rem',
                                    borderRadius: borderRadius.md,
                                    border: theme === t ? `2px solid ${colors.primary}` : `1px solid ${colors.border}`,
                                    background: theme === t ? `${colors.primary}10` : colors.white,
                                    cursor: 'pointer',
                                    textAlign: 'left',
                                    transition: 'all 0.2s',
                                    transform: theme === t ? 'scale(1.02)' : 'scale(1)'
                                }}
                            >
                                <div style={{ fontWeight: 'bold', marginBottom: '0.2rem', fontSize: '0.9rem', color: colors.dark }}>{t}</div>
                                <div style={{ fontSize: '0.75rem', color: colors.textMuted }}>{getMasteryStars(t)}</div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Difficulty Range Slider */}
                <div style={{ marginBottom: '1.5rem' }}>
                    <DualRangeSlider
                        min={1}
                        max={9}
                        minValue={minDifficulty}
                        maxValue={maxDifficulty}
                        onChange={handleDifficultyChange}
                        label="Difficulty Range"
                    />
                </div>

                <button
                    onClick={handleStart}
                    style={{
                        width: '100%',
                        padding: '1rem',
                        fontSize: '1.2rem',
                        background: colors.primaryGradient,
                        color: 'white',
                        borderRadius: borderRadius.lg,
                        border: 'none',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        boxShadow: shadows.primary
                    }}
                >
                    Start Quiz!
                </button>
            </div>
        </PageLayout>
    );
}
