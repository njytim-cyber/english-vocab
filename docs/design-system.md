# Design System Guidelines

## 🎨 Overview
All components MUST use the centralized design tokens from `@styles/designTokens.js`.  
**No exceptions. No inline hex colors. No `var(--*)` CSS variables.**

---

## ⚖️ Three Laws of Architecture

### 1. DRY Law (Don't Repeat Yourself)
> **Define once, use everywhere.**

- If you write the same code twice, create a reusable component
- Currency display → use `<StarDisplay>`, `<StarReward>`, `<StarCost>`
- Page wrapper → use `<PageLayout>`
- Game wrapper → use `<GameLayout>`

### 2. Data-Driven Law
- NEVER hardcode numeric values (damage, speed, cost)
- Import from `@data/balance.json`

### 3. Strict Separation
- **Components**: UI only, no business logic
- **Engine**: Business logic, no UI
- **Tokens**: Styling constants only
```javascript
import { colors, borderRadius, shadows, spacing, typography, icons } from '../styles/designTokens';
import PageLayout from './common/PageLayout';
```

---

## Learning-Focused Icons

> [!IMPORTANT]
> **No monetary symbols!** Teachers requested positive, learning-focused messaging.

| Use Case | Token | Symbol |
|----------|-------|--------|
| Currency/Rewards | `icons.currency` | ⭐ |
| Experience | `icons.xp` | ✨ |
| Streaks | `icons.streak` | 🔥 |
| Achievements | `icons.achievement` | 🏆 |
| Progress | `icons.progress` | 📈 |
| Learning | `icons.learn` | 📚 |
| Practice | `icons.practice` | 🎯 |

### ⛔ Forbidden Icons
- 💰 (money bag) - monetary connotation
- 🤑 (money face) - inappropriate for education
- 💵 💴 💶 💷 (currency) - real money references

---

## Scalable Navigation Architecture

The navigation is designed to scale for future subjects:

```
Home (Learning Hub)
├── Learn (Subjects - expandable)
│   ├── Vocabulary (current)
│   ├── Grammar (future)
│   ├── Spelling (future)
│   └── Creative Writing (future)
├── Practice (Games & Activities)
├── Progress (Skills + Awards)
└── Rewards (Shop)
```

### NavBar Labels
| Current | Purpose |
|---------|---------|
| Home | Daily overview, quick actions |
| Learn | All subjects (expandable) |
| Practice | Games and activities |
| Progress | Skills tree + achievements |
| Rewards | Shop for cosmetics |

---

## Core Components

### PageLayout (Required for all pages)
```jsx
<PageLayout 
    title="Page Title 📚" 
    onBack={handleBack}
    rightContent={<StarDisplay />}
    maxWidth="800px"
>
    {/* Page content */}
</PageLayout>
```

### Displaying Currency
```jsx
// Always use icons.currency from designTokens
<span>{icons.currency}</span>
<strong>{starCount}</strong>

// In text: "You earned 50 Stars!" (not "coins")
```

### Primary Action Button
```jsx
style={{
    background: colors.primaryGradient,
    color: 'white',
    borderRadius: borderRadius.lg,
    boxShadow: shadows.primary
}}
```

---

## Color Rules

| Use Case | Token |
|----------|-------|
| Primary actions | `colors.primaryGradient` |
| Text | `colors.dark` |
| Muted text | `colors.textMuted` |
| Success | `colors.success` (#2ecc71) |
| Error | `colors.error` (#e74c3c) |

---

## Checklist for New Components

- [ ] Uses `PageLayout` wrapper
- [ ] Imports from `designTokens.js`
- [ ] No hardcoded colors
- [ ] Uses `icons.currency` (⭐) for rewards
- [ ] Buttons have purple gradient
- [ ] Text says "Stars" not "Coins"
- [ ] Labels are learning-focused
