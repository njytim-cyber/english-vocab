
import { colors, borderRadius } from '../../styles/designTokens';

export function AchievementGrid({ achievements, unlocked, onSelect }) {
    return (
        <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))',
            gap: '1rem'
        }}>
            {achievements.map(ach => {
                const isUnlocked = unlocked.some(u => u.id === ach.id);
                return (
                    <div
                        key={ach.id}
                        onClick={() => onSelect(ach)}
                        style={{
                            aspectRatio: '1/1',
                            background: isUnlocked ? '#f0fdf4' : colors.light,
                            borderRadius: borderRadius.lg,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '0.5rem',
                            cursor: 'pointer',
                            border: isUnlocked ? `2px solid ${colors.success}` : `2px dashed ${colors.border}`,
                            opacity: isUnlocked ? 1 : 0.7,
                            transition: 'all 0.2s',
                            transform: isUnlocked ? 'scale(1)' : 'scale(0.95)'
                        }}
                    >
                        <div style={{
                            fontSize: '2rem',
                            marginBottom: '0.2rem',
                            filter: isUnlocked ? 'none' : 'grayscale(100%) opacity(0.5)'
                        }}>
                            {ach.icon}
                        </div>
                        <div style={{
                            fontSize: '0.65rem',
                            textAlign: 'center',
                            color: isUnlocked ? colors.dark : colors.textMuted,
                            lineHeight: 1.2
                        }}>
                            {ach.title}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
