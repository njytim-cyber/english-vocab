import { useState, useEffect } from 'react';
import { colors, borderRadius, shadows, spacing } from '../../styles/designTokens';
import { sfx } from '../../utils/soundEffects';
import AvatarBuilder from './AvatarBuilder';
import { DEFAULT_AVATAR } from '../../data/avatarTypes';

/**
 * ProfileModal - User profile customization
 * Allows editing name, avatar, and settings
 */
export default function ProfileModal({ userProfile, economy, onClose, onSave }) {
    const [name, setName] = useState(() => {
        try {
            return userProfile?.getName?.() || '';
        } catch (e) {
            console.error('Error getting name from profile:', e);
            return '';
        }
    });
    const [avatarData, setAvatarData] = useState(() => {
        try {
            return userProfile?.getAvatarData?.() || DEFAULT_AVATAR;
        } catch (e) {
            console.error('Error getting avatar data:', e);
            return DEFAULT_AVATAR;
        }
    });
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
            if (avatarData) {
                userProfile.setAvatarData(avatarData);
            }
        }
        localStorage.setItem('sound_enabled', soundEnabled);
        onSave?.();
        onClose();
    };

    const handleAvatarChange = (newAvatarData) => {
        sfx.playPop();
        setAvatarData(newAvatarData);
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

                {/* Avatar Builder */}
                <div style={{ marginBottom: spacing.lg }}>
                    <label style={{
                        display: 'block',
                        marginBottom: spacing.sm,
                        fontWeight: '600',
                        color: colors.dark
                    }}>
                        Customize Avatar
                    </label>
                    <AvatarBuilder
                        avatarData={avatarData}
                        ownedItems={economy?.getInventory?.() || []}
                        onChange={handleAvatarChange}
                    />
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
        </div >
    );
}
