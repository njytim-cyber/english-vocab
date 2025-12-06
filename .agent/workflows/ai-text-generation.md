---
description: Standard procedure for generating game content using AI
---

# Workflow: AI Content Generation
**Trigger:** Expanding game data (vocab, cloze, grammer) using AI scripts.

**Step 1: Configuration Check**
Select the appropriate model based on modality:

*   **Text / JSON / Code:**
    *   **Approved Model:** `gemini-2.0-flash-exp`
    *   **Use Case:** Large batch generation (Vocab, Cloze, Quests).
    *   **Reason:** Superior rate limits and stability compared to 1.5 Pro.

*   **Images / Audio:**
    *   **Approved Models:** Imagen 3 (Images), etc.
    *   **Note:** Do NOT use Gemini 2.0 Flash for pure image synthesis unless using multimodal capabilities explicitly.

**Step 2: Dry Run**
Run the script with a small batch size (1-5 items) to verify prompt efficacy and JSON schema validity.

**Step 3: Verification**
After generation, run validation scripts (e.g., `scripts/merge_vocab.py`) to check for:
1.  JSON Validity
2.  Schema compliance (Question, Answer, Distractors)
3.  Duplicate detection

**Step 4: Merge**
Only merge into `src/data/` source files after Step 3 passes.
