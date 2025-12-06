"""
Cloze Passage Generation Script using Vertex AI
Generates 500 cloze passages with:
- 4-5 paragraphs per passage
- 2 blanks per paragraph (8-10 blanks total)
- Multiple choice options for each blank

Usage: python generate_cloze_ai.py
"""

import json
import os
import time
from typing import List, Dict, Any

try:
    import vertexai
    from vertexai.generative_models import GenerativeModel
except ImportError:
    print("Please install: pip install google-cloud-aiplatform")
    exit(1)

# Configuration
PROJECT_ID = os.environ.get("GOOGLE_CLOUD_PROJECT", "vocab-gen-2025-njytim")
LOCATION = "us-central1"
OUTPUT_FILE = os.path.join(os.path.dirname(__file__), "../src/data/cloze_passages.json")
VOCAB_FILE = os.path.join(os.path.dirname(__file__), "../src/data/vocab_8000.json")

# Themes for passages
PASSAGE_THEMES = [
    "Science & Technology", "Environment & Climate", "History",
    "Literature", "Social Issues", "Health & Wellness",
    "Business & Economics", "Government & Politics", "Education",
    "Culture & Traditions", "Travel & Adventure", "Sports",
    "Artificial Intelligence", "Space Exploration", "Marine Life"
]

DIFFICULTY_LEVELS = {
    1: "Primary 1-3 (simple vocabulary, short sentences)",
    2: "Primary 4-6 (intermediate vocabulary, PSLE level)",
    3: "Secondary 1-2 (more complex sentences)",
    4: "Secondary 3-4 (O-Level complexity)",
    5: "JC level (sophisticated vocabulary and structure)"
}

def init_vertex_ai():
    """Initialize Vertex AI."""
    vertexai.init(project=PROJECT_ID, location=LOCATION)
    return GenerativeModel("gemini-2.0-flash-001")

def load_vocab_words():
    """Load generated vocabulary for reference."""
    if os.path.exists(VOCAB_FILE):
        with open(VOCAB_FILE, "r") as f:
            return json.load(f)
    return []

def generate_cloze_passage(model: GenerativeModel, passage_id: int, difficulty: int, theme: str) -> Dict:
    """Generate a single cloze passage."""
    
    diff_desc = DIFFICULTY_LEVELS[difficulty]
    
    prompt = f"""Generate an educational cloze passage for Singapore students.

Theme: {theme}
Difficulty: Level {difficulty} - {diff_desc}
Passage ID: {passage_id}

Requirements:
1. Write a coherent, engaging passage of 4-5 paragraphs
2. Each paragraph should have exactly 2 blanks (numbered sequentially)
3. Total of 8-10 blanks in the passage
4. Each blank tests a vocabulary word appropriate for the difficulty level
5. Provide 4 options for each blank (1 correct, 3 distractors)

Return a valid JSON object with this EXACT structure:
{{
  "id": {passage_id},
  "title": "Short descriptive title",
  "type": "ClozePassage",
  "difficulty": {difficulty},
  "theme": "{theme}",
  "paragraphs": [
    {{
      "text": "Paragraph text with __1__ and __2__ as blanks.",
      "blanks": [
        {{"id": 1, "answer": "correct_word", "options": ["correct_word", "wrong1", "wrong2", "wrong3"]}},
        {{"id": 2, "answer": "another_word", "options": ["another_word", "wrong1", "wrong2", "wrong3"]}}
      ]
    }}
  ],
  "totalBlanks": 8
}}

IMPORTANT:
- The passage must be educational and factually accurate
- Use blank markers like __1__, __2__, etc. in the text
- Options array must have the correct answer as first element (will be shuffled later)
- Return ONLY valid JSON, no markdown

Generate the passage now:"""

    try:
        response = model.generate_content(prompt)
        text = response.text.strip()
        
        # Clean up response
        if text.startswith("```"):
            text = text.split("```")[1]
            if text.startswith("json"):
                text = text[4:]
        text = text.strip()
        
        passage = json.loads(text)
        
        # Validate structure
        if not passage.get("paragraphs"):
            raise ValueError("Missing paragraphs")
        
        # Shuffle options for each blank
        import random
        for para in passage["paragraphs"]:
            for blank in para.get("blanks", []):
                if blank.get("options"):
                    random.shuffle(blank["options"])
        
        # Count total blanks
        passage["totalBlanks"] = sum(len(p.get("blanks", [])) for p in passage["paragraphs"])
        
        return passage
        
    except Exception as e:
        print(f"Error generating passage {passage_id}: {e}")
        return None

def main():
    """Main generation loop for cloze passages."""
    print("Initializing Vertex AI...")
    model = init_vertex_ai()
    
    all_passages = []
    
    # Target: 500 passages distributed by difficulty
    # More passages at intermediate levels
    targets = {1: 80, 2: 120, 3: 120, 4: 100, 5: 80}
    
    passage_id = 1
    
    for difficulty, count in targets.items():
        print(f"\n=== Generating Difficulty {difficulty} ({count} passages) ===")
        generated = 0
        
        while generated < count:
            # Rotate through themes
            theme = PASSAGE_THEMES[passage_id % len(PASSAGE_THEMES)]
            
            print(f"  Passage {passage_id} (Theme: {theme})...", end=" ")
            
            passage = generate_cloze_passage(model, passage_id, difficulty, theme)
            
            if passage:
                all_passages.append(passage)
                generated += 1
                print(f"OK ({passage.get('totalBlanks', 0)} blanks)")
            else:
                print("FAILED - retrying...")
                time.sleep(2)
                continue
            
            passage_id += 1
            
            # Rate limiting
            time.sleep(1)
            
            # Checkpoint every 50 passages
            if len(all_passages) % 50 == 0:
                with open(OUTPUT_FILE, "w") as f:
                    json.dump(all_passages, f, indent=2)
                print(f"  Checkpoint: {len(all_passages)} passages saved")
    
    # Final save
    with open(OUTPUT_FILE, "w") as f:
        json.dump(all_passages, f, indent=2)
    
    print(f"\n=== COMPLETE: {len(all_passages)} passages generated ===")
    print(f"Saved to: {OUTPUT_FILE}")

if __name__ == "__main__":
    main()
