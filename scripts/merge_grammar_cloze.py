"""
Merge additional grammar cloze passages with existing ones
"""

import json
import os

# File paths
EXISTING_FILE = os.path.join(os.path.dirname(__file__), "../src/data/grammar_cloze_full.json")
ADDITIONAL_FILE = os.path.join(os.path.dirname(__file__), "../src/data/grammar_cloze_additional.json")
OUTPUT_FILE = EXISTING_FILE  # Overwrite the existing file

def main():
    print("=" * 60)
    print("MERGING GRAMMAR CLOZE PASSAGES")
    print("=" * 60)
    
    # Load existing passages
    with open(EXISTING_FILE, "r", encoding="utf-8") as f:
        existing = json.load(f)
    print(f"\nExisting passages: {len(existing)}")
    
    # Load additional passages
    with open(ADDITIONAL_FILE, "r", encoding="utf-8") as f:
        additional = json.load(f)
    print(f"Additional passages: {len(additional)}")
    
    # Merge
    merged = existing + additional
    print(f"Total passages: {len(merged)}")
    
    # Save
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(merged, f, indent=2, ensure_ascii=False)
    
    print(f"\n✅ Merged successfully!")
    print(f"Saved to: {OUTPUT_FILE}")
    print("=" * 60)
    
    # Clean up additional file
    if os.path.exists(ADDITIONAL_FILE):
        os.remove(ADDITIONAL_FILE)
        print("Removed temporary file: grammar_cloze_additional.json")

if __name__ == "__main__":
    main()
