
import { colors, spacing } from '../../styles/designTokens';

export function StatRow({ label, value }) {
    return (
        <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            padding: `${spacing.sm} 0`,
            borderBottom: `1px solid ${colors.light}`
        }}>
            <span style={{ color: colors.textMuted }}>{label}</span>
            <span style={{ fontWeight: '600', color: colors.dark }}>{value}</span>
        </div>
    );
}
