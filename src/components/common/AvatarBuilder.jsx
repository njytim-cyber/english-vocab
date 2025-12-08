import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { colors, borderRadius, shadows, spacing } from '../../styles/designTokens';
import Avatar from './Avatar';
import { DEFAULT_AVATAR } from '../../data/avatarTypes';

/**
 * AvatarBuilder - Interactive avatar customization component
 * Allows users to customize their avatar by selecting from owned items
 */
import { SHOP_ITEMS } from '../../engine/Economy';

/**
 * AvatarBuilder - Interactive avatar customization component
 * Allows users to customize their avatar by selecting from owned items
 */
export default function AvatarBuilder({ avatarData, ownedItems = [], onChange, readonly = false }) {
    // Defensive copy with defaults
    console.log('AvatarBuilder ownedItems:', ownedItems);
    const safeAvatarData = {
        ...DEFAULT_AVATAR,
        ...(avatarData || {}),
        face: { ...DEFAULT_AVATAR.face, ...(avatarData?.face || {}) },
        accessories: { ...DEFAULT_AVATAR.accessories, ...(avatarData?.accessories || {}) }
    };

    const [activeTab, setActiveTab] = useState('base');
    const [currentAvatar, setCurrentAvatar] = useState(safeAvatarData);

    // Available bases (always unlocked)

    // Memoize derived lists for performance
    const { bases, hats, eyes, backgrounds } = React.useMemo(() => {
        // Shop -> Avatar Mappings
        const shopAvatars = SHOP_ITEMS
            .filter(i => i.type === 'avatar')
            .map(i => ({ id: i.id, name: i.name, emoji: i.icon, shopItem: i.id }));

        const shopHats = SHOP_ITEMS
            .filter(i => i.type === 'accessory' && i.subtype === 'hat')
            .map(i => ({ id: i.id, name: i.name, emoji: i.icon, shopItem: i.id }));

        const shopEyes = SHOP_ITEMS
            .filter(i => i.type === 'accessory' && i.subtype === 'eyes')
            .map(i => ({ id: i.id, name: i.name, emoji: i.icon, shopItem: i.id }));

        const shopBackgrounds = SHOP_ITEMS.filter(i => i.type === 'theme').map(i => ({
            id: i.id, name: i.name, shopItem: i.id, color: 'linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)'
        }));

        return {
            bases: [
                // Diverse human options (gender-neutral)
                { id: 'person', name: 'Person', emoji: '🧑', free: true },
                { id: 'person-fem', name: 'Person (Feminine)', emoji: '👩', free: true },
                { id: 'person-masc', name: 'Person (Masculine)', emoji: '👨', free: true },
                { id: 'child', name: 'Child', emoji: '🧒', free: true },
                // Animal options (inherently gender-neutral)
                { id: 'cat', name: 'Cat', emoji: '🐱', free: true },
                { id: 'dog', name: 'Dog', emoji: '🐶', free: true },
                { id: 'bear', name: 'Bear', emoji: '🐻', free: true },
                { id: 'fox', name: 'Fox', emoji: '🦊', free: true },
                { id: 'panda', name: 'Panda', emoji: '🐼', free: true },
                ...shopAvatars
            ],
            hats: [
                { id: null, name: 'None', emoji: '❌', free: true },
                ...shopHats
            ],
            eyes: [
                { id: 'default', name: 'Default', emoji: '👀', free: true },
                ...shopEyes
            ],
            backgrounds: [
                { id: 'gradient1', name: 'Purple', color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', free: true },
                ...shopBackgrounds
            ]
        };
    }, []); // Empty dependency array as SHOP_ITEMS is static constant

    const tabs = React.useMemo(() => [
        { id: 'base', name: '👤 Base', items: bases },
        { id: 'eyes', name: '👓 Eyes', items: eyes },
        { id: 'hat', name: '🎩 Hat', items: hats },
        { id: 'bg', name: '🎨 Background', items: backgrounds }
    ], [bases, eyes, hats, backgrounds]);

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
        // Check shop cost automatically
        const shopItemDef = SHOP_ITEMS.find(i => i.id === item.shopItem);
        if (shopItemDef && shopItemDef.cost === 0) return true;

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
                display: 'flex',
                gap: spacing.sm,
                overflowX: 'auto',
                overflowY: 'hidden',
                padding: spacing.xs,
                scrollbarWidth: 'thin',
                scrollbarColor: `${colors.primary} ${colors.light}`,
                WebkitOverflowScrolling: 'touch',
                scrollSnapType: 'x mandatory'
            }}>
                {(currentTabData?.items || []).map(item => {
                    if (!item) return null;
                    const owned = isItemOwned(item);
                    const isSelected = activeTab === 'base' ? currentAvatar.base === item.id
                        : activeTab === 'eyes' ? currentAvatar.face?.eyes === item.id
                            : activeTab === 'hat' ? currentAvatar.accessories?.hat === item.id
                                : currentAvatar.background === item.id;

                    const isLocked = !owned;
                    const ariaLabel = `${owned ? 'Equip' : 'Locked:'} ${item.name}`;

                    return (
                        <button
                            key={item.id || 'none'}
                            onClick={() => owned && handleItemSelect(activeTab, item.id)}
                            disabled={!owned || readonly}
                            aria-label={ariaLabel}
                            title={ariaLabel}
                            style={{
                                minWidth: '70px',
                                flexShrink: 0,
                                scrollSnapAlign: 'start',
                                padding: spacing.sm,
                                borderRadius: borderRadius.md,
                                border: isSelected ? `2px solid ${colors.primary}` : `1px solid ${colors.border}`,
                                background: isSelected ? `${colors.primary}10` : owned ? colors.white : colors.light,
                                cursor: owned && !readonly ? 'pointer' : 'not-allowed',
                                opacity: 1,  // Always 1, we'll use overlay instead
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: spacing.xs,
                                position: 'relative',
                                transition: 'all 0.2s',
                                boxShadow: isSelected ? shadows.sm : 'none'
                            }}
                        >
                            {/* Locked Overlay - WCAG AA Compliant */}
                            {isLocked && (
                                <>
                                    <div style={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        right: 0,
                                        bottom: 0,
                                        background: 'rgba(0, 0, 0, 0.6)',  // High contrast overlay
                                        borderRadius: borderRadius.md,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        zIndex: 1
                                    }}>
                                        <span style={{
                                            fontSize: '1.5rem',
                                            filter: 'drop-shadow(0 0 2px rgba(255,255,255,0.8))'  // Glow for visibility
                                        }}>🔒</span>
                                    </div>
                                </>
                            )}

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
