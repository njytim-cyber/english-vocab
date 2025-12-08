/**
 * Helper to save arena stats (call from ArenaView after match)
 */
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
