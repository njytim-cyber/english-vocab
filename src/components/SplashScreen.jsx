import { useState } from 'react';

export default function SplashScreen({ onEnter }) {
    const [visible, setVisible] = useState(true);

    const handleClick = () => {
        setVisible(false);
        setTimeout(onEnter, 500); // Wait for exit animation
    };

    return (
        <div
            onClick={handleClick}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                zIndex: 1000,
                opacity: visible ? 1 : 0,
                transition: 'opacity 0.5s ease-out',
                cursor: 'pointer'
            }}
        >
            <div className="animate-bounce" style={{ fontSize: '5rem', marginBottom: '1rem' }}>
                🇬🇧
            </div>
            <h1 className="animate-pop" style={{ fontSize: '3rem', fontWeight: 'bold', marginBottom: '2rem', textAlign: 'center' }}>
                Vocab Quest
            </h1>
            <p className="animate-pulse" style={{ fontSize: '1.5rem', opacity: 0.8 }}>
                Tap to Start
            </p>
        </div>
    );
}
