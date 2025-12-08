import { useState, useMemo } from 'react';
import { colors, borderRadius, shadows, spacing } from '../styles/designTokens';
import PageLayout from './common/PageLayout';
import { ACHIEVEMENTS } from '../engine/Achievements';
import { GRAMMAR_CATEGORIES } from '../data/grammarData';
import { VOCAB_CLOZE } from '../data/dataManifest';
const clozePassages = VOCAB_CLOZE;
import { StatCard } from './progress/StatCard';
import { StatRow } from './progress/StatRow';
import { SkillProgress } from './progress/SkillProgress';
import { AchievementGrid } from './progress/AchievementGrid';
import { AchievementModal } from './progress/AchievementModal';

/**
 * ProgressHub - Comprehensive progress and analytics center
 * Features:
 * - Overview with streaks, XP, level
 * - Skills breakdown by category
 * - Achievements gallery
 * - Detailed statistics
 */

export default function ProgressHub({
    engine,
    economy,
    spellingProgress,
    achievements,
    onNavigate,
    onBack
}) {
    const [activeTab, setActiveTab] = useState('overview');
    const [selectedSticker, setSelectedSticker] = useState(null); // For Achievements modal

    // Calculate stats
    const stats = useMemo(() => {
        const sr = engine?.spacedRep || engine?.sr;
        const allQuestions = engine?.allQuestions || [];

        // Helper function (defined before use)
        const calculateAccuracy = (srInstance, questions) => {
            if (!srInstance) return 0;
            let correct = 0, total = 0;
            questions.forEach(q => {
                const history = srInstance.history?.[q.question_number || q.id];
                if (history) {
                    correct += history.correct || 0;
                    total += (history.correct || 0) + (history.wrong || 0);
                }
            });
            return total > 0 ? Math.round((correct / total) * 100) : 0;
        };

        // Word mastery distribution
        const masteryLevels = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        allQuestions.forEach(q => {
            const box = sr?.getBox?.(q.question_number || q.id) || 0;
            masteryLevels[Math.min(5, box)]++;
        });

        // Calculate total mastery percentage
        const totalWords = allQuestions.length;
        const masteredWords = masteryLevels[5] || 0;
        const masteryPercentage = totalWords > 0 ? Math.round((masteredWords / totalWords) * 100) : 0;

        // Economy stats
        const xp = economy?.getXP?.() || 0;
        const level = economy?.getLevel?.() || 1;
        const coins = economy?.getCoins?.() || 0;

        // Spelling stats
        const spellingStats = spellingProgress?.getStats?.() || { total: 0, mastered: 0 };

        // Streak (mock - would need actual tracking)
        const streak = parseInt(localStorage.getItem('vocab_streak') || '0');

        return {
            totalWords,
            masteredWords,
            masteryPercentage,
            masteryLevels,
            xp,
            level,
            coins,
            spellingStats,
            streak,
            questionsAnswered: sr?.getTotalAnswered?.() || allQuestions.filter(q => sr?.getBox?.(q.question_number || q.id) > 0).length,
            accuracy: calculateAccuracy(sr, allQuestions)
        };
    }, [engine, economy, spellingProgress]);

    // Achievements data
    const unlockedAchievements = achievements?.getUnlocked?.() || [];
    const allAchievementDefs = achievements?.getAllAchievements?.() || [];

    const tabs = [
        { id: 'overview', label: 'Overview', icon: '📊' },
        { id: 'skills', label: 'Skills', icon: '🎯' },
        { id: 'achievements', label: 'Achievements', icon: '🏆' },
        { id: 'stats', label: 'Statistics', icon: '📈' }
    ];

    const renderOverview = () => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.lg }}>
            {/* Hero Stats */}
            <div style={{
                background: colors.primaryGradient,
                borderRadius: borderRadius.xl,
                padding: spacing.xl,
                color: 'white',
                textAlign: 'center',
                boxShadow: shadows.lg
            }}>
                <div style={{ fontSize: '0.9rem', opacity: 0.9, marginBottom: spacing.xs }}>
                    Level {stats.level}
                </div>
                <div style={{ fontSize: '3rem', fontWeight: 'bold', marginBottom: spacing.xs }}>
                    {stats.xp.toLocaleString()} XP
                </div>
                <div style={{
                    background: 'rgba(255,255,255,0.2)',
                    borderRadius: borderRadius.round,
                    height: '8px',
                    marginTop: spacing.sm,
                    overflow: 'hidden'
                }}>
                    <div style={{
                        background: 'white',
                        height: '100%',
                        width: `${(stats.xp % 100)}%`,
                        transition: 'width 0.3s'
                    }} />
                </div>
                <div style={{ fontSize: '0.75rem', opacity: 0.8, marginTop: spacing.xs }}>
                    {100 - (stats.xp % 100)} XP to next level
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: spacing.sm }}>
                <StatCard icon="🔥" label="Day Streak" value={stats.streak} color={colors.error} />
                <StatCard icon="⭐" label="Stars" value={stats.coins} color={colors.warning} />
                <StatCard icon="📚" label="Words Learned" value={stats.masteredWords} color={colors.success} />
                <StatCard icon="🎯" label="Accuracy" value={`${stats.accuracy}%`} color={colors.primary} />
            </div>

            {/* Mastery Ring */}
            <div style={{
                background: colors.white,
                borderRadius: borderRadius.xl,
                padding: spacing.lg,
                boxShadow: shadows.md,
                textAlign: 'center'
            }}>
                <h3 style={{ margin: 0, marginBottom: spacing.md, color: colors.dark }}>
                    📈 Overall Mastery
                </h3>
                <div style={{
                    position: 'relative',
                    width: '120px',
                    height: '120px',
                    margin: '0 auto',
                    marginBottom: spacing.md
                }}>
                    <svg viewBox="0 0 36 36" style={{ transform: 'rotate(-90deg)' }}>
                        <path
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke={colors.light}
                            strokeWidth="3"
                        />
                        <path
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke={colors.success}
                            strokeWidth="3"
                            strokeDasharray={`${stats.masteryPercentage}, 100`}
                        />
                    </svg>
                    <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        fontSize: '1.5rem',
                        fontWeight: 'bold',
                        color: colors.dark
                    }}>
                        {stats.masteryPercentage}%
                    </div>
                </div>
                <div style={{ color: colors.textMuted, fontSize: '0.9rem' }}>
                    {stats.masteredWords} of {stats.totalWords} words mastered
                </div>
            </div>
        </div>
    );

    const renderSkills = () => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.md }}>
            {/* Vocabulary Skills */}
            <SkillProgress
                title="Vocabulary"
                icon="📝"
                levels={stats.masteryLevels}
                total={stats.totalWords}
                color="#667eea"
            />

            {/* Spelling Skills */}
            <div style={{
                background: colors.white,
                borderRadius: borderRadius.xl,
                padding: spacing.lg,
                boxShadow: shadows.md
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.md }}>
                    <span style={{ fontSize: '1.5rem' }}>🔤</span>
                    <h3 style={{ margin: 0, color: colors.dark }}>Spelling</h3>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: spacing.sm }}>
                    <span style={{ color: colors.textMuted }}>Words Practiced</span>
                    <span style={{ fontWeight: '600' }}>{stats.spellingStats.total}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: colors.textMuted }}>Mastered</span>
                    <span style={{ fontWeight: '600', color: '#10b981' }}>{stats.spellingStats.mastered}</span>
                </div>
            </div>

            {/* Grammar Skills */}
            <div style={{
                background: colors.white,
                borderRadius: borderRadius.xl,
                padding: spacing.lg,
                boxShadow: shadows.md
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.md }}>
                    <span style={{ fontSize: '1.5rem' }}>✏️</span>
                    <h3 style={{ margin: 0, color: colors.dark }}>Grammar</h3>
                </div>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr',
                    gap: spacing.sm,
                    marginBottom: spacing.sm
                }}>
                    {GRAMMAR_CATEGORIES.map(cat => (
                        <div key={cat.name} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                            <span style={{ color: colors.textMuted }}>{cat.name}</span>
                            <span style={{ background: '#fef3c7', padding: '2px 8px', borderRadius: '10px', fontSize: '0.75rem', color: '#92400e' }}>
                                {cat.subunits.length} Topics
                            </span>
                        </div>
                    ))}
                </div>
                <div style={{
                    marginTop: spacing.sm,
                    padding: spacing.sm,
                    background: colors.light,
                    borderRadius: borderRadius.lg,
                    textAlign: 'center',
                    fontSize: '0.85rem',
                    color: colors.textMuted
                }}>
                    Practice Mode Available
                </div>
            </div>

            {/* Comprehension Skills */}
            <div style={{
                background: colors.white,
                borderRadius: borderRadius.xl,
                padding: spacing.lg,
                boxShadow: shadows.md
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.md }}>
                    <span style={{ fontSize: '1.5rem' }}>📖</span>
                    <h3 style={{ margin: 0, color: colors.dark }}>Reading</h3>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: spacing.sm }}>
                    <span style={{ color: colors.textMuted }}>Passages Available</span>
                    <span style={{ fontWeight: '600' }}>{clozePassages.length}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: colors.textMuted }}>Skills Tracked</span>
                    <span style={{ fontWeight: '600' }}>Context & Recall</span>
                </div>
                <div style={{
                    marginTop: spacing.sm,
                    padding: spacing.sm,
                    background: `${colors.primary}15`,
                    borderRadius: borderRadius.lg,
                    textAlign: 'center',
                    fontSize: '0.85rem',
                    color: '#0369a1'
                }}>
                    Progress linked to Vocabulary Mastery
                </div>
            </div>

            {/* View Full Skill Tree Button */}
            <button
                onClick={() => onNavigate?.('skill-tree')}
                style={{
                    padding: spacing.md,
                    background: colors.primaryGradient,
                    color: 'white',
                    border: 'none',
                    borderRadius: borderRadius.lg,
                    fontWeight: '600',
                    cursor: 'pointer',
                    boxShadow: shadows.md
                }}
            >
                View Full Skill Tree →
            </button>
        </div>
    );

    const renderAchievements = () => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.md }}>
            <div style={{
                background: colors.white,
                borderRadius: borderRadius.xl,
                padding: spacing.lg,
                boxShadow: shadows.md
            }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: spacing.md
                }}>
                    <h3 style={{ margin: 0, color: colors.dark }}>🏆 Sticker Book</h3>
                    <span style={{ color: colors.textMuted }}>
                        {unlockedAchievements.length} / {allAchievementDefs.length} Unlocked
                    </span>
                </div>

                <AchievementGrid
                    achievements={allAchievementDefs}
                    unlocked={unlockedAchievements}
                    onSelect={setSelectedSticker}
                />
            </div>

            {/* Achievement Detail Modal */}
            {selectedSticker && (
                <AchievementModal
                    sticker={selectedSticker}
                    isUnlocked={unlockedAchievements.some(u => u.id === selectedSticker.id)}
                    onClose={() => setSelectedSticker(null)}
                />
            )}
        </div>
    );

    const renderStats = () => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.md }}>
            {/* Summary Stats */}
            <div style={{
                background: colors.white,
                borderRadius: borderRadius.xl,
                padding: spacing.lg,
                boxShadow: shadows.md
            }}>
                <h3 style={{ margin: 0, marginBottom: spacing.md, color: colors.dark }}>
                    📊 Summary
                </h3>
                <StatRow label="Questions Answered" value={stats.questionsAnswered} />
                <StatRow label="Overall Accuracy" value={`${stats.accuracy}%`} />
                <StatRow label="Total XP Earned" value={stats.xp.toLocaleString()} />
                <StatRow label="Stars Collected" value={stats.coins} />
                <StatRow label="Current Level" value={stats.level} />
            </div>

            {/* Content Stats */}
            <div style={{
                background: colors.white,
                borderRadius: borderRadius.xl,
                padding: spacing.lg,
                boxShadow: shadows.md
            }}>
                <h3 style={{ margin: 0, marginBottom: spacing.md, color: colors.dark }}>
                    📚 Content Progress
                </h3>
                <StatRow label="Vocabulary Words" value={stats.totalWords} />
                <StatRow label="Spelling Words" value={stats.spellingStats.total} />
                <StatRow label="Grammar Topics" value={GRAMMAR_CATEGORIES.reduce((acc, cat) => acc + cat.subunits.length, 0)} />
                <StatRow label="Reading Passages" value={clozePassages.length} />
            </div>

            {/* Mastery Breakdown */}
            <div style={{
                background: colors.white,
                borderRadius: borderRadius.xl,
                padding: spacing.lg,
                boxShadow: shadows.md
            }}>
                <h3 style={{ margin: 0, marginBottom: spacing.md, color: colors.dark }}>
                    🌳 Mastery Levels
                </h3>
                {[
                    { level: 0, name: 'Seed 🌱', color: '#95a5a6' },
                    { level: 1, name: 'Sprout 🌿', color: '#3498db' },
                    { level: 2, name: 'Sapling 🌳', color: '#2ecc71' },
                    { level: 3, name: 'Branch 🪵', color: '#f1c40f' },
                    { level: 4, name: 'Trunk 🪵', color: '#e67e22' },
                    { level: 5, name: 'Tree 🌲', color: '#9b59b6' }
                ].map(({ level, name, color }) => (
                    <div key={level} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: spacing.sm,
                        marginBottom: spacing.sm
                    }}>
                        <span style={{ fontSize: '0.9rem', minWidth: '100px' }}>{name}</span>
                        <div style={{
                            flex: 1,
                            background: colors.light,
                            borderRadius: borderRadius.round,
                            height: '12px',
                            overflow: 'hidden'
                        }}>
                            <div style={{
                                background: color,
                                height: '100%',
                                width: `${stats.totalWords > 0 ? (stats.masteryLevels[level] / stats.totalWords) * 100 : 0}%`,
                                transition: 'width 0.3s'
                            }} />
                        </div>
                        <span style={{
                            minWidth: '40px',
                            textAlign: 'right',
                            fontWeight: '600',
                            color
                        }}>
                            {stats.masteryLevels[level]}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <PageLayout
            title="Progress"
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
                borderRadius: borderRadius.lg,
                overflowX: 'auto'
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
                            transition: 'all 0.2s',
                            whiteSpace: 'nowrap',
                            minWidth: 'fit-content'
                        }}
                    >
                        <span style={{ marginRight: spacing.xs }}>{tab.icon}</span>
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            {activeTab === 'overview' && renderOverview()}
            {activeTab === 'skills' && renderSkills()}
            {activeTab === 'achievements' && renderAchievements()}
            {activeTab === 'stats' && renderStats()}
        </PageLayout>
    );
}


