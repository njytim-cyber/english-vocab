/**
 * PageLayout - Wrapper component for consistent page structure
 * All pages should use this as their root container
 */
import { colors, spacing, borderRadius, shadows, typography } from '../../styles/designTokens';

export default function PageLayout({
    children,
    title,
    onBack,
    rightContent,
    maxWidth = '800px',
    centered = true
}) {
    return (
        <div style={{
            minHeight: '100vh',
            padding: spacing.xl,
            paddingBottom: '100px',
            background: colors.light,
            fontFamily: typography.fontFamily,
            display: 'flex',
            flexDirection: 'column',
            alignItems: centered ? 'center' : 'stretch'
        }}>
            <div style={{
                width: '100%',
                maxWidth: maxWidth
            }}>
                {/* Header */}
                {(title || onBack) && (
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: spacing.xl,
                        width: '100%'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: spacing.md }}>
                            {onBack && (
                                <button
                                    onClick={onBack}
                                    aria-label="Go back"
                                    style={{
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
                                        color: colors.dark,
                                        transition: 'transform 0.2s, box-shadow 0.2s'
                                    }}
                                >
                                    ←
                                </button>
                            )}
                            {title && (
                                <h1 style={{
                                    margin: 0,
                                    fontSize: typography.h1.fontSize,
                                    fontWeight: typography.h1.fontWeight,
                                    color: colors.dark
                                }}>
                                    {title}
                                </h1>
                            )}
                        </div>

                        {rightContent && (
                            <div>{rightContent}</div>
                        )}
                    </div>
                )}

                {/* Content */}
                {children}
            </div>
        </div>
    );
}
