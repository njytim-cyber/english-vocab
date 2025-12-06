import { useState } from 'react';
import { colors, borderRadius, shadows, spacing } from '../styles/designTokens';
import PageLayout from './common/PageLayout';

/**
 * GrammarSetup - Setup screen for Grammar MCQ with subunit selection
 * Allows students to choose specific grammar topics to practice
 */

const GRAMMAR_CATEGORIES = [
    {
        name: "Nouns, Pronouns & Determiners",
        subunits: [
            { id: "countable-uncountable", name: "Countable vs. Uncountable Nouns" },
            { id: "collective-nouns", name: "Collective Nouns" },
            { id: "possessive-pronouns", name: "Possessive Pronouns vs. Adjectives" },
            { id: "reflexive-pronouns", name: "Reflexive Pronouns" },
            { id: "demonstrative-pronouns", name: "Demonstrative Pronouns" }
        ]
    },
    {
        name: "Subject-Verb Agreement",
        subunits: [
            { id: "basic-sva", name: "Basic SVA (Singular/Plural)" },
            { id: "proximity-rule", name: "Proximity Rule (Neither/Nor)" },
            { id: "together-with", name: "'Together with / As well as' Rule" },
            { id: "indefinite-pronouns", name: "Indefinite Pronouns (Everyone, Each)" },
            { id: "exception-nouns", name: "Exception Nouns (News, Trousers)" }
        ]
    },
    {
        name: "Tenses & Verb Forms",
        subunits: [
            { id: "past-present-perfect", name: "Simple Past vs. Present Perfect" },
            { id: "past-continuous", name: "Past Continuous vs. Simple Past" },
            { id: "past-perfect", name: "Past Perfect (Sequencing Actions)" },
            { id: "future-forms", name: "Future Forms (Will vs. Going to)" },
            { id: "irregular-verbs", name: "Irregular Verbs" }
        ]
    },
    {
        name: "Conditionals & Modals",
        subunits: [
            { id: "zero-first-conditional", name: "Zero & First Conditionals" },
            { id: "second-third-conditional", name: "Second & Third Conditionals" },
            { id: "mixed-conditionals", name: "Mixed Conditionals" },
            { id: "modal-verbs", name: "Modal Verbs (Can/Could/May/Might)" },
            { id: "modal-perfects", name: "Modal Perfects (Should have, Could have)" }
        ]
    },
    {
        name: "Advanced Structures",
        subunits: [
            { id: "reported-speech", name: "Reported Speech" },
            { id: "passive-voice", name: "Passive Voice" },
            { id: "relative-clauses", name: "Relative Clauses" },
            { id: "subjunctive", name: "The Subjunctive Mood" },
            { id: "inversion", name: "Inversion for Emphasis" }
        ]
    }
];

