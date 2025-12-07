
import { colors } from '../../styles/designTokens';

export default function LoadingSpinner({ text = 'Loading...' }) {
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
            minHeight: '200px',
            color: colors.textMuted
        }}>
            <style>
                {`
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                `}
            </style>
            <div style={{
                width: '40px',
                height: '40px',
                border: `4px solid ${colors.light}`,
                borderTop: `4px solid ${colors.primary}`,
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                marginBottom: '1rem'
            }} />
            <div>{text}</div>
        </div>
    );
}
