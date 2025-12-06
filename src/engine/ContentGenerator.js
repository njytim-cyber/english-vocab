/**
 * ContentGenerator Module
 * Generates Cloze Passages and other content types from vocabulary data.
 * 
 * Enhanced with smarter distractor selection to avoid ambiguous answers.
 */

export class ContentGenerator {
    constructor() {
        // No state needed for now, purely functional
    }

    /**
     * Generate a Cloze Passage question from a word object.
     * Uses the FULL example sentence for better context.
     * @param {Object} targetWord - The word object (must have 'example' and 'answer')
     * @param {Array} allQuestions - Pool of questions for distractors
     * @returns {Object} Cloze question object
     */
    generateClozePassage(targetWord, allQuestions) {
        if (!targetWord || !targetWord.example || !targetWord.answer) {
            console.error('Invalid target word for Cloze Passage', targetWord);
            return null;
        }

        const answer = targetWord.answer;
        const example = targetWord.example;

        // Create the blanked sentence using the FULL example for better context
        const regex = new RegExp(`\\b${answer}\\b`, 'gi');
        const formattedText = example.replace(regex, '_____');

        if (formattedText === example) {
            console.warn(`Could not find answer "${answer}" in example "${example}"`);
            return null;
        }

        // Generate SMART Distractors - avoiding plausible alternatives
        const distractors = this.generateSmartDistractors(targetWord, allQuestions, formattedText, 3);

        // Shuffle Word Bank (Target + Distractors)
        const wordBank = [answer, ...distractors].sort(() => Math.random() - 0.5);

        return {
            type: 'ClozePassage',
            passage_id: `cloze_${targetWord.id || targetWord.question_number}`,
            formatted_text: formattedText,
            question: formattedText, // Use as question for display
            target_word_id: targetWord.id || targetWord.question_number,
            answer: answer,
            word_bank: wordBank,
            options: wordBank.reduce((acc, word, i) => { acc[i + 1] = word; return acc; }, {}),
            original_question: targetWord
        };
    }

    /**
     * Generate SMART distractors that are clearly wrong in context.
     * Avoids selecting words that could also grammatically/semantically fit.
     * 
     * Strategy:
     * 1. Prefer antonyms (if available) - clearly wrong
     * 2. Avoid same-ending words (e.g., avoid other "-ive" words if answer ends in "-ive")
     * 3. Prefer different word lengths (makes it harder to guess by pattern)
     * 4. Avoid words from the same semantic cluster
     * 
     * @param {Object} targetWord 
     * @param {Array} allQuestions 
     * @param {string} sentence - The blanked sentence for context checking
     * @param {number} count 
     * @returns {string[]} Array of distractor words
     */
    generateSmartDistractors(targetWord, allQuestions, sentence, count) {
        const answer = targetWord.answer.toLowerCase();
        const answerSuffix = answer.slice(-3); // Last 3 chars (e.g., "ive" from "articulate")

        // Words that are likely same part of speech / semantic field to AVOID
        const semanticClusters = {
            // Speaking-related words (avoid mixing these)
            speaking: ['articulate', 'incoherent', 'unintelligible', 'eloquent', 'mute', 'verbose', 'taciturn', 'loquacious'],
            size: ['large', 'huge', 'enormous', 'tiny', 'small', 'minuscule', 'gigantic', 'massive'],
            speed: ['fast', 'quick', 'rapid', 'slow', 'sluggish', 'swift', 'gradual', 'hasty'],
            emotion: ['happy', 'sad', 'joyful', 'melancholy', 'ecstatic', 'depressed', 'elated', 'gloomy'],
            difficulty: ['easy', 'hard', 'simple', 'complex', 'difficult', 'straightforward', 'arduous', 'effortless']
        };

        // Find which cluster the target belongs to
        let targetCluster = null;
        for (const [cluster, words] of Object.entries(semanticClusters)) {
            if (words.includes(answer)) {
                targetCluster = cluster;
                break;
            }
        }

        // Get the cluster words to avoid
        const wordsToAvoid = targetCluster ? semanticClusters[targetCluster] : [];

        // Filter pool:
        let pool = allQuestions.filter(q => {
            if (!q.answer || q.answer === targetWord.answer) return false;

            const distractor = q.answer.toLowerCase();

            // Avoid words in same semantic cluster
            if (wordsToAvoid.includes(distractor)) return false;

            // Avoid words with same suffix (likely same part of speech pattern)
            if (distractor.slice(-3) === answerSuffix && distractor.length === answer.length) return false;

            // Avoid words that start with same letter AND same length (too similar)
            if (distractor[0] === answer[0] && Math.abs(distractor.length - answer.length) <= 1) return false;

            return true;
        });

        // If not enough after filtering, relax constraints
        if (pool.length < count) {
            pool = allQuestions.filter(q =>
                q.answer &&
                q.answer !== targetWord.answer &&
                !wordsToAvoid.includes(q.answer.toLowerCase())
            );
        }

        // Prioritize antonyms and clearly different words
        // Sort by: different theme first, then different difficulty level
        pool.sort((a, b) => {
            const aScore = (a.theme !== targetWord.theme ? 10 : 0) +
                Math.abs((a.difficulty || 5) - (targetWord.difficulty || 5));
            const bScore = (b.theme !== targetWord.theme ? 10 : 0) +
                Math.abs((b.difficulty || 5) - (targetWord.difficulty || 5));
            return bScore - aScore; // Higher score = more different = better distractor
        });

        // Take a random sample from the top candidates
        const topCandidates = pool.slice(0, Math.min(pool.length, count * 3));
        return topCandidates
            .sort(() => Math.random() - 0.5)
            .slice(0, count)
            .map(q => q.answer);
    }

    /**
     * Legacy method - still works but uses simple random selection
     * @deprecated Use generateSmartDistractors instead
     */
    generateDistractors(targetWord, allQuestions, count) {
        return this.generateSmartDistractors(targetWord, allQuestions, '', count);
    }
}
