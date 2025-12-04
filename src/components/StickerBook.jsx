import React, { useState, useEffect } from 'react';
import { ACHIEVEMENTS } from '../engine/Achievements';

export default function StickerBook({ achievements, onBack, onViewCertificate }) {
    const [unlocked, setUnlocked] = useState(new Set(achievements.getUnlocked()));
    const [selectedSticker, setSelectedSticker] = useState(null);

    // Refresh on mount in case updates happened elsewhere
    useEffect(() => {
        setUnlocked(new Set(achievements.getUnlocked()));
    }, [achievements]);

    return (
        <div className="sticker-book" style={{
            minHeight: '100vh',
            padding: '2rem',
            background: 'var(--light)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
        }}>
            <div style={{ width: '100%', maxWidth: '800px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <button onClick={onBack} style={{ fontSize: '1.5rem', background: 'none', border: 'none', cursor: 'pointer' }}>⬅️ Back</button>
                <h1 style={{ fontFamily: 'var(--font-fun)', color: 'var(--primary)', margin: 0 }}>Sticker Book 🏆</h1>
                <button onClick={onViewCertificate} style={{ fontSize: '1.5rem', background: 'none', border: 'none', cursor: 'pointer' }} title="View Certificate">📜</button>
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                gap: '1.5rem',
                width: '100%',
                maxWidth: '800px'
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
                                background: 'white',
                                borderRadius: '15px',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: '1rem',
                                cursor: 'pointer',
                                boxShadow: isUnlocked ? '0 4px 10px rgba(0,0,0,0.1)' : 'none',
                                border: isUnlocked ? '2px solid var(--primary)' : '2px dashed #ccc',
                                opacity: isUnlocked ? 1 : 0.6,
                                transition: 'transform 0.2s'
                            }}
                        >
                            <div style={{
                                fontSize: '3rem',
                                marginBottom: '0.5rem',
                                filter: isUnlocked ? 'none' : 'grayscale(100%) contrast(0%) brightness(80%)' // Silhouette effect
                            }}>
                                {ach.icon}
                            </div>
                            <div style={{
                                fontWeight: 'bold',
                                fontSize: '0.9rem',
                                textAlign: 'center',
                                color: isUnlocked ? 'var(--dark)' : '#999'
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
                    <div className="card animate-pop" style={{
                        background: 'white',
                        padding: '2rem',
                        borderRadius: '20px',
                        maxWidth: '400px',
                        width: '90%',
                        textAlign: 'center'
                    }} onClick={e => e.stopPropagation()}>
                        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>
                            {unlocked.has(selectedSticker.id) ? selectedSticker.icon : '🔒'}
                        </div>
                        <h2 style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}>{selectedSticker.title}</h2>
                        <p style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>{selectedSticker.description}</p>

                        <div style={{
                            padding: '0.5rem 1rem',
                            background: unlocked.has(selectedSticker.id) ? '#e8f5e9' : '#ffebee',
                            color: unlocked.has(selectedSticker.id) ? 'green' : 'red',
                            borderRadius: '20px',
                            display: 'inline-block',
                            fontWeight: 'bold'
                        }}>
                            {unlocked.has(selectedSticker.id) ? 'Unlocked!' : 'Locked'}
                        </div>

                        <button onClick={() => setSelectedSticker(null)} style={{
                            display: 'block',
                            margin: '2rem auto 0',
                            padding: '0.5rem 2rem',
                            background: '#eee',
                            border: 'none',
                            borderRadius: '20px',
                            cursor: 'pointer'
                        }}>
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
