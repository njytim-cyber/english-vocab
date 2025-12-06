const STORAGE_KEY = 'vocab_achievements';

export const ACHIEVEMENTS = [
    // --- Learning Milestones ---
    { id: 'first_win', title: 'First Victory', description: 'Win your first quiz.', icon: '🏆', condition: (stats) => stats.wins >= 1 },
    { id: 'quiz_master', title: 'Quiz Master', description: 'Win 10 quizzes.', icon: '🎓', condition: (stats) => stats.wins >= 10 },
    { id: 'quiz_legend', title: 'Quiz Legend', description: 'Win 50 quizzes.', icon: '👑', condition: (stats) => stats.wins >= 50 },
    { id: 'quiz_god', title: 'Quiz Deity', description: 'Win 100 quizzes.', icon: '⚡', condition: (stats) => stats.wins >= 100 },

    // --- Perfect Scores ---
    { id: 'perfect_score', title: 'Perfectionist', description: 'Get 100% on a quiz.', icon: '⭐', condition: (stats) => stats.perfectScores >= 1 },
    { id: 'perfect_five', title: 'Flawless Five', description: 'Get 5 perfect scores.', icon: '🌟', condition: (stats) => stats.perfectScores >= 5 },
    { id: 'perfect_ten', title: 'Perfect Ten', description: 'Get 10 perfect scores.', icon: '💫', condition: (stats) => stats.perfectScores >= 10 },
    { id: 'perfect_master', title: 'Perfection Master', description: 'Get 25 perfect scores.', icon: '✨', condition: (stats) => stats.perfectScores >= 25 },

    // --- Stars & Rewards ---
    { id: 'rich', title: 'Star Collector', description: 'Earn 1000 total stars.', icon: '⭐', condition: (stats) => stats.totalCoins >= 1000 },
    { id: 'wealthy', title: 'Star Master', description: 'Earn 5000 total stars.', icon: '🌟', condition: (stats) => stats.totalCoins >= 5000 },
    { id: 'millionaire', title: 'Star Legend', description: 'Earn 10000 total stars.', icon: '💫', condition: (stats) => stats.totalCoins >= 10000 },

    // --- Shopping ---
    { id: 'first_purchase', title: 'First Purchase', description: 'Buy your first item.', icon: '🛒', condition: (stats) => stats.itemsBought >= 1 },
    { id: 'shopper', title: 'Big Spender', description: 'Buy 5 items from the shop.', icon: '🛍️', condition: (stats) => stats.itemsBought >= 5 },
    { id: 'collector', title: 'Collector', description: 'Buy 10 items.', icon: '📦', condition: (stats) => stats.itemsBought >= 10 },

    // --- Streaks ---
    { id: 'streak_3', title: 'Consistent', description: 'Login for 3 days in a row.', icon: '🔥', condition: (stats) => stats.maxStreak >= 3 },
    { id: 'streak_week', title: 'Dedicated', description: 'Login for 7 days in a row.', icon: '🔥', condition: (stats) => stats.maxStreak >= 7 },
    { id: 'streak_month', title: 'Devoted', description: 'Login for 30 days in a row.', icon: '🌋', condition: (stats) => stats.maxStreak >= 30 },

    // --- Word Mastery ---
    { id: 'words_10', title: 'Word Learner', description: 'Master 10 words.', icon: '📖', condition: (stats) => stats.wordsMastered >= 10 },
    { id: 'words_50', title: 'Vocabulary Builder', description: 'Master 50 words.', icon: '📚', condition: (stats) => stats.wordsMastered >= 50 },
    { id: 'words_100', title: 'Word Wizard', description: 'Master 100 words.', icon: '🧙', condition: (stats) => stats.wordsMastered >= 100 },
    { id: 'words_250', title: 'Lexicon Lord', description: 'Master 250 words.', icon: '👨‍🎓', condition: (stats) => stats.wordsMastered >= 250 },
    { id: 'words_500', title: 'Vocabulary Virtuoso', description: 'Master 500 words.', icon: '🎭', condition: (stats) => stats.wordsMastered >= 500 },
    { id: 'words_1000', title: 'Word Sage', description: 'Master 1000 words.', icon: '🦉', condition: (stats) => stats.wordsMastered >= 1000 },

    // --- Arena Battles ---
    { id: 'arena_first', title: 'Arena Debut', description: 'Win your first Arena battle.', icon: '⚔️', condition: (stats) => stats.arenaWins >= 1 },
    { id: 'arena_5', title: 'Arena Fighter', description: 'Win 5 Arena battles.', icon: '🤺', condition: (stats) => stats.arenaWins >= 5 },
    { id: 'arena_25', title: 'Arena Champion', description: 'Win 25 Arena battles.', icon: '🏟️', condition: (stats) => stats.arenaWins >= 25 },
    { id: 'arena_master', title: 'Arena Master', description: 'Defeat a Master difficulty CPU.', icon: '👑', condition: (stats) => stats.masterDefeated >= 1 },

    // --- Speed Achievements ---
    { id: 'speed_demon', title: 'Speed Demon', description: 'Answer 5 questions in under 3 seconds each.', icon: '⚡', condition: (stats) => stats.fastAnswers >= 5 },
    { id: 'quick_thinker', title: 'Quick Thinker', description: 'Complete a quiz in under 30 seconds.', icon: '🚀', condition: (stats) => stats.fastQuizzes >= 1 },

    // --- Minigames ---
    { id: 'mini_first', title: 'Game Explorer', description: 'Play your first minigame.', icon: '🎮', condition: (stats) => stats.minigamesPlayed >= 1 },
    { id: 'mini_variety', title: 'Jack of All Games', description: 'Play all 5 different minigames.', icon: '🎯', condition: (stats) => stats.uniqueMinigames >= 5 },
    { id: 'word_search_pro', title: 'Word Search Pro', description: 'Complete 10 word searches.', icon: '🔍', condition: (stats) => stats.wordSearchWins >= 10 },
    { id: 'scramble_master', title: 'Unscrambler', description: 'Complete 10 word scrambles.', icon: '🔀', condition: (stats) => stats.scrambleWins >= 10 },

    // --- Theme Mastery ---
    { id: 'theme_first', title: 'Theme Explorer', description: 'Complete a theme at 100%.', icon: '🗺️', condition: (stats) => stats.themesCompleted >= 1 },
    { id: 'theme_5', title: 'Theme Collector', description: 'Complete 5 themes.', icon: '🏅', condition: (stats) => stats.themesCompleted >= 5 },
    { id: 'theme_all', title: 'Theme Master', description: 'Complete all themes.', icon: '🌈', condition: (stats) => stats.themesCompleted >= 10 },

    // --- Special Achievements ---
    { id: 'night_owl', title: 'Night Owl', description: 'Study after 10 PM.', icon: '🦉', condition: (stats) => stats.nightStudy >= 1 },
    { id: 'early_bird', title: 'Early Bird', description: 'Study before 7 AM.', icon: '🐦', condition: (stats) => stats.earlyStudy >= 1 },
    { id: 'weekend_warrior', title: 'Weekend Warrior', description: 'Study on both Saturday and Sunday.', icon: '📅', condition: (stats) => stats.weekendStudy >= 2 },

    // --- Fun Milestones ---
    { id: 'hundred_club', title: 'Century Club', description: 'Answer 100 questions correctly.', icon: '💯', condition: (stats) => stats.correctAnswers >= 100 },
    { id: 'thousand_club', title: 'Thousand Club', description: 'Answer 1000 questions correctly.', icon: '🎊', condition: (stats) => stats.correctAnswers >= 1000 },
    { id: 'comeback', title: 'Comeback Kid', description: 'Win after getting 3 wrong in a row.', icon: '💪', condition: (stats) => stats.comebacks >= 1 },
    { id: 'no_hints', title: 'No Help Needed', description: 'Complete 5 quizzes without using hints.', icon: '🧠', condition: (stats) => stats.noHintQuizzes >= 5 }
];

