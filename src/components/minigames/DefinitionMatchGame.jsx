import { useState, useEffect, useCallback } from 'react';
import { triggerConfetti } from '../../utils/effects';
import { speak } from '../../utils/audio';
import { sfx } from '../../utils/soundEffects';
import GameTutorialModal from '../common/GameTutorialModal';
import GameSummaryModal from '../common/GameSummaryModal';
import balance from '../../data/balance.json';
import GameLayout from '../common/GameLayout';
import { colors, borderRadius, shadows, spacing } from '../../styles/designTokens';

export default function DefinitionMatchGame({ engine, onBack }) {
    const [questions, setQuestions] = useState([]);
    const [definitions, setDefinitions] = useState([]);
    const [matchedPairs, setMatchedPairs] = useState(new Set());
    const [selectedWord, setSelectedWord] = useState(null);
    const [selectedDef, setSelectedDef] = useState(null);
    const [_wrongPair, setWrongPair] = useState(null);
    const [gameStatus, setGameStatus] = useState('playing'); // 'playing' | 'won'
    const [showTutorial, setShowTutorial] = useState(false);
    const [showSummary, setShowSummary] = useState(false);
    const [rewards, setRewards] = useState({ xp: 0, coins: 0 });

    const closeTutorial = () => {
        sfx.playClick();
        setShowTutorial(false);
        localStorage.setItem('tutorial_definitionmatch', 'true');
    };

    const startNewRound = useCallback(() => {
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
    }, [engine]);

    useEffect(() => {
        startNewRound();

        // Check tutorial status
        const hasSeenTutorial = localStorage.getItem('tutorial_definitionmatch');
        if (!hasSeenTutorial) {
            setShowTutorial(true);
        }
    }, [startNewRound]); // Added startNewRound dependency

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
                const { xp, stars } = balance.rewards.minigames.definitionMatch;
                setRewards({ xp, coins: stars });
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



    return (
        <GameLayout
            title="Sentence Match"
            icon="🧩"
            onBack={onBack}
            onHelp={() => setShowTutorial(true)}
        >

            <div style={{ display: 'flex', justifyContent: 'center', gap: spacing.xxl, width: '100%', flexWrap: 'wrap' }}>
                {/* Words Column */}
                <div style={{ flex: '1 1 300px', maxWidth: '450px', display: 'flex', flexDirection: 'column', gap: spacing.md }}>
                    {questions.map(q => {
                        const isMatched = matchedPairs.has(q.id);
                        const isSelected = selectedWord?.id === q.id;

                        return (
                            <button
                                key={q.id}
                                onClick={() => handleWordClick(q)}
                                disabled={isMatched}
                                style={{
                                    padding: `${spacing.lg} ${spacing.xl}`,
                                    fontSize: '1.2rem',
                                    fontWeight: 'bold',
                                    background: isMatched ? colors.success : (isSelected ? `${colors.primary}15` : colors.white),
                                    color: isMatched ? colors.white : (isSelected ? colors.primary : colors.dark),
                                    border: `2px solid ${isMatched ? colors.success : (isSelected ? colors.primary : colors.border)}`,
                                    borderRadius: borderRadius.xl,
                                    cursor: isMatched ? 'default' : 'pointer',
                                    textAlign: 'center',
                                    transition: 'all 0.3s ease',
                                    opacity: isMatched ? 0.85 : 1,
                                    boxShadow: isSelected ? shadows.primary : shadows.sm,
                                    transform: isSelected ? 'translateY(-2px) scale(1.02)' : 'translateY(0)',
                                    position: 'relative'
                                }}
                                onMouseEnter={(e) => {
                                    if (!isMatched) {
                                        e.currentTarget.style.boxShadow = shadows.md;
                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (!isMatched && !isSelected) {
                                        e.currentTarget.style.boxShadow = shadows.sm;
                                        e.currentTarget.style.transform = 'translateY(0)';
                                    }
                                }}
                            >
                                {isMatched && (
                                    <span style={{ position: 'absolute', top: '8px', right: '12px', fontSize: '1.2rem' }}>✓</span>
                                )}
                                {q.answer}
                            </button>
                        );
                    })}
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
                <div style={{ flex: '1 1 300px', maxWidth: '550px', display: 'flex', flexDirection: 'column', gap: spacing.md }}>
                    {definitions.map(def => {
                        const isMatched = matchedPairs.has(def.id);
                        const isSelected = selectedDef?.id === def.id;

                        return (
                            <button
                                key={def.id}
                                onClick={() => handleDefClick(def)}
                                disabled={isMatched}
                                style={{
                                    padding: `${spacing.lg} ${spacing.xl}`,
                                    fontSize: '1rem',
                                    lineHeight: '1.5',
                                    background: isMatched ? colors.success : (isSelected ? `${colors.primary}15` : colors.white),
                                    color: isMatched ? colors.white : (isSelected ? colors.primary : colors.text),
                                    border: `2px solid ${isMatched ? colors.success : (isSelected ? colors.primary : colors.border)}`,
                                    borderRadius: borderRadius.xl,
                                    cursor: isMatched ? 'default' : 'pointer',
                                    textAlign: 'left',
                                    transition: 'all 0.3s ease',
                                    opacity: isMatched ? 0.85 : 1,
                                    boxShadow: isSelected ? shadows.primary : shadows.sm,
                                    transform: isSelected ? 'translateY(-2px) scale(1.01)' : 'translateY(0)',
                                    position: 'relative'
                                }}
                                onMouseEnter={(e) => {
                                    if (!isMatched) {
                                        e.currentTarget.style.boxShadow = shadows.md;
                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (!isMatched && !isSelected) {
                                        e.currentTarget.style.boxShadow = shadows.sm;
                                        e.currentTarget.style.transform = 'translateY(0)';
                                    }
                                }}
                            >
                                {isMatched && (
                                    <span style={{ position: 'absolute', top: '12px', right: '16px', fontSize: '1.2rem' }}>✓</span>
                                )}
                                {def.text.replace(questions.find(q => q.id === def.id)?.answer, '_____')}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Tutorial Modal */}
            {showTutorial && (
                <GameTutorialModal
                    title="How to Play"
                    instructions={[
                        "Match each word on the left to its sentence on the right.",
                        "Tap a word, then tap the sentence where it belongs.",
                        "Correct matches turn green with a checkmark.",
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
        </GameLayout>
    );
}

