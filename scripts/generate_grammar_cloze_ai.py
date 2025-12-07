"""
Grammar Cloze Generation Script using Vertex AI
Generates comprehensive grammar cloze passages with mixed topics.

Specification:
- 5 paragraphs per passage
- 4 sentences per paragraph  
- 2 grammar questions per paragraph (10 total/passage)
- Covers all 35 grammar subunits

Usage: python generate_grammar_cloze_ai.py
"""

import json
import os
import time
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
OUTPUT_FILE = os.path.join(os.path.dirname(__file__), "../src/data/grammar_cloze_full.json")

# Grammar subunits (same as MCQ)
GRAMMAR_SUBUNITS = [
    # Nouns, Pronouns & Determiners
    {"name": "Countable vs. Uncountable Nouns", "category": "Nouns, Pronouns & Determiners"},
    {"name": "Collective Nouns", "category": "Nouns, Pronouns & Determiners"},
    {"name": "Possessive Pronouns vs. Adjectives", "category": "Nouns, Pronouns & Determiners"},
    {"name": "Reflexive Pronouns", "category": "Nouns, Pronouns & Determiners"},
    {"name": "Demonstrative Pronouns", "category": "Nouns, Pronouns & Determiners"},
    
    # Subject-Verb Agreement
    {"name": "Basic SVA (Singular/Plural)", "category": "Subject-Verb Agreement"},
    {"name": "The Proximity Rule (Neither/Nor, Either/Or)", "category": "Subject-Verb Agreement"},
    {"name": "The 'Together with / As well as' Rule", "category": "Subject-Verb Agreement"},
    {"name": "Indefinite Pronouns (Everyone, Nobody, Each)", "category": "Subject-Verb Agreement"},
    {"name": "Exception Nouns (News, Trousers, Scissors)", "category": "Subject-Verb Agreement"},
    
    # Tenses & Verb Forms
    {"name": "Simple Past vs. Present Perfect", "category": "Tenses & Verb Forms"},
    {"name": "Past Continuous vs. Simple Past", "category": "Tenses & Verb Forms"},
    {"name": "Past Perfect (Sequencing Actions)", "category": "Tenses & Verb Forms"},
    {"name": "Future Forms (Will vs. Going to)", "category": "Tenses & Verb Forms"},
    {"name": "Irregular Verbs", "category": "Tenses & Verb Forms"},
    
    # Adjectives, Adverbs & Comparison
    {"name": "Comparative & Superlative Forms", "category": "Adjectives, Adverbs & Comparison"},
    {"name": "Order of Adjectives", "category": "Adjectives, Adverbs & Comparison"},
    {"name": "Adverbs of Frequency & Manner", "category": "Adjectives, Adverbs & Comparison"},
    {"name": "Adjective vs. Adverb Confusion", "category": "Adjectives, Adverbs & Comparison"},
    
    # Prepositions & Phrasal Verbs
    {"name": "Prepositions of Time (at, on, in)", "category": "Prepositions & Phrasal Verbs"},
    {"name": "Prepositions of Place & Movement", "category": "Prepositions & Phrasal Verbs"},
    {"name": "Common Phrasal Verbs", "category": "Prepositions & Phrasal Verbs"},
    {"name": "Dependent Prepositions", "category": "Prepositions & Phrasal Verbs"},
    
    # Conditionals & Modals
    {"name": "Zero & First Conditionals", "category": "Conditionals & Modals"},
    {"name": "Second & Third Conditionals", "category": "Conditionals & Modals"},
    {"name": "Mixed Conditionals", "category": "Conditionals & Modals"},
    {"name": "Modal Verbs (Can/Could/May/Might)", "category": "Conditionals & Modals"},
    {"name": "Modal Perfects (Should have, Could have)", "category": "Conditionals & Modals"},
    
    # Advanced Structures
    {"name": "Reported Speech", "category": "Advanced Structures"},
    {"name": "Passive Voice", "category": "Advanced Structures"},
    {"name": "Relative Clauses (Defining/Non-defining)", "category": "Advanced Structures"},
    {"name": "The Subjunctive Mood", "category": "Advanced Structures"},
    {"name": "Inversion for Emphasis", "category": "Advanced Structures"},
    {"name": "Cleft Sentences (It is...that)", "category": "Advanced Structures"},
    {"name": "Participle Clauses", "category": "Advanced Structures"},
]

