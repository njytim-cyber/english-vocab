const STORAGE_KEY = 'vocab_achievements';

export const ACHIEVEMENTS = [
    {
        id: 'first_win',
        title: 'First Victory',
        description: 'Win your first quiz.',
        icon: '🏆',
        condition: (stats) => stats.wins >= 1
    },
    {
        id: 'quiz_master',
        title: 'Quiz Master',
        description: 'Win 10 quizzes.',
        icon: '🎓',
        condition: (stats) => stats.wins >= 10
    },
    {
        id: 'rich',
        title: 'Money Maker',
        description: 'Earn 1000 total coins.',
        icon: '💰',
        condition: (stats) => stats.totalCoins >= 1000
    },
    {
        id: 'shopper',
        title: 'Big Spender',
        description: 'Buy 5 items from the shop.',
        icon: '🛍️',
        condition: (stats) => stats.itemsBought >= 5
    },
    {
        id: 'streak_week',
        title: 'Dedicated',
        description: 'Login for 7 days in a row.',
        icon: '🔥',
        condition: (stats) => stats.maxStreak >= 7
    },
    {
        id: 'perfect_score',
        title: 'Perfectionist',
        description: 'Get 100% on a quiz.',
        icon: '⭐',
        condition: (stats) => stats.perfectScores >= 1
    }
];

export class Achievements {
    constructor() {
        this.unlocked = this.load();
        // We need to track stats separately or pass them in. 
        // For simplicity, let's assume we pass a stats object to check().
        // Or we can store stats here too. Let's store stats here for easier management.
        this.stats = this.loadStats();
    }

    load() {
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            return data ? new Set(JSON.parse(data)) : new Set();
        } catch (e) {
            return new Set();
        }
    }

    save() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify([...this.unlocked]));
        } catch (e) {
            console.error('Failed to save achievements', e);
        }
    }

    loadStats() {
        try {
            const data = localStorage.getItem(STORAGE_KEY + '_stats');
            return data ? JSON.parse(data) : {
                wins: 0,
                totalCoins: 0,
                itemsBought: 0,
                maxStreak: 0,
                perfectScores: 0
            };
        } catch (e) {
            return { wins: 0, totalCoins: 0, itemsBought: 0, maxStreak: 0, perfectScores: 0 };
        }
    }

    saveStats() {
        try {
            localStorage.setItem(STORAGE_KEY + '_stats', JSON.stringify(this.stats));
        } catch (e) {
            console.error('Failed to save stats', e);
        }
    }

    // Call this whenever a relevant event happens
    updateStats(updates) {
        let changed = false;
        for (const [key, value] of Object.entries(updates)) {
            if (typeof value === 'number') {
                // If it's an increment (usually we want to increment, but sometimes set)
                // Let's assume updates are deltas for simplicity, or we can handle specific keys.
                // Actually, for things like 'wins', we usually increment.
                // For 'maxStreak', we might set it.
                // Let's make it simple: if the key exists, add to it. If it's a special key, handle it.
                if (this.stats[key] !== undefined) {
                    this.stats[key] += value;
                    changed = true;
                }
            }
        }

        // Special handling for non-additive stats if needed
        // For now, let's assume the caller handles logic and passes increments.
        // E.g. updateStats({ wins: 1, totalCoins: 50 })

        if (changed) this.saveStats();
        return this.checkUnlocks();
    }

    checkUnlocks() {
        const newUnlocks = [];
        for (const achievement of ACHIEVEMENTS) {
            if (!this.unlocked.has(achievement.id)) {
                if (achievement.condition(this.stats)) {
                    this.unlocked.add(achievement.id);
                    newUnlocks.push(achievement);
                }
            }
        }

        if (newUnlocks.length > 0) {
            this.save();
        }

        return newUnlocks;
    }

    getUnlocked() {
        return Array.from(this.unlocked);
    }
}
