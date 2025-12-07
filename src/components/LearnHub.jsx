import { colors, borderRadius, shadows, spacing } from '../styles/designTokens';
import PageLayout from './common/PageLayout';


/**
 * LearnHub - Central learning dashboard
 * Shows Vocab MCQ only (Word Games moved to nav)
 */
export default function LearnHub({ economy, onNavigate }) {
    const cards = [
        {
            id: 'vocab-mcq',
            title: 'Vocab MCQ',
            icon: '📝',
            description: 'Test your vocabulary knowledge',
            color: '#667eea',
            action: () => onNavigate('quiz-setup')
        },
        {
            id: 'vocab-cloze',
            title: 'Vocab Cloze',
            icon: '📖',
            description: 'Fill in the blanks in passages',
            color: '#10b981',
            action: () => onNavigate('cloze-setup')
        },
        {
            id: 'grammar-mcq',
            title: 'Grammar MCQ',
            icon: '✏️',
            description: 'Master grammar rules and structures',
            color: '#f59e0b',
            action: () => onNavigate('grammar')
        },
        {
            id: 'grammar-cloze',
            title: 'Grammar Cloze',
            icon: '📜',
            description: 'Fill in grammar blanks in passages',
            color: '#d97706',
            action: () => onNavigate('grammar-cloze-setup')
        },
        {
            id: 'spelling',
            title: 'Spelling',
            icon: '🔤',
            description: 'Practice spelling words',
            color: '#3b82f6',
            action: () => onNavigate('spelling')
        },
        {
            id: 'synthesis',
            title: 'Synthesis & Transform',
            icon: '🔄',
            description: 'Combine sentences using grammar',
            color: '#8b5cf6',
            action: () => onNavigate('synthesis-setup')
        },
        {
            id: 'comprehension',
            title: 'Comprehension',
            icon: '📰',
            description: 'Read passages and answer questions',
            color: '#0ea5e9',
            action: () => onNavigate('comprehension-setup')
        }
    ];

    return (
        <PageLayout title="Learn" showBack={false} maxWidth="800px">

            {/* Action Cards Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: spacing.md,
                padding: spacing.sm
            }}>
                {cards.map(card => (
                    <button
                        key={card.id}
                        onClick={card.action}
                        style={{
                            background: `linear-gradient(135deg, ${card.color} 0%, ${adjustColor(card.color, -20)} 100%)`,
                            border: 'none',
                            borderRadius: borderRadius.xl,
                            padding: spacing.lg,
                            cursor: 'pointer',
                            textAlign: 'left',
                            color: 'white',
                            boxShadow: shadows.md,
                            transition: 'all 0.2s ease',
                            minHeight: '140px',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-4px)';
                            e.currentTarget.style.boxShadow = shadows.lg;
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = shadows.md;
                        }}
                    >
                        <div style={{ fontSize: '2.5rem', marginBottom: spacing.sm }}>
                            {card.icon}
                        </div>
                        <div>
                            <div style={{
                                fontSize: '1.25rem',
                                fontWeight: 'bold',
                                marginBottom: '0.25rem'
                            }}>
                                {card.title}
                            </div>
                            <div style={{
                                fontSize: '0.85rem',
                                opacity: 0.9
                            }}>
                                {card.description}
                            </div>
                        </div>
                    </button>
                ))}
            </div>
        </PageLayout>
    );
}

// Helper to darken/lighten hex colors
function adjustColor(hex, amount) {
    const num = parseInt(hex.replace('#', ''), 16);
    const r = Math.min(255, Math.max(0, (num >> 16) + amount));
    const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + amount));
    const b = Math.min(255, Math.max(0, (num & 0x0000FF) + amount));
    return `#${(1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1)}`;
}
