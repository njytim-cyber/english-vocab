/**
 * Data Manifest - Production Question Bank
 * 
 * CRITICAL: This is the SINGLE SOURCE OF TRUTH for all question data imports.
 * Always import from this file to ensure you're using production data.
 * 
 * Usage:
 *   import { VOCAB_MCQ, GRAMMAR_CLOZE, getSynthesisQuestions } from '../data/dataManifest';
 */

// ===== PRODUCTION DATA FILES =====
import vocabMCQ from './questions.json';
import synthesisRaw from './synthesis_transformation.json';
import grammarMCQ from './grammar_questions_full.json';
import grammarCloze from './grammar_cloze_full.json';
import vocabCloze from './cloze_generated.json';
import spelling from './spelling_words.json';
import comprehension from './comprehension_full.json';
import balance from './balance.json';

// ===== QUESTION COUNTS (for verification) =====
export const QUESTION_COUNTS = {
    VOCAB_MCQ: vocabMCQ.length,
    GRAMMAR_MCQ: grammarMCQ.length,
    VOCAB_CLOZE: vocabCloze.length,
    GRAMMAR_CLOZE: grammarCloze.length,
    SPELLING: spelling.length,  // Now includes all spelling words (basic + advanced)
    SYNTHESIS: synthesisRaw.length,
    COMPREHENSION: comprehension.length
};

// ===== EXPORTED DATA =====
export const VOCAB_MCQ = vocabMCQ;
export const GRAMMAR_MCQ = grammarMCQ;
export const VOCAB_CLOZE = vocabCloze;
export const GRAMMAR_CLOZE = grammarCloze;
export const SPELLING = spelling;  // Combined basic + advanced (1,526 words)
export const COMPREHENSION = comprehension;
export const BALANCE = balance;

// ===== SYNTHESIS QUESTIONS (with answerParts) =====
export function getSynthesisQuestions() {
    return synthesisRaw.filter(q => q.type === 'synthesis');
}

export function getTransformationQuestions() {
    return synthesisRaw.filter(q => q.type === 'transformation');
}

export const SYNTHESIS_ALL = synthesisRaw;

// ===== UTILITY FUNCTIONS =====
export function getQuestionsByType(type) {
    switch (type) {
        case 'vocab-mcq':
            return VOCAB_MCQ;
        case 'grammar-mcq':
            return GRAMMAR_MCQ;
        case 'vocab-cloze':
            return VOCAB_CLOZE;
        case 'grammar-cloze':
            return GRAMMAR_CLOZE;
        case 'spelling':
            return SPELLING;
        case 'synthesis':
            return getSynthesisQuestions();
        case 'comprehension':
            return COMPREHENSION;
        default:
            throw new Error(`Unknown question type: ${type}`);
    }
}

export function getAllQuestions() {
    return [
        ...VOCAB_MCQ,
        ...GRAMMAR_MCQ,
        ...VOCAB_CLOZE,
        ...GRAMMAR_CLOZE,
        ...SPELLING,
        ...SYNTHESIS_ALL,
        ...COMPREHENSION
    ];
}

// ===== DATA VALIDATION =====
if (process.env.NODE_ENV !== 'production') {
    console.log('📊 Question Bank Loaded:');
    console.log(`  Vocab MCQ:           ${QUESTION_COUNTS.VOCAB_MCQ.toLocaleString()}`);
    console.log(`  Grammar MCQ:         ${QUESTION_COUNTS.GRAMMAR_MCQ.toLocaleString()}`);
    console.log(`  Vocab Cloze:         ${QUESTION_COUNTS.VOCAB_CLOZE.toLocaleString()}`);
    console.log(`  Grammar Cloze:       ${QUESTION_COUNTS.GRAMMAR_CLOZE.toLocaleString()}`);
    console.log(`  Spelling:            ${QUESTION_COUNTS.SPELLING.toLocaleString()}`);
    console.log(`  Synthesis:           ${QUESTION_COUNTS.SYNTHESIS.toLocaleString()}`);
    console.log(`  Comprehension:       ${QUESTION_COUNTS.COMPREHENSION.toLocaleString()}`);
    console.log(`  TOTAL:               ${getAllQuestions().length.toLocaleString()}`);
}
