import { useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { colors, borderRadius, shadows, spacing } from '../../styles/designTokens';
import Avatar from './Avatar';
import { SHOP_ITEMS } from '../../engine/Economy';
import { DEFAULT_AVATAR } from '../../data/avatarTypes';

/**
 * AvatarBuilder - Interactive avatar customization component
 * Allows users to customize their avatar by selecting from owned items
 */
export default function AvatarBuilder({ avatarData, ownedItems = [], onChange, readonly = false, showPreview = true }) {
    // Defensive copy with defaults
    const safeAvatarData = {
        ...DEFAULT_AVATAR,
        ...(avatarData || {}),
        face: { ...DEFAULT_AVATAR.face, ...(avatarData?.face || {}) },
        accessories: { ...DEFAULT_AVATAR.accessories, ...(avatarData?.accessories || {}) }
    };

    const [activeTab, setActiveTab] = useState('base');
    const [currentAvatar, setCurrentAvatar] = useState(safeAvatarData);

    // Sync internal state if prop changes
    useEffect(() => {
        setCurrentAvatar(safeAvatarData);
    }, [avatarData]);

    // Memoize derived lists for performance
    const { bases, hats, eyes, backgrounds } = useMemo(() => {
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
                { id: 'person', name: 'Person', emoji: '🧑', free: true },
                { id: 'person-fem', name: 'Person (Fem)', emoji: '👩', free: true },
                { id: 'person-masc', name: 'Person (Masc)', emoji: '👨', free: true },
                { id: 'child', name: 'Child', emoji: '🧒', free: true },
                { id: 'cat', name: 'Cat', emoji: '🐱', free: true },
                { id: 'dog', name: 'Dog', emoji: '🐶', free: true },
                { id: 'bear', name: 'Bear', emoji: '🐻', free: true },
                { id: 'fox', name: 'Fox', emoji: '🦊', free: true },
                { id: 'panda', name: 'Panda', emoji: '🐼', free: true },
                ...shopAvatars
            ],
            hats: [
                { id: null, name: 'None', emoji: null, free: true }, // Emoji null triggers special render
                ...shopHats
            ],
            eyes: [
                { id: 'default', name: 'Default', emoji: null, free: true },
                ...shopEyes
            ],
            backgrounds: [
                { id: 'gradient1', name: 'Purple', color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', free: true },
                ...shopBackgrounds
            ]
        };
    }, []);

    const tabs = useMemo(() => [
        { id: 'base', icon: '👤', items: bases },
        { id: 'eyes', icon: '👓', items: eyes },
        { id: 'hat', icon: '🎩', items: hats },
        { id: 'bg', icon: '🎨', items: backgrounds }
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
        const shopItemDef = SHOP_ITEMS.find(i => i.id === item.shopItem);
        if (shopItemDef && shopItemDef.cost === 0) return true;
        if (!item.shopItem) return false;
        return ownedItems.includes(item.shopItem);
    };

    const currentTabData = tabs.find(t => t.id === activeTab);

    return (
        <div style={{ width: '100%' }}>
            {/* Preview - Optional */}
            {showPreview && (
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    marginBottom: spacing.lg
                }}>
                    <Avatar avatarData={currentAvatar} size="large" showBorder />
                </div>
            )}

            {/* Tabs - Icon Only Pills */}
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                gap: spacing.sm,
                marginBottom: spacing.md
            }}>
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        style={{
                            padding: `${spacing.sm} ${spacing.lg}`,
                            border: 'none',
                            borderRadius: borderRadius.pill,
                            background: activeTab === tab.id ? colors.primary + '20' : 'transparent',
                            cursor: 'pointer',
                            color: activeTab === tab.id ? colors.primary : colors.textMuted,
                            fontSize: '1.2rem',
                            transition: 'all 0.2s',
                            boxShadow: activeTab === tab.id ? shadows.sm : 'none'
                        }}
                        aria-label={tab.id}
                        title={tab.id}
                    >
                        {tab.icon}
                    </button>
                ))}
            </div>

            {/* Items Grid - Horizontal Carousel */}
            <div style={{
                display: 'flex',
                gap: spacing.sm,
                overflowX: 'auto',
                overflowY: 'hidden',
                padding: `${spacing.xs} ${spacing.xs} ${spacing.md} ${spacing.xs}`,
                scrollbarWidth: 'none', // Firefox
                msOverflowStyle: 'none', // IE/Edge
                WebkitOverflowScrolling: 'touch',
                scrollSnapType: 'x mandatory'
            }}>
                <style>{`
                    /* Hide scrollbar for Chrome, Safari and Opera */
                    div::-webkit-scrollbar {
                        display: none;
                    }
                `}</style>
                {(currentTabData?.items || []).map(item => {
                    if (!item) return null;
                    const owned = isItemOwned(item);
                    const isSelected = activeTab === 'base' ? currentAvatar.base === item.id
                        : activeTab === 'eyes' ? currentAvatar.face?.eyes === item.id
                            : activeTab === 'hat' ? currentAvatar.accessories?.hat === item.id
                                : currentAvatar.background === item.id;

                    const isLocked = !owned;
                    const ariaLabel = `${owned ? 'Equip' : 'Locked:'} ${item.name}`;

                    // Special rendering for 'None' or 'Default' which might have null emoji
                    const renderIcon = () => {
                        if (item.emoji === null && item.id === null) {
                            // "None" / Null item
                            return <div style={{
                                width: '24px',
                                height: '24px',
                                border: `2px dashed ${colors.textMuted}`,
                                borderRadius: '50%'
                            }} />;
                        }
                        if (activeTab === 'bg' && item.color) {
                            return <div style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '50%',
                                background: item.color,
                                border: `1px solid ${colors.border}`
                            }} />;
                        }
                        if (item.emoji) {
                            return <div style={{ fontSize: '1.5rem', lineHeight: 1 }}>{item.emoji}</div>;
                        }
                        // Fallback
                        return <div style={{ fontSize: '1rem' }}>?</div>;
                    };

                    return (
                        <button
                            key={item.id || 'none'}
                            onClick={() => owned && handleItemSelect(activeTab, item.id)}
                            disabled={!owned || readonly}
                            aria-label={ariaLabel}
                            title={item.name}
                            style={{
                                minWidth: '60px',
                                height: '60px',
                                flexShrink: 0,
                                scrollSnapAlign: 'start',
                                borderRadius: borderRadius.lg,
                                border: isSelected ? `2px solid ${colors.primary}` : `1px solid ${colors.border}`,
                                background: isSelected ? `${colors.primary}10` : colors.white,
                                cursor: owned && !readonly ? 'pointer' : 'default',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                position: 'relative',
                                transition: 'all 0.2s',
                                boxShadow: isSelected ? shadows.sm : 'none'
                            }}
                        >
                            {renderIcon()}

                            {/* Locked Icon */}
                            {isLocked && (
                                <div style={{
                                    position: 'absolute',
                                    top: '2px',
                                    right: '2px',
                                    fontSize: '0.7rem'
                                }}>🔒</div>
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

AvatarBuilder.propTypes = {
    avatarData: PropTypes.object,
    ownedItems: PropTypes.array,
    onChange: PropTypes.func,
    readonly: PropTypes.bool,
    showPreview: PropTypes.bool
};
