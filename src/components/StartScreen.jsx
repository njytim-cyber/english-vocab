import { useState, useEffect } from 'react';
import StarDisplay from './common/StarDisplay';
import { colors, borderRadius, shadows } from '../styles/designTokens';

const VERSION = '1.2.0'; // SemVer
const AVATARS = ['🦊', '🐼', '🦁', '🐯', '🐸', '🦄'];

export default function StartScreen({ onNavigate, engine, onStartArena, userProfile }) {
    const [selectedAvatar, setSelectedAvatar] = useState(userProfile?.getAvatar() || AVATARS[0]);
    const [playerName, setPlayerName] = useState(userProfile?.getName() || '');
    const [isEditingName, setIsEditingName] = useState(!userProfile?.getName());

    // Sync avatar selection with profile
    useEffect(() => {
        if (userProfile && selectedAvatar !== userProfile.getAvatar()) {
            userProfile.setAvatar(selectedAvatar);
        }
    }, [selectedAvatar, userProfile]);

    const handleNameSave = () => {
        if (playerName.trim() && userProfile) {
            userProfile.setName(playerName.trim());
            setIsEditingName(false);
        }
    };

    const displayName = userProfile?.getDisplayName() || 'Adventurer';

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '1rem',
            paddingBottom: '100px',
            background: colors.light,
            color: colors.dark
        }}>
            <div style={{
                width: '100%',
                maxWidth: '500px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1.5rem'
            }}>
                <h1 style={{ fontSize: '1.8rem', margin: 0 }}>Home Base 🏠</h1>
                <StarDisplay count={engine ? engine.state.score : 0} />
            </div>

            <div className="card" style={{
                padding: '1.5rem',
                width: '100%',
                maxWidth: '500px',
                marginBottom: '1.5rem',
                textAlign: 'center',
                background: colors.white,
                borderRadius: borderRadius.lg,
                boxShadow: shadows.md
            }}>
                {/* Avatar Display */}
                <div style={{ fontSize: '5rem', marginBottom: '1rem' }}>
                    {selectedAvatar}
                </div>

                {/* Player Name Section */}
                {isEditingName ? (
                    <div style={{ marginBottom: '1rem' }}>
                        <input
                            type="text"
                            value={playerName}
                            onChange={(e) => setPlayerName(e.target.value)}
                            placeholder="Enter your name..."
                            maxLength={20}
                            style={{
                                padding: '0.8rem 1rem',
                                fontSize: '1rem',
                                border: `2px solid ${colors.primary}`,
                                borderRadius: borderRadius.md,
                                textAlign: 'center',
                                width: '80%',
                                marginBottom: '0.5rem'
                            }}
                            onKeyPress={(e) => e.key === 'Enter' && handleNameSave()}

                        />
                        <button
                            onClick={handleNameSave}
                            disabled={!playerName.trim()}
                            style={{
                                padding: '0.5rem 1.5rem',
                                background: playerName.trim() ? colors.primaryGradient : '#ccc',
                                color: colors.white,
                                border: 'none',
                                borderRadius: borderRadius.md,
                                cursor: playerName.trim() ? 'pointer' : 'not-allowed',
                                fontWeight: 'bold'
                            }}
                        >
                            Save
                        </button>
                    </div>
                ) : (
                    <div style={{ marginBottom: '1rem' }}>
                        <h2 style={{ margin: '0 0 0.3rem 0', fontSize: '1.5rem' }}>
                            Welcome, <span style={{ color: colors.primary }}>{displayName}</span>! 👋
                        </h2>
                        <button
                            onClick={() => setIsEditingName(true)}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: colors.textMuted,
                                cursor: 'pointer',
                                fontSize: '0.9rem'
                            }}
                        >
                            ✏️ Edit name
                        </button>
                    </div>
                )}

                {/* Avatar Selection */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {AVATARS.map(avatar => (
                        <button
                            key={avatar}
                            onClick={() => setSelectedAvatar(avatar)}
                            aria-label={`Select avatar ${avatar}`}
                            style={{
                                fontSize: '1.5rem',
                                padding: '0.5rem',
                                minWidth: '44px',
                                minHeight: '44px',
                                background: selectedAvatar === avatar ? `rgba(102, 126, 234, 0.2)` : 'transparent',
                                borderRadius: borderRadius.round,
                                border: selectedAvatar === avatar ? `2px solid ${colors.primary}` : '2px solid transparent',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            {avatar}
                        </button>
                    ))}
                </div>
            </div>

            <div style={{
                width: '100%',
                maxWidth: '500px',
                display: 'grid',
                gridTemplateColumns: '1fr',
                gap: '1rem'
            }}>
                <button
                    onClick={() => onNavigate('quiz-setup')}
                    style={{
                        padding: '1.5rem',
                        fontSize: '1.1rem',
                        background: colors.primaryGradient,
                        color: colors.white,
                        borderRadius: borderRadius.lg,
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        boxShadow: shadows.primary,
                        minHeight: '80px'
                    }}
                >
                    <span style={{ fontSize: '2rem' }}>⚔️</span>
                    Start Quiz
                </button>

                <button
                    onClick={onStartArena}
                    style={{
                        padding: '1.5rem',
                        fontSize: '1.1rem',
                        background: colors.primaryGradient,
                        color: colors.white,
                        borderRadius: borderRadius.lg,
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        boxShadow: shadows.primary,
                        minHeight: '80px'
                    }}
                >
                    <span style={{ fontSize: '2rem' }}>🏟️</span>
                    The Arena
                </button>
            </div>

            {/* Version Display */}
            <div style={{
                position: 'absolute',
                bottom: '1rem',
                fontSize: '0.75rem',
                color: colors.textMuted,
                opacity: 0.5
            }}>
                v{VERSION}
            </div>
        </div>
    );
}
