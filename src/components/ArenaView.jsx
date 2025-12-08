import React, { useState, useEffect, useRef, useMemo } from 'react';
import { QuizEngine } from '../engine/QuizEngine';
import { triggerConfetti } from '../utils/effects';
import balanceConfig from '../data/balance.json';
import { useIsMobile } from '../hooks/useIsMobile';
import { colors, spacing, borderRadius, shadows, typography, componentStyles } from '../styles/designTokens';

import { buildArenaQuestions, flattenClozePassages } from '../utils/arenaQuestionBuilder';
import { VOCAB_CLOZE, GRAMMAR_MCQ, GRAMMAR_CLOZE } from '../data/dataManifest';

const clozePassagesData = VOCAB_CLOZE;
const grammarQuestionsData = GRAMMAR_MCQ;
const grammarClozePassagesData = GRAMMAR_CLOZE;

// Get Arena config from balance.json
const ARENA_CONFIG = balanceConfig.arena;
const OPPONENTS = ARENA_CONFIG.opponents;

// Avatar emojis
const PLAYER_AVATARS = ['🦊', '🐱', '🐶', '🐼', '🦄', '🐸'];

export default function ArenaView({ engine: mainEngine, selectedQuestionTypes = ['vocab-mcq'], onBack }) {
    // Opponent selection state
    const [selectedDifficulty, setSelectedDifficulty] = useState(null);
    const [showOpponentSelect, setShowOpponentSelect] = useState(true);

    // Get opponent config based on selection
    const opponentConfig = selectedDifficulty ? OPPONENTS[selectedDifficulty] : null;

    const playerAvatar = useMemo(() => PLAYER_AVATARS[Math.floor(Math.random() * PLAYER_AVATARS.length)], []);

    const [playerEngine] = useState(() => {
        // Flatten cloze passages
        const vocabClozeQuestions = flattenClozePassages(clozePassagesData, 'vocab-cloze');
        const grammarClozeQuestions = flattenClozePassages(grammarClozePassagesData, 'grammar-cloze');

        // Build mixed question set
        const mixedQuestions = buildArenaQuestions({
            vocabMcq: mainEngine.allQuestions,
            vocabCloze: vocabClozeQuestions,
            grammarMcq: grammarQuestionsData,
            grammarCloze: grammarClozeQuestions
        }, new Set(selectedQuestionTypes), 10); // Standard 10 questions

        const engine = new QuizEngine(mixedQuestions);
        engine.startNewGame();
        return engine;
    });

    const [cpuEngine] = useState(() => {
        const engine = new QuizEngine(playerEngine.allQuestions);
        engine.startNewGame();
        return engine;
    });

    const [playerState, setPlayerState] = useState(playerEngine.getState());
    const [cpuState, setCpuState] = useState(cpuEngine.getState());
    const [winner, setWinner] = useState(null);
    const [countDown, setCountDown] = useState(3);
    const [gameStarted, setGameStarted] = useState(false);
    const [questionTimer, setQuestionTimer] = useState(ARENA_CONFIG.questionTimeLimit);

    const cpuTimerRef = useRef(null);
    const questionTimerRef = useRef(null);

    // Responsive Layout
    const isMobile = useIsMobile();

    // Start game after opponent selection
    const handleSelectOpponent = (difficulty) => {
        setSelectedDifficulty(difficulty);
        setShowOpponentSelect(false);
    };

    // Countdown Timer (3, 2, 1, FIGHT!)
    useEffect(() => {
        if (showOpponentSelect) return; // Don't start until opponent selected

        if (countDown > 0) {
            const timer = setTimeout(() => setCountDown(countDown - 1), 1000);
            return () => clearTimeout(timer);
        } else if (!gameStarted) {
            setGameStarted(true);
        }
    }, [countDown, gameStarted, showOpponentSelect]);

    // Question Timer
    useEffect(() => {
        if (!gameStarted || winner || playerState.isFinished) return;

        if (questionTimer > 0) {
            questionTimerRef.current = setTimeout(() => {
                setQuestionTimer(t => t - 1);
            }, 1000);
        } else {
            playerEngine.answer('__TIMEOUT__');
            setPlayerState(playerEngine.getState());
            setQuestionTimer(ARENA_CONFIG.questionTimeLimit);

            if (playerEngine.getState().isFinished) {
                checkWinner();
            }
        }

        return () => clearTimeout(questionTimerRef.current);
    }, [gameStarted, questionTimer, winner, playerState.isFinished]);

    // CPU Logic - uses balance.json timing
    useEffect(() => {
        if (!gameStarted || !opponentConfig) return;

        const playCpuTurn = () => {
            if (cpuEngine.getState().isFinished) return;

            // Use opponent config for response time
            const { minResponseTime, maxResponseTime, accuracy } = opponentConfig;
            const responseTime = minResponseTime + Math.random() * (maxResponseTime - minResponseTime);

            cpuTimerRef.current = setTimeout(() => {
                const q = cpuEngine.getCurrentQuestion();
                if (!q) return;

                const isCorrect = Math.random() < accuracy;
                const answer = isCorrect ? q.answer : "__WRONG__";

                cpuEngine.answer(answer);
                setCpuState(cpuEngine.getState());

                if (cpuEngine.getState().isFinished) {
                    checkWinner();
                } else {
                    playCpuTurn();
                }
            }, responseTime);
        };

        playCpuTurn();
        return () => clearTimeout(cpuTimerRef.current);
    }, [gameStarted, opponentConfig]);

    const handlePlayerAnswer = (answer) => {
        if (!gameStarted || winner || playerState.isFinished) return;

        playerEngine.answer(answer);
        setPlayerState(playerEngine.getState());
        setQuestionTimer(ARENA_CONFIG.questionTimeLimit);

        if (playerEngine.getState().isFinished) {
            checkWinner();
        }
    };

    const checkWinner = () => {
        const pState = playerEngine.getState();
        const cState = cpuEngine.getState();

        // Helper to persist results
        const persistResult = (result, difficulty) => {
            // Logic to find elo gain/loss based on difficulty
            // This is simplified, actual logic could be more complex
            const baseElo = 20;
            const multiplier = difficulty === 'noob' ? 0.5 : difficulty === 'easy' ? 1 : difficulty === 'medium' ? 1.5 : difficulty === 'hard' ? 2 : 2.5;
            const amount = Math.round(baseElo * multiplier);

            if (mainEngine?.economy) {
                if (result === 'win') mainEngine.economy.addArenaWin(amount);
                else if (result === 'loss') mainEngine.economy.addArenaLoss(Math.round(amount / 2));
            }
        };

        if (pState.isFinished && cState.isFinished) {
            if (pState.score > cState.score) {
                setWinner('player');
                triggerConfetti();
                persistResult('win', selectedDifficulty);
            } else if (cState.score > pState.score) {
                setWinner('cpu');
                persistResult('loss', selectedDifficulty);
            } else {
                setWinner('draw');
            }
        } else if (pState.isFinished && !cState.isFinished) {
            // If player finishes but CPU hasn't, we wait? Or is it concurrent? 
            // In this design, it seems they play concurrently. The winner check should probably happen when BOTH finish or maybe time limit?
            // But existing logic seemed to check on every answer. 
            // If player finishes first, we should probably wait for CPU or declare win if score is already unbeatable?
            // For simplicity, let's keep the logic: if player finishes, wait for CPU? 
            // Or if we strictly follow "Race", then speed matters. 
            // Let's assume we wait for both to finish to compare HIGH SCORE.
        }

        // Revised Winner Check Logic for "Race":
        // Whoever answers all questions first? Or whoever has highest score at end?
        // Usually it's highest score. 
        if (pState.isFinished && cState.isFinished) {
            // ... (same as above)
        }
    };

    const currentQuestion = playerEngine.getCurrentQuestion();
    const totalQuestions = playerEngine.questions.length;

    // Opponent Selection Screen
    if (showOpponentSelect) {
        return (
            <div style={{
                ...componentStyles.page,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <div style={{ textAlign: 'center', marginBottom: spacing.xl }}>
                    <h1 style={{ ...typography.h1, color: colors.primary, marginBottom: spacing.sm }}>
                        ⚔️ Choose Your Opponent ⚔️
                    </h1>
                    <p style={{ ...typography.body, color: colors.textMuted }}>Select your difficulty level</p>
                </div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: spacing.md,
                    width: '100%',
                    maxWidth: '1000px'
                }}>
                    {Object.entries(OPPONENTS).map(([key, opponent]) => (
                        <button
                            key={key}
                            onClick={() => handleSelectOpponent(key)}
                            style={{
                                background: colors.white,
                                border: `2px solid ${colors.border}`,
                                borderRadius: borderRadius.xl,
                                padding: spacing.xl,
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                boxShadow: shadows.sm,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center'
                            }}
                            onMouseEnter={e => {
                                e.currentTarget.style.transform = 'translateY(-4px)';
                                e.currentTarget.style.boxShadow = shadows.lg;
                                e.currentTarget.style.borderColor = colors.primary;
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = shadows.sm;
                                e.currentTarget.style.borderColor = colors.border;
                            }}
                        >
                            <div style={{ fontSize: '3.5rem', marginBottom: spacing.md }}>{opponent.emoji}</div>
                            <div style={{ ...typography.h3, marginBottom: spacing.xs }}>{opponent.name}</div>
                            <div style={{ ...typography.small, color: colors.primary, fontWeight: 'bold', textTransform: 'uppercase' }}>{key}</div>
                            <div style={{
                                ...typography.small,
                                color: colors.textMuted,
                                marginTop: spacing.sm,
                                background: colors.light,
                                padding: `${spacing.xs} ${spacing.sm}`,
                                borderRadius: borderRadius.pill
                            }}>
                                {Math.round(opponent.accuracy * 100)}% accuracy
                            </div>
                        </button>
                    ))}
                </div>

                <button
                    onClick={onBack}
                    style={{
                        ...componentStyles.secondaryButton,
                        marginTop: spacing.xl,
                        width: 'auto',
                        padding: `${spacing.md} ${spacing.xl}`
                    }}
                >
                    ← Back to Home
                </button>
            </div>
        );
    }

    if (winner) {
        return (
            <div style={{
                ...componentStyles.page,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center'
            }}>
                <h1 style={{ ...typography.h1, fontSize: '3rem', marginBottom: spacing.md }}>
                    {winner === 'player' ? '🏆 Victory! 🏆' : winner === 'cpu' ? '💀 Defeat! 💀' : '🤝 Draw! 🤝'}
                </h1>
                <div style={{ fontSize: '4rem', marginBottom: spacing.lg }}>
                    {winner === 'player' ? playerAvatar : opponentConfig.emoji}
                </div>
                <div style={{ ...typography.h2, marginBottom: spacing.xl }}>
                    Score: {playerState.score} vs {cpuState.score}
                </div>
                <button
                    onClick={onBack}
                    style={componentStyles.primaryButton}
                >
                    Return to Hub
                </button>
            </div>
        );
    }

    if (countDown > 0) {
        return (
            <div style={{
                ...componentStyles.page,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: colors.dark
            }}>
                <div style={{ fontSize: '8rem', color: colors.white, fontWeight: 'bold', animation: 'ping 1s infinite' }}>
                    {countDown}
                </div>
            </div>
        );
    }

    return (
        <div style={{ ...componentStyles.page, padding: isMobile ? spacing.sm : spacing.lg }}>
            <div style={{
                marginBottom: spacing.md,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <button onClick={onBack} style={componentStyles.backButton}>←</button>
                <div style={{
                    background: colors.white,
                    padding: `${spacing.xs} ${spacing.md}`,
                    borderRadius: borderRadius.pill,
                    boxShadow: shadows.sm,
                    fontWeight: 'bold',
                    color: colors.primary
                }}>
                    ⏱️ {questionTimer}s
                </div>
                <div style={{ width: '44px' }} /> {/* Spacer */}
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
                gap: spacing.lg,
                height: isMobile ? 'auto' : 'calc(100vh - 120px)'
            }}>
                {/* Player Column */}
                <div style={{
                    background: colors.white,
                    borderRadius: borderRadius.xl,
                    padding: spacing.md,
                    boxShadow: shadows.md,
                    display: 'flex',
                    flexDirection: 'column'
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: spacing.md,
                        marginBottom: spacing.md,
                        paddingBottom: spacing.md,
                        borderBottom: `1px solid ${colors.border}`
                    }}>
                        <div style={{ fontSize: '2.5rem' }}>{playerAvatar}</div>
                        <div>
                            <div style={{ fontWeight: 'bold' }}>You</div>
                            <div style={{ color: colors.primary }}>Score: {playerState.score}</div>
                        </div>
                    </div>

                    {currentQuestion ? (
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                            <div style={{
                                ...typography.h3,
                                marginBottom: spacing.lg,
                                minHeight: '60px'
                            }}>
                                {currentQuestion.question}
                            </div>

                            <div style={{ display: 'grid', gap: spacing.sm, marginTop: 'auto' }}>
                                {currentQuestion.options.map((opt, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => handlePlayerAnswer(opt)}
                                        style={{
                                            ...componentStyles.secondaryButton,
                                            textAlign: 'left',
                                            justifyContent: 'flex-start'
                                        }}
                                    >
                                        {opt}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', marginTop: spacing.xl, color: colors.textMuted }}>
                            Waiting for results...
                        </div>
                    )}
                </div>

                {/* CPU Column */}
                <div style={{
                    background: isMobile ? 'transparent' : 'rgba(255,255,255,0.5)',
                    borderRadius: borderRadius.xl,
                    padding: spacing.md,
                    border: isMobile ? 'none' : `2px dashed ${colors.border}`,
                    opacity: isMobile ? 0.8 : 1
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: spacing.md,
                        marginBottom: spacing.md,
                        paddingBottom: spacing.md,
                        borderBottom: `1px solid ${colors.border}`
                    }}>
                        <div style={{ fontSize: '2.5rem' }}>{opponentConfig.emoji}</div>
                        <div>
                            <div style={{ fontWeight: 'bold' }}>{opponentConfig.name}</div>
                            <div style={{ color: colors.error }}>Score: {cpuState.score}</div>
                        </div>
                    </div>

                    <div style={{ padding: spacing.md }}>
                        {cpuState.history.map((h, i) => (
                            <div key={i} style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: spacing.sm,
                                marginBottom: spacing.xs,
                                fontSize: '0.9rem'
                            }}>
                                <span>Q{i + 1}:</span>
                                <span>{h.isCorrect ? '✅' : '❌'}</span>
                            </div>
                        ))}
                        {cpuState.history.length === 0 && (
                            <div style={{ color: colors.textMuted, fontStyle: 'italic' }}>
                                Opponent is thinking...
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
