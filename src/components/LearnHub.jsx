import { useMemo } from 'react';
import { colors, borderRadius, shadows, spacing } from '../styles/designTokens';
import PageLayout from './common/PageLayout';
import UserProgress from '../engine/UserProgress';
import { useIsMobile } from '../hooks/useIsMobile';


/**
 * LearnHub - Central learning dashboard
 * Shows Vocab MCQ only (Word Games moved to nav)
 */
export default function LearnHub({ onNavigate }) {
    const isMobile = useIsMobile();
    const userProgress = useMemo(() => new UserProgress(), []);

    const cards = useMemo(() => [
        {
            id: 'vocab-mcq',
            title: 'Vocab MCQ',
            icon: '📝',
            action: () => onNavigate('quiz-setup')
        },
        {
            id: 'vocab-cloze',
            title: 'Vocab Cloze',
            icon: '📖',
            action: () => onNavigate('cloze-setup')
        },
        {
            id: 'grammar-mcq',
            title: 'Grammar MCQ',
            icon: '✏️',
            action: () => onNavigate('grammar')
        },
        {
            id: 'grammar-cloze',
            title: 'Grammar Cloze',
            icon: '📜',
            action: () => onNavigate('grammar-cloze-setup')
        },
        {
            id: 'spelling',
            title: 'Spelling',
            icon: '🔤',
            action: () => onNavigate('spelling')
        },
        {
            id: 'synthesis',
            title: 'Synthesis',
            icon: '🔄',
            action: () => onNavigate('synthesis-setup')
        },
        {
            id: 'listening',
            title: 'Listening',
            icon: '🎧',
            action: () => onNavigate('listening-setup')
        },
        {
            id: 'comprehension',
            title: 'Comprehension',
            icon: '📰',
            action: () => onNavigate('comprehension-setup')
        }
    ], [onNavigate]);

    const recommendedId = useMemo(() => userProgress.getRecommendedModule(cards), [userProgress, cards]);

    return (
        <PageLayout title="Learn" showBack={false} maxWidth="800px">

            {/* PREMIUM HERO BANNER - Listening Comprehension */}
            <div
                onClick={() => onNavigate('listening-setup')}
                style={{
                    position: 'relative',
                    display: 'flex',
                    flexDirection: isMobile ? 'column' : 'row',
                    alignItems: 'center',
                    minHeight: '140px',
                    marginBottom: spacing.xl,
                    padding: `${spacing.lg} ${spacing.lg}`,
                    borderRadius: borderRadius.xl,
                    background: 'linear-gradient(135deg, #2a2a3e 0%, #1a1a2e 100%)',
                    color: colors.white,
                    boxShadow: '0 0 0 1px rgba(255, 215, 0, 0.3), 0 10px 30px -10px rgba(0, 0, 0, 0.5)',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 0 0 1px rgba(255, 215, 0, 0.5), 0 15px 40px -10px rgba(0, 0, 0, 0.6)';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 0 0 1px rgba(255, 215, 0, 0.3), 0 10px 30px -10px rgba(0, 0, 0, 0.5)';
                }}
            >
                <div style={{
                    display: 'flex',
                    flexDirection: isMobile ? 'column' : 'row',
                    alignItems: 'center',
                    gap: isMobile ? spacing.md : spacing.lg,
                    flex: 1,
                    textAlign: isMobile ? 'center' : 'left'
                }}>
                    {/* Icon with PRO Badge */}
                    <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div style={{
                            background: '#ffd700',
                            color: '#000',
                            fontWeight: '800',
                            fontSize: '0.7rem',
                            padding: '4px 8px',
                            borderRadius: borderRadius.sm,
                            textTransform: 'uppercase',
                            marginBottom: spacing.xs
                        }}>
                            PRO
                        </div>
                        <div style={{ fontSize: '3rem' }}>🎧</div>
                    </div>

                    {/* Text Content */}
                    <div>
                        <h2 style={{
                            fontSize: isMobile ? '1.4rem' : '1.8rem',
                            margin: 0,
                            marginBottom: spacing.xs,
                            fontWeight: 'bold',
                            background: 'linear-gradient(to right, #fff, #ffd700)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text'
                        }}>
                            Listening Comprehension
                        </h2>
                        <p style={{
                            opacity: 0.8,
                            fontSize: '1rem',
                            margin: 0
                        }}>
                            Master native accents with studio-quality audio scenes.
                        </p>
                    </div>
                </div>

                {/* Arrow indicator */}
                <div style={{
                    fontSize: '1.5rem',
                    opacity: 0.6,
                    color: '#ffd700',
                    transform: isMobile ? 'rotate(90deg)' : 'none',
                    marginTop: isMobile ? spacing.md : 0
                }}>
                    →
                </div>
            </div>

            {/* Action Cards Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                gap: spacing.sm,
                padding: isMobile ? spacing.xs : spacing.sm
            }}>
                {cards.filter(card => card.id !== 'listening').map((card) => {
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


