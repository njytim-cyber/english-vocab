import React from 'react';

export default function CertificateView({ achievements, economy, onBack }) {
    const stats = achievements.stats;
    const unlockedCount = achievements.getUnlocked().length;
    const totalAchievements = 6; // Hardcoded for now based on ACHIEVEMENTS list

    // Calculate a "Level" based on wins
    const level = Math.floor(stats.wins / 5) + 1;

    // Get current date
    const date = new Date().toLocaleDateString();

    const handlePrint = () => {
        window.print();
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: '#333',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem'
        }}>
            {/* Controls */}
            <div className="no-print" style={{ marginBottom: '2rem', display: 'flex', gap: '1rem' }}>
                <button onClick={onBack} style={{
                    padding: '0.8rem 1.5rem',
                    fontSize: '1rem',
                    background: 'white',
                    border: 'none',
                    borderRadius: '20px',
                    cursor: 'pointer'
                }}>
                    ⬅️ Back
                </button>
                <button onClick={handlePrint} style={{
                    padding: '0.8rem 1.5rem',
                    fontSize: '1rem',
                    background: 'var(--primary)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '20px',
                    cursor: 'pointer'
                }}>
                    🖨️ Print / Save
                </button>
            </div>

            {/* Certificate Container */}
            <div className="certificate-container" style={{
                background: 'white',
                width: '100%',
                maxWidth: '900px',
                aspectRatio: '1.414 / 1', // A4 Landscape approx
                padding: '3rem',
                position: 'relative',
                boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                border: '20px solid #DAA520', // Goldenrod
                outline: '5px solid #8B4513' // SaddleBrown
            }}>
                {/* Corner Decorations */}
                <div style={{ position: 'absolute', top: '10px', left: '10px', fontSize: '3rem' }}>⚜️</div>
                <div style={{ position: 'absolute', top: '10px', right: '10px', fontSize: '3rem' }}>⚜️</div>
                <div style={{ position: 'absolute', bottom: '10px', left: '10px', fontSize: '3rem' }}>⚜️</div>
                <div style={{ position: 'absolute', bottom: '10px', right: '10px', fontSize: '3rem' }}>⚜️</div>

                <h1 style={{
                    fontFamily: 'serif',
                    fontSize: '4rem',
                    color: '#8B4513',
                    marginBottom: '1rem',
                    textTransform: 'uppercase',
                    letterSpacing: '5px'
                }}>Certificate</h1>

                <h2 style={{
                    fontFamily: 'serif',
                    fontSize: '2rem',
                    color: '#DAA520',
                    marginBottom: '3rem'
                }}>of Achievement</h2>

                <p style={{ fontSize: '1.5rem', fontStyle: 'italic', marginBottom: '1rem' }}>This certifies that</p>

                <div style={{
                    fontSize: '3rem',
                    fontFamily: 'cursive',
                    borderBottom: '2px solid #333',
                    padding: '0 2rem',
                    marginBottom: '2rem',
                    minWidth: '300px'
                }}>
                    Vocab Master
                </div>

                <p style={{ fontSize: '1.5rem', marginBottom: '3rem' }}>
                    has successfully demonstrated dedication to learning.
                </p>

                {/* Stats Grid */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '2rem',
                    width: '80%',
                    marginBottom: '3rem'
                }}>
                    <div style={{ border: '1px solid #ccc', padding: '1rem', borderRadius: '10px' }}>
                        <div style={{ fontSize: '2rem', color: 'var(--primary)' }}>{level}</div>
                        <div style={{ textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '1px' }}>Level</div>
                    </div>
                    <div style={{ border: '1px solid #ccc', padding: '1rem', borderRadius: '10px' }}>
                        <div style={{ fontSize: '2rem', color: '#DAA520' }}>{stats.totalCoins}</div>
                        <div style={{ textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '1px' }}>Total Coins</div>
                    </div>
                    <div style={{ border: '1px solid #ccc', padding: '1rem', borderRadius: '10px' }}>
                        <div style={{ fontSize: '2rem', color: 'green' }}>{unlockedCount} / {totalAchievements}</div>
                        <div style={{ textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '1px' }}>Achievements</div>
                    </div>
                </div>

                {/* Footer */}
                <div style={{
                    marginTop: 'auto',
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-end'
                }}>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ borderBottom: '1px solid #333', width: '200px', marginBottom: '0.5rem' }}>{date}</div>
                        <div style={{ fontSize: '0.8rem' }}>Date</div>
                    </div>

                    <div style={{ fontSize: '4rem', opacity: 0.8, transform: 'rotate(-15deg)' }}>
                        🏅
                    </div>

                    <div style={{ textAlign: 'center' }}>
                        <div style={{ borderBottom: '1px solid #333', width: '200px', marginBottom: '0.5rem', fontFamily: 'cursive', fontSize: '1.2rem' }}>Antigravity AI</div>
                        <div style={{ fontSize: '0.8rem' }}>Instructor</div>
                    </div>
                </div>
            </div>

            <style>{`
                @media print {
                    .no-print { display: none !important; }
                    .certificate-container { 
                        border: 5px solid #DAA520 !important;
                        box-shadow: none !important;
                        width: 100% !important;
                        height: 100% !important;
                        position: absolute !important;
                        top: 0 !important;
                        left: 0 !important;
                        margin: 0 !important;
                    }
                    body { background: white !important; }
                }
            `}</style>
        </div>
    );
}
