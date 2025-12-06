#!/usr/bin/env node
/**
 * Data Quality Audit Script
 * 
 * Run: node scripts/audit-questions.js
 * 
 * Checks:
 * 1. Duplicate answers (same word appearing multiple times)
 * 2. Missing difficulty values
 * 3. Difficulty distribution (are all levels represented?)
 * 4. Missing required fields
 * 5. Empty or invalid answers
 * 6. Theme distribution
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const questionsPath = path.join(__dirname, '../src/data/questions.json');
const questions = JSON.parse(fs.readFileSync(questionsPath, 'utf-8'));

console.log('╔════════════════════════════════════════════════════════════════╗');
console.log('║               📊 QUESTIONS DATA QUALITY AUDIT                  ║');
console.log('╚════════════════════════════════════════════════════════════════╝\n');

console.log(`📁 File: ${questionsPath}`);
console.log(`📝 Total Questions: ${questions.length}\n`);

// 1. Check for duplicates
console.log('═══════════════════════════════════════════════════════════════');
console.log('1️⃣  DUPLICATE ANSWERS');
console.log('═══════════════════════════════════════════════════════════════');

const answerCounts = {};
questions.forEach((q, idx) => {
    const answer = (q.answer || '').toLowerCase().trim();
    if (!answerCounts[answer]) {
        answerCounts[answer] = [];
    }
    answerCounts[answer].push({ idx, id: q.id || q.question_number });
});

const duplicates = Object.entries(answerCounts)
    .filter(([_, occurrences]) => occurrences.length > 1)
    .sort((a, b) => b[1].length - a[1].length);

if (duplicates.length > 0) {
    console.log(`⚠️  Found ${duplicates.length} duplicate answers:\n`);
    duplicates.slice(0, 20).forEach(([answer, occurrences]) => {
        console.log(`   "${answer}" appears ${occurrences.length}x (IDs: ${occurrences.map(o => o.id).join(', ')})`);
    });
    if (duplicates.length > 20) {
        console.log(`   ... and ${duplicates.length - 20} more duplicates`);
    }
} else {
    console.log('✅ No duplicate answers found');
}

// 2. Missing difficulty
console.log('\n═══════════════════════════════════════════════════════════════');
console.log('2️⃣  MISSING DIFFICULTY VALUES');
console.log('═══════════════════════════════════════════════════════════════');

const missingDifficulty = questions.filter(q => q.difficulty === undefined || q.difficulty === null);
if (missingDifficulty.length > 0) {
    console.log(`⚠️  ${missingDifficulty.length} questions missing difficulty:`);
    missingDifficulty.slice(0, 10).forEach(q => {
        console.log(`   ID: ${q.id || q.question_number} - "${(q.answer || q.question || '').substring(0, 30)}..."`);
    });
} else {
    console.log('✅ All questions have difficulty values');
}

// 3. Difficulty distribution
console.log('\n═══════════════════════════════════════════════════════════════');
console.log('3️⃣  DIFFICULTY DISTRIBUTION');
console.log('═══════════════════════════════════════════════════════════════');

const difficultyDist = {};
questions.forEach(q => {
    const d = q.difficulty ?? 'undefined';
    difficultyDist[d] = (difficultyDist[d] || 0) + 1;
});

const sortedDiff = Object.entries(difficultyDist).sort((a, b) => {
    if (a[0] === 'undefined') return 1;
    if (b[0] === 'undefined') return -1;
    return Number(a[0]) - Number(b[0]);
});

console.log('\n   Level  │  Count  │  Percentage  │  Bar');
console.log('   ───────┼─────────┼──────────────┼────────────────────');
const maxCount = Math.max(...Object.values(difficultyDist));
sortedDiff.forEach(([level, count]) => {
    const pct = ((count / questions.length) * 100).toFixed(1);
    const barLen = Math.round((count / maxCount) * 20);
    const bar = '█'.repeat(barLen) + '░'.repeat(20 - barLen);
    console.log(`   ${String(level).padStart(5)}  │  ${String(count).padStart(5)}  │  ${pct.padStart(10)}%  │  ${bar}`);
});

// Check for missing levels
const expectedLevels = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const missingLevels = expectedLevels.filter(l => !difficultyDist[l]);
if (missingLevels.length > 0) {
    console.log(`\n⚠️  Missing difficulty levels: ${missingLevels.join(', ')}`);
}

// 4. Missing required fields
console.log('\n═══════════════════════════════════════════════════════════════');
console.log('4️⃣  MISSING REQUIRED FIELDS');
console.log('═══════════════════════════════════════════════════════════════');

const requiredFields = ['question', 'answer', 'options'];
const fieldMissing = {};

questions.forEach((q, idx) => {
    requiredFields.forEach(field => {
        if (!q[field]) {
            if (!fieldMissing[field]) fieldMissing[field] = [];
            fieldMissing[field].push(q.id || q.question_number || idx);
        }
    });
});

if (Object.keys(fieldMissing).length > 0) {
    Object.entries(fieldMissing).forEach(([field, ids]) => {
        console.log(`⚠️  "${field}" missing in ${ids.length} questions (IDs: ${ids.slice(0, 5).join(', ')}${ids.length > 5 ? '...' : ''})`);
    });
} else {
    console.log('✅ All required fields present');
}

// 5. Theme distribution
console.log('\n═══════════════════════════════════════════════════════════════');
console.log('5️⃣  THEME DISTRIBUTION');
console.log('═══════════════════════════════════════════════════════════════');

const themeDist = {};
questions.forEach(q => {
    const theme = q.theme || 'No Theme';
    themeDist[theme] = (themeDist[theme] || 0) + 1;
});

const sortedThemes = Object.entries(themeDist).sort((a, b) => b[1] - a[1]);
console.log(`\n   Found ${sortedThemes.length} themes:\n`);
sortedThemes.slice(0, 15).forEach(([theme, count]) => {
    const pct = ((count / questions.length) * 100).toFixed(1);
    console.log(`   ${theme.padEnd(25)} ${String(count).padStart(5)} (${pct}%)`);
});
if (sortedThemes.length > 15) {
    console.log(`   ... and ${sortedThemes.length - 15} more themes`);
}

// 6. Summary
console.log('\n═══════════════════════════════════════════════════════════════');
console.log('📋 SUMMARY');
console.log('═══════════════════════════════════════════════════════════════');

const issues = [];
if (duplicates.length > 0) issues.push(`${duplicates.length} duplicate answers`);
if (missingDifficulty.length > 0) issues.push(`${missingDifficulty.length} missing difficulty`);
if (missingLevels.length > 0) issues.push(`Missing difficulty levels: ${missingLevels.join(', ')}`);
if (Object.keys(fieldMissing).length > 0) issues.push('Missing required fields');

if (issues.length === 0) {
    console.log('\n✅ Data quality: EXCELLENT - No issues found!\n');
} else {
    console.log(`\n⚠️  Data quality issues found (${issues.length}):`);
    issues.forEach(issue => console.log(`   • ${issue}`));
    console.log('\n');
}

// Export report as JSON for programmatic use
const report = {
    timestamp: new Date().toISOString(),
    totalQuestions: questions.length,
    duplicateAnswers: duplicates.length,
    missingDifficulty: missingDifficulty.length,
    missingLevels,
    difficultyDistribution: difficultyDist,
    themeCount: sortedThemes.length,
    issues
};

const reportPath = path.join(__dirname, '../docs/data-quality-report.json');
fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
console.log(`📄 Report saved to: ${reportPath}\n`);