def init_vertex_ai():
    """Initialize Vertex AI."""
    vertexai.init(project=PROJECT_ID, location=LOCATION)
    return GenerativeModel("gemini-2.0-flash-001")

def generate_passage(model: GenerativeModel, passage_id: int, difficulty: int) -> Dict:
    """Generate a single grammar cloze passage with mixed topics."""
    
    # Select 5 random subunits for this passage (one per paragraph)
    import random
    selected_subunits = random.sample(GRAMMAR_SUBUNITS, 5)
    
    subunit_list = "\n".join([f"  Paragraph {i+1}: {s['name']}" for i, s in enumerate(selected_subunits)])
    
    prompt = f"""Generate a coherent grammar cloze passage for Singapore students.

Difficulty Level: {difficulty} (1-3: Primary, 4-6: Secondary, 7-9: JC)

STRUCTURE REQUIREMENTS:
- EXACTLY 5 paragraphs
- EXACTLY 4 sentences per paragraph
- EXACTLY 2 grammar blanks per paragraph (10 total)

GRAMMAR TOPICS (one per paragraph):
{subunit_list}

For each paragraph, create 4 well-connected sentences with 2 blanks testing the assigned grammar topic.

Return a JSON object with:
- "title": Engaging passage title
- "paragraphs": Array of 5 objects, each with:
    - "text": The 4-sentence paragraph with blanks marked as __1__, __2__, etc. (sequential numbering 1-10)
    - "blanks": Array of 2 objects with:
        - "id": The blank number (1-10)
        - "answer": Correct word (lowercase)
        - "options": Array of 4 options (1 correct + 3 distractors)
        - "subunit": The grammar topic being tested
        - "explanation": Why the answer is correct (2-3 sentences)

CRITICAL:
- Blanks must be numbered 1-10 SEQUENTIALLY across all paragraphs
- Each paragraph must have EXACTLY 4 sentences
- Grammar must be contextually integrated, not artificial
- Distractors must be grammatically plausible but contextually wrong

Return ONLY valid JSON, no markdown."""

    try:
        response = model.generate_content(prompt)
        text = response.text.strip()
        
        # Clean markdown
        if text.startswith("```"):
            text = text.split("```")[1]
            if text.startswith("json"):
                text = text[4:]
        text = text.strip()
        
        passage = json.loads(text)
        
        # Add metadata
        passage["id"] = passage_id
        passage["type"] = "GrammarCloze"
        passage["difficulty"] = difficulty
        passage["category"] = "Mixed Grammar"
        
        # Verify and count blanks
        total_blanks = sum(len(p.get("blanks", [])) for p in passage.get("paragraphs", []))
        passage["totalBlanks"] = total_blanks
        
        return passage
        
    except Exception as e:
        print(f"  Error generating passage {passage_id}: {e}")
        return None

def main():
    print("=" * 60)
    print("GRAMMAR CLOZE GENERATION")
    print("Mixed Topics | 5 Paragraphs × 4 Sentences × 2 Questions")
    print("=" * 60)
    
    model = init_vertex_ai()
    all_passages = []
    
    # Target distribution by difficulty
    targets = {
        3: 20,  # Primary 3-4
        4: 20,  # Primary 5-6 (PSLE)
        5: 20,  # Secondary 1-2
        6: 20,  # Secondary 3-4 (O-Level)
        7: 20   # JC (A-Level)
    }
    
    passage_id = 1
    
    for difficulty, count in targets.items():
        print(f"\n=== Difficulty {difficulty} ({count} passages) ===")
        
        for i in range(count):
            print(f"  Generating passage {i+1}/{count}...", end=" ", flush=True)
            
            passage = generate_passage(model, passage_id, difficulty)
            
            if passage:
                all_passages.append(passage)
                passage_id += 1
                print(f"Done ({passage.get('totalBlanks', 0)} blanks)")
            else:
                print("FAILED")
            
            time.sleep(1)  # Rate limit
    
    # Save results
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(all_passages, f, indent=2, ensure_ascii=False)
    
    print(f"\n{'=' * 60}")
    print(f"COMPLETE: {len(all_passages)} passages generated")
    print(f"Saved to: {OUTPUT_FILE}")
    print("=" * 60)

if __name__ == "__main__":
    main()
