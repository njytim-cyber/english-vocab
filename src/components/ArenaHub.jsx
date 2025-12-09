import { useState, useMemo, memo } from 'react';
import { colors, borderRadius, shadows, spacing } from '../styles/designTokens';
import PageLayout from './common/PageLayout';
import { QUESTION_TYPES } from '../utils/arenaQuestionBuilder';

/**
 * ArenaHub - Enhanced Arena lobby with leaderboard and battle history
 * Optimized: extracted memoized components, improved a11y, consolidated styles
 */

const LEAGUES = [
    { id: 'bronze', name: 'Bronze', icon: '🥉', minElo: 0, maxElo: 999, color: '#cd7f32' },
    { id: 'silver', name: 'Silver', icon: '🥈', minElo: 1000, maxElo: 1499, color: '#c0c0c0' },
    { id: 'gold', name: 'Gold', icon: '🥇', minElo: 1500, maxElo: 1999, color: '#ffd700' },
    { id: 'platinum', name: 'Platinum', icon: '💎', minElo: 2000, maxElo: 2499, color: '#e5e4e2' },
    { id: 'diamond', name: 'Diamond', icon: '💠', minElo: 2500, maxElo: 9999, color: '#b9f2ff' }
];

const STORAGE_KEY = 'vocab_arena_stats';

// Consolidated style patterns
const cardStyle = {
    background: `linear-gradient(135deg, ${colors.white} 0%, ${colors.light} 100%)`,
    borderRadius: borderRadius.xl,
    boxShadow: shadows.md,
    border: `2px solid ${colors.border}`
};

// Memoized QuickStat - pure presentational, no interactive handlers on div
const QuickStat = memo(function QuickStat({ label, value, color, icon }) {
    return (
        <div
            style={{
                ...cardStyle,
                padding: spacing.md,
                textAlign: 'center'
            }}
            role="group"
            aria-label={`${label}: ${value}`}
        >
            <div style={{ fontSize: '1rem', marginBottom: spacing.xs }}>{icon}</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color }}>{value}</div>
            <div style={{ fontSize: '0.75rem', color: colors.textMuted }}>{label}</div>
        </div>
    );
});

// Memoized Battle Tab Content
const BattleTab = memo(function BattleTab({
    arenaStats,
    currentLeague,
    nextLeague,
    progressToNext,
    selectedTypes,
    toggleQuestionType,
    handleStartBattle
}) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.lg }}>
            {/* Player Card */}
            <div style={{
                background: colors.primaryGradient,
                borderRadius: borderRadius.xl,
                padding: spacing.lg,
                color: 'white',
                textAlign: 'center',
                boxShadow: shadows.xl,
                border: '3px solid rgba(255,255,255,0.2)'
            }}>
                <div style={{ fontSize: '4rem', marginBottom: spacing.sm }}>🦊</div>
                <h2 style={{ margin: 0, fontSize: '1.5rem' }}>Champion</h2>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: spacing.sm,
                    marginTop: spacing.sm
                }}>
                    <span style={{ fontSize: '1.5rem' }}>{currentLeague.icon}</span>
                    <span style={{ fontWeight: 'bold' }}>{currentLeague.name} League</span>
                </div>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', marginTop: spacing.sm }}>
                    {arenaStats.elo} ELO
                </div>

                {nextLeague && (
                    <div style={{ marginTop: spacing.md }}>
                        <div style={{
                            background: 'rgba(255,255,255,0.2)',
                            borderRadius: borderRadius.round,
                            height: '8px',
                            overflow: 'hidden'
                        }}>
                            <div style={{
                                background: 'white',
                                height: '100%',
                                width: `${progressToNext}%`,
                                transition: 'width 0.3s'
                            }} />
                        </div>
                        <div style={{ fontSize: '0.8rem', opacity: 0.8, marginTop: spacing.xs }}>
                            {nextLeague.minElo - arenaStats.elo} ELO to {nextLeague.name}
                        </div>
                    </div>
                )}
            </div>

            {/* Quick Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: spacing.sm }}>
                <QuickStat label="Wins" value={arenaStats.wins} color="#10b981" icon="✓" />
                <QuickStat label="Losses" value={arenaStats.losses} color="#ef4444" icon="✗" />
                <QuickStat
                    label="Win Rate"
                    value={`${arenaStats.wins + arenaStats.losses > 0
                        ? Math.round((arenaStats.wins / (arenaStats.wins + arenaStats.losses)) * 100)
                        : 0}%`}
                    color="#3b82f6"
                    icon="📊"
                />
            </div>

            {/* Question Type Selection */}
            <div style={{ ...cardStyle, padding: spacing.md }}>
                <h4 style={{ margin: 0, marginBottom: spacing.sm, color: colors.dark, fontSize: '0.9rem' }}>
                    📋 Question Types
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: spacing.xs }}>
                    {QUESTION_TYPES.map(type => {
                        const isSelected = selectedTypes.has(type.id);
                        return (
                            <button
                                key={type.id}
                                onClick={() => toggleQuestionType(type.id)}
                                aria-pressed={isSelected}
                                style={{
                                    padding: spacing.sm,
                                    background: isSelected ? `${type.color}15` : colors.light,
                                    border: `2px solid ${isSelected ? type.color : 'transparent'}`,
                                    borderRadius: borderRadius.md,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: spacing.xs,
                                    transition: 'all 0.2s'
                                }}
                            >
                                <span style={{
                                    width: '18px',
                                    height: '18px',
                                    borderRadius: '4px',
                                    background: isSelected ? type.color : 'white',
                                    border: `2px solid ${isSelected ? type.color : colors.border}`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'white',
                                    fontSize: '0.7rem'
                                }}>
                                    {isSelected && '✓'}
                                </span>
                                <span style={{ fontSize: '1rem' }}>{type.icon}</span>
                                <span style={{
                                    fontSize: '0.8rem',
                                    color: isSelected ? type.color : colors.textMuted,
                                    fontWeight: isSelected ? '600' : '400'
                                }}>
                                    {type.name}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Battle Button */}
            <button
                onClick={handleStartBattle}
                style={{
                    padding: spacing.lg,
                    background: colors.errorGradient,
                    color: 'white',
                    border: 'none',
                    borderRadius: borderRadius.xl,
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    boxShadow: '0 10px 35px rgba(255, 61, 0, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: spacing.md,
                    transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
                }}
            >
                <span style={{ fontSize: '2rem' }}>⚔️</span>
                ENTER ARENA
            </button>

            {/* Streak */}
            {arenaStats.streak > 0 && (
                <div style={{
                    background: '#fef3c7',
                    borderRadius: borderRadius.lg,
                    padding: spacing.md,
                    textAlign: 'center',
                    color: '#92400e',
                    fontWeight: '600'
                }}>
                    🔥 {arenaStats.streak} Win Streak! (Best: {arenaStats.bestStreak})
                </div>
            )}
        </div>
    );
});

