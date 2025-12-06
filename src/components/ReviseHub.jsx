import { useState, useMemo } from 'react';
import { colors, borderRadius, shadows, spacing, typography } from '../styles/designTokens';
import PageLayout from './common/PageLayout';

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
    const stats = useMemo(() => {
        const spacedRep = engine?.spacedRep;
        if (!spacedRep) return null;

        const dueWords = spacedRep.getDueWords?.() || [];
        const allProgress = spacedRep.progress || {};
        const wordCount = Object.keys(allProgress).length;

        // Calculate mastery distribution
        const masteryLevels = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        Object.values(allProgress).forEach(p => {
            const level = Math.min(5, Math.floor(p.correctStreak || 0));
            masteryLevels[level]++;
        });

        // Spelling stats
        const spellingStats = spellingProgress?.getStats?.() || { total: 0, mastered: 0 };

        return {
            dueCount: dueWords.length,
            totalWords: wordCount,
            masteryLevels,
            spellingStats,
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
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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
                    label="Mastered"
                    value={stats?.masteryLevels?.[5] || 0}
                    icon="⭐"
                    color="#10b981"
                />
                <StatCard
                    label="Spelling"
                    value={stats?.spellingStats?.mastered || 0}
                    icon="🔤"
                    color="#3b82f6"
                />
            </div>

            {/* Mastery Distribution */}
            <div style={{
                background: colors.white,
                borderRadius: borderRadius.xl,
                padding: spacing.lg,
                boxShadow: shadows.md
            }}>
                <h3 style={{ margin: 0, marginBottom: spacing.md, color: colors.dark }}>
                    📈 Mastery Distribution
                </h3>
                <div style={{ display: 'flex', gap: spacing.xs, alignItems: 'flex-end', height: '80px' }}>
                    {[0, 1, 2, 3, 4, 5].map(level => {
                        const count = stats?.masteryLevels?.[level] || 0;
                        const maxCount = Math.max(...Object.values(stats?.masteryLevels || { 0: 1 }));
                        const height = maxCount > 0 ? (count / maxCount) * 100 : 0;

                        return (
                            <div key={level} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <div style={{
                                    width: '100%',
                                    height: `${Math.max(height, 5)}%`,
                                    background: `hsl(${level * 30 + 200}, 70%, 50%)`,
                                    borderRadius: `${borderRadius.sm} ${borderRadius.sm} 0 0`,
                                    transition: 'height 0.3s'
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
