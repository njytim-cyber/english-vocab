/**
 * PageLayout - Wrapper component for consistent page structure
 * All pages should use this as their root container
 */
import React from 'react';
import { colors, spacing, borderRadius, shadows, typography } from '../../styles/designTokens';
import { useIsMobile } from '../../hooks/useIsMobile';

export default function PageLayout({
    children,
    title,
    onBack,
    rightContent,
    maxWidth = '800px',
    centered = true
}) {
    const isMobile = useIsMobile();

    return (
        <div style={{
            minHeight: '100vh',
            padding: isMobile ? spacing.md : spacing.xl,
            paddingTop: isMobile ? '80px' : spacing.xl, // Extra padding for HUD on mobile
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
                {/* Header - Sticky */}
                {(title || onBack) && (
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: spacing.xl,
                        width: '100%',
                        position: 'sticky',
                        top: 0,
                        zIndex: 900,
                        background: colors.light, // Fully opaque to prevent content bleeding through
                        backdropFilter: 'none',
                        padding: isMobile ? '0.5rem 0' : '0',
                        marginTop: isMobile ? '-0.5rem' : '0'
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
                                        width: isMobile ? '36px' : '44px',
                                        height: isMobile ? '36px' : '44px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: isMobile ? '1rem' : '1.2rem',
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
                                    fontSize: isMobile ? '1.5rem' : typography.h1.fontSize,
                                    fontWeight: typography.h1.fontWeight,
                                    color: colors.dark
                                }}>
                                    {title}
                                </h1>
                            )}
                        </div>

                        {rightContent && (
                            <div style={{ transform: isMobile ? 'scale(0.8)' : 'none' }}>{rightContent}</div>
                        )}
                    </div>
                )}

                {/* Content */}
                {children}
            </div>
        </div>
    );
}
