import { useState, useEffect } from 'react';
import { colors, borderRadius, shadows, spacing } from '../../styles/designTokens';
import { sfx } from '../../utils/soundEffects';

const AVATARS = ['🎓', '🦊', '🐱', '🐶', '🦁', '🐼', '🐨', '🐸', '🦉', '🐙', '🦋', '🌟'];

/**
 * ProfileModal - User profile customization
 * Allows editing name, avatar, and settings
 */
export default function ProfileModal({ userProfile, onClose, onSave }) {
    const [name, setName] = useState(userProfile?.getName() || '');
    const [avatar, setAvatar] = useState(userProfile?.getAvatar() || '🎓');
    const [soundEnabled, setSoundEnabled] = useState(true);

    useEffect(() => {
        // Load sound preference
        const savedSound = localStorage.getItem('sound_enabled');
        if (savedSound !== null) {
            setSoundEnabled(savedSound === 'true');
        }
    }, []);

    const handleSave = () => {
        sfx.playClick();
        if (userProfile) {
            userProfile.setName(name);
            userProfile.setAvatar(avatar);
        }
        localStorage.setItem('sound_enabled', soundEnabled);
        onSave?.();
        onClose();
    };

    const handleAvatarSelect = (newAvatar) => {
        sfx.playPop();
        setAvatar(newAvatar);
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000,
            padding: spacing.md
        }}>
            <div
                className="animate-pop"
                style={{
                    background: colors.white,
                    borderRadius: borderRadius.xl,
                    padding: spacing.xl,
                    maxWidth: '400px',
                    width: '100%',
                    boxShadow: shadows.lg,
                    maxHeight: '90vh',
                    overflowY: 'auto'
                }}
            >
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: spacing.lg
                }}>
                    <h2 style={{ margin: 0, color: colors.dark }}>Your Profile</h2>
                    <button
                        onClick={() => { sfx.playClick(); onClose(); }}
                        style={{
                            background: 'none',
                            border: 'none',
                            fontSize: '1.5rem',
                            cursor: 'pointer',
                            color: colors.textMuted
                        }}
                    >
                        ✕
                    </button>
                </div>

                {/* Current Avatar Display */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    marginBottom: spacing.lg
                }}>
                    <div style={{
                        width: '100px',
                        height: '100px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '3.5rem',
                        boxShadow: shadows.md
                    }}>
                        {avatar}
                    </div>
                </div>

                {/* Name Input */}
                <div style={{ marginBottom: spacing.lg }}>
                    <label style={{
                        display: 'block',
                        marginBottom: spacing.xs,
                        fontWeight: '600',
                        color: colors.dark
                    }}>
                        Your Name
                    </label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter your name..."
                        maxLength={20}
                        style={{
                            width: '100%',
                            padding: spacing.md,
                            border: `2px solid ${colors.border}`,
                            borderRadius: borderRadius.md,
                            fontSize: '1rem',
                            outline: 'none',
                            transition: 'border-color 0.2s',
                            boxSizing: 'border-box'
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#667eea'}
                        onBlur={(e) => e.target.style.borderColor = colors.border}
                    />
                </div>

                {/* Avatar Selection */}
                <div style={{ marginBottom: spacing.lg }}>
                    <label style={{
                        display: 'block',
                        marginBottom: spacing.sm,
                        fontWeight: '600',
                        color: colors.dark
                    }}>
                        Choose Avatar
                    </label>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(6, 1fr)',
                        gap: spacing.sm
                    }}>
                        {AVATARS.map(a => (
                            <button
                                key={a}
                                onClick={() => handleAvatarSelect(a)}
                                style={{
                                    width: '45px',
                                    height: '45px',
                                    borderRadius: '50%',
                                    border: avatar === a ? '3px solid #667eea' : '2px solid #eee',
                                    background: avatar === a ? '#f0f4ff' : colors.white,
                                    fontSize: '1.5rem',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    transition: 'all 0.2s'
                                }}
                            >
                                {a}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Settings */}
                <div style={{ marginBottom: spacing.lg }}>
                    <label style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: spacing.sm,
                        cursor: 'pointer'
                    }}>
                        <input
                            type="checkbox"
                            checked={soundEnabled}
                            onChange={(e) => setSoundEnabled(e.target.checked)}
                            style={{ width: '18px', height: '18px' }}
                        />
                        <span style={{ color: colors.dark }}>🔊 Sound Effects</span>
                    </label>
                </div>

                {/* Save Button */}
                <button
                    onClick={handleSave}
                    style={{
                        width: '100%',
                        padding: spacing.md,
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        border: 'none',
                        borderRadius: borderRadius.lg,
                        color: 'white',
                        fontSize: '1.1rem',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        boxShadow: shadows.sm,
                        transition: 'transform 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                    Save Profile
                </button>
            </div>
        </div>
    );
}
