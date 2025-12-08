/**
 * Generate Augmented Spelling List
 * Extracts challenging vocabulary words (difficulty 4-9) from questions.json
 * to create an expanded spelling practice list.
 */

const fs = require('fs');
const path = require('path');

const vocabPath = path.join(__dirname, '../questions.json');
const outputPath = path.join(__dirname, '../spelling_augmented.json');

// Load vocab questions
const vocab = JSON.parse(fs.readFileSync(vocabPath, 'utf8'));

// Extract challenging words (difficulty 4-9)
const hardWords = vocab
    .filter(q => q.difficulty >= 4 && q.difficulty <= 9)
    .map(q => ({
        word: q.answer,
        difficulty: q.difficulty,
        definition: q.definition,
        example: q.example,
        theme: q.theme
    }));

console.log(`✅ Extracted ${hardWords.length} challenging words (difficulty 4-9)`);
console.log('\nSample words:');
hardWords.slice(0, 5).forEach(w => {
    console.log(`  ${w.word} (diff ${w.difficulty}): ${w.definition.substring(0, 60)}...`);
});

// Write to file
fs.writeFileSync(outputPath, JSON.stringify(hardWords, null, 2));
console.log(`\n✅ Written to spelling_augmented.json`);
console.log(`📊 Total augmented spelling words: ${hardWords.length}`);
