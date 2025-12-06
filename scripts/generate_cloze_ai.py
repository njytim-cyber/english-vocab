
"""
Cloze Passage Generation Script using Vertex AI
Generates reading comprehension passages with missing words (cloze test).
Target: Singapore School Syllabus (Primary 3 to JC 2)

Features:
- Multi-paragraph passages
- 4-10 blanks per passage
- Context-appropriate vocabulary
- 3 types of distractors (semantic, syntactic, phonetic)

Usage: python generate_cloze_ai.py
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
OUTPUT_FILE = os.path.join(os.path.dirname(__file__), "../src/data/cloze_generated.json")

# Themes - Same as Vocab but focused on reading topics
THEMES = [
    "Environment & Climate", "Science & Technology", "History & Culture",
    "Health & Society", "Business & Economics", "Nature & Wildlife",
    "Relationships & Values", "Biography & Achievements"
]

# Difficulty Levels
DIFFICULTY_LEVELS = {
    3: "Primary 3-4 (age 9-10): Simple narrative/informative texts (approx 150 words)",
    4: "Primary 5-6 (age 11-12): PSLE standard, descriptive/argumentative (approx 200 words)",
    5: "Secondary 1-2 (age 13-14): Lower Sec, more complex structure (approx 250 words)",
    6: "Secondary 3-4 (age 15-16): O-Level standard, formal/academic tone (approx 300 words)",
    7: "Junior College (age 17-18): General Paper standard, complex arguments (approx 350 words)"
}

def init_vertex_ai():
    """Initialize Vertex AI with project settings."""
    vertexai.init(project=PROJECT_ID, location=LOCATION)
    # User feedback: Works with 2.0, not 1.5
    return GenerativeModel("gemini-2.0-flash-exp")

def generate_cloze_batch(model: GenerativeModel, difficulty: int, count: int, current_id: int) -> List[Dict]:
    """Generate a batch of cloze passages."""
    
    difficulty_desc = DIFFICULTY_LEVELS[difficulty]
    theme = random.choice(THEMES)
    
    prompt = f"""Generate {count} unique English cloze passages for Singapore students.

Difficulty Level: {difficulty} - {difficulty_desc}
Theme: {theme}

For EACH passage, provide a JSON object with:
- "title": Engaging title
- "theme": The selected theme ({theme})
- "paragraphs": Array of objects, each containing:
    - "text": The full paragraph text, but with blanks replaced by markers like "__1__", "__2__", etc.
    - "blanks": Array of objects corresponding to markers in this paragraph, each with:
        - "id": The integer number matched to the marker (e.g. 1)
        - "answer": The correct word that fits the blank (LOWERCASE)
        - "options": Array of 4 strings (1 correct answer + 3 distractors). Distractors must be grammatically plausible but incorrect contextually.

IMPORTANT:
- Passage should have distinct paragraphs (2-4).
- Total blanks per passage should be between 5 and 10.
- Ensure narrative flow and logical coherence.
- VOCABULARY appropriately challenging for the level.

Return ONLY a valid JSON array of objects.
"""

    try:
        response = model.generate_content(prompt)
        text = response.text.strip()
        
        # Clean up response
        if text.startswith("```"):
            parts = text.split("```")
            if len(parts) >= 2:
                text = parts[1]
                if text.startswith("json"):
                    text = text[4:]
        text = text.strip()
        
        passages = json.loads(text)
        
        # Post-processing to add IDs and structure
        valid_passages = []
        for p in passages:
            p["id"] = current_id
            p["difficulty"] = difficulty
            p["type"] = "ClozePassage"
            
            # Flatten/Verify blanks count
            total_blanks = 0
            for para in p.get("paragraphs", []):
                total_blanks += len(para.get("blanks", []))
                # Add wordId placeholder (optional, can be linked to vocab bank later)
                for blank in para.get("blanks", []):
                    blank["wordId"] = f"c_{current_id}_{blank['id']}"
            
            p["totalBlanks"] = total_blanks
            valid_passages.append(p)
            current_id += 1
            
        return valid_passages

    except Exception as e:
        print(f"Error generating batch: {e}")
        return []

def main():
    print("Initializing Vertex AI (Gemini 1.5 Pro)...")
    model = init_vertex_ai()
    
    all_passages = []
    
    # Load existing if file exists
    if os.path.exists(OUTPUT_FILE):
        try:
            with open(OUTPUT_FILE, "r") as f:
                all_passages = json.load(f)
                print(f"Loaded {len(all_passages)} existing passages.")
        except:
            print("Could not load existing file, starting fresh.")
            
    current_id = max([p["id"] for p in all_passages], default=0) + 1
    
    # Target distribution
    targets = {
        3: 100, # P3-4
        4: 100, # P5-6
        5: 100, # Sec 1-2
        6: 100, # O-Level
        7: 100  # A-Level
    }
    
    for difficulty, count in targets.items():
        print(f"\n=== Generating Difficulty {difficulty} ({count} passages) ===")
        generated_this_level = 0
        
        while generated_this_level < count:
            batch_size = 1 # Reduced from dynamic to 1 for stability
            print(f"  Generating passage {generated_this_level + 1}/{count}...", end=" ", flush=True)
            
            retry_count = 0
            max_retries = 5
            
            while retry_count < max_retries:
                new_passages = generate_cloze_batch(model, difficulty, batch_size, current_id)
                
                if new_passages:
                    all_passages.extend(new_passages)
                    generated_this_level += len(new_passages)
                    current_id += len(new_passages)
                    print(f"Done. Total: {len(all_passages)}")
                    
                    # Save checkpoint
                    with open(OUTPUT_FILE, "w") as f:
                        json.dump(all_passages, f, indent=2)
                    
                    time.sleep(1) # Cooldown
                    break
                else:
                    retry_wait = 2 ** retry_count
                    print(f"\n  [Warn] Failed batch. Retrying in {retry_wait}s...", end=" ", flush=True)
                    time.sleep(retry_wait)
                    retry_count += 1
            
            if retry_count == max_retries:
                print("\n[Error] Max retries reached for this batch. Skipping...")
                # Optional: Break completely or just skip?
                # For now, let's break to avoid infinite loops of failure
                break
                


    print(f"\n=== COMPLETE: {len(all_passages)} passages generated ===")
    print(f"Saved to: {OUTPUT_FILE}")

if __name__ == "__main__":
    main()
