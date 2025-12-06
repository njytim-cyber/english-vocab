import { useState, useEffect } from 'react';
import PageLayout from './common/PageLayout';
import DualRangeSlider from './common/DualRangeSlider';
import { colors, borderRadius, shadows } from '../styles/designTokens';

export default function SkillTreeView({ engine, onBack, onNavigate }) {
    const allQuestions = engine.allQuestions;
    const sr = engine.sr;
    const [filterLevel, setFilterLevel] = useState('All');
    const [minDifficulty, setMinDifficulty] = useState(1);
    const [maxDifficulty, setMaxDifficulty] = useState(9); // Max is 9 (no level 10 words)
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const LEVELS = {
        0: { name: 'Seed', desc: 'Initial Exposure', icon: '🌱', color: '#95a5a6' },
        1: { name: 'Sprout', desc: 'Recognition', icon: '🌿', color: '#3498db' },
        2: { name: 'Sapling', desc: 'Basic Recall', icon: '🌳', color: '#2ecc71' },
        3: { name: 'Branch', desc: 'Contextual Application', icon: '🪵', color: '#f1c40f' },
        4: { name: 'Trunk', desc: 'Nuanced Control', icon: '🪵', color: '#e67e22' },
        5: { name: 'Tree', desc: 'Mastery', icon: '🌲', color: '#9b59b6' }
    };

    const wordsByLevel = { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [] };

    allQuestions.forEach(q => {
        const box = sr.getBox(q.question_number || q.id);
        // Fix: Handle undefined difficulty - default to 0 which will be filtered out by most ranges
        const difficulty = q.difficulty ?? 0;
        if (difficulty < minDifficulty || difficulty > maxDifficulty) return;
        if (wordsByLevel[box] !== undefined) {
            wordsByLevel[box].push(q);
        } else {
            wordsByLevel[0].push(q);
        }
    });

    // Deduplicate words by answer within each level
    Object.keys(wordsByLevel).forEach(level => {
        const seen = new Set();
        wordsByLevel[level] = wordsByLevel[level].filter(q => {
            const key = (q.answer || q.question).toLowerCase();
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });
    });

    const totalFilteredWords = Object.values(wordsByLevel).reduce((acc, curr) => acc + curr.length, 0);
    const levelsToShow = filterLevel === 'All' ? [0, 1, 2, 3, 4, 5] : [parseInt(filterLevel)];

    const handleDifficultyChange = (newMin, newMax) => {
        setMinDifficulty(newMin);
        setMaxDifficulty(newMax);
    };

    return (
        <PageLayout
            title="Vocabulary Skills 📚"
            onBack={onBack}
            maxWidth="1200px"
            rightContent={
                <button
                    onClick={() => onNavigate && onNavigate('stickers')}
                    className="animate-pop"
                    style={{
                        background: colors.white,
                        border: 'none',
                        color: colors.primary,
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        padding: '0.5rem 1rem',
                        borderRadius: borderRadius.pill,
                        boxShadow: shadows.sm,
                        fontSize: '0.9rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}
                >
                    <span style={{ fontSize: '1.1rem' }}>🏆</span>
                    <span>Achievements</span>
                </button>
            }
        >
            {/* Stats Header */}
            <div style={{
                display: 'flex',
                justifyContent: isMobile ? 'flex-start' : 'center',
                flexWrap: isMobile ? 'nowrap' : 'wrap',
                gap: '1rem',
                marginBottom: '1.5rem',
                background: colors.white,
                padding: '1rem',
                borderRadius: borderRadius.lg,
                boxShadow: shadows.sm,
                overflowX: 'auto',
                paddingBottom: isMobile ? '1.5rem' : '1rem' // Space for scrollbar
            }}>
                <div
                    onClick={() => setFilterLevel('All')}
                    style={{
                        textAlign: 'center',
                        minWidth: '55px',
                        cursor: 'pointer',
                        opacity: filterLevel === 'All' ? 1 : 0.5,
                        transform: filterLevel === 'All' ? 'scale(1.1)' : 'scale(1)',
                        transition: 'all 0.2s',
                        flexShrink: 0
                    }}
                >
                    <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: colors.dark }}>{totalFilteredWords}</div>
                    <div style={{ fontSize: '0.75rem', color: colors.textMuted }}>All</div>
                </div>
                {[0, 1, 2, 3, 4, 5].map(lvl => (
                    <div
                        key={lvl}
                        onClick={() => setFilterLevel(lvl)}
                        style={{
                            textAlign: 'center',
                            minWidth: '55px',
                            cursor: 'pointer',
                            opacity: parseInt(filterLevel) === lvl ? 1 : 0.5,
                            transform: parseInt(filterLevel) === lvl ? 'scale(1.1)' : 'scale(1)',
                            transition: 'all 0.2s',
                            flexShrink: 0
                        }}
                    >
                        <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: LEVELS[lvl].color }}>{wordsByLevel[lvl].length}</div>
                        <div style={{ fontSize: '0.75rem', color: colors.textMuted }}>{LEVELS[lvl].icon} {LEVELS[lvl].name}</div>
                    </div>
                ))}
            </div>

            {/* Difficulty Filter - Dual Range Slider */}
            <div style={{
                marginBottom: '1.5rem',
                background: colors.white,
                padding: '1.25rem',
                borderRadius: borderRadius.lg,
                boxShadow: shadows.sm
            }}>
                <DualRangeSlider
                    min={1}
                    max={9}
                    minValue={minDifficulty}
                    maxValue={maxDifficulty}
                    onChange={handleDifficultyChange}
                    label="Word Difficulty"
                />
            </div>

            {/* Levels Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                {levelsToShow.map(level => (
                    <div key={level} style={{
                        background: colors.white,
                        borderRadius: borderRadius.lg,
                        padding: '1.25rem',
                        boxShadow: shadows.sm,
                        borderLeft: `4px solid ${LEVELS[level].color}`,
                        display: 'flex',
                        flexDirection: 'column',
                        height: '100%' // Full height for grid alignment
                    }}>
                        <h3 style={{
                            margin: '0 0 0.75rem 0',
                            color: LEVELS[level].color,
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            fontSize: '1.1rem'
                        }}>
                            <span>{LEVELS[level].icon} {LEVELS[level].name}</span>
                            <span style={{
                                fontSize: '0.8rem',
                                background: colors.light,
                                padding: '2px 8px',
                                borderRadius: borderRadius.pill,
                                color: colors.textMuted
                            }}>
                                {wordsByLevel[level].length}
                            </span>
                        </h3>
                        {/* Subtitle removed per user request */}

                        <div style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: '0.35rem',
                            maxHeight: '110px', // Approx 3 lines (32px * 3 + gaps)
                            overflowY: 'auto',
                            scrollbarWidth: 'thin', // Firefox
                            alignContent: 'flex-start'
                        }}>
                            {wordsByLevel[level].length > 0 ? (
                                wordsByLevel[level].map(q => (
                                    <span key={q.id || q.question_number} style={{
                                        fontSize: '0.8rem',
                                        padding: '4px 10px',
                                        paddingRight: '14px',
                                        background: `${LEVELS[level].color}15`,
                                        color: LEVELS[level].color,
                                        borderRadius: borderRadius.pill,
                                        border: `1px solid ${LEVELS[level].color}30`,
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        position: 'relative',
                                        fontWeight: '500',
                                        height: '32px' // Enforce uniform height
                                    }}>
                                        {q.answer}
                                        <span style={{
                                            position: 'absolute',
                                            top: '2px',
                                            right: '4px',
                                            fontSize: '0.5rem',
                                            color: colors.textMuted,
                                            fontWeight: 'bold'
                                        }}>
                                            {q.difficulty}
                                        </span>
                                    </span>
                                ))
                            ) : (
                                <div style={{ color: colors.textMuted, fontStyle: 'italic', width: '100%', textAlign: 'center', padding: '0.75rem' }}>
                                    No words yet
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </PageLayout>
    );
}