// Memoized Ranking Tab
const RankingTab = memo(function RankingTab({ arenaStats, currentLeague }) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.md }}>
            <h3 style={{ margin: 0, color: colors.dark }}>🏆 League Ladder</h3>

            {LEAGUES.slice().reverse().map(league => {
                const isCurrent = league.id === currentLeague.id;
                return (
                    <div key={league.id} style={{
                        background: isCurrent ? `${league.color}20` : colors.white,
                        borderRadius: borderRadius.lg,
                        padding: spacing.md,
                        border: isCurrent ? `3px solid ${league.color}` : `1px solid ${colors.border}`,
                        display: 'flex',
                        alignItems: 'center',
                        gap: spacing.md,
                        boxShadow: isCurrent ? shadows.md : shadows.sm
                    }}>
                        <span style={{ fontSize: '2rem' }}>{league.icon}</span>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 'bold', color: colors.dark }}>{league.name}</div>
                            <div style={{ fontSize: '0.8rem', color: colors.textMuted }}>{league.minElo}+ ELO</div>
                        </div>
                        {isCurrent && (
                            <span style={{
                                padding: `${spacing.xs} ${spacing.sm}`,
                                background: league.color,
                                color: 'white',
                                borderRadius: borderRadius.md,
                                fontSize: '0.8rem',
                                fontWeight: 'bold'
                            }}>
                                YOU
                            </span>
                        )}
                    </div>
                );
            })}

            {/* Season Info */}
            <div style={{
                background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
                borderRadius: borderRadius.xl,
                padding: spacing.lg,
                color: 'white',
                marginTop: spacing.md
            }}>
                <h4 style={{ margin: 0, marginBottom: spacing.sm }}>🌟 Season 1 Rewards</h4>
                <p style={{ margin: 0, opacity: 0.8, fontSize: '0.9rem' }}>
                    Finish the season in a higher league to earn exclusive stickers and bonus XP!
                </p>
            </div>
        </div>
    );
});

