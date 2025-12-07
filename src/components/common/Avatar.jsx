import React from 'react';
import PropTypes from 'prop-types';
import { colors, borderRadius, shadows } from '../../styles/designTokens';

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

    // For now, render using emojis - will upgrade to images later
    const baseEmoji = {
        human: '🧑',
        cat: '🐱',
        dog: '🐶',
        bear: '🐻',
        fox: '🦊',
        panda: '🐼'
    }[avatarData?.base || 'human'];

    const hatEmoji = avatarData?.accessories?.hat ? {
        cap: '🧢',
        crown: '👑',
        headphones: '🎧',
        graduation: '🎓',
        tophat: '🎩',
        cowboy: '🤠'
    }[avatarData.accessories.hat] : null;

    const eyesEmoji = avatarData?.face?.eyes === 'sunglasses' ? '😎' : null;

    // Background gradient
    const backgroundStyle = avatarData?.background && avatarData.background !== 'none' ? {
        gradient1: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        gradient2: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        stars: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
    }[avatarData.background] : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';

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
