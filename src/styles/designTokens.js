/**
 * Design Tokens - Single source of truth for all styling
 * Use these constants throughout the app for consistency
 */

export const colors = {
    // Primary brand gradient
    primaryGradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    primary: '#667eea',
    primaryDark: '#764ba2',

    // Semantic colors
    success: '#2ecc71',
    warning: '#f1c40f',
    error: '#e74c3c',

    // Neutrals
    dark: '#2c3e50',
    text: '#34495e',
    textMuted: '#7f8c8d',
    border: '#e0e0e0',

    // Backgrounds
    light: '#f8f9fa',
    white: '#ffffff',
    cardShadow: 'rgba(0, 0, 0, 0.08)'
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
    sm: '8px',
    md: '12px',
    lg: '15px',
    xl: '20px',
    round: '50%',
    pill: '50px'
};

export const shadows = {
    sm: '0 2px 8px rgba(0, 0, 0, 0.08)',
    md: '0 4px 15px rgba(0, 0, 0, 0.1)',
    lg: '0 8px 25px rgba(0, 0, 0, 0.12)',
    primary: '0 4px 15px rgba(102, 126, 234, 0.3)'
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
