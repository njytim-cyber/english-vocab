import React, { useState, useEffect } from 'react';
import { triggerConfetti } from '../../utils/effects';
import { speak } from '../../utils/audio';
import { sfx } from '../../utils/soundEffects';
import GameTutorialModal from '../common/GameTutorialModal';
import GameSummaryModal from '../common/GameSummaryModal';

export default function DefinitionMatchGame({ engine, onBack }) {
    const [questions, setQuestions] = useState([]);
    const [definitions, setDefinitions] = useState([]);
    const [matchedPairs, setMatchedPairs] = useState(new Set());
    const [selectedWord, setSelectedWord] = useState(null);
    const [selectedDef, setSelectedDef] = useState(null);
    const [wrongPair, setWrongPair] = useState(null);
    const [gameStatus, setGameStatus] = useState('playing'); // 'playing' | 'won'
    const [showTutorial, setShowTutorial] = useState(false);
    const [showSummary, setShowSummary] = useState(false);
    const [rewards, setRewards] = useState({ xp: 0, coins: 0 });

    useEffect(() => {
        startNewRound();

        // Check tutorial status
        const hasSeenTutorial = localStorage.getItem('tutorial_definitionmatch');
        if (!hasSeenTutorial) {
            setShowTutorial(true);
        }
    }, []);

    const closeTutorial = () => {
        sfx.playClick();
        setShowTutorial(false);
        localStorage.setItem('tutorial_definitionmatch', 'true');
    };

    const startNewRound = () => {
        // Get 4 random questions
        const qs = engine.getReinforcementQuestions(4);
        setQuestions(qs);

        // Shuffle definitions
        const defs = qs.map(q => ({ id: q.id, text: q.question }));
        for (let i = defs.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [defs[i], defs[j]] = [defs[j], defs[i]];
        }
        setDefinitions(defs);

        setMatchedPairs(new Set());
        setSelectedWord(null);
        setSelectedDef(null);
        setWrongPair(null);
        setGameStatus('playing');
        setShowSummary(false);
    };

    const handleWordClick = (q) => {
        if (matchedPairs.has(q.id) || gameStatus !== 'playing') return;
        sfx.playClick();
        setSelectedWord(q);
        setWrongPair(null);

        if (selectedDef) {
            checkMatch(q, selectedDef);
        } else {
            speak(q.answer);
        }
    };

    const handleDefClick = (def) => {
        if (matchedPairs.has(def.id) || gameStatus !== 'playing') return;
        sfx.playClick();
        setSelectedDef(def);
        setWrongPair(null);

        if (selectedWord) {
            checkMatch(selectedWord, def);
        }
    };

    const checkMatch = (word, def) => {
        if (word.id === def.id) {
            // Match!
            const newMatched = new Set(matchedPairs);
            newMatched.add(word.id);
            setMatchedPairs(newMatched);
            setSelectedWord(null);
            setSelectedDef(null);
            triggerConfetti();
            sfx.playCorrect();
            speak("Correct match!");

            if (newMatched.size === questions.length) {
                setGameStatus('won');
                sfx.playWin();
                const xpEarned = 40;
                const coinsEarned = 20;
                setRewards({ xp: xpEarned, coins: coinsEarned });
                setTimeout(() => setShowSummary(true), 1000);
            }
        } else {
            // Wrong match
            sfx.playWrong();
            setWrongPair({ wordId: word.id, defId: def.id });
            speak("Try again");
            setTimeout(() => {
                setSelectedWord(null);
                setSelectedDef(null);
                setWrongPair(null);
            }, 1000);
        }
    };

    const getLineColor = (wordId, defId) => {
        if (matchedPairs.has(wordId) && wordId === defId) return '#4caf50'; // Green for match
        if (wrongPair && wrongPair.wordId === wordId && wrongPair.defId === defId) return '#f44336'; // Red for wrong
        if (selectedWord?.id === wordId && selectedDef?.id === defId) return '#2196f3'; // Blue for selection
        return 'transparent';
    };

    if (questions.length === 0) return <div>Loading...</div>;

    return (
        <div className="definition-match-game" style={{
            padding: '2rem',
            maxWidth: '1000px',
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
                <h2 style={{ margin: 0 }}>Definition Match 🧩</h2>
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

            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', gap: '2rem', position: 'relative' }}>
                {/* Words Column */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {questions.map(q => (
                        <button
                            key={q.id}
                            onClick={() => handleWordClick(q)}
                            disabled={matchedPairs.has(q.id)}
                            style={{
                                padding: '1.5rem',
                                fontSize: '1.2rem',
                                fontWeight: 'bold',
                                background: matchedPairs.has(q.id) ? '#e8f5e9' : (selectedWord?.id === q.id ? '#e3f2fd' : 'white'),
                                color: matchedPairs.has(q.id) ? '#2e7d32' : (selectedWord?.id === q.id ? '#1565c0' : 'var(--dark)'),
                                border: `2px solid ${matchedPairs.has(q.id) ? '#4caf50' : (selectedWord?.id === q.id ? '#2196f3' : '#ddd')}`,
                                borderRadius: '15px',
                                cursor: matchedPairs.has(q.id) ? 'default' : 'pointer',
                                textAlign: 'center',
                                transition: 'all 0.2s',
                                opacity: matchedPairs.has(q.id) ? 0.7 : 1,
                                position: 'relative',
                                zIndex: 2
                            }}
                        >
                            {q.answer}
                        </button>
                    ))}
                </div>

                {/* SVG Lines Layer */}
                <svg style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    pointerEvents: 'none',
                    zIndex: 1
                }}>
                    {/* This is a simplified visualization - ideally we'd calculate exact coordinates */}
                </svg>

                {/* Definitions Column */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {definitions.map(def => (
                        <button
                            key={def.id}
                            onClick={() => handleDefClick(def)}
                            disabled={matchedPairs.has(def.id)}
                            style={{
                                padding: '1.5rem',
                                fontSize: '1rem',
                                background: matchedPairs.has(def.id) ? '#e8f5e9' : (selectedDef?.id === def.id ? '#e3f2fd' : 'white'),
                                color: matchedPairs.has(def.id) ? '#2e7d32' : (selectedDef?.id === def.id ? '#1565c0' : '#555'),
                                border: `2px solid ${matchedPairs.has(def.id) ? '#4caf50' : (selectedDef?.id === def.id ? '#2196f3' : '#ddd')}`,
                                borderRadius: '15px',
                                cursor: matchedPairs.has(def.id) ? 'default' : 'pointer',
                                textAlign: 'left',
                                transition: 'all 0.2s',
                                opacity: matchedPairs.has(def.id) ? 0.7 : 1,
                                position: 'relative',
                                zIndex: 2
                            }}
                        >
                            {def.text.replace(questions.find(q => q.id === def.id)?.answer, '_____')}
                        </button>
                    ))}
                </div>
            </div>

            {/* Tutorial Modal */}
            {showTutorial && (
                <GameTutorialModal
                    title="How to Play"
                    instructions={[
                        "Match the words on the left to their definitions on the right.",
                        "Tap a word, then tap its definition.",
                        "Correct matches turn green.",
                        "Match all pairs to win!"
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
