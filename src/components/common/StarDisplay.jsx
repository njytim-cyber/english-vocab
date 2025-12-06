/**
 * StarDisplay - Unified currency/reward display component
 * 
 * Use this component EVERYWHERE stars are displayed.
 * Single source of truth for currency presentation.
 */
import { colors, borderRadius, shadows, icons } from '../../styles/designTokens';

export default function StarDisplay({ count, size = 'md', showLabel = false }) {
    const sizes = {
        sm: { icon: '1rem', text: '0.9rem', padding: '0.3rem 0.6rem' },
        md: { icon: '1.1rem', text: '1rem', padding: '0.5rem 1rem' },
        lg: { icon: '1.4rem', text: '1.2rem', padding: '0.6rem 1.2rem' }
    };

    const s = sizes[size] || sizes.md;

    return (
        <div style={{
            background: colors.white,
            padding: s.padding,
            borderRadius: borderRadius.pill,
            boxShadow: shadows.sm,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem'
        }}>
            <span style={{ fontSize: s.icon }}>{icons.currency}</span>
            <strong style={{
                fontSize: s.text,
                color: colors.primary,
                fontWeight: '600'
            }}>
                {count}
            </strong>
            {showLabel && (
                <span style={{
                    fontSize: '0.8rem',
                    color: colors.textMuted,
                    marginLeft: '0.2rem'
                }}>
                    Stars
                </span>
            )}
        </div>
    );
}

/**
 * StarReward - For showing earned stars (with + prefix)
 */
export function StarReward({ amount, size = 'md' }) {
    const sizes = {
        sm: { icon: '1rem', text: '1rem' },
        md: { icon: '1.3rem', text: '1.4rem' },
        lg: { icon: '1.6rem', text: '1.8rem' }
    };

    const s = sizes[size] || sizes.md;

    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.3rem'
        }}>
            <span style={{
                fontSize: s.text,
                fontWeight: 'bold',
                color: colors.primary
            }}>
                +{amount}
            </span>
            <span style={{ fontSize: s.icon }}>{icons.currency}</span>
        </div>
    );
}

/**
 * StarCost - For showing item costs in shop
 */
export function StarCost({ cost }) {
    return (
        <span style={{
            color: colors.textMuted,
            fontSize: '0.85rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.25rem'
        }}>
            {icons.currency} {cost}
        </span>
    );
}
