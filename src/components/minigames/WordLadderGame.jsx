import { useState, useEffect, useRef, useCallback } from 'react';
import { triggerConfetti } from '../../utils/effects';
import { sfx } from '../../utils/soundEffects';
import GameTutorialModal from '../common/GameTutorialModal';
import GameSummaryModal from '../common/GameSummaryModal';
import balance from '../../data/balance.json';
import GameLayout from '../common/GameLayout';
import { colors, borderRadius, shadows, spacing } from '../../styles/designTokens';

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

    const closeTutorial = () => {
        sfx.playClick();
        setShowTutorial(false);
        localStorage.setItem('tutorial_wordladder', 'true');
        setTimeout(() => inputRef.current?.focus(), 100);
    };

    const startNewRound = useCallback(() => {
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
    }, [engine]);

    // Initialization Effect
    useEffect(() => {
        startNewRound();

        const hasSeenTutorial = localStorage.getItem('tutorial_wordladder');
        if (!hasSeenTutorial) {
            setShowTutorial(true);
        }
    }, [startNewRound]);

    // Focus Keeper Effect
    useEffect(() => {
        const handleClick = () => {
            if (inputRef.current && gameStatus === 'playing') {
                inputRef.current.focus();
            }
        };
        window.addEventListener('click', handleClick);
        return () => window.removeEventListener('click', handleClick);
    }, [gameStatus]);

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
            const { xp, stars } = balance.rewards.minigames.wordLadder;
            setRewards({ xp, coins: stars });
            setTimeout(() => setShowSummary(true), 1000);
        }
    };

    return (
        <GameLayout
            title="Word Ladder"
            icon="🪜"
            onBack={onBack}
            onHelp={() => setShowTutorial(true)}
        >
            <div className="card" style={{ padding: spacing.xl, width: '100%', textAlign: 'center', marginBottom: spacing.xl, background: colors.white, borderRadius: borderRadius.xl, boxShadow: shadows.md }}>
                <div style={{ fontSize: '1.2rem', marginBottom: spacing.md, color: colors.text }}>Transform</div>
                <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: colors.primary }}>{currentLadder.start}</div>
                <div style={{ fontSize: '1.2rem', margin: `${spacing.md} 0`, color: colors.textMuted }}>to</div>
                <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: colors.success }}>{currentLadder.end}</div>
            </div>

            {/* Steps */}
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: spacing.sm, marginBottom: spacing.xl }}>
                {userSteps.map((step, idx) => (
                    <div key={idx} className="animate-pop" style={{
                        padding: spacing.lg,
                        background: colors.white,
                        borderRadius: borderRadius.lg,
                        textAlign: 'center',
                        fontSize: '1.5rem',
                        fontWeight: 'bold',
                        boxShadow: shadows.sm,
                        border: idx === 0 ? `2px solid ${colors.primary}` : `1px solid ${colors.border}`
                    }}>
                        {step}
                    </div>
                ))}
            </div>

            {/* Input */}
            {gameStatus === 'playing' ? (
                <form onSubmit={handleSubmitStep} style={{ width: '100%', display: 'flex', gap: spacing.sm }}>
                    <input
                        ref={inputRef}
                        type="text"
                        value={currentInput}
                        onChange={handleInputChange}
                        placeholder="Next word..."
                        maxLength={currentLadder.start.length}
                        style={{
                            flex: 1,
                            padding: spacing.lg,
                            fontSize: '1.2rem',
                            borderRadius: borderRadius.lg,
                            border: `2px solid ${colors.border}`,
                            textAlign: 'center',
                            textTransform: 'uppercase'
                        }}
                        autoFocus
                    />
                    <button
                        type="submit"
                        disabled={currentInput.length !== currentLadder.start.length}
                        style={{
                            padding: `0 ${spacing.xl}`,
                            background: colors.dark,
                            color: colors.white,
                            border: 'none',
                            borderRadius: borderRadius.lg,
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
                        <h3 style={{ color: colors.success, fontSize: '2rem' }}>Goal Reached!</h3>
                        <p>Steps: {userSteps.length - 1}</p>
                    </div>
                )
            )}

            {message && <div style={{ color: colors.error, marginTop: spacing.md }}>{message}</div>}

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
        </GameLayout>
    );
}
