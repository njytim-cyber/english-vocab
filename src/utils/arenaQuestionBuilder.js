/**
 * Arena Question Builder
 * Utilities for building mixed question sets and randomizing answer positions
 */

/**
 * Shuffles the options of a question so the answer isn't always in the same position
 * @param {Object} question - Question object with options and answer
 * @returns {Object} New question with shuffled options and updated answer_index
 */
export function shuffleOptions(question) {
    if (!question || !question.options || !question.answer) {
        return question;
    }

    // Get all options as an array of [key, value] pairs
    const optionEntries = Object.entries(question.options);

    // Shuffle the array using Fisher-Yates
    for (let i = optionEntries.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [optionEntries[i], optionEntries[j]] = [optionEntries[j], optionEntries[i]];
    }

    // Rebuild options object with new positions (1-indexed)
    const newOptions = {};
    let newAnswerIndex = 1;

    optionEntries.forEach(([_, value], index) => {
        const newKey = index + 1;
        newOptions[newKey] = value;

        // Track where the answer ended up
        if (value === question.answer) {
            newAnswerIndex = newKey;
        }
    });

    return {
        ...question,
        options: newOptions,
        answer_index: newAnswerIndex
    };
}

/**
 * Builds a mixed question set from multiple sources
 * @param {Object} sources - Object containing question arrays by type
 * @param {Array} sources.vocabMcq - Vocab MCQ questions
 * @param {Array} sources.vocabCloze - Vocab Cloze questions  
 * @param {Array} sources.grammarMcq - Grammar MCQ questions
 * @param {Array} sources.grammarCloze - Grammar Cloze questions
 * @param {Set} selectedTypes - Set of selected question types
 * @param {number} count - Total questions to select
 * @param {number} difficulty - Optional difficulty filter (1-10)
 * @returns {Array} Mixed and shuffled question array
 */
export function buildArenaQuestions(sources, selectedTypes, count = 10, difficulty = null) {
    const typeMap = {
        'vocab-mcq': { key: 'vocabMcq', type: 'vocab-mcq' },
        'vocab-cloze': { key: 'vocabCloze', type: 'vocab-cloze' },
        'grammar-mcq': { key: 'grammarMcq', type: 'grammar-mcq' },
        'grammar-cloze': { key: 'grammarCloze', type: 'grammar-cloze' }
    };

    // Collect all available questions from selected types
    let pool = [];

    selectedTypes.forEach(type => {
        const config = typeMap[type];
        if (!config) return;

        const questions = sources[config.key] || [];

        // Filter by difficulty if specified
        let filtered = questions;
        if (difficulty !== null) {
            filtered = questions.filter(q => {
                const qDiff = q.difficulty || 5;
                return Math.abs(qDiff - difficulty) <= 2; // Within 2 levels
            });
        }

        // Tag each question with its type
        const tagged = filtered.map(q => ({
            ...q,
            questionType: config.type,
            originalType: config.type
        }));

        pool = pool.concat(tagged);
    });

    // Shuffle the pool
    for (let i = pool.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [pool[i], pool[j]] = [pool[j], pool[i]];
    }

    // Take requested count
    const selected = pool.slice(0, count);

    // Shuffle options for each question
    return selected.map(q => shuffleOptions(q));
}

/**
 * Gets color theme for question type
 * @param {string} type - Question type
 * @returns {Object} Color config { primary, background }
 */
export function getQuestionTypeTheme(type) {
    const themes = {
        'vocab-mcq': { primary: '#667eea', background: '#667eea22', name: 'Vocab MCQ' },
        'vocab-cloze': { primary: '#10b981', background: '#10b98122', name: 'Vocab Cloze' },
        'grammar-mcq': { primary: '#f59e0b', background: '#f59e0b22', name: 'Grammar MCQ' },
        'grammar-cloze': { primary: '#d97706', background: '#d9770622', name: 'Grammar Cloze' }
    };
    return themes[type] || themes['vocab-mcq'];
}

/**
 * Flattens cloze passages into individual questions
 * @param {Array} passages - Array of ClozePassage objects
 * @param {string} type - 'vocab-cloze' or 'grammar-cloze'
 * @returns {Array} Array of single blank questions
 */
export function flattenClozePassages(passages, type) {
    if (!passages) return [];

    return passages.flatMap(passage => {
        if (!passage.paragraphs) return [];

        return passage.paragraphs.flatMap((para, pIndex) => {
            if (!para.blanks) return [];

            return para.blanks.map(blank => {
                // Create context by filling in OTHER blanks in this paragraph
                let questionText = para.text;

                // Replace other blanks with their answers
                para.blanks.forEach(b => {
                    if (b.id !== blank.id) {
                        const regex = new RegExp(`__${b.id}__`, 'g');
                        questionText = questionText.replace(regex, b.answer);
                    }
                });

                // Replace CURRENT blank with underscore placeholder
                const blankRegex = new RegExp(`__${blank.id}__`, 'g');
                questionText = questionText.replace(blankRegex, '________');

                // format options from array to object {1: 'a', 2: 'b', ...}
                // if they are already an array
                const optionsObj = {};
                if (Array.isArray(blank.options)) {
                    blank.options.forEach((opt, i) => {
                        optionsObj[i + 1] = opt;
                    });
                }

                // Find answer index 
                // Note: blank.options is array, we made 1-based keys.
                // We need to match blank.answer
                const answerIndex = Object.keys(optionsObj).find(key => optionsObj[key] === blank.answer);

                return {
                    id: `${type}_${passage.id}_${pIndex}_${blank.id}`,
                    type: type,
                    question: questionText,
                    originalQuestion: questionText, // for reference
                    options: optionsObj,
                    answer: blank.answer,
                    answer_index: parseInt(answerIndex), // Will be shuffled later so this is temp
                    difficulty: passage.difficulty || 5,
                    explanation: blank.explanation || null, // Grammar cloze has this
                    subunit: passage.category || passage.theme // Context
                };
            });
        });
    });
}

/**
 * Question type definitions for UI
 */
export const QUESTION_TYPES = [
    { id: 'vocab-mcq', name: 'Vocab MCQ', icon: '📝', color: '#667eea' },
    { id: 'vocab-cloze', name: 'Vocab Cloze', icon: '📖', color: '#10b981' },
    { id: 'grammar-mcq', name: 'Grammar MCQ', icon: '✏️', color: '#f59e0b' },
    { id: 'grammar-cloze', name: 'Grammar Cloze', icon: '📜', color: '#d97706' }
];
