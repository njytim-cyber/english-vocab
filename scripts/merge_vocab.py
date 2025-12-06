
import json
import os
import random

QUESTIONS_FILE = "src/data/questions.json"
NEW_VOCAB_FILE = "src/data/vocab_8000.json"
OUTPUT_FILE = "src/data/questions.json" # Overwrite or create new

def load_json(path):
    if not os.path.exists(path):
        return []
    with open(path, 'r', encoding='utf-8') as f:
        return json.load(f)

def save_json(path, data):
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

def main():
    print("Loading data...")
    existing_questions = load_json(QUESTIONS_FILE)
    new_vocab = load_json(NEW_VOCAB_FILE)
    
    print(f"Existing questions: {len(existing_questions)}")
    print(f"New vocab entries: {len(new_vocab)}")

    # Build existence set (normalize to lowercase)
    existing_words = set()
    for q in existing_questions:
        if 'answer' in q:
            existing_words.add(q['answer'].lower().strip())

    max_id = 0
    for q in existing_questions:
        if 'question_number' in q:
            if q['question_number'] > max_id:
                max_id = q['question_number']
    
    print(f"Max ID: {max_id}")
    print(f"Unique existing answers: {len(existing_words)}")

    merged_count = 0
    skipped_count = 0
    
    for entry in new_vocab:
        word = entry['word'].lower().strip()
        
        # Uniqueness Check
        if word in existing_words:
            skipped_count += 1
            continue
            
        # Transform Schema
        # Target: question_number, question, options, answer, answer_index, theme, difficulty, definition, example
        
        # 1. Options & Answer Index
        opts = [word] + entry['distractors'][:3] # Ensure max 4
        random.shuffle(opts)
        
        answer_index = -1
        options_map = {}
        for idx, opt in enumerate(opts):
            key = str(idx + 1)
            options_map[key] = opt
            if opt == word:
                answer_index = idx + 1
        
        # 2. Theme (Pick first or default)
        theme = "General"
        if 'themes' in entry and len(entry['themes']) > 0:
            theme = entry['themes'][0]
        
        # 3. Question (Use example validation)
        question_text = entry.get('example', '').replace('_____', '________') # Standardize blank
        if '________' not in question_text:
             # Fallback if no blank found (rare but possible given AI gen)
             question_text = f"Choose the word that means: {entry['definition']}"
        
        max_id += 1
        
        new_q = {
            "question_number": max_id,
            "question": question_text,
            "options": options_map,
            "answer": word,
            "answer_index": answer_index,
            "theme": theme,
            "difficulty": entry.get('difficulty', 1),
            "definition": entry.get('definition', ''),
            "example": entry.get('example', '')
        }
        
        existing_questions.append(new_q)
        existing_words.add(word)
        merged_count += 1

    print(f"Skipped {skipped_count} duplicates.")
    print(f"Merged {merged_count} new questions.")
    print(f"Total questions now: {len(existing_questions)}")

    # Verify Logic
    if merged_count > 0:
        print("Saving merged file...")
        save_json(OUTPUT_FILE, existing_questions)
        print("Success.")
    else:
        print("No new unique entries found to merge.")

if __name__ == "__main__":
    main()
