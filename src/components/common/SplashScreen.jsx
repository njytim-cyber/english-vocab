import { useEffect, useState } from 'react';
import { triggerConfetti } from '../../utils/effects';
import { colors, borderRadius, shadows, spacing } from '../../styles/designTokens';
import releaseNotes from '../../data/release_notes.json';

/**
 * SplashScreen - Exciting modal to celebrate major releases
 * @param {Object} props
 * @param {string} props.version - Current app version (e.g., "2.0.0")
 * @param {function} props.onClose - Callback when user dismisses splash
 * @param {boolean} props.show - Whether to display the splash
 */
export default function SplashScreen({ version, onClose, show }) {
    const [isVisible, setIsVisible] = useState(false);
    const releaseData = releaseNotes[version] || null;

    useEffect(() => {
        if (show && releaseData) {
            // Delay to ensure smooth animation
            setTimeout(() => setIsVisible(true), 100);
            triggerConfetti();
        }
    }, [show, releaseData]);

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(onClose, 300); // Wait for fade-out animation
    };

    if (!show || !releaseData) return null;

    return (
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: 'rgba(0, 0, 0, 0.85)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: 9999,
                opacity: isVisible ? 1 : 0,
                transition: 'opacity 0.3s ease-in-out'
            }}
            onClick={handleClose}
        >
            <div
                className="animate-pop"
                style={{
                    background: releaseData.background,
                    padding: spacing.xxl,
                    borderRadius: borderRadius.xxl,
                    textAlign: 'center',
                    maxWidth: '90%',
                    width: '450px',
                    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
                    color: colors.white,
                    transform: isVisible ? 'scale(1)' : 'scale(0.8)',
                    transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Version Badge */}
                <div
                    style={{
                        display: 'inline-block',
                        background: 'rgba(255, 255, 255, 0.2)',
                        padding: `${spacing.xs} ${spacing.md}`,
                        borderRadius: borderRadius.pill,
                        fontSize: '0.85rem',
                        fontWeight: 'bold',
                        marginBottom: spacing.md,
                        backdropFilter: 'blur(10px)'
                    }}
                >
                    v{version}
                </div>

                {/* Title */}
                <h1
                    style={{
                        fontSize: '2.2rem',
                        margin: `0 0 ${spacing.sm} 0`,
                        fontWeight: 'bold',
                        textShadow: '0 2px 10px rgba(0, 0, 0, 0.3)'
                    }}
                >
                    {releaseData.title}
                </h1>

                {/* Tagline */}
                <p
                    style={{
                        fontSize: '1.1rem',
                        margin: `0 0 ${spacing.lg} 0`,
                        opacity: 0.9
                    }}
                >
                    {releaseData.tagline}
                </p>

                {/* Highlights */}
                <div
                    style={{
                        background: 'rgba(0, 0, 0, 0.2)',
                        borderRadius: borderRadius.lg,
                        padding: spacing.lg,
                        marginBottom: spacing.xl,
                        backdropFilter: 'blur(10px)'
                    }}
                >
                    <h3 style={{ fontSize: '1rem', marginBottom: spacing.md, opacity: 0.9 }}>
                        What's New:
                    </h3>
                    <ul
                        style={{
                            listStyle: 'none',
                            padding: 0,
                            margin: 0,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: spacing.sm
                        }}
                    >
                        {releaseData.highlights.map((highlight, idx) => (
                            <li
                                key={idx}
                                style={{
                                    fontSize: '1rem',
                                    fontWeight: '500',
                                    padding: spacing.sm,
                                    background: 'rgba(255, 255, 255, 0.1)',
                                    borderRadius: borderRadius.md
                                }}
                            >
                                {highlight}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Continue Button */}
                <button
                    onClick={handleClose}
                    style={{
                        padding: `${spacing.md} ${spacing.xl}`,
                        fontSize: '1.1rem',
                        background: colors.white,
                        color: colors.primary,
                        border: 'none',
                        borderRadius: borderRadius.lg,
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        boxShadow: shadows.elevation2,
                        transition: 'transform 0.2s'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
                    onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                >
                    Let's Go! 🚀
                </button>
            </div>
        </div>
    );
}
