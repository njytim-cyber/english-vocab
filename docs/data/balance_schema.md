# Balance Data Schema
Source: `src/data/balance.json` (Version 1.3)

## Entities
### Player
- `baseSpeed`: Base movement/action speed.

## Rewards
### Activities
(vocabMCQ, grammarMCQ, vocabCloze, grammarCloze, comprehension, spelling, flashcards, srsReview)
- `baseStars` / `starsPerBlank` / `starsPerQuestion` / `starsPerCard` / `starsPerWord`: Base star reward key varies by activity type.
- `xpMultiplier`: Multiplier for XP calculation.
- `learningValue`: qualitative tag (medium, high, very_high).

### Minigames
(wordSearch, definitionMatch, letterDeduction, wordScramble, wordLadder, sentenceMatch)
- `baseStars`: Base stars for completing.
- `starsPerCorrect`: Stars per correct item.
- `maxBonus`: Maximum bonus stars.
- `xp`: Experience points reward.
- `learningValue`: qualitative tag.

### Arena
Win/Loss/Draw rewards:
- `stars`: Star reward.
- `xp`: XP reward.
- `winVs`: Tiered rewards based on opponent difficulty (noob to master).

### Daily Login
- Array of rewards for consecutive days (7 days cycle).

### Difficulty Multiplier
- `formula`: Formula string for difficulty calculation.

## Arena Settings
- `questionTimeLimit`: Seconds per question.
- `maxQuestions`: Questions per arena match.

### Opponents
(noob, easy, medium, hard, master)
- `name`: Display name.
- `emoji`: Avatar icon.
- `minResponseTime` / `maxResponseTime`: Bot delay range (ms).
- `accuracy`: Probability of correct answer (0.0 - 1.0).

## Game Settings
- `questionsPerRound`: Number of questions in a standard session.
- `retryDelay`: Delay (ms) before proceeding after feedback.

## Streaks
- `milestones`: Days required for streak tiers (fire, hot, legendary).
- `colors`: Hex codes for streak tier visuals.

## Cloze Logic
- `performanceThreshold`: Accuracy below which high probability is triggered.
- `probabilityHigh`: Probability of seeing Cloze if struggling (< threshold).
- `probabilityLow`: Probability of seeing Cloze if mastering (> threshold).
- `minBox` / `maxBox`: Spaced repetition box range for Cloze eligibility.
