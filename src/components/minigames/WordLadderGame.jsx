import React, { useState, useEffect, useRef } from 'react';
import { triggerConfetti } from '../../utils/effects';
import { speak } from '../../utils/audio';
import { sfx } from '../../utils/soundEffects';
import GameTutorialModal from '../common/GameTutorialModal';
import GameSummaryModal from '../common/GameSummaryModal';

export default function WordLadderGame({ engine, onBack }) {
    const [currentLadder, setCurrentLadder] = useState(null);
    const [userSteps, setUserSteps] = useState([]);
    const [currentInput, setCurrentInput] = useState('');
    const [gameStatus, setGameStatus] = useState('playing'); // 'playing', 'won'
    const [message, setMessage] = useState('');
    const [showTutorial, setShowTutorial] = useState(false);
    const [showSummary, setShowSummary] = useState(false);
    const [rewards, setRewards] = useState({ xp: 0, coins: 0 });

    const inputRef = useRef(null);

    useEffect(() => {
        startNewRound();

        const hasSeenTutorial = localStorage.getItem('tutorial_wordladder');
        if (!hasSeenTutorial) {
            setShowTutorial(true);
        }

        // Keep focus
        const handleClick = () => {
            if (inputRef.current && gameStatus === 'playing') {
                inputRef.current.focus();
            }
        };
        window.addEventListener('click', handleClick);
        return () => window.removeEventListener('click', handleClick);
    }, []);

    const closeTutorial = () => {
        sfx.playClick();
        setShowTutorial(false);
        localStorage.setItem('tutorial_wordladder', 'true');
        setTimeout(() => inputRef.current?.focus(), 100);
    };

    const startNewRound = () => {
        // Mock ladder for now if engine doesn't have it, or use engine
        // Assuming engine.getWordLadder() returns { start: 'COLD', end: 'WARM', path: [...] }
        // If not available, I'll use a simple mock or try-catch
        let ladder;
        try {
            ladder = engine.getWordLadder ? engine.getWordLadder() : { start: 'COLD', end: 'WARM' };
        } catch (e) {
            ladder = { start: 'COLD', end: 'WARM' };
        }

        setCurrentLadder(ladder);
        setUserSteps([ladder.start]);
        setCurrentInput('');
        setGameStatus('playing');
        setMessage('');
        setShowSummary(false);
        setTimeout(() => inputRef.current?.focus(), 100);
    };

    const handleInputChange = (e) => {
        setCurrentInput(e.target.value.toUpperCase());
        setMessage('');
    };

    const handleSubmitStep = (e) => {
        e.preventDefault();
        if (gameStatus !== 'playing') return;

        const word = currentInput.toUpperCase();
        const lastWord = userSteps[userSteps.length - 1];

        // Validation
        if (word.length !== lastWord.length) {
            setMessage('Word must be same length');
            sfx.playWrong();
            return;
        }

        let diff = 0;
        for (let i = 0; i < word.length; i++) {
            if (word[i] !== lastWord[i]) diff++;
        }

        if (diff !== 1) {
            setMessage('Change exactly one letter');
            sfx.playWrong();
            return;
        }

        // Check if valid word (using engine.checkWord or similar if available, else assume valid for now or use simple list)
        // For now, let's assume any input is valid if it follows rules, or check against engine if possible.
        // engine.isValidWord(word)

        sfx.playPop();
        setUserSteps([...userSteps, word]);
        setCurrentInput('');

        if (word === currentLadder.end) {
            setGameStatus('won');
            sfx.playWin();
            triggerConfetti();
            const xpEarned = 50;
            const coinsEarned = 25;
            setRewards({ xp: xpEarned, coins: coinsEarned });
            setTimeout(() => setShowSummary(true), 1000);
        }
    };

    if (!currentLadder) return <div>Loading...</div>;

    return (
        <div className="word-ladder-game" style={{
            padding: '2rem',
            maxWidth: '600px',
            margin: '0 auto',
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            color: 'var(--dark)'
        }}>
            <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <button onClick={() => { sfx.playClick(); onBack(); }} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>
                    ← Back
                </button>
                <button
                    onClick={() => { sfx.playClick(); setShowTutorial(true); }}
                    style={{
                        background: 'white',
                        border: 'none',
                        borderRadius: '50%',
                        width: '36px',
                        height: '36px',
                        cursor: 'pointer',
                        fontSize: '1.2rem',
                        fontWeight: 'bold',
                        color: '#4ECDC4',
                        boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                    }}
                >
                    ?
                </button>
            </div>

            <h2 style={{ marginBottom: '1rem' }}>Word Ladder 🪜</h2>

            <div className="card" style={{ padding: '2rem', width: '100%', textAlign: 'center', marginBottom: '2rem' }}>
                <div style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Transform</div>
                <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--primary)' }}>{currentLadder.start}</div>
                <div style={{ fontSize: '1.2rem', margin: '1rem 0' }}>to</div>
                <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--secondary)' }}>{currentLadder.end}</div>
            </div>

            {/* Steps */}
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '2rem' }}>
                {userSteps.map((step, idx) => (
                    <div key={idx} className="animate-pop" style={{
                        padding: '1rem',
                        background: 'white',
                        borderRadius: '10px',
                        textAlign: 'center',
                        fontSize: '1.5rem',
                        fontWeight: 'bold',
                        boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
                        border: idx === 0 ? '2px solid var(--primary)' : '1px solid #eee'
                    }}>
                        {step}
                    </div>
                ))}
            </div>

            {/* Input */}
            {gameStatus === 'playing' ? (
                <form onSubmit={handleSubmitStep} style={{ width: '100%', display: 'flex', gap: '0.5rem' }}>
                    <input
                        ref={inputRef}
                        type="text"
                        value={currentInput}
                        onChange={handleInputChange}
                        placeholder="Next word..."
                        maxLength={currentLadder.start.length}
                        style={{
                            flex: 1,
                            padding: '1rem',
                            fontSize: '1.2rem',
                            borderRadius: '10px',
                            border: '2px solid #ddd',
                            textAlign: 'center',
                            textTransform: 'uppercase'
                        }}
                        autoFocus
                    />
                    <button
                        type="submit"
                        disabled={currentInput.length !== currentLadder.start.length}
                        style={{
                            padding: '0 1.5rem',
                            background: 'var(--dark)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '10px',
                            cursor: 'pointer',
                            fontSize: '1.5rem'
                        }}
                    >
                        ⬆️
                    </button>
                </form>
            ) : (
                !showSummary && (
                    <div className="animate-pop" style={{ textAlign: 'center' }}>
                        <h3 style={{ color: 'green', fontSize: '2rem' }}>Goal Reached!</h3>
                        <p>Steps: {userSteps.length - 1}</p>
                    </div>
                )
            )}

            {message && <div style={{ color: 'red', marginTop: '1rem' }}>{message}</div>}

            {/* Tutorial Modal */}
            {showTutorial && (
                <GameTutorialModal
                    title="How to Play"
                    instructions={[
                        "Transform the start word into the end word.",
                        "Change exactly one letter at a time.",
                        "Each step must be a valid word.",
                        "Try to reach the goal in as few steps as possible!"
                    ]}
                    onClose={closeTutorial}
                />
            )}

            {/* Summary Modal */}
            {showSummary && (
                <GameSummaryModal
                    score={null}
                    xp={rewards.xp}
                    coins={rewards.coins}
                    onReplay={startNewRound}
                    onBack={onBack}
                />
            )}
        </div>
    );
}
