/**
 * Design Tokens - Single source of truth for all styling
 * Use these constants throughout the app for consistency
 */

export const colors = {
    // Primary brand (Material Design 3 - muted purple)
    primaryGradient: 'linear-gradient(135deg, #6750A4 0%, #625B71 100%)',
    primary: '#6750A4',
    primaryDark: '#625B71',

    // Semantic colors (WCAG AA compliant)
    success: '#6B8E23',      // Olive green
    warning: '#B8860B',      // Dark goldenrod
    error: '#C9302C',        // Muted red

    // Neutrals
    dark: '#1C1B1F',         // Material on-surface
    text: '#49454F',         // Material on-surface-variant
    textMuted: '#79747E',    // Material outline
    border: '#E7E0EC',       // Material outline-variant

    // Backgrounds
    light: '#F3EDF7',        // Material surface-variant
    white: '#FFFBFE',        // Material surface
    cardShadow: 'rgba(0, 0, 0, 0.05)'
};

// Icons and symbols - learning-focused, no monetary connotations
export const icons = {
    currency: '⭐',        // Stars for currency you earn & spend
    rewards: '🎁',         // Gift for rewards/shop section
    xp: '✨',              // Sparkles for experience
    streak: '🔥',          // Fire for streaks
    achievement: '🏆',     // Trophy for achievements
    progress: '📈',        // Chart for progress
    learn: '📚',           // Books for learning
    practice: '🎯',        // Target for practice
    mastery: {
        filled: '●',       // Filled circle for mastery level
        empty: '○'         // Empty circle for remaining
    }
};

export const spacing = {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    xxl: '3rem'
};

export const borderRadius = {
    sm: '6px',             // Reduced from 8px
    md: '10px',            // Reduced from 12px
    lg: '12px',            // Reduced from 15px
    xl: '16px',            // Reduced from 20px
    round: '50%',
    pill: '50px'
};

export const shadows = {
    sm: '0 1px 3px rgba(0, 0, 0, 0.05)',      // Flatter, reduced from 2px 8px
    md: '0 2px 6px rgba(0, 0, 0, 0.08)',      // Reduced from 4px 15px
    lg: '0 4px 12px rgba(0, 0, 0, 0.1)',      // Reduced from 8px 25px
    primary: '0 2px 8px rgba(103, 80, 164, 0.2)'  // Softer primary shadow
};

export const typography = {
    fontFamily: "'Outfit', -apple-system, BlinkMacSystemFont, sans-serif",
    h1: { fontSize: '1.8rem', fontWeight: '700' },
    h2: { fontSize: '1.4rem', fontWeight: '600' },
    h3: { fontSize: '1.1rem', fontWeight: '600' },
    body: { fontSize: '1rem', fontWeight: '400' },
    small: { fontSize: '0.85rem', fontWeight: '400' }
};

// Common component styles
export const componentStyles = {
    page: {
        minHeight: '100vh',
        padding: spacing.xl,
        paddingBottom: '100px', // NavBar space
        background: colors.light,
        fontFamily: typography.fontFamily
    },

    card: {
        background: colors.white,
        borderRadius: borderRadius.lg,
        padding: spacing.lg,
        boxShadow: shadows.sm
    },

    backButton: {
        background: colors.white,
        border: 'none',
        borderRadius: borderRadius.round,
        width: '44px',
        height: '44px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '1.2rem',
        cursor: 'pointer',
        boxShadow: shadows.sm,
        color: colors.dark
    },

    primaryButton: {
        background: colors.primaryGradient,
        color: colors.white,
        border: 'none',
        borderRadius: borderRadius.lg,
        padding: `${spacing.md} ${spacing.lg}`,
        fontSize: '1rem',
        fontWeight: 'bold',
        cursor: 'pointer',
        boxShadow: shadows.primary
    },

    secondaryButton: {
        background: colors.white,
        color: colors.primary,
        border: `2px solid ${colors.primary}`,
        borderRadius: borderRadius.lg,
        padding: `${spacing.md} ${spacing.lg}`,
        fontSize: '1rem',
        fontWeight: 'bold',
        cursor: 'pointer'
    }
};
