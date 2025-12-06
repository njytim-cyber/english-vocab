/**
 * ActionButton - Consistent button styling for primary actions
 * Purple gradient theme matching the Practice Time banner
 */
export default function ActionButton({
    children,
    onClick,
    icon,
    variant = 'primary',
    disabled = false,
    fullWidth = false,
    size = 'medium'
}) {
    const getBackground = () => {
        if (disabled) return '#ccc';
        switch (variant) {
            case 'primary':
                return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
            case 'secondary':
                return 'white';
            case 'ghost':
                return 'transparent';
            default:
                return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
        }
    };

    const getColor = () => {
        if (disabled) return 'white';
        switch (variant) {
            case 'primary':
                return 'white';
            case 'secondary':
                return '#667eea';
            case 'ghost':
                return '#667eea';
            default:
                return 'white';
        }
    };

    const getPadding = () => {
        switch (size) {
            case 'small':
                return '0.5rem 1rem';
            case 'large':
                return '1.2rem 2rem';
            default:
                return '0.8rem 1.5rem';
        }
    };

    const getFontSize = () => {
        switch (size) {
            case 'small':
                return '0.9rem';
            case 'large':
                return '1.2rem';
            default:
                return '1rem';
        }
    };

    return (
        <button
            onClick={onClick}
            disabled={disabled}
            style={{
                background: getBackground(),
                color: getColor(),
                border: variant === 'secondary' ? '2px solid #667eea' : 'none',
                borderRadius: '15px',
                padding: getPadding(),
                fontSize: getFontSize(),
                fontWeight: 'bold',
                cursor: disabled ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                width: fullWidth ? '100%' : 'auto',
                boxShadow: variant === 'primary' && !disabled
                    ? '0 4px 15px rgba(102, 126, 234, 0.4)'
                    : 'none',
                transition: 'transform 0.2s, box-shadow 0.2s'
            }}
        >
            {icon && <span style={{ fontSize: size === 'large' ? '1.5rem' : '1.2rem' }}>{icon}</span>}
            {children}
        </button>
    );
}
