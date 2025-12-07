import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { colors, borderRadius, shadows, spacing } from '../../styles/designTokens';
import Avatar from './Avatar';
import { DEFAULT_AVATAR } from '../../data/avatarTypes';

/**
 * AvatarBuilder - Interactive avatar customization component
 * Allows users to customize their avatar by selecting from owned items
 */
export default function AvatarBuilder({ avatarData, ownedItems = [], onChange, readonly = false }) {
    const [activeTab, setActiveTab] = useState('base');
    const [currentAvatar, setCurrentAvatar] = useState(avatarData || DEFAULT_AVATAR);

    // Available bases (always unlocked)
    const bases = [
        { id: 'human', name: 'Human', emoji: '🧑' },
        { id: 'cat', name: 'Cat', emoji: '🐱' },
        { id: 'dog', name: 'Dog', emoji: '🐶' },
        { id: 'bear', name: 'Bear', emoji: '🐻' },
        { id: 'fox', name: 'Fox', emoji: '🦊' },
        { id: 'panda', name: 'Panda', emoji: '🐼' }
    ];

    // Available hats (shop items)
    const hats = [
        { id: null, name: 'None', emoji: '❌', free: true },
        { id: 'cap', name: 'Cap', emoji: '🧢', shopItem: 'cap' },
        { id: 'crown', name: 'Crown', emoji: '👑', shopItem: 'crown' },
        { id: 'headphones', name: 'Headphones', emoji: '🎧', shopItem: 'headphones' },
        { id: 'graduation', name: 'Grad Cap', emoji: '🎓', shopItem: 'graduation_cap' },
        { id: 'tophat', name: 'Top Hat', emoji: '🎩', shopItem: 'tophat' },
        { id: 'cowboy', name: 'Cowboy', emoji: '🤠', shopItem: 'cowboy_hat' }
    ];

    // Eye accessories  
    const eyes = [
        { id: 'default', name: 'Default', emoji: '👀', free: true },
        { id: 'sunglasses', name: 'Sunglasses', emoji: '😎', shopItem: 'sunglasses' },
        { id: 'glasses', name: 'Glasses', emoji: '🤓', shopItem: 'glasses' }
    ];

    // Backgrounds
    const backgrounds = [
        { id: 'none', name: 'None', free: true },
        { id: 'gradient1', name: 'Purple', color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', free: true },
        { id: 'gradient2', name: 'Pink', color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', shopItem: 'bg_pink' },
        { id: 'stars', name: 'Stars', color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', shopItem: 'bg_stars' }
    ];

    const tabs = [
        { id: 'base', name: '👤 Base', items: bases },
        { id: 'eyes', name: '👓 Eyes', items: eyes },
        { id: 'hat', name: '🎩 Hat', items: hats },
        { id: 'bg', name: '🎨 Background', items: backgrounds }
    ];

    const handleItemSelect = (tabId, itemId) => {
        if (readonly) return;

        let updated = { ...currentAvatar };

        switch (tabId) {
            case 'base':
                updated.base = itemId;
                break;
            case 'eyes':
                updated.face = { ...updated.face, eyes: itemId };
                break;
            case 'hat':
                updated.accessories = { ...updated.accessories, hat: itemId };
                break;
            case 'bg':
                updated.background = itemId;
                break;
        }

        setCurrentAvatar(updated);
        onChange?.(updated);
    };

    const isItemOwned = (item) => {
        if (item.free) return true;
        if (!item.shopItem) return false;
        return ownedItems.includes(item.shopItem);
    };

    const currentTabData = tabs.find(t => t.id === activeTab);

    return (
        <div style={{ width: '100%' }}>
            {/* Preview */}
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                marginBottom: spacing.lg
            }}>
                <Avatar avatarData={currentAvatar} size="large" showBorder />
            </div>

            {/* Tabs */}
            <div style={{
                display: 'flex',
                gap: spacing.xs,
                marginBottom: spacing.md,
                borderBottom: `2px solid ${colors.border}`
            }}>
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        style={{
                            padding: spacing.sm,
                            border: 'none',
                            borderBottom: activeTab === tab.id ? `3px solid ${colors.primary}` : '3px solid transparent',
                            background: 'transparent',
                            cursor: 'pointer',
                            fontWeight: activeTab === tab.id ? 'bold' : 'normal',
                            color: activeTab === tab.id ? colors.primary : colors.textMuted,
                            fontSize: '0.9rem',
                            transition: 'all 0.2s'
                        }}
                    >
                        {tab.name}
                    </button>
                ))}
            </div>

            {/* Items Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(70px, 1fr))',
                gap: spacing.sm,
                maxHeight: '200px',
                overflowY: 'auto',
                padding: spacing.xs
            }}>
                {currentTabData?.items.map(item => {
                    const owned = isItemOwned(item);
                    const isSelected = activeTab === 'base' ? currentAvatar.base === item.id
                        : activeTab === 'eyes' ? currentAvatar.face?.eyes === item.id
                            : activeTab === 'hat' ? currentAvatar.accessories?.hat === item.id
                                : currentAvatar.background === item.id;

                    return (
                        <button
                            key={item.id || 'none'}
                            onClick={() => owned && handleItemSelect(activeTab, item.id)}
                            disabled={!owned || readonly}
                            style={{
                                padding: spacing.sm,
                                borderRadius: borderRadius.md,
                                border: isSelected ? `2px solid ${colors.primary}` : `1px solid ${colors.border}`,
                                background: isSelected ? `${colors.primary}10` : owned ? colors.white : colors.light,
                                cursor: owned && !readonly ? 'pointer' : 'not-allowed',
                                opacity: owned ? 1 : 0.4,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: spacing.xs,
                                transition: 'all 0.2s',
                                position: 'relative'
                            }}
                        >
                            {activeTab === 'bg' && item.color ? (
                                <div style={{
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '50%',
                                    background: item.color,
                                    border: `2px solid ${colors.border}`
                                }} />
                            ) : (
                                <div style={{ fontSize: '2rem' }}>{item.emoji}</div>
                            )}
                            <div style={{ fontSize: '0.7rem', textAlign: 'center', color: colors.dark }}>
                                {item.name}
                            </div>
                            {!owned && (
                                <div style={{
                                    position: 'absolute',
                                    top: '4px',
                                    right: '4px',
                                    fontSize: '0.8rem'
                                }}>🔒</div>
                            )}
                        </button>
                    );
                })}
            </div>

            {!ownedItems.length && (
                <div style={{
                    textAlign: 'center',
                    padding: spacing.lg,
                    color: colors.textMuted,
                    fontSize: '0.9rem'
                }}>
                    💡 Visit the shop to unlock more items!
                </div>
            )}
        </div>
    );
}

AvatarBuilder.propTypes = {
    avatarData: PropTypes.object,
    ownedItems: PropTypes.arrayOf(PropTypes.string),
    onChange: PropTypes.func,
    readonly: PropTypes.bool
};
