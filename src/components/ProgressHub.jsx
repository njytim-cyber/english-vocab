import { useState, useMemo } from 'react';
import { colors, borderRadius, shadows, spacing } from '../styles/designTokens';
import PageLayout from './common/PageLayout';
import { ACHIEVEMENTS } from '../engine/Achievements';
import { GRAMMAR_CATEGORIES } from './GrammarSetup';
import clozePassages from '../data/cloze_sample.json';

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
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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
                <StatCard icon="🔥" label="Day Streak" value={stats.streak} color="#ef4444" />
                <StatCard icon="⭐" label="Stars" value={stats.coins} color="#eab308" />
                <StatCard icon="📚" label="Words Learned" value={stats.masteredWords} color="#10b981" />
                <StatCard icon="🎯" label="Accuracy" value={`${stats.accuracy}%`} color="#3b82f6" />
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
                            stroke="#10b981"
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
                    background: '#e0f2fe',
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

// Helper components
function StatCard({ icon, label, value, color }) {
    return (
        <div style={{
            background: colors.white,
            borderRadius: borderRadius.lg,
            padding: spacing.md,
            textAlign: 'center',
            boxShadow: shadows.sm
        }}>
            <div style={{ fontSize: '1.5rem', marginBottom: spacing.xs }}>{icon}</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color }}>{value}</div>
            <div style={{ fontSize: '0.75rem', color: colors.textMuted }}>{label}</div>
        </div>
    );
}

function StatRow({ label, value }) {
    return (
        <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            padding: `${spacing.sm} 0`,
            borderBottom: `1px solid ${colors.light}`
        }}>
            <span style={{ color: colors.textMuted }}>{label}</span>
            <span style={{ fontWeight: '600', color: colors.dark }}>{value}</span>
        </div>
    );
}

function SkillProgress({ title, icon, levels, total, color }) {
    const mastered = levels[5] || 0;
    const percentage = total > 0 ? Math.round((mastered / total) * 100) : 0;

    return (
        <div style={{
            background: colors.white,
            borderRadius: borderRadius.xl,
            padding: spacing.lg,
            boxShadow: shadows.md
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.md }}>
                <span style={{ fontSize: '1.5rem' }}>{icon}</span>
                <h3 style={{ margin: 0, color: colors.dark }}>{title}</h3>
                <span style={{
                    marginLeft: 'auto',
                    padding: `${spacing.xs} ${spacing.sm}`,
                    background: `${color}20`,
                    color: color,
                    borderRadius: borderRadius.md,
                    fontSize: '0.8rem',
                    fontWeight: '600'
                }}>
                    {percentage}% Mastered
                </span>
            </div>

            {/* Mini bar chart */}
            <div style={{ display: 'flex', gap: '2px', height: '40px', alignItems: 'flex-end' }}>
                {[0, 1, 2, 3, 4, 5].map(level => {
                    const count = levels[level] || 0;
                    const maxCount = Math.max(...Object.values(levels));
                    const height = maxCount > 0 ? (count / maxCount) * 100 : 0;

                    return (
                        <div key={level} style={{
                            flex: 1,
                            height: `${Math.max(height, 5)}%`,
                            background: `hsl(${level * 30 + 200}, 70%, 50%)`,
                            borderRadius: '2px 2px 0 0'
                        }} />
                    );
                })}
            </div>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginTop: spacing.xs,
                fontSize: '0.7rem',
                color: colors.textMuted
            }}>
                <span>L0</span>
                <span>L5</span>
            </div>
        </div>
    );
}

function AchievementGrid({ achievements, unlocked, onSelect }) {
    return (
        <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))',
            gap: '1rem'
        }}>
            {achievements.map(ach => {
                const isUnlocked = unlocked.some(u => u.id === ach.id);
                return (
                    <div
                        key={ach.id}
                        onClick={() => onSelect(ach)}
                        style={{
                            aspectRatio: '1/1',
                            background: isUnlocked ? '#f0fdf4' : colors.light,
                            borderRadius: borderRadius.lg,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '0.5rem',
                            cursor: 'pointer',
                            border: isUnlocked ? `2px solid ${colors.success}` : `2px dashed ${colors.border}`,
                            opacity: isUnlocked ? 1 : 0.7,
                            transition: 'all 0.2s',
                            transform: isUnlocked ? 'scale(1)' : 'scale(0.95)'
                        }}
                    >
                        <div style={{
                            fontSize: '2rem',
                            marginBottom: '0.2rem',
                            filter: isUnlocked ? 'none' : 'grayscale(100%)'
                        }}>
                            {isUnlocked ? ach.icon : '🔒'}
                        </div>
                        <div style={{
                            fontSize: '0.65rem',
                            textAlign: 'center',
                            color: isUnlocked ? colors.dark : colors.textMuted,
                            lineHeight: 1.2
                        }}>
                            {ach.title}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

function AchievementModal({ sticker, isUnlocked, onClose }) {
    return (
        <div style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.8)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem'
        }} onClick={onClose}>
            <div onClick={e => e.stopPropagation()} style={{
                background: 'white',
                padding: '2rem',
                borderRadius: borderRadius.xl,
                maxWidth: '400px',
                width: '100%',
                textAlign: 'center',
                position: 'relative'
            }}>
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>
                    {isUnlocked ? sticker.icon : '🔒'}
                </div>
                <h2 style={{ marginBottom: '0.5rem', color: colors.dark }}>{sticker.title}</h2>
                <p style={{ color: colors.textMuted, marginBottom: '1.5rem' }}>
                    {sticker.description}
                </p>
                <div style={{
                    padding: '0.5rem 1rem',
                    background: isUnlocked ? '#dcfce7' : colors.light,
                    color: isUnlocked ? '#166534' : colors.textMuted,
                    borderRadius: borderRadius.round,
                    display: 'inline-block',
                    fontSize: '0.9rem',
                    fontWeight: 'bold'
                }}>
                    {isUnlocked ? 'Unlocked!' : 'Locked'}
                </div>
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: '1rem',
                        right: '1rem',
                        background: 'none',
                        border: 'none',
                        fontSize: '1.5rem',
                        cursor: 'pointer',
                        color: colors.textMuted
                    }}
                >
                    ×
                </button>
            </div>
        </div>
    );
}