export default function GrammarSetup({
    allQuestions,
    onStart,
    onBack
}) {
    const [selectedSubunits, setSelectedSubunits] = useState(new Set());
    const [expandedCategories, setExpandedCategories] = useState(new Set());

    const toggleCategory = (categoryName) => {
        setExpandedCategories(prev => {
            const next = new Set(prev);
            if (next.has(categoryName)) {
                next.delete(categoryName);
            } else {
                next.add(categoryName);
            }
            return next;
        });
    };

    const toggleSubunit = (subunitName) => {
        setSelectedSubunits(prev => {
            const next = new Set(prev);
            if (next.has(subunitName)) {
                next.delete(subunitName);
            } else {
                next.add(subunitName);
            }
            return next;
        });
    };

    const selectAllInCategory = (category) => {
        setSelectedSubunits(prev => {
            const next = new Set(prev);
            category.subunits.forEach(s => next.add(s.name));
            return next;
        });
    };

    const deselectAllInCategory = (category) => {
        setSelectedSubunits(prev => {
            const next = new Set(prev);
            category.subunits.forEach(s => next.delete(s.name));
            return next;
        });
    };

    const handleStart = () => {
        // Filter questions by selected subunits
        const selected = Array.from(selectedSubunits);
        let filteredQuestions = allQuestions;

        if (selected.length > 0) {
            filteredQuestions = allQuestions.filter(q =>
                selected.includes(q.subunit)
            );
        }

        // Shuffle and take up to 15 questions
        const shuffled = [...filteredQuestions].sort(() => Math.random() - 0.5);
        const finalQuestions = shuffled.slice(0, 15);

        onStart(finalQuestions);
    };

    const getQuestionCount = () => {
        if (selectedSubunits.size === 0) return allQuestions.length;
        return allQuestions.filter(q => selectedSubunits.has(q.subunit)).length;
    };

    return (
        <PageLayout
            title="Grammar Quiz Setup"
            showBack={true}
            onBack={onBack}
            maxWidth="700px"
        >
            <p style={{
                color: colors.textMuted,
                marginBottom: spacing.lg,
                textAlign: 'center'
            }}>
                Select topics to practice, or start with all topics
            </p>

            {/* Category List */}
            <div style={{ marginBottom: spacing.xl }}>
                {GRAMMAR_CATEGORIES.map(category => {
                    const isExpanded = expandedCategories.has(category.name);
                    const selectedCount = category.subunits.filter(s =>
                        selectedSubunits.has(s.name)
                    ).length;
                    const allSelected = selectedCount === category.subunits.length;

                    return (
                        <div key={category.name} style={{
                            background: colors.white,
                            borderRadius: borderRadius.lg,
                            marginBottom: spacing.sm,
                            overflow: 'hidden',
                            boxShadow: shadows.sm
                        }}>
                            {/* Category Header */}
                            <div
                                onClick={() => toggleCategory(category.name)}
                                style={{
                                    padding: spacing.md,
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    cursor: 'pointer',
                                    background: selectedCount > 0 ? '#fef3c7' : colors.white
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm }}>
                                    <span>{isExpanded ? '▼' : '▶'}</span>
                                    <span style={{ fontWeight: '600', color: colors.dark }}>
                                        {category.name}
                                    </span>
                                </div>
                                <span style={{
                                    padding: `${spacing.xs} ${spacing.sm}`,
                                    background: selectedCount > 0 ? '#f59e0b' : colors.light,
                                    color: selectedCount > 0 ? 'white' : colors.textMuted,
                                    borderRadius: borderRadius.round,
                                    fontSize: '0.8rem'
                                }}>
                                    {selectedCount}/{category.subunits.length}
                                </span>
                            </div>

                            {/* Subunits */}
                            {isExpanded && (
                                <div style={{
                                    padding: spacing.sm,
                                    borderTop: `1px solid ${colors.border}`,
                                    background: colors.light
                                }}>
                                    {/* Select/Deselect All */}
                                    <div style={{
                                        marginBottom: spacing.sm,
                                        display: 'flex',
                                        gap: spacing.xs
                                    }}>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); selectAllInCategory(category); }}
                                            style={{
                                                padding: `${spacing.xs} ${spacing.sm}`,
                                                background: colors.white,
                                                border: `1px solid ${colors.border}`,
                                                borderRadius: borderRadius.md,
                                                cursor: 'pointer',
                                                fontSize: '0.75rem'
                                            }}
                                        >
                                            Select All
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); deselectAllInCategory(category); }}
                                            style={{
                                                padding: `${spacing.xs} ${spacing.sm}`,
                                                background: colors.white,
                                                border: `1px solid ${colors.border}`,
                                                borderRadius: borderRadius.md,
                                                cursor: 'pointer',
                                                fontSize: '0.75rem'
                                            }}
                                        >
                                            Deselect All
                                        </button>
                                    </div>

                                    {category.subunits.map(subunit => {
                                        const isSelected = selectedSubunits.has(subunit.name);
                                        return (
                                            <div
                                                key={subunit.id}
                                                onClick={() => toggleSubunit(subunit.name)}
                                                style={{
                                                    padding: spacing.sm,
                                                    marginBottom: spacing.xs,
                                                    background: isSelected ? '#fef3c7' : colors.white,
                                                    borderRadius: borderRadius.md,
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: spacing.sm,
                                                    border: isSelected ? '2px solid #f59e0b' : '2px solid transparent'
                                                }}
                                            >
                                                <span style={{
                                                    width: '20px',
                                                    height: '20px',
                                                    borderRadius: '4px',
                                                    border: `2px solid ${isSelected ? '#f59e0b' : colors.border}`,
                                                    background: isSelected ? '#f59e0b' : 'white',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    color: 'white',
                                                    fontSize: '0.7rem'
                                                }}>
                                                    {isSelected && '✓'}
                                                </span>
                                                <span style={{ fontSize: '0.9rem', color: colors.dark }}>
                                                    {subunit.name}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Start Button */}
            <div style={{ textAlign: 'center' }}>
                <div style={{ marginBottom: spacing.sm, color: colors.textMuted }}>
                    {selectedSubunits.size === 0
                        ? `All topics (${getQuestionCount()} questions available)`
                        : `${selectedSubunits.size} topics selected (${getQuestionCount()} questions)`
                    }
                </div>
                <button
                    onClick={handleStart}
                    disabled={getQuestionCount() === 0}
                    style={{
                        padding: `${spacing.md} ${spacing.xl}`,
                        background: getQuestionCount() > 0
                            ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
                            : colors.light,
                        color: getQuestionCount() > 0 ? 'white' : colors.textMuted,
                        border: 'none',
                        borderRadius: borderRadius.lg,
                        fontSize: '1.1rem',
                        fontWeight: '600',
                        cursor: getQuestionCount() > 0 ? 'pointer' : 'not-allowed',
                        boxShadow: getQuestionCount() > 0 ? shadows.md : 'none'
                    }}
                >
                    Start Quiz
                </button>
            </div>
        </PageLayout>
    );
}

export { GRAMMAR_CATEGORIES };
