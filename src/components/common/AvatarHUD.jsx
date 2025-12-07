import { useState, useEffect } from 'react';
import { colors, borderRadius, shadows, spacing, icons } from '../../styles/designTokens';

/**
 * AvatarHUD - Persistent HUD in top-right corner
 * Shows: Stars (currency, clickable → Shop) | Avatar + Name
 * Clicking avatar opens the profile modal
 */
export default function AvatarHUD({ userProfile, economy, onOpenProfile, onOpenShop }) {
    const [isHovered, setIsHovered] = useState(false);
    const [isCurrencyHovered, setIsCurrencyHovered] = useState(false);
    const [stats, setStats] = useState({
        coins: economy?.getCoins() || 0,
        xp: economy?.getXP?.() || 0,
        level: economy?.getLevel?.() || 1
    });

    useEffect(() => {
        if (!economy || !economy.subscribe) return;

        // Initial sync
        setStats({
            coins: economy.getCoins(),
            xp: economy.getXP(),
            level: economy.getLevel()
        });

        const unsubscribe = economy.subscribe((newState) => {
            setStats({
                coins: newState.coins,
                xp: newState.xp || 0,
                level: newState.level || 1
            });
        });
        return unsubscribe;
    }, [economy]);

    const avatar = userProfile?.getAvatar() || '🎓';
    const name = userProfile?.getName() || 'Learner';
    const equippedItems = userProfile?.getEquippedItems() || { hat: null, accessory: null, skin: null };

    // XP Progress Calculation
    const currentLevelBaseXP = Math.pow(stats.level - 1, 2) * 100;
    const nextLevelXP = Math.pow(stats.level, 2) * 100;
    const progress = Math.min(100, Math.max(0, ((stats.xp - currentLevelBaseXP) / (nextLevelXP - currentLevelBaseXP)) * 100));

    return (
        <>
            {/* Profile Pill - TOP LEFT */}
            <button
                onClick={onOpenProfile}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                style={{
                    position: 'fixed',
                    top: spacing.md,
                    left: spacing.md,
                    zIndex: 1000,
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
                    transform: isHovered ? 'scale(1.05)' : 'scale(1)',
                    height: '48px'
                }}
            >
                <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: isHovered ? 'rgba(255,255,255,0.2)' : colors.light,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.3rem',
                    position: 'relative'
                }}>
                    {avatar}
                    {/* Equipped item overlay */}
                    {(equippedItems.hat || equippedItems.accessory) && (
                        <span style={{
                            position: 'absolute',
                            top: '-8px',
                            right: '-4px',
                            fontSize: '1.1rem',
                            filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))'
                        }}>
                            {equippedItems.hat === 'crown' ? '👑' :
                                equippedItems.hat === 'hat' ? '🎩' :
                                    equippedItems.accessory === 'sunglasses' ? '🕶️' : null}
                        </span>
                    )}
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

            {/* Currency Display - TOP RIGHT */}
            <button
                onClick={onOpenShop}
                onMouseEnter={() => setIsCurrencyHovered(true)}
                onMouseLeave={() => setIsCurrencyHovered(false)}
                style={{
                    position: 'fixed',
                    top: spacing.md,
                    right: spacing.md,
                    zIndex: 1000,
                    background: isCurrencyHovered
                        ? 'linear-gradient(135deg, #f1c40f 0%, #e67e22 100%)'
                        : colors.white,
                    padding: '0 16px',
                    borderRadius: '50px',
                    boxShadow: isCurrencyHovered ? shadows.md : shadows.sm,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '0.9rem',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    transform: isCurrencyHovered ? 'scale(1.05)' : 'scale(1)',
                    height: '48px'
                }}
                title="Open Rewards Shop"
            >
                <span style={{ fontSize: '1.1rem' }}>{icons.currency}</span>
                <span style={{
                    fontWeight: '600',
                    color: isCurrencyHovered ? 'white' : colors.dark
                }}>
                    {stats.coins}
                </span>
            </button>
        </>
    );
}
