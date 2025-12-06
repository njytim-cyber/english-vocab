"""
Vocab Generation Script using Vertex AI
Generates 8000 unique vocabulary words with:
- Multiple themes per word
- Difficulty levels 1-9 (Primary to JC)
- Definition, example sentence, and 3 distractors

Usage: python generate_vocab_ai.py
"""

import json
import os
import time
import random
from typing import List, Dict, Any

# Use google-cloud-aiplatform for Vertex AI
try:
    import vertexai
    from vertexai.generative_models import GenerativeModel, Part
except ImportError:
    print("Please install: pip install google-cloud-aiplatform")
    exit(1)

# Configuration
PROJECT_ID = os.environ.get("GOOGLE_CLOUD_PROJECT", "vocab-gen-2025-njytim")
LOCATION = "us-central1"
OUTPUT_FILE = os.path.join(os.path.dirname(__file__), "../src/data/vocab_8000.json")

# Themes - comprehensive list for Singapore syllabus
THEMES = [
    # Core Academic
    "Science & Technology", "Mathematics", "Literature & Poetry", 
    "History & Civics", "Geography", "Art & Music",
    
    # Life Skills
    "Health & Wellness", "Sports & Fitness", "Food & Nutrition",
    
    # Modern Topics
    "Artificial Intelligence", "Environment & Climate", "Digital Media",
    "Business & Economics", "Government & Politics", "Law & Justice",
    "Taxation & Finance", "Urban Planning", "Social Issues",
    
    # Traditional
    "Nature & Wildlife", "Emotions & Psychology", "Relationships",
    "Communication", "Travel & Transport", "Home & Family",
    "Work & Careers", "Education", "Culture & Traditions"
]

# Difficulty level descriptions for prompts
DIFFICULTY_LEVELS = {
    1: "Primary 1-2 (age 7-8): Very basic words (run, big, happy)",
    2: "Primary 2-3 (age 8-9): Simple words (beautiful, excited, carefully)",
    3: "Primary 3-4 (age 9-10): Common words (magnificent, determined, obstacles)",
    4: "Primary 4-5 (age 10-11): Intermediate words (reluctant, substantial, deteriorate)",
    5: "Primary 5-6 (age 11-12): PSLE level (meticulous, comprehensive, perseverance)",
    6: "Secondary 1-2 (age 13-14): Secondary level (scrutinize, paramount, juxtapose)",
    7: "Secondary 3-4 (age 15-16): O-Level (ubiquitous, exacerbate, pragmatic)",
    8: "JC 1 (age 17): A-Level prep (perfunctory, inexorable, vicissitudes)",
    9: "JC 2 (age 18): Advanced (sesquipedalian, perspicacious, antediluvian)"
}

def init_vertex_ai():
    """Initialize Vertex AI with project settings."""
    vertexai.init(project=PROJECT_ID, location=LOCATION)
    return GenerativeModel("gemini-2.0-flash-001")

def generate_vocab_batch(model: GenerativeModel, difficulty: int, count: int, existing_words: set) -> List[Dict]:
    """Generate a batch of vocabulary words using Vertex AI."""
    
    difficulty_desc = DIFFICULTY_LEVELS[difficulty]
    themes_str = ", ".join(THEMES)
    
    prompt = f"""Generate {count} unique English vocabulary words for Singapore students.

Difficulty Level: {difficulty} - {difficulty_desc}

For EACH word, provide a JSON object with:
- "word": the vocabulary word (lowercase)
- "themes": array of 1-3 applicable themes from: {themes_str}
- "definition": clear, concise definition (1-2 sentences)
- "example": example sentence with _____ as blank for the word
- "distractors": array of exactly 3 wrong answer options (semantically related but incorrect)

IMPORTANT:
- Words must be UNIQUE (not in this list: {', '.join(list(existing_words)[:50]) or 'none yet'})
- Each word should have realistic, contextual examples
- Distractors should be plausible but clearly wrong
- Themes should accurately reflect word usage

Return ONLY a valid JSON array of objects, no markdown formatting.
Example format:
[
  {{
    "word": "resilient",
    "themes": ["Psychology", "Health & Wellness"],
    "definition": "Able to recover quickly from difficulties or setbacks.",
    "example": "Despite many failures, the _____ entrepreneur kept trying.",
    "distractors": ["fragile", "weak", "defeated"]
  }}
]
"""

    try:
        response = model.generate_content(prompt)
        text = response.text.strip()
        
        # Clean up response (remove markdown code blocks if present)
        if text.startswith("```"):
            text = text.split("```")[1]
            if text.startswith("json"):
                text = text[4:]
        text = text.strip()
        
        words = json.loads(text)
        
        # Validate and add difficulty + wordId
        valid_words = []
        for w in words:
            if w.get("word") and w["word"].lower() not in existing_words:
                w["word"] = w["word"].lower()
                w["difficulty"] = difficulty
                # wordId will be assigned after collection (based on final index)
                # Ensure themes is a list
                if isinstance(w.get("themes"), str):
                    w["themes"] = [w["themes"]]
                valid_words.append(w)
                existing_words.add(w["word"])
        
        return valid_words
        
    except Exception as e:
        print(f"Error generating batch: {e}")
        return []

def main():
    """Main generation loop."""
    print("Initializing Vertex AI...")
    model = init_vertex_ai()
    
    all_words = []
    existing_words = set()
    
    # Target: 8000 words, distributed across difficulties
    # More words at lower levels (more primary students)
    targets = {
        1: 800, 2: 900, 3: 1000, 4: 1000,
        5: 1000, 6: 1000, 7: 900, 8: 700, 9: 700
    }
    
    batch_size = 100  # Maximum batch size for speed
    
    for difficulty, target in targets.items():
        print(f"\n=== Generating Difficulty {difficulty} ({target} words) ===")
        generated = 0
        
        while generated < target:
            remaining = min(batch_size, target - generated)
            print(f"  Batch: {generated}/{target}...", end=" ", flush=True)
            
            batch = generate_vocab_batch(model, difficulty, remaining, existing_words)
            all_words.extend(batch)
            generated += len(batch)
            
            print(f"Got {len(batch)} words. Total: {len(all_words)}")
            
            # Minimal delay - just to avoid burst limits
            time.sleep(0.2)
        
        # Save checkpoint after each difficulty level
        with open(OUTPUT_FILE, "w") as f:
            json.dump(all_words, f, indent=2)
        print(f"  Checkpoint saved: {len(all_words)} total words")
    
    # Assign wordIds after all words collected
    print("\nAssigning wordIds...")
    for i, word in enumerate(all_words):
        word["wordId"] = f"w_{i+1:04d}"
    
    # Final save with wordIds
    with open(OUTPUT_FILE, "w") as f:
        json.dump(all_words, f, indent=2)
    
    print(f"\n=== COMPLETE: {len(all_words)} words generated ===")
    print(f"Saved to: {OUTPUT_FILE}")

if __name__ == "__main__":
    main()
