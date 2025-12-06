import { useState, useEffect, useRef, useMemo } from 'react';
import { QuizEngine } from '../engine/QuizEngine';
import { triggerConfetti } from '../utils/effects';
import balanceConfig from '../data/balance.json';

// Get Arena config from balance.json
const ARENA_CONFIG = balanceConfig.arena;
const OPPONENTS = ARENA_CONFIG.opponents;

// Avatar emojis
const PLAYER_AVATARS = ['🦊', '🐱', '🐶', '🐼', '🦄', '🐸'];

export default function ArenaView({ engine: playerEngine, onFinish, onBack }) {
    // Opponent selection state
    const [selectedDifficulty, setSelectedDifficulty] = useState(null);
    const [showOpponentSelect, setShowOpponentSelect] = useState(true);

    // Get opponent config based on selection
    const opponentConfig = selectedDifficulty ? OPPONENTS[selectedDifficulty] : null;

    const playerAvatar = useMemo(() => PLAYER_AVATARS[Math.floor(Math.random() * PLAYER_AVATARS.length)], []);

    const [cpuEngine] = useState(() => {
        const engine = new QuizEngine(playerEngine.allQuestions);
        engine.startNewGame();
        return engine;
    });

    useEffect(() => {
        playerEngine.startNewGame();
    }, []);

    const [playerState, setPlayerState] = useState(playerEngine.getState());
    const [cpuState, setCpuState] = useState(cpuEngine.getState());
    const [winner, setWinner] = useState(null);
    const [countDown, setCountDown] = useState(3);
    const [gameStarted, setGameStarted] = useState(false);
    const [questionTimer, setQuestionTimer] = useState(ARENA_CONFIG.questionTimeLimit);

    const cpuTimerRef = useRef(null);
    const questionTimerRef = useRef(null);

    // Responsive Layout
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

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

        if (pState.isFinished && cState.isFinished) {
            if (pState.score > cState.score) {
                setWinner('player');
                triggerConfetti();
            } else if (cState.score > pState.score) {
                setWinner('cpu');
            } else {
                setWinner('draw');
            }
        } else if (pState.isFinished && !cState.isFinished) {
            if (pState.score >= cState.score) {
                setWinner('player');
                triggerConfetti();
            } else {
                setWinner('cpu');
            }
        }
    };

    const totalQuestions = playerEngine.questions?.length || ARENA_CONFIG.maxQuestions;

    // Opponent Selection Screen
    if (showOpponentSelect) {
        return (
            <div style={{
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #1a1a2e, #16213e, #0f3460)',
                color: 'white',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '2rem'
            }}>
                <h1 style={{
                    fontSize: '2.5rem',
                    marginBottom: '0.5rem',
                    background: 'linear-gradient(90deg, #ffd700, #ff6b6b)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                }}>
                    ⚔️ Choose Your Opponent ⚔️
                </h1>
                <p style={{ opacity: 0.7, marginBottom: '2rem' }}>Select difficulty level</p>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                    gap: '1rem',
                    maxWidth: '900px',
                    width: '100%'
                }}>
                    {Object.entries(OPPONENTS).map(([key, opponent]) => (
                        <button
                            key={key}
                            onClick={() => handleSelectOpponent(key)}
                            style={{
                                padding: '1.5rem',
                                background: key === 'noob' ? 'linear-gradient(135deg, #27ae60, #2ecc71)' :
                                    key === 'easy' ? 'linear-gradient(135deg, #3498db, #2980b9)' :
                                        key === 'medium' ? 'linear-gradient(135deg, #f39c12, #e67e22)' :
                                            key === 'hard' ? 'linear-gradient(135deg, #e74c3c, #c0392b)' :
                                                'linear-gradient(135deg, #9b59b6, #8e44ad)',
                                border: 'none',
                                borderRadius: '15px',
                                cursor: 'pointer',
                                color: 'white',
                                transition: 'transform 0.2s, box-shadow 0.2s',
                                boxShadow: '0 4px 15px rgba(0,0,0,0.3)'
                            }}
                            onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'}
                            onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
                        >
                            <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>{opponent.emoji}</div>
                            <div style={{ fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '0.3rem' }}>
                                {opponent.name}
                            </div>
                            <div style={{ fontSize: '0.8rem', opacity: 0.8, textTransform: 'capitalize' }}>
                                {key}
                            </div>
                            <div style={{ fontSize: '0.7rem', opacity: 0.6, marginTop: '0.5rem' }}>
                                {Math.round(opponent.accuracy * 100)}% accuracy
                            </div>
                        </button>
                    ))}
                </div>

                <button
                    onClick={onBack}
                    style={{
                        marginTop: '2rem',
                        padding: '0.8rem 2rem',
                        background: 'rgba(255,255,255,0.1)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: '10px',
                        color: 'white',
                        cursor: 'pointer'
                    }}
                >
                    ← Back to Home
                </button>
            </div>
        );
    }

    const renderPlayerColumn = () => {
        const q = playerEngine.getCurrentQuestion();
        const progress = ((playerState.currentQuestionIndex) / totalQuestions) * 100;

        return (
            <div style={{
                flex: 1,
                padding: '1rem',
                background: 'linear-gradient(180deg, #667eea22, #764ba222)',
                borderRadius: '20px',
                margin: '0.5rem',
                border: '3px solid #667eea'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                    <span style={{ fontSize: '3rem' }}>{playerAvatar}</span>
                    <div style={{ textAlign: 'center' }}>
                        <h2 style={{ margin: 0, color: '#667eea', fontSize: '1.5rem' }}>YOU</h2>
                        <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#667eea' }}>
                            {playerState.score} pts
                        </div>
                    </div>
                </div>

                <div style={{ background: '#ddd', borderRadius: '10px', height: '8px', marginBottom: '1rem', overflow: 'hidden' }}>
                    <div style={{
                        width: `${progress}%`,
                        height: '100%',
                        background: 'linear-gradient(90deg, #667eea, #764ba2)',
                        transition: 'width 0.3s'
                    }} />
                </div>

                <div style={{ textAlign: 'center', marginBottom: '0.5rem', color: '#666', fontWeight: 'bold' }}>
                    Question {playerState.currentQuestionIndex + 1} / {totalQuestions}
                </div>

                {q && !playerState.isFinished ? (
                    <div style={{ background: 'white', borderRadius: '15px', padding: '1.5rem', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
                        <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', textAlign: 'center', color: '#333' }}>
                            {q.question || q.formatted_text || 'Answer the question!'}
                        </h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                            {Object.values(q.options || {}).map((opt, i) => (
                                <button
                                    key={i}
                                    onClick={() => handlePlayerAnswer(opt)}
                                    style={{
                                        padding: '0.8rem',
                                        background: 'linear-gradient(135deg, #667eea, #764ba2)',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '10px',
                                        cursor: 'pointer',
                                        fontWeight: 'bold',
                                        fontSize: '0.9rem'
                                    }}
                                >
                                    {opt}
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div style={{ textAlign: 'center', padding: '2rem', background: 'white', borderRadius: '15px' }}>
                        <span style={{ fontSize: '3rem' }}>✅</span>
                        <h3>Finished!</h3>
                    </div>
                )}
            </div>
        );
    };

    const renderCPUColumn = () => {
        const q = cpuEngine.getCurrentQuestion();
        const progress = ((cpuState.currentQuestionIndex) / (cpuEngine.questions?.length || ARENA_CONFIG.maxQuestions)) * 100;

        return (
            <div style={{
                flex: 1,
                padding: '1rem',
                background: 'linear-gradient(180deg, #ff6b6b22, #ee5a2422)',
                borderRadius: '20px',
                margin: '0.5rem',
                border: '3px solid #ff6b6b',
                opacity: 0.9
            }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                    <span style={{ fontSize: '3rem' }}>{opponentConfig?.emoji || '🤖'}</span>
                    <div style={{ textAlign: 'center' }}>
                        <h2 style={{ margin: 0, color: '#ff6b6b', fontSize: '1.2rem' }}>
                            {opponentConfig?.name || 'CPU'}
                        </h2>
                        <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ff6b6b' }}>
                            {cpuState.score} pts
                        </div>
                    </div>
                </div>

                <div style={{ background: '#ddd', borderRadius: '10px', height: '8px', marginBottom: '1rem', overflow: 'hidden' }}>
                    <div style={{
                        width: `${progress}%`,
                        height: '100%',
                        background: 'linear-gradient(90deg, #ff6b6b, #ee5a24)',
                        transition: 'width 0.3s'
                    }} />
                </div>

                <div style={{ textAlign: 'center', marginBottom: '0.5rem', color: '#666', fontWeight: 'bold' }}>
                    Question {cpuState.currentQuestionIndex + 1} / {cpuEngine.questions?.length || ARENA_CONFIG.maxQuestions}
                </div>

                {q && !cpuState.isFinished ? (
                    <div style={{
                        background: 'white',
                        borderRadius: '15px',
                        padding: '1.5rem',
                        filter: 'blur(2px)',
                        pointerEvents: 'none'
                    }}>
                        <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', textAlign: 'center' }}>{q.question}</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                            {Object.values(q.options || {}).map((opt, i) => (
                                <div key={i} style={{ padding: '0.8rem', background: '#eee', borderRadius: '10px', textAlign: 'center' }}>
                                    {opt}
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div style={{ textAlign: 'center', padding: '2rem', background: 'white', borderRadius: '15px' }}>
                        <span style={{ fontSize: '3rem' }}>✅</span>
                        <h3>Finished!</h3>
                    </div>
                )}
            </div>
        );
    };



    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            background: 'linear-gradient(135deg, #1a1a2e, #16213e, #0f3460)',
            color: 'white'
        }}>
            {/* Header */}
            <div style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button
                    onClick={onBack}
                    style={{
                        background: 'rgba(255,255,255,0.1)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        color: 'white',
                        padding: '0.5rem 1rem',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        fontSize: isMobile ? '0.8rem' : '1rem'
                    }}
                >
                    ← {isMobile ? 'Exit' : 'Exit Arena'}
                </button>

                <h1 style={{
                    fontSize: isMobile ? '1.5rem' : '2rem',
                    background: 'linear-gradient(90deg, #ffd700, #ff6b6b, #667eea)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    textAlign: 'center'
                }}>
                    {isMobile ? '⚔️ ARENA ⚔️' : '⚔️ THE ARENA ⚔️'}
                </h1>

                {gameStarted && !winner && !playerState.isFinished && (
                    <div style={{
                        background: questionTimer <= 5 ? '#ff6b6b' : 'rgba(255,255,255,0.1)',
                        padding: '0.5rem 1rem',
                        borderRadius: '10px',
                        fontWeight: 'bold',
                        fontSize: isMobile ? '1.2rem' : '1.5rem',
                        minWidth: '60px',
                        textAlign: 'center'
                    }}>
                        {questionTimer}s
                    </div>
                )}
                {(!gameStarted || winner || playerState.isFinished) && <div style={{ width: isMobile ? '50px' : '80px' }} />}
            </div>

            {/* Countdown/Winner Overlay */}
            {(!gameStarted || winner) && (
                <div style={{
                    position: 'fixed',
                    top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.9)',
                    zIndex: 100,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    color: 'white',
                    padding: '1rem',
                    textAlign: 'center'
                }}>
                    {winner ? (
                        <>
                            <div style={{ fontSize: isMobile ? '4rem' : '5rem', marginBottom: '1rem' }}>
                                {winner === 'player' ? playerAvatar : winner === 'cpu' ? opponentConfig?.emoji : '🤝'}
                            </div>
                            <h1 style={{
                                fontSize: isMobile ? '2.5rem' : '4rem',
                                background: winner === 'player'
                                    ? 'linear-gradient(90deg, #ffd700, #ffed4a)'
                                    : 'linear-gradient(90deg, #ff6b6b, #ee5a24)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                marginBottom: '1rem'
                            }}>
                                {winner === 'player' ? 'VICTORY!' : winner === 'cpu' ? 'DEFEAT' : 'DRAW!'}
                            </h1>
                            <p style={{ fontSize: isMobile ? '1.2rem' : '1.5rem', opacity: 0.8 }}>
                                You: {playerState.score} pts — {opponentConfig?.name}: {cpuState.score} pts
                            </p>
                            <button
                                onClick={onBack}
                                style={{
                                    marginTop: '2rem',
                                    padding: isMobile ? '0.8rem 2rem' : '1rem 3rem',
                                    fontSize: isMobile ? '1.2rem' : '1.5rem',
                                    background: 'linear-gradient(135deg, #667eea, #764ba2)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '15px',
                                    cursor: 'pointer',
                                    fontWeight: 'bold'
                                }}
                            >
                                Continue →
                            </button>
                        </>
                    ) : (
                        <>
                            <div style={{ fontSize: isMobile ? '2rem' : '3rem', marginBottom: '1rem', display: 'flex', gap: isMobile ? '1rem' : '2rem', alignItems: 'center' }}>
                                <span>{playerAvatar}</span>
                                <span style={{ color: '#ff6b6b' }}>VS</span>
                                <span>{opponentConfig?.emoji}</span>
                            </div>
                            <p style={{ marginBottom: '1rem', opacity: 0.8 }}>YOU vs {opponentConfig?.name}</p>
                            <h1 style={{
                                fontSize: isMobile ? '5rem' : '8rem',
                                background: 'linear-gradient(90deg, #ffd700, #ff6b6b)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent'
                            }}>
                                {countDown > 0 ? countDown : 'FIGHT!'}
                            </h1>
                        </>
                    )}
                </div>
            )}

            {/* Arena Split View */}
            <div style={{
                flex: 1,
                display: 'flex',
                maxWidth: '1200px',
                margin: '0 auto',
                width: '100%',
                padding: '0.5rem',
                flexDirection: isMobile ? 'column' : 'row',
                gap: isMobile ? '1rem' : '0'
            }}>
                {renderPlayerColumn()}
                {renderCPUColumn()}
            </div>
        </div>
    );
}
