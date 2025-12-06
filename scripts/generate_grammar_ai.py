"""
Grammar MCQ Generation Script using Vertex AI
Generates 20 questions per subunit (35 subunits = 700 questions total)
Uses parallel processing for speed

Usage: python generate_grammar_ai.py
"""

import json
import os
import asyncio
from concurrent.futures import ThreadPoolExecutor
from typing import List, Dict

try:
    import vertexai
    from vertexai.generative_models import GenerativeModel
except ImportError:
    print("Please install: pip install google-cloud-aiplatform")
    exit(1)

# Configuration
PROJECT_ID = os.environ.get("GOOGLE_CLOUD_PROJECT", "vocab-gen-2025-njytim")
LOCATION = "us-central1"
OUTPUT_FILE = os.path.join(os.path.dirname(__file__), "../src/data/grammar_questions_full.json")

# Grammar subunits with difficulty ranges
GRAMMAR_SUBUNITS = [
    # Nouns, Pronouns & Determiners
    {"id": 1, "name": "Countable vs. Uncountable Nouns", "category": "Nouns, Pronouns & Determiners", "difficulty_range": [1, 4]},
    {"id": 2, "name": "Collective Nouns", "category": "Nouns, Pronouns & Determiners", "difficulty_range": [2, 5]},
    {"id": 3, "name": "Possessive Pronouns vs. Adjectives", "category": "Nouns, Pronouns & Determiners", "difficulty_range": [2, 4]},
    {"id": 4, "name": "Reflexive Pronouns", "category": "Nouns, Pronouns & Determiners", "difficulty_range": [3, 5]},
    {"id": 5, "name": "Demonstrative Pronouns", "category": "Nouns, Pronouns & Determiners", "difficulty_range": [1, 3]},
    
    # Subject-Verb Agreement
    {"id": 6, "name": "Basic SVA (Singular/Plural)", "category": "Subject-Verb Agreement", "difficulty_range": [2, 4]},
    {"id": 7, "name": "The Proximity Rule (Neither/Nor, Either/Or)", "category": "Subject-Verb Agreement", "difficulty_range": [5, 7]},
    {"id": 8, "name": "The 'Together with / As well as' Rule", "category": "Subject-Verb Agreement", "difficulty_range": [5, 7]},
    {"id": 9, "name": "Indefinite Pronouns (Everyone, Nobody, Each)", "category": "Subject-Verb Agreement", "difficulty_range": [4, 6]},
    {"id": 10, "name": "Exception Nouns (News, Trousers, Scissors)", "category": "Subject-Verb Agreement", "difficulty_range": [4, 6]},
    
    # Tenses & Verb Forms
    {"id": 11, "name": "Simple Past vs. Present Perfect", "category": "Tenses & Verb Forms", "difficulty_range": [4, 6]},
    {"id": 12, "name": "Past Continuous vs. Simple Past", "category": "Tenses & Verb Forms", "difficulty_range": [4, 5]},
    {"id": 13, "name": "Past Perfect (Sequencing Actions)", "category": "Tenses & Verb Forms", "difficulty_range": [5, 7]},
    {"id": 14, "name": "Future Forms (Will vs. Going to)", "category": "Tenses & Verb Forms", "difficulty_range": [3, 5]},
    {"id": 15, "name": "Irregular Verbs", "category": "Tenses & Verb Forms", "difficulty_range": [3, 6]},
    
    # Adjectives, Adverbs & Comparison
    {"id": 16, "name": "Comparative & Superlative Forms", "category": "Adjectives, Adverbs & Comparison", "difficulty_range": [2, 4]},
    {"id": 17, "name": "Order of Adjectives", "category": "Adjectives, Adverbs & Comparison", "difficulty_range": [4, 6]},
    {"id": 18, "name": "Adverbs of Frequency & Manner", "category": "Adjectives, Adverbs & Comparison", "difficulty_range": [2, 4]},
    {"id": 19, "name": "Adjective vs. Adverb Confusion", "category": "Adjectives, Adverbs & Comparison", "difficulty_range": [3, 5]},
    
    # Prepositions & Phrasal Verbs
    {"id": 20, "name": "Prepositions of Time (at, on, in)", "category": "Prepositions & Phrasal Verbs", "difficulty_range": [2, 4]},
    {"id": 21, "name": "Prepositions of Place & Movement", "category": "Prepositions & Phrasal Verbs", "difficulty_range": [2, 4]},
    {"id": 22, "name": "Common Phrasal Verbs", "category": "Prepositions & Phrasal Verbs", "difficulty_range": [4, 7]},
    {"id": 23, "name": "Dependent Prepositions", "category": "Prepositions & Phrasal Verbs", "difficulty_range": [5, 7]},
    
    # Conditionals & Modals
    {"id": 24, "name": "Zero & First Conditionals", "category": "Conditionals & Modals", "difficulty_range": [3, 5]},
    {"id": 25, "name": "Second & Third Conditionals", "category": "Conditionals & Modals", "difficulty_range": [5, 7]},
    {"id": 26, "name": "Mixed Conditionals", "category": "Conditionals & Modals", "difficulty_range": [7, 9]},
    {"id": 27, "name": "Modal Verbs (Can/Could/May/Might)", "category": "Conditionals & Modals", "difficulty_range": [3, 5]},
    {"id": 28, "name": "Modal Perfects (Should have, Could have)", "category": "Conditionals & Modals", "difficulty_range": [6, 8]},
    
    # Advanced Structures
    {"id": 29, "name": "Reported Speech", "category": "Advanced Structures", "difficulty_range": [5, 7]},
    {"id": 30, "name": "Passive Voice", "category": "Advanced Structures", "difficulty_range": [4, 6]},
    {"id": 31, "name": "Relative Clauses (Defining/Non-defining)", "category": "Advanced Structures", "difficulty_range": [5, 7]},
    {"id": 32, "name": "The Subjunctive Mood", "category": "Advanced Structures", "difficulty_range": [7, 9]},
    {"id": 33, "name": "Inversion for Emphasis", "category": "Advanced Structures", "difficulty_range": [7, 9]},
    {"id": 34, "name": "Cleft Sentences (It is...that)", "category": "Advanced Structures", "difficulty_range": [7, 9]},
    {"id": 35, "name": "Participle Clauses", "category": "Advanced Structures", "difficulty_range": [6, 8]},
]

