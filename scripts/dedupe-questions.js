#!/usr/bin/env node
/**
 * Deduplicate Questions Script
 * 
 * Run: node scripts/dedupe-questions.js
 * 
 * Removes duplicate answers from questions.json, keeping only the first occurrence.
 * Creates a backup before modifying.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const questionsPath = path.join(__dirname, '../src/data/questions.json');
const backupPath = path.join(__dirname, '../src/data/questions.backup.json');

console.log('╔════════════════════════════════════════════════════════════════╗');
console.log('║               🔧 QUESTIONS DEDUPLICATION SCRIPT                ║');
console.log('╚════════════════════════════════════════════════════════════════╝\n');

// Read original data
const questions = JSON.parse(fs.readFileSync(questionsPath, 'utf-8'));
console.log(`📁 Original file: ${questionsPath}`);
console.log(`📝 Original count: ${questions.length}\n`);

// Create backup
fs.writeFileSync(backupPath, JSON.stringify(questions, null, 2));
console.log(`💾 Backup created: ${backupPath}\n`);

// Deduplicate by answer (case-insensitive)
const seenAnswers = new Set();
const dedupedQuestions = [];
const removedDuplicates = [];

questions.forEach((q, idx) => {
    const answer = (q.answer || '').toLowerCase().trim();

    if (!seenAnswers.has(answer)) {
        seenAnswers.add(answer);
        dedupedQuestions.push(q);
    } else {
        removedDuplicates.push({
            id: q.id || q.question_number || idx,
            answer: q.answer,
            question: (q.question || '').substring(0, 50)
        });
    }
});

console.log('═══════════════════════════════════════════════════════════════');
console.log('📊 DEDUPLICATION RESULTS');
console.log('═══════════════════════════════════════════════════════════════\n');

console.log(`   Original questions:  ${questions.length}`);
console.log(`   After deduplication: ${dedupedQuestions.length}`);
console.log(`   Duplicates removed:  ${removedDuplicates.length}`);
console.log(`   Reduction:           ${((removedDuplicates.length / questions.length) * 100).toFixed(1)}%\n`);

if (removedDuplicates.length > 0) {
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('🗑️  REMOVED DUPLICATES (first 20)');
    console.log('═══════════════════════════════════════════════════════════════\n');

    removedDuplicates.slice(0, 20).forEach(dup => {
        console.log(`   ❌ "${dup.answer}" (ID: ${dup.id})`);
    });

    if (removedDuplicates.length > 20) {
        console.log(`   ... and ${removedDuplicates.length - 20} more\n`);
    }
}

// Write deduplicated data
fs.writeFileSync(questionsPath, JSON.stringify(dedupedQuestions, null, 2));
console.log(`\n✅ Deduplicated file saved: ${questionsPath}`);

// Save removal log
const logPath = path.join(__dirname, '../docs/deduplication-log.json');
fs.writeFileSync(logPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    originalCount: questions.length,
    newCount: dedupedQuestions.length,
    removedCount: removedDuplicates.length,
    removedItems: removedDuplicates
}, null, 2));
console.log(`📄 Removal log saved: ${logPath}\n`);

console.log('╔════════════════════════════════════════════════════════════════╗');
console.log('║                    ✅ DEDUPLICATION COMPLETE                   ║');
console.log('╚════════════════════════════════════════════════════════════════╝\n');
