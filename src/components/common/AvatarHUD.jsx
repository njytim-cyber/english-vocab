import { useState } from 'react';
import { colors, borderRadius, shadows, spacing, icons } from '../../styles/designTokens';

/**
 * AvatarHUD - Persistent HUD in top-right corner
 * Shows: Stars (currency) | Avatar + Name
 * Clicking avatar opens the profile modal
 */
export default function AvatarHUD({ userProfile, economy, onOpenProfile }) {
    const [isHovered, setIsHovered] = useState(false);

    const avatar = userProfile?.getAvatar() || '🎓';
    const name = userProfile?.getName() || 'Learner';
    const coins = economy?.getCoins?.() || 0;
    console.log('AvatarHUD Render:', { icons, coins, economyExists: !!economy });

    return (
        <div style={{
            position: 'fixed',
            top: spacing.md,
            right: spacing.md,
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            gap: spacing.sm
        }}>
            {/* Stars display */}
            <div style={{
                background: colors.white,
                padding: `${spacing.xs} ${spacing.md}`,
                borderRadius: '50px',
                boxShadow: shadows.sm,
                display: 'flex',
                alignItems: 'center',
                gap: spacing.xs,
                fontWeight: '600',
                fontSize: '0.95rem'
            }}>
                <span style={{ fontSize: '1.1rem' }}>{icons.currency}</span>
                <span style={{ color: colors.primary }}>{coins}</span>
            </div>

            {/* Avatar button */}
            <button
                onClick={onOpenProfile}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: spacing.sm,
                    background: isHovered
                        ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                        : colors.white,
                    border: 'none',
                    borderRadius: '50px',
                    padding: `${spacing.xs} ${spacing.md} ${spacing.xs} ${spacing.xs}`,
                    cursor: 'pointer',
                    boxShadow: isHovered ? shadows.lg : shadows.md,
                    transition: 'all 0.2s ease',
                    transform: isHovered ? 'scale(1.05)' : 'scale(1)'
                }}
            >
                <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: isHovered ? 'rgba(255,255,255,0.2)' : colors.light,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.5rem'
                }}>
                    {avatar}
                </div>
                <span style={{
                    fontWeight: '600',
                    fontSize: '0.9rem',
                    color: isHovered ? 'white' : colors.dark,
                    paddingRight: spacing.xs,
                    maxWidth: '80px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                }}>
                    {name}
                </span>
            </button>
        </div>
    );
}
