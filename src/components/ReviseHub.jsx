import { useState, useMemo } from 'react';
import { colors, borderRadius, shadows, spacing, typography } from '../styles/designTokens';
import PageLayout from './common/PageLayout';
import { VOCAB_MCQ, GRAMMAR_MCQ, SPELLING } from '../data/dataManifest';

/**
 * ReviseHub - Comprehensive revision center
 * Features:
 * - Spaced repetition dashboard
 * - Multi-mode revision (Vocab, Grammar, Spelling)
 * - Smart revision (picks weakest areas)
 * - Flashcard mode
 * - Progress analytics
 */

// Skill types for tracking
const SKILL_TYPES = [
    { id: 'vocab-mcq', name: 'Vocab MCQ', icon: '📝', color: '#667eea' },
    { id: 'vocab-cloze', name: 'Vocab Cloze', icon: '📖', color: '#10b981' },
    { id: 'grammar-mcq', name: 'Grammar MCQ', icon: '✏️', color: '#f59e0b' },
    { id: 'grammar-cloze', name: 'Grammar Cloze', icon: '📜', color: '#d97706' },
    { id: 'spelling', name: 'Spelling', icon: '🔤', color: '#3b82f6' },
    { id: 'comprehension', name: 'Comprehension', icon: '📰', color: '#0ea5e9' }
];

