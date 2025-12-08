import { useState, useMemo } from 'react';
import { colors, borderRadius, shadows, spacing } from '../styles/designTokens';
import PageLayout from './common/PageLayout';
import { GRAMMAR_CATEGORIES } from '../data/grammarData';

/**
 * GrammarSetup - Setup screen for Grammar MCQ using "Clean Themes" style
 */
export default function GrammarSetup({
    allQuestions,
    onStart,
    onBack
}) {
    const [selectedSubunits, setSelectedSubunits] = useState(new Set());

    // Flatten all topics for easy selection
    const allTopics = useMemo(() => {
        const topics = [];
        (GRAMMAR_CATEGORIES || []).forEach(cat => { // Defensive check
            cat.subunits.forEach(sub => {
                topics.push({
                    id: sub.name, // Using name as ID for now to match Question logic
                    name: sub.name,
                    category: cat.name
                });
            });
        });
        return topics;
    }, []);

    const toggleTopic = (topicName) => {
        setSelectedSubunits(prev => {
            const next = new Set(prev);
            if (next.has(topicName)) {
                next.delete(topicName);
            } else {
                next.add(topicName);
            }
            return next;
        });
    };

    const toggleAll = () => {
        if (selectedSubunits.size === allTopics.length) {
            setSelectedSubunits(new Set());
        } else {
            setSelectedSubunits(new Set(allTopics.map(t => t.name)));
        }
    };

    const handleStart = () => {
        // Filter questions
        const selected = Array.from(selectedSubunits);
        let filteredQuestions = allQuestions;

        if (selected.length > 0) {
            filteredQuestions = allQuestions.filter(q =>
                selected.includes(q.subunit)
            );
        }

        // Shuffle and take 15
        const shuffled = [...filteredQuestions].sort(() => Math.random() - 0.5);
        const finalQuestions = shuffled.slice(0, 15);

        onStart(finalQuestions);
    };

    const getQuestionCount = () => {
        if (selectedSubunits.size === 0) return allQuestions.length;
        return allQuestions.filter(q => selectedSubunits.has(q.subunit)).length;
    };

    return (
        <PageLayout title="Grammar Setup" showBack={true} onBack={onBack} maxWidth="700px">
            <div style={{ background: colors.white, padding: spacing.lg, borderRadius: borderRadius.lg, boxShadow: shadows.md }}>

                {/* Header / Selection Info */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md }}>
                    <div>
                        <h2 style={{ fontSize: '1.2rem', margin: 0, color: colors.dark }}>Select Topics</h2>
                        <span style={{ fontSize: '0.9rem', color: colors.textMuted }}>
                            {selectedSubunits.size} selected
                        </span>
                    </div>

                    <button
                        onClick={toggleAll}
                        style={{
                            background: colors.light,
                            border: 'none',
                            padding: '6px 12px',
                            borderRadius: borderRadius.md,
                            cursor: 'pointer',
                            fontSize: '0.9rem',
                            color: colors.primary,
                            fontWeight: '600'
                        }}
                    >
                        {selectedSubunits.size === allTopics.length ? 'Deselect All' : 'Select All'}
                    </button>
                </div>

                {/* Re-rendering properly structure: List of Categories with internal Grids */}
                <div style={{ maxHeight: '60vh', overflowY: 'auto', marginBottom: spacing.lg }}>
                    {(GRAMMAR_CATEGORIES || []).map(cat => (
                        <div key={cat.name} style={{ marginBottom: spacing.md }}>
                            <h4 style={{
                                margin: `0 0 ${spacing.sm} 0`,
                                fontSize: '0.9rem',
                                color: colors.textMuted,
                                borderBottom: `1px solid ${colors.border}`,
                                paddingBottom: '4px'
                            }}>
                                {cat.name}
                            </h4>
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                                gap: spacing.sm
                            }}>
                                {cat.subunits.map(sub => {
                                    const isSelected = selectedSubunits.has(sub.name);
                                    return (
                                        <button
                                            key={sub.name}
                                            onClick={() => toggleTopic(sub.name)}
                                            style={{
                                                padding: spacing.sm,
                                                borderRadius: borderRadius.md,
                                                border: isSelected ? `2px solid ${colors.primary}` : `1px solid ${colors.border}`,
                                                background: isSelected ? `${colors.primary}15` : colors.white,
                                                color: isSelected ? colors.primary : colors.dark,
                                                textAlign: 'left',
                                                cursor: 'pointer',
                                                fontSize: '0.9rem',
                                                fontWeight: isSelected ? '600' : '400',
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            <span style={{ marginRight: '8px' }}>{sub.name}</span>
                                            {isSelected && <span>✓</span>}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer Action */}
                <button
                    onClick={handleStart}
                    disabled={getQuestionCount() === 0}
                    style={{
                        width: '100%',
                        padding: spacing.md,
                        fontSize: '1.2rem',
                        background: getQuestionCount() > 0 ? colors.primaryGradient : colors.light,
                        color: getQuestionCount() > 0 ? 'white' : colors.textMuted,
                        borderRadius: borderRadius.lg,
                        border: 'none',
                        cursor: getQuestionCount() > 0 ? 'pointer' : 'not-allowed',
                        boxShadow: getQuestionCount() > 0 ? shadows.md : 'none',
                        fontWeight: 'bold'
                    }}
                >
                    Start Quiz ({getQuestionCount()} Questions)
                </button>
            </div>
        </PageLayout>
    );
}
