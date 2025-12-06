"""
TEST VERSION - Generate 50 words using Vertex AI
"""

import json
import os
import time

try:
    import vertexai
    from vertexai.generative_models import GenerativeModel
except ImportError:
    print("Please install: pip install google-cloud-aiplatform")
    exit(1)

PROJECT_ID = "vocab-gen-2025-njytim"
LOCATION = "us-central1"
OUTPUT_FILE = os.path.join(os.path.dirname(__file__), "../src/data/vocab_test.json")

THEMES = [
    "Science & Technology", "Artificial Intelligence", "Environment & Climate",
    "Business & Economics", "Government & Politics", "Health & Wellness",
    "Literature & Poetry", "Education", "Social Issues"
]

DIFFICULTY_LEVELS = {
    3: "Primary 3-4 (age 9-10): Common words",
    5: "Primary 5-6 (age 11-12): PSLE level",
    7: "Secondary 3-4 (age 15-16): O-Level"
}

def init_vertex_ai():
    print(f"Project: {PROJECT_ID}, Location: {LOCATION}")
    vertexai.init(project=PROJECT_ID, location=LOCATION)
    return GenerativeModel("gemini-2.0-flash-001")

def generate_vocab_batch(model, difficulty, count, existing_words):
    themes_str = ", ".join(THEMES)
    diff_desc = DIFFICULTY_LEVELS.get(difficulty, "Intermediate")
    
    prompt = f"""Generate {count} unique English vocabulary words for Singapore students.

Difficulty Level: {difficulty} - {diff_desc}

For EACH word, provide a JSON object with:
- "word": the vocabulary word (lowercase)
- "themes": array of 1-3 applicable themes from: {themes_str}
- "definition": clear, concise definition (1-2 sentences)
- "example": example sentence with _____ as blank for the word
- "distractors": array of exactly 3 wrong answer options

Return ONLY a valid JSON array of objects, no markdown.
"""

    try:
        response = model.generate_content(prompt)
        text = response.text.strip()
        
        if text.startswith("```"):
            text = text.split("```")[1]
            if text.startswith("json"):
                text = text[4:]
        text = text.strip()
        
        words = json.loads(text)
        
        valid_words = []
        for w in words:
            if w.get("word") and w["word"].lower() not in existing_words:
                w["word"] = w["word"].lower()
                w["difficulty"] = difficulty
                if isinstance(w.get("themes"), str):
                    w["themes"] = [w["themes"]]
                valid_words.append(w)
                existing_words.add(w["word"])
        
        return valid_words
        
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
        return []

def main():
    print("=" * 50)
    print("VOCAB AI TEST - Generating 50 words")
    print("=" * 50)
    
    print("\nInitializing Vertex AI...")
    model = init_vertex_ai()
    
    all_words = []
    existing_words = set()
    
    for difficulty in [3, 5, 7]:
        print(f"\nDifficulty {difficulty}...", end=" ", flush=True)
        batch = generate_vocab_batch(model, difficulty, 17, existing_words)
        all_words.extend(batch)
        print(f"Got {len(batch)} words")
        time.sleep(1)
    
    with open(OUTPUT_FILE, "w") as f:
        json.dump(all_words, f, indent=2)
    
    print(f"\n{'=' * 50}")
    print(f"SUCCESS: {len(all_words)} words generated")
    print(f"Saved to: {OUTPUT_FILE}")
    print("=" * 50)
    
    if all_words:
        print("\nSample word:")
        sample = all_words[0]
        print(f"  Word: {sample['word']}")
        print(f"  Themes: {sample.get('themes', [])}")
        print(f"  Definition: {sample.get('definition', '')[:80]}...")

if __name__ == "__main__":
    main()
