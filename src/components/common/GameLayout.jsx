/**
 * GameLayout - Unified layout wrapper for all minigames
 * Provides consistent header, back button, help button, and styling
 */
import { colors, borderRadius, shadows } from '../../styles/designTokens';
import { sfx } from '../../utils/soundEffects';

export default function GameLayout({
    title,
    icon,
    onBack,
    onHelp,
    children
}) {
    return (
        <div style={{
            padding: '2rem',
            paddingBottom: '100px',
            maxWidth: '900px',
            margin: '0 auto',
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            background: colors.light,
            userSelect: 'none'
        }}>
            {/* Header */}
            <div style={{
                width: '100%',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1.5rem'
            }}>
                <button
                    onClick={() => { sfx.playClick(); onBack(); }}
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
                        color: colors.dark
                    }}
                >
                    ←
                </button>

                <h2 style={{
                    margin: 0,
                    fontSize: '1.4rem',
                    color: colors.dark,
                    fontWeight: '700'
                }}>
                    {title} {icon}
                </h2>

                {onHelp ? (
                    <button
                        onClick={() => { sfx.playClick(); onHelp(); }}
                        aria-label="Help"
                        style={{
                            background: colors.white,
                            border: 'none',
                            borderRadius: borderRadius.round,
                            width: '44px',
                            height: '44px',
                            cursor: 'pointer',
                            fontSize: '1.1rem',
                            fontWeight: 'bold',
                            color: colors.primary,
                            boxShadow: shadows.sm,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        ?
                    </button>
                ) : (
                    <div style={{ width: '44px' }} /> // Spacer for alignment
                )}
            </div>

            {/* Game Content */}
            <div style={{ width: '100%', flex: 1 }}>
                {children}
            </div>
        </div>
    );
}
