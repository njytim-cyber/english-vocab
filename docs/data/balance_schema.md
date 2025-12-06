# Balance Data Schema
Source: `src/data/balance.json` (Version 1.2)

## Entities
### Player
- `baseSpeed`: Base movement/action speed.

## Rewards
### Quiz
- `correctAnswer`: XP/Coins per correct answer.
- `perfectBonus`: Bonus for perfect score.
- `streakBonus`: Bonus for maintaining a streak.

### Minigames
(wordSearch, definitionMatch, letterDeduction, wordScramble, wordLadder)
- `xp`: Experience points reward.
- `stars`: Star rating reward.
- `learningValue`: qualitative tag (low, medium, high).

### Daily Login
- Array of rewards for consecutive days (7 days cycle).

## Arena
- `questionTimeLimit`: Seconds per question.
- `maxQuestions`: Questions per arena match.

### Opponents
(noob, easy, medium, hard, master)
- `name`: Display name.
- `emoji`: Avatar icon.
- `minResponseTime` / `maxResponseTime`: Bot delay range (ms).
- `accuracy`: Probability of correct answer (0.0 - 1.0).
