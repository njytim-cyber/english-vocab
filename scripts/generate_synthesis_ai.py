"""
Synthesis & Transformation Question Generation Script using Vertex AI
Generates 30 questions per subcategory based on the S&T curriculum template.

Target: 24 subcategories × 30 questions = 720 total questions

Usage: python generate_synthesis_ai.py
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
TEMPLATE_FILE = os.path.join(os.path.dirname(__file__), "synthesis_template.json")
OUTPUT_FILE = os.path.join(os.path.dirname(__file__), "../src/data/synthesis_transformation.json")

def init_vertex_ai():
    """Initialize Vertex AI."""
    vertexai.init(project=PROJECT_ID, location=LOCATION)
    return GenerativeModel("gemini-2.0-flash-exp")

def load_template():
    """Load the S&T structure template."""
    with open(TEMPLATE_FILE, "r", encoding="utf-8") as f:
        return json.load(f)

def generate_questions_for_subcategory(
    model: GenerativeModel,
    category_name: str,
    subcategory: Dict,
    num_questions: int = 30
) -> List[Dict]:
    """Generate 30 questions for a specific subcategory."""
    
    triggers_str = ", ".join(f'"{t}"' for t in subcategory["triggers"])
    
    prompt = f"""Generate {num_questions} Synthesis & Transformation questions for Singapore students.

**Category:** {category_name}
**Subcategory:** {subcategory["sub_category_name"]}
**Difficulty:** {subcategory["difficulty"]}/9

**Transformation Logic:**
{subcategory["logic"]}

**Key Triggers/Connectors:** {triggers_str}

**Example Question:**
Input: {subcategory["question"]}
Answer: {subcategory["answer"]}

**TASK:**
Generate {num_questions} similar questions following the EXACT same transformation pattern.

**Requirements:**
1. Each question should have TWO separate sentences that need to be combined
2. The answer must use one of the trigger words/phrases: {triggers_str}
3. Vary the vocabulary and context (school, home, nature, sports, daily life)
4. Keep sentences age-appropriate for Primary 5-6 to Secondary students
5. Ensure grammatical accuracy in both question and answer
6. The transformation difficulty should match level {subcategory["difficulty"]}/9

**Return Format:**
Return ONLY a JSON array of {num_questions} objects, each with:
{{
  "id": <number 1-{num_questions}>,
  "question": "First sentence. Second sentence.",
  "answer": "Combined sentence using the trigger.",
  "subcategory": "{subcategory["sub_category_name"]}",
  "category": "{category_name}",
  "difficulty": {subcategory["difficulty"]},
  "trigger_used": "<which trigger word/phrase was used>"
}}

**CRITICAL:**
- NO markdown code blocks
- Return ONLY the JSON array
- Each question must be unique and contextually different
- Answers must be grammatically perfect for Singapore English standards
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
        
        # Ensure it's a list
        if not isinstance(questions, list):
            print(f"    Warning: Response not a list, wrapping...")
            questions = [questions]
        
        # Add metadata
        for q in questions:
            q["type"] = "synthesis"
            q["category"] = category_name
            q["subcategory"] = subcategory["sub_category_name"]
            q["difficulty"] = subcategory["difficulty"]
            q["logic"] = subcategory["logic"]
        
        return questions
        
    except json.JSONDecodeError as e:
        print(f"    JSON Error: {e}")
        print(f"    Response text: {text[:200]}...")
        return []
    except Exception as e:
        print(f"    Error: {e}")
        return []

def main():
    print("=" * 70)
    print("SYNTHESIS &TRANSFORMATION QUESTION GENERATION")
    print("Target: 24 subcategories × 30 questions = 720 total")
    print("=" * 70)
    
    # Load template
    template = load_template()
    model = init_vertex_ai()
    all_questions = []
    question_id = 1
    
    total_subcats = sum(len(cat["sub_categories"]) for cat in template["categories"])
    current_subcat = 0
    
    for category in template["categories"]:
        cat_name = category["category_name"]
        print(f"\n{'=' * 70}")
        print(f"CATEGORY: {cat_name}")
        print(f"{'=' * 70}")
        
        for subcategory in category["sub_categories"]:
            current_subcat += 1
            subcat_name = subcategory["sub_category_name"]
            difficulty = subcategory["difficulty"]
            
            print(f"\n[{current_subcat}/{total_subcats}] {subcat_name} (Difficulty: {difficulty}/9)")
            print(f"  Generating 30 questions...", end=" ", flush=True)
            
            questions = generate_questions_for_subcategory(
                model, cat_name, subcategory, num_questions=30
            )
            
            if questions:
                # Assign global IDs
                for q in questions:
                    q["id"] = question_id
                    question_id += 1
                
                all_questions.extend(questions)
                print(f"✓ Done ({len(questions)} questions)")
            else:
                print("✗ FAILED")
            
            # Rate limiting
            time.sleep(2)
    
    # Save results
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(all_questions, f, indent=2, ensure_ascii=False)
    
    print(f"\n{'=' * 70}")
    print(f"COMPLETE: {len(all_questions)} questions generated")
    print(f"Saved to: {OUTPUT_FILE}")
    print("=" * 70)
    
    # Summary by category
    print("\n** Summary by Category **")
    for category in template["categories"]:
        cat_name = category["category_name"]
        cat_questions = [q for q in all_questions if q["category"] == cat_name]
        print(f"  {cat_name}: {len(cat_questions)} questions")
    
    # Summary by difficulty
    print("\n** Summary by Difficulty **")
    difficulty_counts = {}
    for q in all_questions:
        diff = q["difficulty"]
        difficulty_counts[diff] = difficulty_counts.get(diff, 0) + 1
    
    for diff in sorted(difficulty_counts.keys()):
        print(f"  Level {diff}: {difficulty_counts[diff]} questions")

if __name__ == "__main__":
    main()
