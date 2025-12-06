import { useState, useEffect } from 'react';
import { triggerConfetti } from '../utils/effects';
import { colors, borderRadius, shadows } from '../styles/designTokens';

const REWARDS = [
    { day: 1, reward: 50, icon: '📚', message: 'Every expert was once a beginner!' },
    { day: 2, reward: 100, icon: '🌱', message: 'Growth happens one word at a time.' },
    { day: 3, reward: 150, icon: '💡', message: 'Your vocabulary is expanding!' },
    { day: 4, reward: 200, icon: '⭐', message: 'Consistency is the key to mastery.' },
    { day: 5, reward: 300, icon: '🚀', message: 'You\'re on fire! Keep learning!' },
    { day: 6, reward: 250, icon: '🎯', message: 'Words are power. You\'re getting stronger!' },
    { day: 7, reward: 500, icon: '🏆', message: 'A week of learning! You\'re amazing!' }
];

export default function DailyLogin({ economy, onClose }) {
    const [streak, setStreak] = useState(0);
    const [claimedToday, setClaimedToday] = useState(false);

    useEffect(() => {
        loadLoginState();
    }, []);

    const loadLoginState = () => {
        const stored = localStorage.getItem('vocab_daily_login');
        if (stored) {
            const data = JSON.parse(stored);
            const last = new Date(data.lastLogin);
            const today = new Date();

            const isSameDay = last.getDate() === today.getDate() &&
                last.getMonth() === today.getMonth() &&
                last.getFullYear() === today.getFullYear();

            const diffTime = Math.abs(today - last);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (isSameDay) {
                setClaimedToday(true);
                setStreak(data.streak);
            } else if (diffDays <= 2) {
                setClaimedToday(false);
                setStreak(data.streak);
            } else {
                setClaimedToday(false);
                setStreak(0);
            }
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
            <div className="animate-pop" style={{
                background: colors.white,
                padding: '2rem',
                borderRadius: borderRadius.xl,
                maxWidth: '500px',
                width: '90%',
                textAlign: 'center',
                boxShadow: shadows.lg
            }}>
                <h2 style={{ fontSize: '1.8rem', color: colors.primary, marginBottom: '0.5rem' }}>
                    Welcome Back! 🌟
                </h2>
                <p style={{ marginBottom: '0.5rem', color: colors.dark, fontSize: '1rem', fontWeight: '500' }}>
                    {REWARDS[streak % 7].message}
                </p>
                <p style={{ marginBottom: '1.5rem', color: colors.textMuted, fontSize: '0.85rem' }}>
                    Day {(streak % 7) + 1} of your learning journey
                </p>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(7, 1fr)',
                    gap: '0.4rem',
                    marginBottom: '1.5rem'
                }}>
                    {REWARDS.map((r, idx) => {
                        const isCurrent = idx === (streak % 7);
                        const isPast = idx < (streak % 7);

                        return (
                            <div key={r.day} style={{
                                padding: '0.75rem 0.25rem',
                                background: isCurrent
                                    ? colors.primaryGradient
                                    : (isPast ? colors.light : colors.white),
                                color: isCurrent ? 'white' : (isPast ? colors.textMuted : colors.dark),
                                borderRadius: borderRadius.md,
                                border: isCurrent ? `2px solid ${colors.primaryDark}` : `1px solid ${colors.border}`,
                                opacity: isPast ? 0.6 : 1,
                                transform: isCurrent ? 'scale(1.08)' : 'scale(1)',
                                transition: 'all 0.2s'
                            }}>
                                <div style={{ fontSize: '0.7rem', marginBottom: '0.3rem' }}>Day {r.day}</div>
                                <div style={{ fontSize: '1.3rem' }}>{r.icon}</div>
                                <div style={{ fontWeight: 'bold', fontSize: '0.85rem' }}>{r.reward}</div>
                            </div>
                        );
                    })}
                </div>

                {claimedToday ? (
                    <button onClick={onClose} style={{
                        padding: '0.9rem 2rem',
                        fontSize: '1.1rem',
                        background: colors.light,
                        color: colors.textMuted,
                        border: 'none',
                        borderRadius: borderRadius.pill,
                        cursor: 'pointer',
                        fontWeight: 'bold'
                    }}>
                        Come Back Tomorrow
                    </button>
                ) : (
                    <button onClick={handleClaim} style={{
                        padding: '0.9rem 2rem',
                        fontSize: '1.1rem',
                        background: colors.primaryGradient,
                        color: 'white',
                        border: 'none',
                        borderRadius: borderRadius.pill,
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        boxShadow: shadows.primary
                    }}>
                        Start Learning Today!
                    </button>
                )}
            </div>
        </div>
    );
}