QUESTIONS_PER_SUBUNIT = 20

def init_vertex_ai():
    """Initialize Vertex AI."""
    vertexai.init(project=PROJECT_ID, location=LOCATION)
    return GenerativeModel("gemini-2.0-flash-001")

def generate_questions_for_subunit(model: GenerativeModel, subunit: Dict) -> List[Dict]:
    """Generate questions for a single subunit."""
    
    min_diff, max_diff = subunit["difficulty_range"]
    
    prompt = f"""Generate {QUESTIONS_PER_SUBUNIT} unique grammar MCQ questions for Singapore students.

Grammar Topic: {subunit["name"]}
Category: {subunit["category"]}
Difficulty Range: {min_diff}-{max_diff} (1-3 = Lower Primary, 4-6 = Upper Primary, 7-9 = Secondary/JC)

For EACH question, provide a JSON object with:
- "question": A sentence with ________ as the blank to fill
- "options": Object with keys "1", "2", "3", "4" for 4 answer choices
- "answer": The correct answer (must match one of the options)
- "answer_index": Which option number is correct (1, 2, 3, or 4)
- "subunit": "{subunit["name"]}"
- "difficulty": Number within {min_diff}-{max_diff}
- "explanation": Clear explanation of WHY the answer is correct (2-3 sentences)
- "example": An additional example sentence using the correct grammar

IMPORTANT RULES:
- Distribute questions evenly across the difficulty range
- Use age-appropriate vocabulary for each difficulty level
- All 4 options must be grammatically plausible but only 1 is correct
- Explanations should teach the grammar rule clearly

Return ONLY a valid JSON array, no markdown.
"""

    try:
        response = model.generate_content(prompt)
        text = response.text.strip()
        
        # Clean markdown if present
        if text.startswith("```"):
            text = text.split("```")[1]
            if text.startswith("json"):
                text = text[4:]
        text = text.strip()
        
        questions = json.loads(text)
        
        # Validate and add metadata
        valid_questions = []
        for q in questions:
            if q.get("question") and q.get("answer"):
                q["category"] = subunit["category"]
                valid_questions.append(q)
        
        return valid_questions
        
    except Exception as e:
        print(f"  Error for {subunit['name']}: {e}")
        return []

def main():
    print("=" * 60)
    print("GRAMMAR MCQ GENERATION - Parallel Processing")
    print(f"Target: {len(GRAMMAR_SUBUNITS)} subunits × {QUESTIONS_PER_SUBUNIT} questions = {len(GRAMMAR_SUBUNITS) * QUESTIONS_PER_SUBUNIT} total")
    print("=" * 60)
    
    model = init_vertex_ai()
    all_questions = []
    
    # Use ThreadPoolExecutor for parallel processing
    max_workers = 5  # Limit concurrent API calls
    
    print(f"\nUsing {max_workers} parallel workers...")
    
    with ThreadPoolExecutor(max_workers=max_workers) as executor:
        futures = {
            executor.submit(generate_questions_for_subunit, model, subunit): subunit
            for subunit in GRAMMAR_SUBUNITS
        }
        
        completed = 0
        for future in futures:
            subunit = futures[future]
            try:
                questions = future.result()
                all_questions.extend(questions)
                completed += 1
                print(f"  [{completed}/{len(GRAMMAR_SUBUNITS)}] {subunit['name']}: {len(questions)} questions")
            except Exception as e:
                print(f"  [{completed}/{len(GRAMMAR_SUBUNITS)}] {subunit['name']}: FAILED - {e}")
    
    # Assign question numbers
    print("\nAssigning question numbers...")
    for i, q in enumerate(all_questions):
        q["question_number"] = i + 1
    
    # Save results
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(all_questions, f, indent=2, ensure_ascii=False)
    
    print(f"\n{'=' * 60}")
    print(f"COMPLETE: {len(all_questions)} questions generated")
    print(f"Saved to: {OUTPUT_FILE}")
    print("=" * 60)
    
    # Summary by category
    categories = {}
    for q in all_questions:
        cat = q.get("category", "Unknown")
        categories[cat] = categories.get(cat, 0) + 1
    
    print("\nBy Category:")
    for cat, count in sorted(categories.items()):
        print(f"  {cat}: {count} questions")

if __name__ == "__main__":
    main()
