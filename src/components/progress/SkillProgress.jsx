
import { colors, borderRadius, shadows, spacing } from '../../styles/designTokens';

export function SkillProgress({ title, icon, levels, total, color }) {
    const mastered = levels[5] || 0;
    const percentage = total > 0 ? Math.round((mastered / total) * 100) : 0;

    return (
        <div style={{
            background: colors.white,
            borderRadius: borderRadius.xl,
            padding: spacing.lg,
            boxShadow: shadows.md
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.md }}>
                <span style={{ fontSize: '1.5rem' }}>{icon}</span>
                <h3 style={{ margin: 0, color: colors.dark }}>{title}</h3>
                <span style={{
                    marginLeft: 'auto',
                    padding: `${spacing.xs} ${spacing.sm}`,
                    background: `${color}20`,
                    color: color,
                    borderRadius: borderRadius.md,
                    fontSize: '0.8rem',
                    fontWeight: '600'
                }}>
                    {percentage}% Mastered
                </span>
            </div>

            {/* Mini bar chart */}
            <div style={{ display: 'flex', gap: '2px', height: '40px', alignItems: 'flex-end' }}>
                {[0, 1, 2, 3, 4, 5].map(level => {
                    const count = levels[level] || 0;
                    const maxCount = Math.max(...Object.values(levels));
                    const height = maxCount > 0 ? (count / maxCount) * 100 : 0;

                    return (
                        <div key={level} style={{
                            flex: 1,
                            height: `${Math.max(height, 5)}%`,
                            background: `hsl(${level * 30 + 200}, 70%, 50%)`,
                            borderRadius: '2px 2px 0 0'
                        }} />
                    );
                })}
            </div>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginTop: spacing.xs,
                fontSize: '0.7rem',
                color: colors.textMuted
            }}>
                <span>L0</span>
                <span>L5</span>
            </div>
        </div>
    );
}
