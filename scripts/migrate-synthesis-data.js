import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Data Migration Script for Synthesis Questions
 * Adds answerParts field to all questions based on existing answer format
 */

const dataPath = path.join(__dirname, '../src/data/synthesis_transformation.json');
const questions = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

let migratedCount = 0;
let skippedCount = 0;

questions.forEach((q, idx) => {
    // Skip if already has answerParts
    if (q.answerParts) {
        skippedCount++;
        return;
    }

    // Only process synthesis type questions
    if (q.type !== 'synthesis' || !q.answer || !q.trigger_used) {
        skippedCount++;
        return;
    }

    // Generate answerParts based on trigger position
    const answer = q.answer;
    const trigger = q.trigger_used;

    // Find trigger in answer (case-insensitive)
    const triggerIndex = answer.toLowerCase().indexOf(trigger.toLowerCase());

    if (triggerIndex === -1) {
        console.warn(`Question ${q.id}: Trigger "${trigger}" not found in answer`);
        skippedCount++;
        return;
    }

    // Split answer into parts based on trigger position
    const beforeTrigger = answer.substring(0, triggerIndex);
    const afterTrigger = answer.substring(triggerIndex + trigger.length);

    // Build answerParts array
    const parts = [];

    // If trigger is at the start
    if (triggerIndex === 0) {
        parts.push({ type: 'locked', text: trigger });

        // Parse the rest for punctuation and blanks
        const remainder = afterTrigger.trim();
        const commaIndex = remainder.indexOf(',');
        const periodIndex = remainder.lastIndexOf('.');

        if (commaIndex > 0 && periodIndex > commaIndex) {
            // Pattern: "Although [blank], [blank]."
            const blank1 = remainder.substring(0, commaIndex).trim();
            const blank2 = remainder.substring(commaIndex + 1, periodIndex).trim();

            parts.push({ type: 'blank', expected: blank1 });
            parts.push({ type: 'locked', text: ',' });
            parts.push({ type: 'blank', expected: blank2 });
            parts.push({ type: 'locked', text: '.' });
        } else {
            // Fallback: single blank
            parts.push({ type: 'blank', expected: remainder.replace(/\.$/, '') });
            if (remainder.endsWith('.')) {
                parts.push({ type: 'locked', text: '.' });
            }
        }
    } else {
        // Trigger is in the middle - more complex parsing needed
        // For now, skip these and handle manually
        console.warn(`Question ${q.id}: Trigger mid-sentence - needs manual review`);
        skippedCount++;
        return;
    }

    // Add answerParts to question
    q.answerParts = parts;
    migratedCount++;
});

// Write back to file
fs.writeFileSync(dataPath, JSON.stringify(questions, null, 2), 'utf-8');

console.log(`✅ Migration complete!`);
console.log(`   Migrated: ${migratedCount}`);
console.log(`   Skipped: ${skippedCount}`);
console.log(`   Total: ${questions.length}`);
