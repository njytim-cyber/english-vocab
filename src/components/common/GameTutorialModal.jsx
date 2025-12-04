import React from 'react';

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
            <div style={{
                background: 'white',
                borderRadius: '20px',
                padding: '2rem',
                maxWidth: '500px',
                width: '100%',
                boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
                animation: 'popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
            }}>
                <h2 style={{
                    textAlign: 'center',
                    color: '#2c3e50',
                    marginBottom: '1.5rem',
                    fontSize: '2rem'
                }}>
                    {title}
                </h2>

                <div style={{ marginBottom: '2rem' }}>
                    {instructions.map((step, index) => (
                        <div key={index} style={{
                            display: 'flex',
                            alignItems: 'start',
                            marginBottom: '1rem',
                            fontSize: '1.1rem',
                            color: '#34495e'
                        }}>
                            <span style={{
                                background: '#3498db',
                                color: 'white',
                                width: '24px',
                                height: '24px',
                                borderRadius: '50%',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                marginRight: '10px',
                                flexShrink: 0,
                                fontSize: '0.9rem',
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
                        background: '#2ecc71',
                        color: 'white',
                        border: 'none',
                        borderRadius: '15px',
                        fontSize: '1.2rem',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        transition: 'transform 0.1s',
                        boxShadow: '0 4px 0 #27ae60'
                    }}
                    onMouseDown={e => e.currentTarget.style.transform = 'translateY(4px)'}
                    onMouseUp={e => e.currentTarget.style.transform = 'translateY(0)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                >
                    Got it!
                </button>
            </div>
            <style>{`
                @keyframes popIn {
                    from { transform: scale(0.8); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }
            `}</style>
        </div>
    );
}
