# Synthesis & Transformation Integration Checklist

## ✅ Completed
1. Created `scripts/synthesis_template.json` - Structure template
2. Created `scripts/generate_synthesis_ai.py` - Generation script
3. Created `src/components/SynthesisView.jsx` - UI component
4. **Generation running:** Currently at 16/24 subcategories

## ⏳ Pending (After Generation Completes)

### 1. Add Synthesis Card to LearnHub
**File:** `src/components/LearnHub.jsx`

Insert between Spelling (line 43-50) and Comprehension (line 51-58):

```javascript
{
    id: 'synthesis',
    title: 'Synthesis & Transformation',
    icon: '🔄',
    description: 'Combine sentences using grammar rules',
    color: '#8b5cf6',
    action: () => onNavigate('synthesis-setup')
},
```

### 2. Add Router Integration
**File:** `src/Router.jsx`

**A. Add imports (around line 42):**
```javascript
import SynthesisView from './components/SynthesisView';
import synthesisQuestions from './data/synthesis_transformation.json';
```

**B. Add state (around line 61):**
```javascript
const [synthesisIndex, setSynthesisIndex] = useState(0);
const [filteredSynthesis, setFilteredSynthesis] = useState(null);
```

**C. Add Setup View (after comprehension-setup, around line 245):**
```javascript
{view === 'synthesis-setup' && (
    <ContentSetup
        title="Synthesis & Transformation Setup"
        data={synthesisQuestions}
        themeKey="category"
        onStart={(filtered) => {
            setFilteredSynthesis(filtered);
            setSynthesisIndex(0);
            setView('synthesis');
        }}
        onBack={() => setView('learn')}
    />
)}
```

**D. Add Quiz View (after comprehension, around line 301):**
```javascript
{view === 'synthesis' && (
    <SynthesisView
        questions={filteredSynthesis || synthesisQuestions}
        currentIndex={synthesisIndex}
        onComplete={(nextIndex) => {
            if (nextIndex === -1) {
                setView('synthesis-setup');
            } else {
                setSynthesisIndex(nextIndex);
            }
        }}
        onBack={() => setView('synthesis-setup')}
        economy={economy}
        spacedRep={spacedRep}
    />
)}
```

### 3. Test Integration
```bash
# Run dev server
npm run dev

# Navigate: Learn → Synthesis & Transformation
# Verify:
# 1. Setup screen shows 8 categories
# 2. Difficulty filter works (1-9)
# 3. Questions display correctly
# 4. Answer checking works
# 5. Navigation works (Next/Back)
```

### 4. Verification Steps
- [ ] Generation completed successfully (720 questions)
- [ ] JSON file valid (`src/data/synthesis_transformation.json`)
- [ ] Synthesis card appears in Learn menu
- [ ] Setup screen loads with categories
- [ ] Questions display properly
- [ ] Answer validation works
- [ ] Rewards granted correctly
- [ ] Navigation flows correctly

## Expected Data Structure
Each question in JSON should have:
- `id`: Unique number
- `type`: "synthesis"
- `category`: Main category (e.g., "Logical Connectors")
- `subcategory`: Specific type
- `difficulty`: 1-9
- `logic`: Explanation of transformation
- `question`: Two sentences to combine
- `answer`: Correct combined sentence
- `trigger_used`: Key word/phrase used

## Next Steps After Integration
1. Run build to check for errors
2. Test on mobile (responsive design)
3. Add to ReviseHub if needed
4. Update ProgressHub to track S&T progress
5. Commit and push changes
