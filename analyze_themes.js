
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filePath = path.join(__dirname, 'src/data/questions.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

const themeCounts = {};
data.forEach(q => {
    themeCounts[q.theme] = (themeCounts[q.theme] || 0) + 1;
});

console.log('Total Questions:', data.length);
console.log('Unique Themes:', Object.keys(themeCounts).length);
console.log('Themes:', JSON.stringify(themeCounts, null, 2));
