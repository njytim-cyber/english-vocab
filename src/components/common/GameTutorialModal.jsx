import React from 'react';
import { colors, borderRadius, shadows } from '../../styles/designTokens';

export default function GameTutorialModal({ title, instructions, onClose }) {
    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 2000,
            padding: '1rem'
        }}>
            <div className="animate-pop" style={{
                background: colors.white,
                borderRadius: borderRadius.xl,
                padding: '2rem',
                maxWidth: '450px',
                width: '100%',
                boxShadow: shadows.lg
            }}>
                <h2 style={{
                    textAlign: 'center',
                    color: colors.dark,
                    marginBottom: '1.5rem',
                    fontSize: '1.6rem'
                }}>
                    {title}
                </h2>

                <div style={{ marginBottom: '1.5rem' }}>
                    {instructions.map((step, index) => (
                        <div key={index} style={{
                            display: 'flex',
                            alignItems: 'start',
                            marginBottom: '0.75rem',
                            fontSize: '1rem',
                            color: colors.dark
                        }}>
                            <span style={{
                                background: colors.primaryGradient,
                                color: 'white',
                                width: '26px',
                                height: '26px',
                                borderRadius: borderRadius.round,
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                marginRight: '0.75rem',
                                flexShrink: 0,
                                fontSize: '0.85rem',
                                fontWeight: 'bold'
                            }}>
                                {index + 1}
                            </span>
                            <span>{step}</span>
                        </div>
                    ))}
                </div>

                <button
                    onClick={onClose}
                    style={{
                        width: '100%',
                        padding: '1rem',
                        background: colors.primaryGradient,
                        color: 'white',
                        border: 'none',
                        borderRadius: borderRadius.lg,
                        fontSize: '1.1rem',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        boxShadow: shadows.primary
                    }}
                >
                    Got it! 👍
                </button>
            </div>
        </div>
    );
}
