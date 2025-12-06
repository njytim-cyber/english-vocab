/**
 * SpellingProgress - Tracks spelling mastery separately from vocabulary mastery
 * 
 * Key difference from vocab SpacedRep:
 * - Spelling progress tracks the ability to TYPE the word correctly
 * - Vocab progress tracks the ability to RECOGNIZE the word's meaning
 * - Same word can have different mastery levels for each skill
 */

const STORAGE_KEY = 'english-vocab-spelling-progress';

// Mastery levels for spelling
const SPELLING_LEVELS = {
    NEW: 0,        // Never practiced
    LEARNING: 1,   // 1-2 correct
    FAMILIAR: 2,   // 3-4 correct
    CONFIDENT: 3,  // 5-6 correct
    MASTERED: 4    // 7+ correct in a row
};

export default class SpellingProgress {
    constructor() {
        this.progress = this.load();
    }

    load() {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            return saved ? JSON.parse(saved) : {};
        } catch (e) {
            console.error('Failed to load spelling progress:', e);
            return {};
        }
    }

    save() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(this.progress));
        } catch (e) {
            console.error('Failed to save spelling progress:', e);
        }
    }

    /**
     * Record a spelling attempt
     * @param {string} wordId - The word's unique ID
     * @param {boolean} correct - Whether the spelling was correct
     */
    recordSpelling(wordId, correct) {
        if (!this.progress[wordId]) {
            this.progress[wordId] = {
                level: SPELLING_LEVELS.NEW,
                streak: 0,
                correctCount: 0,
                wrongCount: 0,
                lastPracticed: null
            };
        }

        const p = this.progress[wordId];
        p.lastPracticed = Date.now();

        if (correct) {
            p.correctCount++;
            p.streak++;

            // Level up based on streak
            if (p.streak >= 7) {
                p.level = SPELLING_LEVELS.MASTERED;
            } else if (p.streak >= 5) {
                p.level = SPELLING_LEVELS.CONFIDENT;
            } else if (p.streak >= 3) {
                p.level = SPELLING_LEVELS.FAMILIAR;
            } else {
                p.level = SPELLING_LEVELS.LEARNING;
            }
        } else {
            p.wrongCount++;
            p.streak = 0; // Reset streak on wrong

            // Don't drop below LEARNING once started
            if (p.level > SPELLING_LEVELS.FAMILIAR) {
                p.level = SPELLING_LEVELS.FAMILIAR;
            }
        }

        this.save();
        return p;
    }

    /**
     * Get spelling level for a word
     */
    getLevel(wordId) {
        return this.progress[wordId]?.level ?? SPELLING_LEVELS.NEW;
    }

    /**
     * Get words that need practice (due for review)
     * @param {Array} allWords - All available words
     * @param {number} count - Number of words to return
     */
    getWordsForPractice(allWords, count = 10) {
        const now = Date.now();
        const DAY = 24 * 60 * 60 * 1000;

        // Calculate review intervals based on level
        const getInterval = (level) => {
            switch (level) {
                case SPELLING_LEVELS.NEW: return 0;
                case SPELLING_LEVELS.LEARNING: return 1 * DAY;
                case SPELLING_LEVELS.FAMILIAR: return 3 * DAY;
                case SPELLING_LEVELS.CONFIDENT: return 7 * DAY;
                case SPELLING_LEVELS.MASTERED: return 30 * DAY;
                default: return 0;
            }
        };

        // Score words by priority
        const scoredWords = allWords.map(word => {
            const p = this.progress[word.wordId] || { level: 0, lastPracticed: 0 };
            const interval = getInterval(p.level);
            const timeSince = now - (p.lastPracticed || 0);
            const overdue = timeSince - interval;

            // Prioritize: NEW > overdue > recently practiced
            const priority = p.level === SPELLING_LEVELS.NEW ? 1000000 : overdue;

            return { word, priority };
        });

        // Sort by priority (descending) and take top N
        return scoredWords
            .sort((a, b) => b.priority - a.priority)
            .slice(0, count)
            .map(s => s.word);
    }

    /**
     * Get summary stats
     */
    getStats() {
        const words = Object.values(this.progress);
        return {
            total: words.length,
            mastered: words.filter(w => w.level >= SPELLING_LEVELS.MASTERED).length,
            confident: words.filter(w => w.level === SPELLING_LEVELS.CONFIDENT).length,
            familiar: words.filter(w => w.level === SPELLING_LEVELS.FAMILIAR).length,
            learning: words.filter(w => w.level === SPELLING_LEVELS.LEARNING).length
        };
    }

    /**
     * Reset all progress (for testing)
     */
    reset() {
        this.progress = {};
        this.save();
    }
}

export { SPELLING_LEVELS };