export class Achievements {
    constructor() {
        this.unlocked = this.load();
        this.stats = this.loadStats();
    }

    load() {
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            console.log('Achievements loaded:', data);
            return data ? new Set(JSON.parse(data)) : new Set();
        } catch (e) {
            console.error('Achievements load error:', e);
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
                perfectScores: 0,
                wordsMastered: 0,
                arenaWins: 0,
                masterDefeated: 0,
                fastAnswers: 0,
                fastQuizzes: 0,
                minigamesPlayed: 0,
                uniqueMinigames: 0,
                wordSearchWins: 0,
                scrambleWins: 0,
                themesCompleted: 0,
                nightStudy: 0,
                earlyStudy: 0,
                weekendStudy: 0,
                correctAnswers: 0,
                comebacks: 0,
                noHintQuizzes: 0
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

    updateStats(updates) {
        let changed = false;
        for (const [key, value] of Object.entries(updates)) {
            if (typeof value === 'number') {
                if (this.stats[key] !== undefined) {
                    this.stats[key] += value;
                    changed = true;
                }
            }
        }

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

    unlock(id) {
        if (!this.unlocked.has(id)) {
            this.unlocked.add(id);
            this.save();
            return true;
        }
        return false;
    }

    getUnlocked() {
        // Return full achievement objects, not just IDs
        return Array.from(this.unlocked).map(id => ACHIEVEMENTS.find(a => a.id === id)).filter(Boolean);
    }

    getAllAchievements() {
        return ACHIEVEMENTS;
    }
}
