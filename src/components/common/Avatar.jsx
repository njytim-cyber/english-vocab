import React from 'react';
import PropTypes from 'prop-types';
import { colors, borderRadius, shadows } from '../../styles/designTokens';
import { SHOP_ITEMS } from '../../engine/Economy';

/**
 * Avatar - Display component for layered avatar
 * Renders avatar from avatarData using layered images/emojis
 */
export default function Avatar({ avatarData, size = 'medium', showBorder = true, onClick }) {
    const sizes = {
        small: { container: '48px', base: '40px', accessory: '24px' },
        medium: { container: '80px', base: '64px', accessory: '40px' },
        large: { container: '120px', base: '96px', accessory: '60px' }
    };

    const currentSize = sizes[size];

    // Helper to get emoji from ID (checking both defaults and shop)
    const getIcon = (id, type) => {
        if (!id) return null;

        // 1. Check Shop Items
        const shopItem = SHOP_ITEMS.find(i => i.id === id);
        if (shopItem) return shopItem.icon;

        // 2. Check Defaults (Free Items)
        const defaults = {
            // Bases
            person: '🧑', 'person-fem': '👩', 'person-masc': '👨', child: '🧒',
            cat: '🐱', dog: '🐶', bear: '🐻', fox: '🦊', panda: '🐼',
            // Hats
            none: null,
            // Eyes
            default: null,
            // Backgrounds
            gradient1: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        };
        return defaults[id] || defaults['person']; // Fallback
    };

    const baseEmoji = getIcon(avatarData?.base, 'avatar') || '🧑';
    const hatEmoji = getIcon(avatarData?.accessories?.hat, 'hat');
    const eyesEmoji = getIcon(avatarData?.face?.eyes, 'eyes');

    // Background logic
    let backgroundStyle = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    if (avatarData?.background && avatarData.background !== 'none') {
        const shopBg = SHOP_ITEMS.find(i => i.id === avatarData.background);
        // Special case for gradients which aren't just icons
        if (avatarData.background === 'gradient1') {
            backgroundStyle = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
        } else if (shopBg && shopBg.type === 'theme') {
            const themeMap = {
                theme_ocean: 'linear-gradient(180deg, #4facfe 0%, #00f2fe 100%)',
                theme_forest: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                theme_sunset: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                theme_galaxy: 'linear-gradient(to right, #434343 0%, black 100%)'
            };
            backgroundStyle = themeMap[avatarData.background] || backgroundStyle;
        }
    }

    return (
        <div
            onClick={onClick}
            style={{
                width: currentSize.container,
                height: currentSize.container,
                borderRadius: '50%',
                background: backgroundStyle,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                cursor: onClick ? 'pointer' : 'default',
                border: showBorder ? `3px solid ${colors.white}` : 'none',
                boxShadow: showBorder ? shadows.md : 'none',
                transition: 'transform 0.2s',
                fontSize: size === 'small' ? '1.5rem' : size === 'medium' ? '2.5rem' : '4rem'
            }}
            onMouseEnter={(e) => onClick && (e.currentTarget.style.transform = 'scale(1.05)')}
            onMouseLeave={(e) => onClick && (e.currentTarget.style.transform = 'scale(1)')}
        >
            {/* Base Character */}
            <div style={{
                position: 'absolute',
                fontSize: 'inherit'
            }}>
                {baseEmoji}
            </div>

            {/* Hat Accessory (on top) */}
            {hatEmoji && (
                <div style={{
                    position: 'absolute',
                    top: size === 'small' ? '-8px' : size === 'medium' ? '-12px' : '-16px',
                    fontSize: size === 'small' ? '1.2rem' : size === 'medium' ? '1.8rem' : '3rem'
                }}>
                    {hatEmoji}
                </div>
            )}

            {/* Eye Accessory (sunglasses overlay) */}
            {eyesEmoji && (
                <div style={{
                    position: 'absolute',
                    fontSize: 'inherit'
                }}>
                    {eyesEmoji}
                </div>
            )}
        </div>
    );
}

Avatar.propTypes = {
    avatarData: PropTypes.shape({
        base: PropTypes.string,
        face: PropTypes.shape({
            eyes: PropTypes.string,
            mouth: PropTypes.string
        }),
        accessories: PropTypes.shape({
            hat: PropTypes.string,
            faceItem: PropTypes.string
        }),
        background: PropTypes.string
    }),
    size: PropTypes.oneOf(['small', 'medium', 'large']),
    showBorder: PropTypes.bool,
    onClick: PropTypes.func
};