export default function ReviseHub({
    engine,
    spellingProgress,
    onNavigate,
    onBack
}) {
    const [activeTab, setActiveTab] = useState('dashboard');

    // Get revision stats from engine
    // Get revision stats from engine
    const stats = useMemo(() => {
        const spacedRep = engine?.spacedRep;
        if (!spacedRep) return null;

        const dueWords = spacedRep.getDueWords?.() || [];
        const allProgress = spacedRep.progress || {};

        // Helper to calculate distribution for a set of questions
        const calculateDistribution = (questions) => {
            const levels = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
            let total = 0;
            let mastered = 0;

            questions.forEach(q => {
                const id = q.question_number || q.id;
                // If ID collision exists between Vocab/Grammar, using the shared SR instance will return
                // the same box for both. Ideally IDs should be unique.
                const box = spacedRep.getBox(id);
                const level = Math.min(5, Math.max(0, box)); // Box 1-5, but SR might return undefined->1.
                // Note: getBox defaults to 1. If it's NEW (never seen), it's conceptually Level 0?
                // SpacedRepetition.js: getBox returns progress[id]?.box || 1.
                // If it's not in progress, it's "New".
                const isStarted = !!allProgress[id];
                const finalLevel = isStarted ? level : 0;

                levels[finalLevel]++;
                total++;
                if (finalLevel >= 5) mastered++;
            });
            return { levels, total, mastered };
        };

        // Vocab Stats
        const vocabDist = calculateDistribution(VOCAB_MCQ);

        // Grammar Stats
        const grammarDist = calculateDistribution(GRAMMAR_MCQ);

        // Spelling Stats (from specialized engine)
        const spellingStatsRaw = spellingProgress?.getStats?.() || {
            total: 0, mastered: 0, confident: 0, familiar: 0, learning: 0
        };
        // Map Spelling "Level" (New=0, Learning=1, Familiar=2, Confident=3, Mastered=4) to our 0-5 scale
        // We'll map Mastered (4) to 5 for consistency with Vocab/Grammar "Mastered"
        const spellingLevels = {
            0: spellingStatsRaw.total - (spellingStatsRaw.mastered + spellingStatsRaw.confident + spellingStatsRaw.familiar + spellingStatsRaw.learning),
            1: spellingStatsRaw.learning,
            2: spellingStatsRaw.familiar,
            3: spellingStatsRaw.confident,
            4: 0, // Gap
            5: spellingStatsRaw.mastered
        };
        // Ensure accurate total if "total" in stats doesn't match sum
        // Actually spellingStatsRaw.total should be reliable.

        return {
            dueCount: dueWords.length,
            totalWords: vocabDist.total, // Default to Vocab count for "Total Words" card? Or sum? User probably thinks Vocab.
            vocabStats: vocabDist,
            grammarStats: grammarDist,
            spellingStats: {
                ...spellingStatsRaw,
                levels: spellingLevels
            },
            weakestAreas: getWeakestAreas(allProgress)
        };
    }, [engine, spellingProgress]);

    const getWeakestAreas = (progress) => {
        // Find words with lowest mastery
        const sorted = Object.entries(progress)
            .map(([id, p]) => ({ id, streak: p.correctStreak || 0, wrong: p.wrongCount || 0 }))
            .filter(w => w.wrong > 0)
            .sort((a, b) => b.wrong - a.wrong)
            .slice(0, 5);
        return sorted;
    };

    const renderDashboard = () => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.lg }}>
            {/* Due for Review Card */}
            <div style={{
                background: colors.primaryGradient,
                borderRadius: borderRadius.xl,
                padding: spacing.lg,
                color: 'white',
                boxShadow: shadows.lg
            }}>
                <div style={{ fontSize: '0.9rem', opacity: 0.9, marginBottom: spacing.xs }}>
                    📚 Due for Review Today
                </div>
                <div style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>
                    {stats?.dueCount || 0} words
                </div>
                <button
                    onClick={() => onNavigate('quiz-setup')}
                    disabled={!stats?.dueCount}
                    style={{
                        marginTop: spacing.md,
                        padding: `${spacing.sm} ${spacing.lg}`,
                        background: 'rgba(255,255,255,0.2)',
                        color: 'white',
                        border: '2px solid rgba(255,255,255,0.4)',
                        borderRadius: borderRadius.lg,
                        cursor: stats?.dueCount ? 'pointer' : 'not-allowed',
                        fontWeight: '600'
                    }}
                >
                    Start Review →
                </button>
            </div>

            {/* Quick Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: spacing.sm }}>
                <StatCard
                    label="Total Words"
                    value={stats?.totalWords || 0}
                    icon="📊"
                    color={colors.primary}
                />
                <StatCard
                    label="Vocab Mastered"
                    value={stats?.vocabStats?.mastered || 0}
                    icon="⭐"
                    color={colors.success}
                />
                <StatCard
                    label="Spelling Mastered"
                    value={stats?.spellingStats?.mastered || 0}
                    icon="🔤"
                    color={colors.primary}
                />
            </div>

            {/* Vocab Mastery */}
            <div style={{
                background: colors.white,
                borderRadius: borderRadius.xl,
                padding: spacing.lg,
                boxShadow: shadows.md
            }}>
                <h3 style={{ margin: 0, marginBottom: spacing.md, color: colors.dark }}>
                    📈 Vocab Mastery
                </h3>
                <DistributionChart levels={stats?.vocabStats?.levels} />
            </div>

            {/* Grammar Mastery */}
            <div style={{
                background: colors.white,
                borderRadius: borderRadius.xl,
                padding: spacing.lg,
                boxShadow: shadows.md
            }}>
                <h3 style={{ margin: 0, marginBottom: spacing.md, color: colors.dark }}>
                    📐 Grammar Mastery
                </h3>
                <DistributionChart levels={stats?.grammarStats?.levels} />
            </div>

            {/* Spelling Mastery */}
            <div style={{
                background: colors.white,
                borderRadius: borderRadius.xl,
                padding: spacing.lg,
                boxShadow: shadows.md
            }}>
                <h3 style={{ margin: 0, marginBottom: spacing.md, color: colors.dark }}>
                    🔤 Spelling Mastery
                </h3>
                <DistributionChart levels={stats?.spellingStats?.levels} />
            </div>

            {/* Weak Areas */}
            {stats?.weakestAreas?.length > 0 && (
                <div style={{
                    background: '#fff7ed',
                    borderRadius: borderRadius.xl,
                    padding: spacing.lg,
                    border: '2px solid #fed7aa'
                }}>
                    <h3 style={{ margin: 0, marginBottom: spacing.md, color: '#c2410c' }}>
                        ⚠️ Needs Practice
                    </h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: spacing.xs }}>
                        {stats.weakestAreas.map(w => (
                            <span key={w.id} style={{
                                padding: `${spacing.xs} ${spacing.sm}`,
                                background: '#ffedd5',
                                borderRadius: borderRadius.md,
                                fontSize: '0.85rem',
                                color: '#c2410c'
                            }}>
                                {w.id} ({w.wrong} wrong)
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );

    const renderModes = () => (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: spacing.md }}>
            {SKILL_TYPES.map(skill => (
                <button
                    key={skill.id}
                    onClick={() => onNavigate(skill.id === 'vocab-mcq' ? 'quiz-setup' : skill.id)}
                    style={{
                        padding: spacing.lg,
                        background: colors.white,
                        border: `2px solid ${colors.border}`,
                        borderRadius: borderRadius.xl,
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: spacing.sm,
                        transition: 'all 0.2s',
                        boxShadow: shadows.sm
                    }}
                >
                    <span style={{
                        fontSize: '2rem',
                        width: '50px',
                        height: '50px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: `${skill.color}20`,
                        borderRadius: borderRadius.round
                    }}>
                        {skill.icon}
                    </span>
                    <span style={{
                        fontWeight: '600',
                        color: colors.dark,
                        fontSize: '0.9rem'
                    }}>
                        {skill.name}
                    </span>
                </button>
            ))}
        </div>
    );

    const renderFlashcards = () => (
        <div style={{
            background: colors.white,
            borderRadius: borderRadius.xl,
            padding: spacing.xl,
            textAlign: 'center',
            boxShadow: shadows.md
        }}>
            <div style={{ fontSize: '4rem', marginBottom: spacing.md }}>🃏</div>
            <h3 style={{ margin: 0, marginBottom: spacing.sm, color: colors.dark }}>
                Flashcard Mode
            </h3>
            <p style={{ color: colors.textMuted, marginBottom: spacing.lg }}>
                Quick review with flip cards. See definition, recall the word.
            </p>
            <button
                onClick={() => onNavigate('flashcards')}
                style={{
                    padding: `${spacing.md} ${spacing.xl}`,
                    background: colors.primaryGradient,
                    color: 'white',
                    border: 'none',
                    borderRadius: borderRadius.lg,
                    fontSize: '1rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    boxShadow: shadows.md
                }}
            >
                Start Flashcards
            </button>
        </div>
    );

    const tabs = [
        { id: 'dashboard', label: 'Dashboard', icon: '📊' },
        { id: 'modes', label: 'Practice', icon: '🎯' },
        { id: 'flashcards', label: 'Flashcards', icon: '🃏' }
    ];

    return (
        <PageLayout
            title="Revise"
            showBack={true}
            onBack={onBack}
            maxWidth="700px"
        >
            {/* Tab Navigation */}
            <div style={{
                display: 'flex',
                gap: spacing.xs,
                marginBottom: spacing.lg,
                background: colors.light,
                padding: spacing.xs,
                borderRadius: borderRadius.lg
            }}>
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        style={{
                            flex: 1,
                            padding: spacing.sm,
                            background: activeTab === tab.id ? colors.white : 'transparent',
                            border: 'none',
                            borderRadius: borderRadius.md,
                            cursor: 'pointer',
                            fontWeight: activeTab === tab.id ? '600' : '400',
                            color: activeTab === tab.id ? colors.dark : colors.textMuted,
                            boxShadow: activeTab === tab.id ? shadows.sm : 'none',
                            transition: 'all 0.2s'
                        }}
                    >
                        <span style={{ marginRight: spacing.xs }}>{tab.icon}</span>
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            {activeTab === 'dashboard' && renderDashboard()}
            {activeTab === 'modes' && renderModes()}
            {activeTab === 'flashcards' && renderFlashcards()}
        </PageLayout>
    );
}

