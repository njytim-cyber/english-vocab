
import { colors, borderRadius } from '../../styles/designTokens';

export function AchievementModal({ sticker, isUnlocked, onClose }) {
    return (
        <div style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.8)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem'
        }} onClick={onClose}>
            <div onClick={e => e.stopPropagation()} style={{
                background: 'white',
                padding: '2rem',
                borderRadius: borderRadius.xl,
                maxWidth: '400px',
                width: '100%',
                textAlign: 'center',
                position: 'relative'
            }}>
                <div style={{
                    fontSize: '4rem',
                    marginBottom: '1rem',
                    filter: isUnlocked ? 'none' : 'grayscale(100%) opacity(0.5)'
                }}>
                    {sticker.icon}
                </div>
                <h2 style={{ marginBottom: '0.5rem', color: colors.dark }}>{sticker.title}</h2>
                <p style={{ color: colors.textMuted, marginBottom: '1.5rem' }}>
                    {sticker.description}
                </p>
                <div style={{
                    padding: '0.5rem 1rem',
                    background: isUnlocked ? '#dcfce7' : colors.light,
                    color: isUnlocked ? '#166534' : colors.textMuted,
                    borderRadius: borderRadius.round,
                    display: 'inline-block',
                    fontSize: '0.9rem',
                    fontWeight: 'bold'
                }}>
                    {isUnlocked ? 'Unlocked!' : 'Locked'}
                </div>
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: '1rem',
                        right: '1rem',
                        background: 'none',
                        border: 'none',
                        fontSize: '1.5rem',
                        cursor: 'pointer',
                        color: colors.textMuted
                    }}
                >
                    ×
                </button>
            </div>
        </div>
    );
}
