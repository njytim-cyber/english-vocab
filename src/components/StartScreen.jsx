import { useState, useEffect } from 'react';
import StarDisplay from './common/StarDisplay';

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
            padding: '2rem',
            paddingBottom: '100px',
            background: 'var(--light)',
            color: 'var(--dark)'
        }}>
            <div style={{
                width: '100%',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '2rem'
            }}>
                <h1 style={{ fontSize: '2rem', margin: 0 }}>Home Base 🏠</h1>
                <StarDisplay count={engine ? engine.state.score : 0} />
            </div>

            <div className="card" style={{
                padding: '2rem',
                width: '100%',
                maxWidth: '500px',
                marginBottom: '2rem',
                textAlign: 'center',
                background: 'linear-gradient(135deg, #ffffff 0%, #f0f2f5 100%)'
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
                                fontSize: '1.1rem',
                                border: '2px solid #667eea',
                                borderRadius: '10px',
                                textAlign: 'center',
                                width: '80%',
                                marginBottom: '0.5rem'
                            }}
                            onKeyPress={(e) => e.key === 'Enter' && handleNameSave()}
                            autoFocus
                        />
                        <button
                            onClick={handleNameSave}
                            disabled={!playerName.trim()}
                            style={{
                                padding: '0.5rem 1.5rem',
                                background: playerName.trim() ? 'linear-gradient(135deg, #667eea, #764ba2)' : '#ccc',
                                color: 'white',
                                border: 'none',
                                borderRadius: '10px',
                                cursor: playerName.trim() ? 'pointer' : 'not-allowed',
                                fontWeight: 'bold'
                            }}
                        >
                            Save
                        </button>
                    </div>
                ) : (
                    <div style={{ marginBottom: '1rem' }}>
                        <h2 style={{ margin: '0 0 0.3rem 0' }}>
                            Welcome, <span style={{ color: '#667eea' }}>{displayName}</span>! 👋
                        </h2>
                        <button
                            onClick={() => setIsEditingName(true)}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: '#888',
                                cursor: 'pointer',
                                fontSize: '0.9rem'
                            }}
                        >
                            ✏️ Edit name
                        </button>
                    </div>
                )}

                {/* Avatar Selection */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
                    {AVATARS.map(avatar => (
                        <button
                            key={avatar}
                            onClick={() => setSelectedAvatar(avatar)}
                            style={{
                                fontSize: '1.5rem',
                                padding: '0.5rem',
                                background: selectedAvatar === avatar ? 'rgba(102, 126, 234, 0.2)' : 'transparent',
                                borderRadius: '50%',
                                border: selectedAvatar === avatar ? '2px solid #667eea' : '2px solid transparent',
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
                gridTemplateColumns: '1fr 1fr',
                gap: '1rem'
            }}>
                <button
                    onClick={() => onNavigate('quiz-setup')}
                    style={{
                        padding: '2rem',
                        fontSize: '1.2rem',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        borderRadius: '20px',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        boxShadow: '0 4px 10px rgba(102, 126, 234, 0.4)'
                    }}
                >
                    <span style={{ fontSize: '2rem' }}>⚔️</span>
                    Start Quiz
                </button>

                <button
                    onClick={onStartArena}
                    style={{
                        padding: '2rem',
                        fontSize: '1.2rem',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        borderRadius: '20px',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        boxShadow: '0 4px 10px rgba(102, 126, 234, 0.4)'
                    }}
                >
                    <span style={{ fontSize: '2rem' }}>🏟️</span>
                    The Arena
                </button>
            </div>
        </div>
    );
}
