import React, { useState, useEffect } from 'react';
import { triggerConfetti } from '../utils/effects';
import { speak } from '../utils/audio';

const REWARDS = [
    { day: 1, reward: 50, icon: '💰' },
    { day: 2, reward: 100, icon: '💰' },
    { day: 3, reward: 150, icon: '💰' },
    { day: 4, reward: 200, icon: '💰' },
    { day: 5, reward: 300, icon: '🎁' }, // Big reward
    { day: 6, reward: 250, icon: '💰' },
    { day: 7, reward: 500, icon: '👑' }  // Huge reward
];

export default function DailyLogin({ economy, onClose }) {
    const [streak, setStreak] = useState(0);
    const [claimedToday, setClaimedToday] = useState(false);
    const [lastLogin, setLastLogin] = useState(null);

    useEffect(() => {
        loadLoginState();
    }, []);

    const loadLoginState = () => {
        const stored = localStorage.getItem('vocab_daily_login');
        if (stored) {
            const data = JSON.parse(stored);
            const last = new Date(data.lastLogin);
            const today = new Date();

            // Check if same day
            const isSameDay = last.getDate() === today.getDate() &&
                last.getMonth() === today.getMonth() &&
                last.getFullYear() === today.getFullYear();

            // Check if consecutive day (simplified)
            const diffTime = Math.abs(today - last);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (isSameDay) {
                setClaimedToday(true);
                setStreak(data.streak);
            } else if (diffDays <= 2) { // Allow 1 missed day grace or just strict next day? Let's say strict < 2 days diff means consecutive
                setClaimedToday(false);
                setStreak(data.streak);
            } else {
                // Streak broken
                setClaimedToday(false);
                setStreak(0);
            }
            setLastLogin(last);
        } else {
            setStreak(0);
            setClaimedToday(false);
        }
    };

    const handleClaim = () => {
        if (claimedToday) return;

        const currentDayIndex = streak % 7;
        const reward = REWARDS[currentDayIndex];

        economy.addCoins(reward.reward);
        triggerConfetti();
        // speak(`Claimed ${reward.reward} coins!`);

        const newStreak = streak + 1;
        setStreak(newStreak);
        setClaimedToday(true);

        const newState = {
            lastLogin: new Date().toISOString(),
            streak: newStreak
        };
        localStorage.setItem('vocab_daily_login', JSON.stringify(newState));

        setTimeout(onClose, 2000);
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.8)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000
        }}>
            <div className="card animate-pop" style={{
                background: 'white',
                padding: '2rem',
                borderRadius: '20px',
                maxWidth: '600px',
                width: '90%',
                textAlign: 'center'
            }}>
                <h2 style={{ fontSize: '2rem', color: 'var(--primary)', marginBottom: '1rem' }}>Daily Rewards 📅</h2>
                <p style={{ marginBottom: '2rem', color: '#666' }}>Come back every day for bigger rewards!</p>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(60px, 1fr))',
                    gap: '0.5rem',
                    marginBottom: '2rem'
                }}>
                    {REWARDS.map((r, idx) => {
                        const isCurrent = idx === (streak % 7);
                        const isPast = idx < (streak % 7);

                        return (
                            <div key={r.day} style={{
                                padding: '1rem 0.5rem',
                                background: isCurrent ? 'var(--secondary)' : (isPast ? '#e0e0e0' : '#f5f5f5'),
                                color: isCurrent ? 'white' : (isPast ? '#999' : 'var(--dark)'),
                                borderRadius: '10px',
                                border: isCurrent ? '2px solid var(--primary)' : 'none',
                                opacity: isPast ? 0.6 : 1,
                                transform: isCurrent ? 'scale(1.1)' : 'scale(1)'
                            }}>
                                <div style={{ fontSize: '0.8rem', marginBottom: '0.5rem' }}>Day {r.day}</div>
                                <div style={{ fontSize: '1.5rem' }}>{r.icon}</div>
                                <div style={{ fontWeight: 'bold' }}>{r.reward}</div>
                            </div>
                        );
                    })}
                </div>

                {claimedToday ? (
                    <button onClick={onClose} style={{
                        padding: '1rem 2rem',
                        fontSize: '1.2rem',
                        background: '#ccc',
                        color: 'white',
                        border: 'none',
                        borderRadius: '20px',
                        cursor: 'pointer'
                    }}>
                        Come Back Tomorrow
                    </button>
                ) : (
                    <button onClick={handleClaim} style={{
                        padding: '1rem 2rem',
                        fontSize: '1.2rem',
                        background: 'var(--primary)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '20px',
                        cursor: 'pointer',
                        boxShadow: '0 4px 10px rgba(102, 126, 234, 0.4)'
                    }}>
                        Claim Reward!
                    </button>
                )}
            </div>
        </div>
    );
}
