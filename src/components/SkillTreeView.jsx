import React, { useState } from 'react';
import DifficultyBadge from './common/DifficultyBadge';

export default function SkillTreeView({ engine }) {
    const allQuestions = engine.allQuestions;
    const sr = engine.sr;
    const state = engine.getState(); // Get current state for streak
    const [filterLevel, setFilterLevel] = useState('All');
    const [filterDifficulty, setFilterDifficulty] = useState([]); // Array of selected difficulties

    // Level Definitions
    const LEVELS = {
        0: { name: 'Seed', desc: 'Initial Exposure', icon: '🌱', color: '#95a5a6' },
        1: { name: 'Sprout', desc: 'Recognition', icon: '🌿', color: '#3498db' },
        2: { name: 'Sapling', desc: 'Basic Recall', icon: '🌳', color: '#2ecc71' },
        3: { name: 'Branch', desc: 'Contextual Application', icon: '🪵', color: '#f1c40f' },
        4: { name: 'Trunk', desc: 'Nuanced Control', icon: '🪵', color: '#e67e22' },
        5: { name: 'Tree', desc: 'Mastery', icon: '🌲', color: '#9b59b6' }
    };

    // Group questions by mastery level (box)
    const wordsByLevel = {
        0: [], 1: [], 2: [], 3: [], 4: [], 5: []
    };

    allQuestions.forEach(q => {
        const box = sr.getBox(q.question_number || q.id);

        // Apply Difficulty Filter
        if (filterDifficulty.length > 0 && !filterDifficulty.includes(q.difficulty)) {
            return;
        }

        if (wordsByLevel[box] !== undefined) {
            wordsByLevel[box].push(q);
        } else {
            wordsByLevel[0].push(q); // Default to 0 (New)
        }
    });

    const toggleDifficulty = (diff) => {
        setFilterDifficulty(prev => {
            if (prev.includes(diff)) {
                return prev.filter(d => d !== diff);
            } else {
                return [...prev, diff];
            }
        });
    };

    const levelsToShow = filterLevel === 'All' ? [0, 1, 2, 3, 4, 5] : [parseInt(filterLevel)];

    return (
        <div className="skill-tree-view" style={{
            padding: '2rem',
            paddingBottom: '80px', // Space for NavBar
            maxWidth: '1200px',
            margin: '0 auto',
            fontFamily: "'Outfit', sans-serif"
        }}>
            <h1 style={{ textAlign: 'center', color: '#2c3e50', marginBottom: '2rem' }}>Skill Tree</h1>

            {/* Stats Header */}
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                flexWrap: 'wrap',
                gap: '1rem',
                marginBottom: '2rem',
                background: 'white',
                padding: '1rem',
                borderRadius: '15px',
                boxShadow: '0 4px 15px rgba(0,0,0,0.05)'
            }}>
                {[0, 1, 2, 3, 4, 5].map(lvl => (
                    <div key={lvl} style={{ textAlign: 'center', minWidth: '60px' }}>
                        <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: LEVELS[lvl].color }}>
                            {wordsByLevel[lvl].length}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#7f8c8d' }}>
                            {LEVELS[lvl].icon} {LEVELS[lvl].name}
                        </div>
                    </div>
                ))}
            </div>

            {/* Filters Container */}
            <div style={{ marginBottom: '2rem', background: 'white', padding: '1rem', borderRadius: '15px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>

                {/* Mastery Level Filter */}
                <div style={{ marginBottom: '1rem', textAlign: 'center' }}>
                    <h4 style={{ margin: '0 0 0.5rem 0', color: '#7f8c8d' }}>Mastery Level</h4>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <button
                            onClick={() => setFilterLevel('All')}
                            style={{
                                padding: '0.5rem 1rem',
                                borderRadius: '20px',
                                border: 'none',
                                background: filterLevel === 'All' ? '#2c3e50' : '#ecf0f1',
                                color: filterLevel === 'All' ? 'white' : '#2c3e50',
                                cursor: 'pointer',
                                fontWeight: 'bold',
                                transition: 'all 0.2s'
                            }}
                        >
                            All
                        </button>
                        {[0, 1, 2, 3, 4, 5].map(lvl => (
                            <button
                                key={lvl}
                                onClick={() => setFilterLevel(lvl)}
                                style={{
                                    padding: '0.5rem 1rem',
                                    borderRadius: '20px',
                                    border: 'none',
                                    background: parseInt(filterLevel) === lvl ? LEVELS[lvl].color : '#ecf0f1',
                                    color: parseInt(filterLevel) === lvl ? 'white' : '#2c3e50',
                                    cursor: 'pointer',
                                    fontWeight: 'bold',
                                    transition: 'all 0.2s'
                                }}
                            >
                                {LEVELS[lvl].icon} {LEVELS[lvl].name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Difficulty Filter */}
                <div style={{ textAlign: 'center' }}>
                    <h4 style={{ margin: '0 0 0.5rem 0', color: '#7f8c8d' }}>Word Difficulty</h4>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(diff => (
                            <button
                                key={diff}
                                onClick={() => toggleDifficulty(diff)}
                                style={{
                                    padding: '0.4rem 0.8rem',
                                    borderRadius: '15px',
                                    border: filterDifficulty.includes(diff) ? '2px solid #3498db' : '1px solid #ecf0f1',
                                    background: filterDifficulty.includes(diff) ? '#e8f4fc' : 'white',
                                    color: '#2c3e50',
                                    cursor: 'pointer',
                                    fontWeight: 'bold',
                                    transition: 'all 0.2s',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '5px',
                                    fontSize: '0.9rem'
                                }}
                            >
                                <DifficultyBadge level={diff} showIcon={false} /> {diff}
                            </button>
                        ))}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#95a5a6', marginTop: '0.5rem' }}>
                        {filterDifficulty.length === 0 ? '(Showing All Difficulties)' : '(Filtered by Selection)'}
                    </div>
                </div>
            </div>

            {/* Levels Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '1.5rem'
            }}>
                {levelsToShow.map(level => (
                    <div key={level} style={{
                        background: 'white',
                        borderRadius: '15px',
                        padding: '1.5rem',
                        boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
                        borderLeft: `5px solid ${LEVELS[level].color}`
                    }}>
                        <h3 style={{
                            margin: '0 0 0.5rem 0',
                            color: LEVELS[level].color,
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <span>{LEVELS[level].icon} {LEVELS[level].name}</span>
                            <span style={{ fontSize: '0.9rem', background: '#f0f2f5', padding: '2px 8px', borderRadius: '10px', color: '#7f8c8d' }}>
                                {wordsByLevel[level].length}
                            </span>
                        </h3>
                        <div style={{ fontSize: '0.9rem', color: '#7f8c8d', marginBottom: '1rem', fontStyle: 'italic' }}>
                            {LEVELS[level].desc}
                        </div>

                        <div style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: '0.5rem',
                            maxHeight: '300px',
                            overflowY: 'auto',
                            paddingRight: '5px'
                        }}>
                            {wordsByLevel[level].length > 0 ? (
                                wordsByLevel[level].map(q => (
                                    <span key={q.id || q.question_number} style={{
                                        fontSize: '0.9rem',
                                        padding: '6px 12px',
                                        paddingRight: '24px', // Space for badge
                                        background: `${LEVELS[level].color}15`,
                                        color: LEVELS[level].color,
                                        borderRadius: '15px',
                                        border: `1px solid ${LEVELS[level].color}30`,
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        position: 'relative',
                                        fontWeight: '500'
                                    }}>
                                        {q.answer}
                                        <div style={{
                                            position: 'absolute',
                                            bottom: '-2px',
                                            right: '-2px',
                                            transform: 'scale(0.8)'
                                        }}>
                                            <DifficultyBadge level={q.difficulty} showIcon={false} />
                                        </div>
                                    </span>
                                ))
                            ) : (
                                <div style={{ color: '#bdc3c7', fontStyle: 'italic', width: '100%', textAlign: 'center', padding: '1rem' }}>
                                    No words yet
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