// Memoized History Tab
const HistoryTab = memo(function HistoryTab({ history }) {
    if (history.length === 0) {
        return (
            <div style={{
                background: colors.light,
                borderRadius: borderRadius.xl,
                padding: spacing.xl,
                textAlign: 'center'
            }}>
                <div style={{ fontSize: '3rem', marginBottom: spacing.md }}>⚔️</div>
                <p style={{ color: colors.textMuted, margin: 0 }}>
                    No battles yet! Enter the arena to start your journey.
                </p>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.sm }}>
            {history.slice(-10).reverse().map((match, i) => (
                <div key={i} style={{
                    background: colors.white,
                    borderRadius: borderRadius.lg,
                    padding: spacing.md,
                    display: 'flex',
                    alignItems: 'center',
                    gap: spacing.md,
                    boxShadow: shadows.sm,
                    borderLeft: `4px solid ${match.result === 'win' ? '#10b981' : match.result === 'loss' ? '#ef4444' : '#eab308'}`
                }}>
                    <span style={{ fontSize: '2rem' }}>{match.opponentEmoji || '🤖'}</span>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: '600', color: colors.dark }}>vs {match.opponentName || 'CPU'}</div>
                        <div style={{ fontSize: '0.8rem', color: colors.textMuted }}>{match.playerScore} - {match.opponentScore}</div>
                    </div>
                    <div style={{
                        padding: `${spacing.xs} ${spacing.sm}`,
                        background: match.result === 'win' ? '#d1fae5' : match.result === 'loss' ? '#fee2e2' : '#fef3c7',
                        color: match.result === 'win' ? '#059669' : match.result === 'loss' ? '#dc2626' : '#d97706',
                        borderRadius: borderRadius.md,
                        fontWeight: 'bold',
                        fontSize: '0.8rem',
                        textTransform: 'uppercase'
                    }}>
                        {match.result}
                    </div>
                    <div style={{
                        fontSize: '0.9rem',
                        fontWeight: 'bold',
                        color: match.eloChange >= 0 ? '#10b981' : '#ef4444'
                    }}>
                        {match.eloChange >= 0 ? '+' : ''}{match.eloChange}
                    </div>
                </div>
            ))}
        </div>
    );
});

export default function ArenaHub({ onStartBattle, onBack }) {
    const [activeTab, setActiveTab] = useState('battle');
    const [selectedTypes, setSelectedTypes] = useState(new Set(['vocab-mcq']));

    const toggleQuestionType = (typeId) => {
        setSelectedTypes(prev => {
            const next = new Set(prev);
            if (next.has(typeId)) {
                if (next.size > 1) next.delete(typeId);
            } else {
                next.add(typeId);
            }
            return next;
        });
    };

    const handleStartBattle = () => {
        onStartBattle(Array.from(selectedTypes));
    };

    const arenaStats = useMemo(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) return JSON.parse(saved);
        } catch (e) { /* ignore */ }
        return { elo: 1000, wins: 0, losses: 0, draws: 0, streak: 0, bestStreak: 0, history: [] };
    }, []);

    const currentLeague = LEAGUES.find(l => arenaStats.elo >= l.minElo && arenaStats.elo <= l.maxElo) || LEAGUES[0];
    const nextLeague = LEAGUES.find(l => l.minElo > arenaStats.elo) || null;
    const progressToNext = nextLeague
        ? Math.round(((arenaStats.elo - currentLeague.minElo) / (nextLeague.minElo - currentLeague.minElo)) * 100)
        : 100;

    const tabs = [
        { id: 'battle', label: 'Battle', icon: '⚔️' },
        { id: 'ranking', label: 'Ranking', icon: '🏆' },
        { id: 'history', label: 'History', icon: '📜' }
    ];

    return (
        <PageLayout title="Arena" showBack={true} onBack={onBack} maxWidth="700px">
            {/* Tab Navigation */}
            <div style={{
                display: 'flex',
                gap: spacing.xs,
                marginBottom: spacing.lg,
                background: colors.light,
                padding: spacing.xs,
                borderRadius: borderRadius.lg
            }} role="tablist">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        role="tab"
                        aria-selected={activeTab === tab.id}
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

            {/* Tab Content - Memoized Components */}
            {activeTab === 'battle' && (
                <BattleTab
                    arenaStats={arenaStats}
                    currentLeague={currentLeague}
                    nextLeague={nextLeague}
                    progressToNext={progressToNext}
                    selectedTypes={selectedTypes}
                    toggleQuestionType={toggleQuestionType}
                    handleStartBattle={handleStartBattle}
                />
            )}
            {activeTab === 'ranking' && <RankingTab arenaStats={arenaStats} currentLeague={currentLeague} />}
            {activeTab === 'history' && <HistoryTab history={arenaStats.history} />}
        </PageLayout>
    );
}
