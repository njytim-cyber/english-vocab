"""
Reading Comprehension Generation Script using Vertex AI
Generates comprehension passages with multiple-choice questions.

Target: 100 passages across difficulty levels (1-9)
- 5-8 questions per passage
- Variety of question types (literal, inferential, vocabulary)

Usage: python generate_comprehension_ai.py
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
OUTPUT_FILE = os.path.join(os.path.dirname(__file__), "../src/data/comprehension_full.json")

# Themes
THEMES = [
    "Animals & Nature", "Science & Technology", "History & Culture",
    "Sports & Games", "Health & Wellness", "Arts & Literature",
    "Geography & Travel", "Social Issues", "Biography & Achievement",
    "Environment & Climate", "Food & Nutrition", "Education & Learning"
]

# Difficulty descriptions
DIFFICULTY_LEVELS = {
    2: "Primary 2-3: Simple narratives, 150-200 words, literal questions",
    3: "Primary 4: Stories with lessons, 200-250 words, basic inference",
    4: "Primary 5-6 (PSLE): Complex narratives, 300-350 words, inference + vocabulary",
    5: "Secondary 1-2: Informative texts, 350-400 words, analysis questions",
    6: "Secondary 3-4 (O-Level): Argumentative/expository, 400-500 words, critical thinking",
    7: "JC/A-Level: Academic texts, 500-600 words, complex analysis"
}

def init_vertex_ai():
    """Initialize Vertex AI."""
    vertexai.init(project=PROJECT_ID, location=LOCATION)
    return GenerativeModel("gemini-2.0-flash-001")

def generate_passage(model: GenerativeModel, passage_id: int, difficulty: int) -> Dict:
    """Generate a single comprehension passage."""
    
    import random
    theme = random.choice(THEMES)
    difficulty_desc = DIFFICULTY_LEVELS.get(difficulty, "General")
    
    # Question count based on difficulty
    num_questions = 4 if difficulty <= 3 else 5 if difficulty <= 5 else 6
    
    prompt = f"""Generate a reading comprehension passage for Singapore students.

Difficulty Level: {difficulty}
Description: {difficulty_desc}
Theme: {theme}

Create a well-written passage with {num_questions} multiple-choice questions.

Return a JSON object with:
- "title": Engaging title
- "difficulty": {difficulty}
- "theme": "{theme}"
- "passage": The full text (well-structured with paragraphs, use \\n\\n between paragraphs)
- "questions": Array of {num_questions} objects with:
    - "id": Question number (1-{num_questions})
    - "question": The question text
    - "options": Object with keys "1", "2", "3", "4" for answer choices
    - "answer": The correct answer (must match one option exactly)
    - "answer_index": Which option is correct (1, 2, 3, or 4)
    - "explanation": Why the answer is correct (2-3 sentences)

QUESTION TYPES (mix these):
- Literal: Direct facts from the passage
- Inferential: Reading between the lines
- Vocabulary: Word meaning in context
- Main idea: Overall message/theme
- Author's purpose: Why was this written?

CRITICAL:
- Passage must be age-appropriate and engaging
- All options must be plausible but only 1 correct
- Questions should test comprehension, not trick readers
- Reference specific parts of the passage in explanations

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
        passage["type"] = "Comprehension"
        
        return passage
        
    except Exception as e:
        print(f"  Error generating passage {passage_id}: {e}")
        return None

def main():
    print("=" * 60)
    print("READING COMPREHENSION GENERATION")
    print("Target: 100 passages across difficulty levels")
    print("=" * 60)
    
    model = init_vertex_ai()
    all_passages = []
    
    # Target distribution
    targets = {
        2: 10,  # Primary 2-3
        3: 15,  # Primary 4
        4: 20,  # Primary 5-6 (PSLE)
        5: 20,  # Secondary 1-2
        6: 20,  # Secondary 3-4 (O-Level)
        7: 15   # JC/A-Level
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
                print(f"Done ({len(passage.get('questions', []))} questions)")
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
    
    # Summary
    total_questions = sum(len(p.get("questions", [])) for p in all_passages)
    print(f"\nTotal questions across all passages: {total_questions}")

if __name__ == "__main__":
    main()
