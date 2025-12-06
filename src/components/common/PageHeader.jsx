/**
 * PageHeader - Consistent page header across all views
 * Provides unified styling for back button, title, and optional action
 */
export default function PageHeader({ title, onBack, rightAction, rightIcon }) {
    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '2rem',
            width: '100%'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                {onBack && (
                    <button
                        onClick={onBack}
                        aria-label="Go back"
                        style={{
                            background: 'white',
                            border: 'none',
                            borderRadius: '50%',
                            width: '44px',
                            height: '44px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.5rem',
                            cursor: 'pointer',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                            transition: 'transform 0.2s, box-shadow 0.2s'
                        }}
                    >
                        ←
                    </button>
                )}
                <h1 style={{
                    margin: 0,
                    fontSize: '1.8rem',
                    color: '#2c3e50',
                    fontWeight: '700'
                }}>
                    {title}
                </h1>
            </div>

            {rightAction && (
                <button
                    onClick={rightAction}
                    aria-label="Action"
                    style={{
                        background: 'white',
                        border: 'none',
                        borderRadius: '50%',
                        width: '44px',
                        height: '44px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.5rem',
                        cursor: 'pointer',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }}
                >
                    {rightIcon || '⚙️'}
                </button>
            )}
        </div>
    );
}