// Helper component for stat cards
function StatCard({ label, value, icon, color }) {
    return (
        <div style={{
            background: colors.white,
            borderRadius: borderRadius.lg,
            padding: spacing.md,
            textAlign: 'center',
            boxShadow: shadows.sm
        }}>
            <div style={{ fontSize: '1.3rem', marginBottom: spacing.xs }}>{icon}</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color }}>{value}</div>
            <div style={{ fontSize: '0.75rem', color: colors.textMuted }}>{label}</div>
        </div>
    );
}

// Helper component for distribution charts
function DistributionChart({ levels }) {
    if (!levels) return null;

    // Calculate max for scaling
    // Note: levels can be {0: 10, 1: 5...}
    const counts = [0, 1, 2, 3, 4, 5].map(l => levels[l] || 0);
    const maxCount = Math.max(...counts, 1); // Avoid div by zero

    return (
        <div style={{ display: 'flex', gap: spacing.xs, alignItems: 'flex-end', height: '80px' }}>
            {[0, 1, 2, 3, 4, 5].map(level => {
                const count = levels[level] || 0;
                const height = maxCount > 0 ? (count / maxCount) * 100 : 0;

                return (
                    <div key={level} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div style={{
                            width: '100%',
                            height: `${Math.max(height, 5)}%`,
                            background: `hsl(${level * 30 + 200}, 70%, 50%)`,
                            borderRadius: `${borderRadius.sm} ${borderRadius.sm} 0 0`,
                            transition: 'height 0.3s',
                            opacity: count === 0 ? 0.3 : 1
                        }} />
                        <div style={{
                            fontSize: '0.7rem',
                            color: colors.textMuted,
                            marginTop: spacing.xs
                        }}>
                            L{level}
                        </div>
                        <div style={{ fontSize: '0.8rem', fontWeight: '600', color: colors.dark }}>
                            {count}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
