import { useState, useEffect } from 'react';
import { ACHIEVEMENTS } from '../engine/Achievements';
import PageLayout from './common/PageLayout';
import { colors, borderRadius, shadows } from '../styles/designTokens';

export default function StickerBook({ achievements, onBack, onNavigate }) {
    const [unlocked, setUnlocked] = useState(new Set(achievements.getUnlocked()));
    const [selectedSticker, setSelectedSticker] = useState(null);

    useEffect(() => {
        setUnlocked(new Set(achievements.getUnlocked()));
    }, [achievements]);

    return (
        <PageLayout
            title="Progress 🏆"
            onBack={onBack}
        >

            {/* Regular Achievements */}
            <h2 style={{ color: colors.dark, marginBottom: '1rem', fontSize: '1.2rem' }}>
                ⭐ Achievements
            </h2>
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(90px, 1fr))',
                gap: '1rem'
            }}>
                {ACHIEVEMENTS.map(ach => {
                    const isUnlocked = unlocked.has(ach.id);

                    return (
                        <div
                            key={ach.id}
                            onClick={() => setSelectedSticker(ach)}
                            className={isUnlocked ? 'animate-pop' : ''}
                            style={{
                                aspectRatio: '1/1',
                                background: colors.white,
                                borderRadius: borderRadius.lg,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: '0.5rem',
                                cursor: 'pointer',
                                boxShadow: isUnlocked ? shadows.sm : 'none',
                                border: isUnlocked ? `2px solid ${colors.primary}` : `2px dashed ${colors.border}`,
                                opacity: isUnlocked ? 1 : 0.6
                            }}
                        >
                            <div style={{
                                fontSize: '2rem',
                                marginBottom: '0.2rem',
                                filter: isUnlocked ? 'none' : 'grayscale(100%) contrast(0%) brightness(80%)'
                            }}>
                                {ach.icon}
                            </div>
                            <div style={{
                                fontWeight: 'bold',
                                fontSize: '0.65rem',
                                textAlign: 'center',
                                color: isUnlocked ? colors.dark : colors.textMuted
                            }}>
                                {ach.title}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Detail Modal */}
            {selectedSticker && (
                <div style={{
                    position: 'fixed',
                    top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.8)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 1000
                }} onClick={() => setSelectedSticker(null)}>
                    <div className="animate-pop" style={{
                        background: colors.white,
                        padding: '2rem',
                        borderRadius: borderRadius.xl,
                        maxWidth: '350px',
                        width: '90%',
                        textAlign: 'center'
                    }} onClick={e => e.stopPropagation()}>
                        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>
                            {selectedSticker.isQuest || unlocked.has(selectedSticker.id) ? selectedSticker.icon : '🔒'}
                        </div>
                        <h2 style={{ color: colors.primary, marginBottom: '0.5rem' }}>{selectedSticker.title}</h2>
                        <p style={{ fontSize: '0.95rem', marginBottom: '1rem', color: colors.textMuted }}>{selectedSticker.description}</p>

                        <div style={{
                            padding: '0.5rem 1rem',
                            background: (selectedSticker.isQuest || unlocked.has(selectedSticker.id))
                                ? colors.primaryGradient
                                : '#ffebee',
                            color: (selectedSticker.isQuest || unlocked.has(selectedSticker.id))
                                ? 'white'
                                : colors.error,
                            borderRadius: borderRadius.pill,
                            display: 'inline-block',
                            fontWeight: 'bold',
                            fontSize: '0.9rem'
                        }}>
                            {(selectedSticker.isQuest || unlocked.has(selectedSticker.id)) ? '✓ Unlocked!' : 'Locked'}
                        </div>

                        <button onClick={() => setSelectedSticker(null)} style={{
                            display: 'block',
                            margin: '1.5rem auto 0',
                            padding: '0.5rem 2rem',
                            background: colors.light,
                            border: 'none',
                            borderRadius: borderRadius.pill,
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            color: colors.dark
                        }}>
                            Close
                        </button>
                    </div>
                </div>
            )}
        </PageLayout>
    );
}
