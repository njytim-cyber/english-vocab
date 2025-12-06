
import os
import json
import time
import random
from google import genai
from google.genai import types
from pydantic import BaseModel, Field

# --- CONFIGURATION ---
# --- CONFIGURATION ---
PROJECT_ID = "vocab-gen-2025-njytim" # Clean, user-created project
LOCATION = "us-central1"
TARGET_COUNT = 5000
OUTPUT_FILE = "src/data/questions_progress.json"
MIN_QUESTION_LENGTH = 15

# --- EXPANDED THEME LIST (50+ Categories) ---
THEMES = [
    # The Physical World
    "Nature & Environment", "Space & Astronomy", "Geography & Landscapes",
    "Weather & Meteorology", "Animals & Zoology", "Plants & Botany",
    
    # Society & Culture
    "Politics & Diplomacy", "Law & Justice", "Crime & Punishment",
    "History & Archaeology", "Religion & Spirituality", "Mythology & Folklore",
    "War & Conflict", "Social Structures & Class",
    
    # Business & Tech
    "Business & Finance", "Marketing & Advertising", "Economics & Trade",
    "Science & Laboratory", "Technology & Innovation", "Cybersecurity & Computing",
    "Medicine & Anatomy", "Engineering & Construction",
    
    # Arts & Leisure
    "Arts & Painting", "Literature & Writing", "Music & Performance",
    "Film & Cinema", "Sports & Athletics", "Games & Recreation",
    "Fashion & Clothing", "Food & Culinary Arts", "Travel & Tourism",
    
    # Abstract Concepts
    "Emotions & Feelings", "Personality Traits (Positive)", "Personality Traits (Negative)",
    "Time & Duration", "Quantity & Measurement", "Truth & Deception",
    "Logic & Philosophy", "Communication & Language", "Knowledge & Wisdom",
    
    # Daily Life
    "Architecture & Housing", "Furniture & Decor", "Education & Learning",
    "Family & Relationships", "Transport & Vehicles", "Work & Careers",
    
    # Niche / Advanced
    "Nautical & Maritime", "Aviation & Flight", "Farming & Agriculture",
    "Chemistry & Elements", "Physics & Forces", "Mathematics & Statistics"
]

try:
    # Initialize Vertex AI Client (Safest: Uses your local 'gcloud' credentials)
    print(f"Initializing Vertex AI for project: {PROJECT_ID}...")
    client = genai.Client(vertexai=True, project=PROJECT_ID, location=LOCATION)
except Exception as e:
    print(f"Warning: Client initialization failed ({e}). Run 'gcloud auth application-default login' first.")

# --- SCHEMA ---
class OptionSet(BaseModel):
    opt1: str = Field(alias="1")
    opt2: str = Field(alias="2")
    opt3: str = Field(alias="3")
    opt4: str = Field(alias="4")

class VocabItem(BaseModel):
    question_number: int
    question: str = Field(description="A rich, contextual sentence (15+ words) with the target word replaced by underscores.")
    options: OptionSet
    answer: str
    answer_index: int
    theme: str
    difficulty: int = Field(description="1 to 9 scale")
    definition: str = Field(description="Unambiguous, dictionary-style definition")
    example: str = Field(description="The full sentence including the word")

# --- GENERATOR FUNCTION ---
def generate_batch(theme, difficulty, existing_words, batch_size=20):
    
    exclusion_list = list(existing_words)[-200:] if len(existing_words) > 0 else []

    prompt = f"""
    Generate {batch_size} vocabulary items for a high-quality British English word game.
    
    ### CONSTRAINTS:
    1. **Theme**: {theme}
    2. **Difficulty**: {difficulty}/9
    3. **Uniqueness**: Avoid these recent words: {exclusion_list}
    4. **Context**: Sentences MUST be 15+ words long and tell a micro-story.
    5. **Spelling**: STRICT British English (colour, theatre, metre).
    
    ### DISTRACTOR RULES:
    * If answer is a Noun, distractors must be Nouns.
    * If answer is "Despondent" (Diff 7), distractors cannot be "Sad" (Diff 1). They must be "Melancholy", "Morose", "Forlorn".
    * There must be NO ambiguous answers. The context must rule out the distractors.
    """

    try:
        response = client.models.generate_content(
            model='gemini-2.0-flash', 
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type='application/json',
                response_schema=list[VocabItem]
            )
        )
        return response.parsed
    except Exception as e:
        print(f"Error generating batch: {e}")
        return []

# --- MAIN LOOP ---
def main():
    database = []
    seen_words = set()
    
    # Check if target file exists and load it to append or resume
    if os.path.exists(OUTPUT_FILE):
        try:
            with open(OUTPUT_FILE, 'r') as f:
                content = json.load(f)
                if isinstance(content, list):
                    database = content
                    seen_words = {item['answer'].lower() for item in database if 'answer' in item}
                    print(f"Resuming... {len(database)} questions loaded.")
        except:
            print("Starting fresh (or file corrupt).")

    # Cycle difficulties to ensure we don't get stuck on "Easy" for 500 iterations
    difficulty_cycle = [1, 2, 3, 4, 5, 6, 7, 8, 9] 
    
    while len(database) < TARGET_COUNT:
        # Shuffle themes so we don't do all "Nature" questions first
        current_themes = THEMES.copy()
        random.shuffle(current_themes)
        
        for theme in current_themes:
            for diff in difficulty_cycle:
                if len(database) >= TARGET_COUNT: break
                
                print(f"Mining... [Theme: {theme}] [Diff: {diff}] [Total: {len(database)}]")
                
                batch = generate_batch(theme, diff, seen_words)
                
                valid_items = 0
                if batch:
                    for item in batch:
                        # 1. Duplication Check
                        if item.answer.lower() in seen_words:
                            continue
                        
                        # 2. Length Check
                        if len(item.question.split()) < MIN_QUESTION_LENGTH:
                            continue

                        # 3. British English Guardrails
                        if item.answer.lower() in ['color', 'center', 'theater', 'honor', 'defense']:
                            continue

                        # Success
                        item.question_number = len(database) + 1
                        database.append(item.model_dump(by_alias=True))
                        seen_words.add(item.answer.lower())
                        valid_items += 1
                    
                    print(f"  -> Accepted {valid_items} valid questions.")
                    
                    # Save progressively
                    try:
                        with open(OUTPUT_FILE, 'w') as f:
                            json.dump(database, f, indent=2)
                    except Exception as e:
                        print(f"Error saving file: {e}")
                
                time.sleep(1)

if __name__ == "__main__":
    main()
