import balance from '../data/balance.json';

/**
 * Reward Calculator - Outcome-Driven System
 * Stars awarded ONLY for correct answers
 */

/**
 * Calculate difficulty multiplier
 * Formula: 1 + (difficulty - 1) / 10
 * Range: 1.0x (diff 1) to 1.9x (diff 10)
 */
export function getDifficultyMultiplier(difficulty) {
    if (!difficulty || difficulty < 1) return 1.0;
    return 1 + (difficulty - 1) / 10;
}

/**
 * Calculate stars for a quiz activity (per correct answer)
 * @param {string} activityType - vocabMCQ, grammarMCQ, etc
 * @param {number} difficulty - 1-10
 * @param {boolean} isCorrect - must be true to get stars
 * @returns {number} stars earned
 */
export function calculateQuizReward(activityType, difficulty = 5, isCorrect = false) {
    if (!isCorrect) return 0;

    const activity = balance.rewards.activities[activityType];
    if (!activity) {
        console.warn(`Unknown activity type: ${activityType}`);
        return 0;
    }

    const baseStars = activity.baseStars || activity.starsPerBlank || activity.starsPerQuestion || activity.starsPerWord || 0;
    const diffMultiplier = getDifficultyMultiplier(difficulty);

    return Math.round(baseStars * diffMultiplier);
}

/**
 * Calculate stars for minigame
 * @param {string} gameName - wordSearch, definitionMatch, etc
 * @param {number} correctCount - number of correct answers
 * @param {number} totalCount - total questions/items
 * @returns {object} { stars, xp }
 */
export function calculateMinigameReward(gameName, correctCount, totalCount) {
    const game = balance.rewards.minigames[gameName];
    if (!game) {
        console.warn(`Unknown minigame: ${gameName}`);
        return { stars: 0, xp: 0 };
    }

    const baseStars = game.baseStars || 0;
    const starsPerCorrect = game.starsPerCorrect || game.starsPerWord || 0;
    const maxBonus = game.maxBonus || 0;

    const bonusStars = Math.min(correctCount * starsPerCorrect, maxBonus);
    const totalStars = Math.round(baseStars + bonusStars);

    const xp = game.xp || 0;

    return { stars: totalStars, xp };
}

/**
 * Calculate arena rewards
 * @param {string} result - 'win', 'loss', 'draw'
 * @param {string} difficulty - 'noob','easy', 'medium', 'hard', 'master'
 * @returns {object} { stars, xp }
 */
export function calculateArenaReward(result, difficulty = 'easy') {
    if (result === 'loss') {
        return balance.rewards.arena.loss;
    }

    if (result === 'draw') {
        return balance.rewards.arena.draw;
    }

    if (result === 'win') {
        const winReward = balance.rewards.arena.winVs[difficulty];
        return winReward || { stars: 50, xp: 100 };
    }

    return { stars: 0, xp: 0 };
}

/**
 * Calculate XP from stars
 * Standard: XP = Stars × 2
 */
export function starsToXP(stars) {
    return stars * 2;
}

/**
 * Consolation reward (for 0 stars session)
 * Small XP only, no stars
 */
export function getConsolationReward() {
    return { stars: 0, xp: 20 };
}
