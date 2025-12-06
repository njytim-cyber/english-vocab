import { colors, borderRadius, shadows, spacing, icons } from '../styles/designTokens';
import PageLayout from './common/PageLayout';


/**
 * LearnHub - Central learning dashboard
 * Replaces StartScreen as the main entry point
 */
export default function LearnHub({ economy, onNavigate }) {
    const cards = [
        {
            id: 'new-quiz',
            title: 'New Quiz',
            icon: '📝',
            description: 'Test your vocabulary knowledge',
            color: '#667eea',
            action: () => onNavigate('quiz-setup')
        },
        {
            id: 'practice',
            title: 'Practice',
            icon: '🔄',
            description: 'Revise 20 words you\'ve learned',
            color: '#2ecc71',
            action: () => onNavigate('practice')
        },
        {
            id: 'arena',
            title: 'Arena',
            icon: '⚔️',
            description: 'Compete against AI opponents',
            color: '#e74c3c',
            action: () => onNavigate('arena')
        },
        {
            id: 'quests',
            title: 'Quests',
            icon: '🗺️',
            description: 'Themed learning journeys',
            color: '#f39c12',
            action: () => onNavigate('quests')
        },
        {
            id: 'games',
            title: 'Word Games',
            icon: '🎮',
            description: 'Fun vocabulary minigames',
            color: '#9b59b6',
            action: () => onNavigate('minigames')
        }
    ];

    return (
        <PageLayout title="Vocab Hub" showBack={false} maxWidth="800px">


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
