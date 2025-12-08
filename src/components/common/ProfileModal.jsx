import { useState, useEffect } from 'react';
import { colors, borderRadius, shadows, spacing } from '../../styles/designTokens';
import { sfx } from '../../utils/soundEffects';
import AvatarBuilder from './AvatarBuilder';
import Avatar from './Avatar';
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
    // Ensure avatarData isn't null, defaulting to DEFAULT_AVATAR
    const [avatarData, setAvatarData] = useState(() => {
        try {
            return userProfile?.getAvatarData?.() || DEFAULT_AVATAR;
        } catch (e) {
            console.error('Error getting avatar data:', e);
            return DEFAULT_AVATAR;
        }
    });

    const handleSave = () => {
        sfx.playClick();
        if (userProfile) {
            userProfile.setName(name);
            if (avatarData) {
                userProfile.setAvatarData(avatarData);
            }
        }
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
            background: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000,
            padding: spacing.md,
            backdropFilter: 'blur(4px)'
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
                {/* Header (Done Button Only) */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    marginBottom: spacing.md
                }}>
                    <button
                        onClick={handleSave}
                        style={{
                            background: 'none',
                            border: 'none',
                            fontSize: '1rem',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            color: colors.primary,
                            padding: spacing.xs
                        }}
                    >
                        Done
                    </button>
                </div>

                {/* Avatar Preview */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    marginBottom: spacing.md
                }}>
                    <Avatar avatarData={avatarData} size="large" showBorder />
                </div>

                {/* Name Input */}
                <div style={{ marginBottom: spacing.xl, textAlign: 'center' }}>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter Name"
                        maxLength={20}
                        style={{
                            width: '100%',
                            maxWidth: '250px',
                            padding: spacing.sm,
                            border: 'none',
                            borderBottom: `2px solid ${colors.light}`,
                            background: 'transparent',
                            fontSize: '1.25rem',
                            fontWeight: 'bold',
                            outline: 'none',
                            textAlign: 'center',
                            color: colors.dark,
                            transition: 'border-color 0.2s'
                        }}
                        onFocus={(e) => e.target.style.borderColor = colors.primary}
                        onBlur={(e) => e.target.style.borderColor = colors.light}
                    />
                </div>

                {/* Avatar Controls (Builder without Preview) */}
                <AvatarBuilder
                    showPreview={false}
                    avatarData={avatarData}
                    ownedItems={economy?.getInventory?.() || []}
                    onChange={handleAvatarChange}
                />
            </div>
        </div >
    );
}
