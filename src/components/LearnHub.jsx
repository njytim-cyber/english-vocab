import { useMemo, useState, useEffect } from 'react';
import { colors, borderRadius, shadows, spacing } from '../styles/designTokens';
import PageLayout from './common/PageLayout';
import UserProgress from '../engine/UserProgress';


/**
 * LearnHub - Central learning dashboard
 * Shows Vocab MCQ only (Word Games moved to nav)
 */
export default function LearnHub({ economy, onNavigate }) {
    const [userProgress] = useState(() => new UserProgress());
    const [, forceUpdate] = useState({});

    const cards = [
        {
            id: 'vocab-mcq',
            title: 'Vocab MCQ',
            subtitle: 'Multiple-choice questions',
            icon: '📝',
            action: () => onNavigate('quiz-setup')
        },
        {
            id: 'vocab-cloze',
            title: 'Vocab Cloze',
            subtitle: 'Fill-in-the-blanks',
            icon: '📖',
            action: () => onNavigate('cloze-setup')
        },
        {
            id: 'grammar-mcq',
            title: 'Grammar MCQ',
            subtitle: 'Grammar rules & structures',
            icon: '✏️',
            action: () => onNavigate('grammar')
        },
        {
            id: 'grammar-cloze',
            title: 'Grammar Cloze',
            subtitle: 'Grammar fill-in-the-blanks',
            icon: '📜',
            action: () => onNavigate('grammar-cloze-setup')
        },
        {
            id: 'spelling',
            title: 'Spelling',
            subtitle: 'Practice spelling words',
            icon: '🔤',
            action: () => onNavigate('spelling')
        },
        {
            id: 'synthesis',
            title: 'Synthesis and Transformation',
            subtitle: 'Combine sentences',
            icon: '🔄',
            action: () => onNavigate('synthesis-setup')
        },
        {
            id: 'comprehension',
            title: 'Comprehension',
            subtitle: 'Reading passages',
            icon: '📰',
            action: () => onNavigate('comprehension-setup')
        }
    ];

    const recommendedId = useMemo(() => userProgress.getRecommendedModule(cards), [userProgress, cards]);

    return (
        <PageLayout title="Learn" showBack={false} maxWidth="800px">

            {/* Action Cards Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: spacing.md,
                padding: spacing.sm
            }}>
                {cards.map((card) => {
                    const isRecommended = card.id === recommendedId;
                    const progress = userProgress.getProgressPercent(card.id);
                    const hasProgress = progress > 0;

                    return (
                        <button
                            key={card.id}
                            onClick={card.action}
                            style={{
                                background: isRecommended
                                    ? colors.primaryGradient
                                    : `linear-gradient(135deg, ${colors.white} 0%, ${colors.light} 100%)`,
                                border: isRecommended
                                    ? 'none'
                                    : `2px solid ${colors.border}`,
                                borderRadius: borderRadius.lg,
                                padding: spacing.lg,
                                cursor: 'pointer',
                                textAlign: 'left',
                                color: isRecommended ? 'white' : colors.dark,
                                boxShadow: isRecommended ? shadows.lg : shadows.md,
                                transition: 'all 0.2s ease',
                                minHeight: isRecommended ? '160px' : '140px',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between',
                                position: 'relative',
                                gridColumn: isRecommended ? 'span 2' : 'span 1',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = isRecommended ? shadows.lg : shadows.md;
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = isRecommended ? shadows.md : shadows.sm;
                            }}
                        >
                            {isRecommended && (
                                <div style={{
                                    position: 'absolute',
                                    top: spacing.sm,
                                    right: spacing.sm,
                                    background: 'rgba(255, 255, 255, 0.3)',
                                    borderRadius: borderRadius.sm,
                                    padding: '4px 8px',
                                    fontSize: '0.7rem',
                                    fontWeight: 'bold',
                                    color: 'white'
                                }}>
                                    RECOMMENDED
                                </div>
                            )}
                            <div style={{ fontSize: isRecommended ? '3rem' : '2.5rem', marginBottom: spacing.sm }}>
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
                                    fontSize: '0.8rem',
                                    opacity: isRecommended ? 0.9 : 0.7,
                                    marginBottom: hasProgress ? spacing.sm : 0
                                }}>
                                    {card.subtitle}
                                </div>
                                {hasProgress && (
                                    <>
                                        <div style={{
                                            fontSize: '0.75rem',
                                            marginTop: spacing.xs,
                                            marginBottom: '4px',
                                            opacity: isRecommended ? 0.9 : 0.7
                                        }}>
                                            {progress}% Complete
                                        </div>
                                        <div style={{
                                            width: '100%',
                                            height: '4px',
                                            background: isRecommended ? 'rgba(255,255,255,0.3)' : colors.border,
                                            borderRadius: '2px',
                                            overflow: 'hidden'
                                        }}>
                                            <div style={{
                                                width: `${progress}%`,
                                                height: '100%',
                                                background: isRecommended ? 'white' : colors.primary,
                                                transition: 'width 0.3s ease'
                                            }} />
                                        </div>
                                    </>
                                )}
                            </div>
                        </button>
                    );
                })}
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
