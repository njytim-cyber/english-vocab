import { useState, useMemo } from 'react';
import { colors, borderRadius, shadows, spacing } from '../styles/designTokens';
import PageLayout from './common/PageLayout';

/**
 * ArenaHub - Enhanced Arena lobby with leaderboard and battle history
 * Features:
 * - Battle lobby with opponent selection
 * - Player ranking/league system
 * - Battle history
 * - Season rewards
 */

const LEAGUES = [
    { id: 'bronze', name: 'Bronze', icon: '🥉', minElo: 0, maxElo: 999, color: '#cd7f32' },
    { id: 'silver', name: 'Silver', icon: '🥈', minElo: 1000, maxElo: 1499, color: '#c0c0c0' },
    { id: 'gold', name: 'Gold', icon: '🥇', minElo: 1500, maxElo: 1999, color: '#ffd700' },
    { id: 'platinum', name: 'Platinum', icon: '💎', minElo: 2000, maxElo: 2499, color: '#e5e4e2' },
    { id: 'diamond', name: 'Diamond', icon: '💠', minElo: 2500, maxElo: 9999, color: '#b9f2ff' }
];

const STORAGE_KEY = 'vocab_arena_stats';

export default function ArenaHub({
    engine,
    onStartBattle,
    onBack
}) {
    const [activeTab, setActiveTab] = useState('battle');

    // Load arena stats from localStorage
    const arenaStats = useMemo(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) return JSON.parse(saved);
        } catch (e) { /* ignore */ }

        return {
            elo: 1000,
            wins: 0,
            losses: 0,
            draws: 0,
            streak: 0,
            bestStreak: 0,
            history: []
        };
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

    const renderBattle = () => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.lg }}>
            {/* Player Card */}
            <div style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: borderRadius.xl,
                padding: spacing.lg,
                color: 'white',
                textAlign: 'center',
                boxShadow: shadows.lg
            }}>
                <div style={{
                    fontSize: '4rem',
                    marginBottom: spacing.sm,
                    filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))'
                }}>
                    🦊
                </div>
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
                <div style={{
                    fontSize: '2rem',
                    fontWeight: 'bold',
                    marginTop: spacing.sm
                }}>
                    {arenaStats.elo} ELO
                </div>

                {/* Progress to next league */}
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
                <QuickStat label="Win Rate" value={`${arenaStats.wins + arenaStats.losses > 0
                    ? Math.round((arenaStats.wins / (arenaStats.wins + arenaStats.losses)) * 100)
                    : 0}%`} color="#3b82f6" icon="📊" />
            </div>

            {/* Battle Button */}
            <button
                onClick={onStartBattle}
                style={{
                    padding: spacing.lg,
                    background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: borderRadius.xl,
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    boxShadow: `0 8px 30px rgba(238, 90, 36, 0.4)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: spacing.md,
                    transition: 'transform 0.2s'
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

    const renderRanking = () => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.md }}>
            {/* League Ladder */}
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
                            <div style={{ fontWeight: 'bold', color: colors.dark }}>
                                {league.name}
                            </div>
                            <div style={{ fontSize: '0.8rem', color: colors.textMuted }}>
                                {league.minElo}+ ELO
                            </div>
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

    const renderHistory = () => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.sm }}>
            {arenaStats.history.length > 0 ? (
                arenaStats.history.slice(-10).reverse().map((match, i) => (
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
                            <div style={{ fontWeight: '600', color: colors.dark }}>
                                vs {match.opponentName || 'CPU'}
                            </div>
                            <div style={{ fontSize: '0.8rem', color: colors.textMuted }}>
                                {match.playerScore} - {match.opponentScore}
                            </div>
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
                ))
            ) : (
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
            )}
        </div>
    );

    return (
        <PageLayout
            title="Arena"
            showBack={true}
            onBack={onBack}
            maxWidth="700px"
        >
            {/* Tab Navigation */}
            <div style={{
                display: 'flex',
                gap: spacing.xs,
                marginBottom: spacing.lg,
                background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
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
                            background: activeTab === tab.id ? 'rgba(255,255,255,0.15)' : 'transparent',
                            border: 'none',
                            borderRadius: borderRadius.md,
                            cursor: 'pointer',
                            fontWeight: activeTab === tab.id ? '600' : '400',
                            color: activeTab === tab.id ? 'white' : 'rgba(255,255,255,0.6)',
                            transition: 'all 0.2s'
                        }}
                    >
                        <span style={{ marginRight: spacing.xs }}>{tab.icon}</span>
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            {activeTab === 'battle' && renderBattle()}
            {activeTab === 'ranking' && renderRanking()}
            {activeTab === 'history' && renderHistory()}
        </PageLayout>
    );
}

function QuickStat({ label, value, color, icon }) {
    return (
        <div style={{
            background: colors.white,
            borderRadius: borderRadius.lg,
            padding: spacing.md,
            textAlign: 'center',
            boxShadow: shadows.sm
        }}>
            <div style={{ fontSize: '1rem', marginBottom: spacing.xs }}>{icon}</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color }}>{value}</div>
            <div style={{ fontSize: '0.75rem', color: colors.textMuted }}>{label}</div>
        </div>
    );
}

// Helper to save arena stats (call from ArenaView after match)
export function saveArenaResult(result, playerScore, opponentScore, opponentName, opponentEmoji) {
    const STORAGE_KEY = 'vocab_arena_stats';
    let stats;
    try {
        stats = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {
            elo: 1000, wins: 0, losses: 0, draws: 0, streak: 0, bestStreak: 0, history: []
        };
    } catch {
        stats = { elo: 1000, wins: 0, losses: 0, draws: 0, streak: 0, bestStreak: 0, history: [] };
    }

    // Calculate ELO change
    let eloChange = 0;
    if (result === 'win') {
        eloChange = 25 + Math.round((opponentScore / (playerScore || 1)) * 10);
        stats.wins++;
        stats.streak++;
        if (stats.streak > stats.bestStreak) stats.bestStreak = stats.streak;
    } else if (result === 'loss') {
        eloChange = -15 - Math.round((playerScore / (opponentScore || 1)) * 5);
        stats.losses++;
        stats.streak = 0;
    } else {
        eloChange = 5;
        stats.draws++;
    }

    stats.elo = Math.max(0, stats.elo + eloChange);

    // Add to history
    stats.history.push({
        result,
        playerScore,
        opponentScore,
        opponentName,
        opponentEmoji,
        eloChange,
        timestamp: Date.now()
    });

    // Keep only last 50 matches
    if (stats.history.length > 50) {
        stats.history = stats.history.slice(-50);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
    return stats;
}
