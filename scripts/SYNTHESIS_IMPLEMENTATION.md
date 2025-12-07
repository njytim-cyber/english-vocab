# Synthesis & Transformation Implementation Plan

## Overview
Adding a new "Synthesis & Transformation" category to the Learn section, positioned between Spelling and Comprehension.

## Files Created

### 1. Template Structure
**File:** `scripts/synthesis_template.json`
- Defines 8 main categories with 24 subcategories total
- Each subcategory includes:
  - Difficulty level (1-9)
  - Transformation logic explanation
  - Trigger words/phrases
  - Example question and answer

### 2. Question Generator Script
**File:** `scripts/generate_synthesis_ai.py`
- Uses Vertex AI (Gemini 2.0 Flash Exp) to generate questions
- Target: 30 questions per subcategory = 720 total questions
- Output: `src/data/synthesis_transformation.json`

## Category Breakdown

### 1. Logical Connectors (6 subcategories)
- Contrast – Clause Takers (Difficulty: 2)
- Contrast – Noun Phrase Takers (Difficulty: 6)
- Cause & Effect – Clause Takers (Difficulty: 1)
- Cause & Effect – Noun Phrase Takers (Difficulty: 5)
- Time – Simultaneous Actions (Difficulty: 2)
- Time – Sequential Actions (Difficulty: 6)

### 2. Reported Speech (4 subcategories)
- Statements (Difficulty: 5)
- Questions – Yes/No (Difficulty: 6)
- Questions – WH- (Difficulty: 7)
- Imperatives (Difficulty: 4)

### 3. Voice Transformation (2 subcategories)
- Active to Passive (Difficulty: 4)
- Passive to Active (Difficulty: 4)

### 4. Conditional & Hypothetical (3 subcategories)
- Unless Transformation (Difficulty: 5)
- Hypothetical Type 2 (Difficulty: 6)
- Subjunctive/Negative Purpose (Difficulty: 9)

### 5. Word Class Transformation (3 subcategories)
- Adjective → Noun (Difficulty: 6)
- Verb → Noun (Difficulty: 6)
- Emotional Reaction (Difficulty: 7)

### 6. Correlative Conjunctions (2 subcategories)
- Inclusion/Parallelism (Difficulty: 5)
- Exclusion/Subject-Verb Agreement (Difficulty: 7)

### 7. Advanced Inversion (2 subcategories)
- Temporal Inversion (Difficulty: 8)
- Negative Inversion (Difficulty: 8)

### 8. Relative Clauses (2 subcategories)
- Object Pronoun (Difficulty: 5)
- Quantifier Phrases (Difficulty: 7)

## Usage Instructions

### Step 1: Set Up Environment
```bash
# Ensure Google Cloud credentials are set
# The script uses PROJECT_ID: vocab-gen-2025-njytim
# Location: us-central1

# If needed, authenticate:
gcloud auth application-default login
```

### Step 2: Run Generator
```bash
cd scripts
python generate_synthesis_ai.py
```

**Expected:**
- Generates 720 questions across 24 subcategories
- Each subcategory gets exactly 30 questions
- Output saved to: `src/data/synthesis_transformation.json`
- Estimated time: ~2-3 minutes (with 2-second rate limiting between subcategories)

### Step 3: Integration (After Generation)
Once questions are generated, we'll need to:

1. **Add to Router** - Update router to recognize "Synthesis" type
2. **Create Quiz View Component** - `SynthesisView.jsx` (similar to ClozeView)
3. **Update ContentSetup** - Add S&T option between Spelling and Comprehension
4. **Engine Support** - Ensure QuizEngine handles synthesis questions

## Data Schema

Each question in the output JSON will have:
```json
{
  "id": 1,
  "type": "synthesis",
  "category": "Logical Connectors",
  "subcategory": "Contrast (Concession) – Clause Takers",
  "difficulty": 2,
  "logic": "Direct combining using connectors...",
  "question": "The rain was heavy. We went hiking.",
  "answer": "Although the rain was heavy, we went hiking.",
  "trigger_used": "Although"
}
```

## Cost Estimate
- Model: Gemini 2.0 Flash Exp
- Requests: 24 subcategories
- Input tokens: ~500 per request
- Output tokens: ~3000 per request (30 questions)
- **Total cost: ~$0.10-0.20 USD** (using Vertex AI credits)

## Next Steps
1. ✅ Create template structure
2. ✅ Create generator script
3. ⏳ Run generation (waiting for user approval)
4. ⏳ Integrate into app
5. ⏳ Test and verify

## Questions for User
- Should we proceed with generation now?
- Any specific adjustments needed to the prompt or structure?
- Preferred positioning in the Learn menu?
