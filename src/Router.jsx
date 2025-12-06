import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useGame } from './contexts/GameContext';
import { useNavigation } from './contexts/NavigationContext';
import { QuestProvider } from './contexts/QuestContext';
import { speak } from './utils/audio';
import { triggerConfetti } from './utils/effects';
import { UserProfile } from './engine/UserProfile';

import StickerBook from './components/StickerBook';

import ArenaView from './components/ArenaView';
import LearnHub from './components/LearnHub';
import QuizSetup from './components/QuizSetup';
import QuizView from './components/QuizView';
import ResultsView from './components/ResultsView';
import ShopView from './components/ShopView';
import SkillTreeView from './components/SkillTreeView';
import MinigameHub from './components/minigames/MinigameHub';
import NavBar from './components/NavBar';
import DailyLogin from './components/DailyLogin';
import AvatarHUD from './components/common/AvatarHUD';
import ProfileModal from './components/common/ProfileModal';
import WordSearchGame from './components/minigames/WordSearchGame';
import DefinitionMatchGame from './components/minigames/DefinitionMatchGame';
import LetterDeductionGame from './components/minigames/LetterDeductionGame';
import WordScrambleGame from './components/minigames/WordScrambleGame';
import WordLadderGame from './components/minigames/WordLadderGame';

export default function Router() {
    const { engine, economy, achievements, eventService } = useGame();
    const { view, setView, navigate } = useNavigation();
    const userProfile = useMemo(() => new UserProfile(), []);
    console.log('ROUTER VIEW:', view);
    const [showDailyLogin, setShowDailyLogin] = useState(false);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [, setTick] = useState(0);

    // Force re-render when engine state changes (legacy behavior)
    useEffect(() => {
        const interval = setInterval(() => {
            setTick(t => t + 1);
        }, 100);

        // Check daily login
        const stored = localStorage.getItem('vocab_daily_login');
        if (stored) {
            const data = JSON.parse(stored);
            const last = new Date(data.lastLogin);
            const today = new Date();
            const isSameDay = last.getDate() === today.getDate() &&
                last.getMonth() === today.getMonth() &&
                last.getFullYear() === today.getFullYear();
            if (!isSameDay) {
                setShowDailyLogin(true);
            }
        } else {
            // First time ever
            setShowDailyLogin(true);
        }

        return () => clearInterval(interval);
    }, []);

    const handleStartQuiz = useCallback((theme, difficulty) => {
        console.log('STARTING QUIZ:', theme, difficulty);
        try {
            engine.startNewGame(theme, difficulty);
            console.log('ENGINE STARTED');
            setView('quiz');
            console.log('VIEW SET TO QUIZ');
        } catch (e) {
            console.error('ERROR STARTING QUIZ:', e);
        }
    }, [engine, setView]);

    const handleStartRevision = useCallback(() => {
        console.log('STARTING REVISION');
        const revisionList = engine.getRevisionList();
        if (revisionList.length > 0) {
            // Limit to 20 questions for bite-sized, achievable sessions
            const biteSize = revisionList.slice(0, 20);
            engine.startRetryGame(biteSize);
            setView('quiz');
        }
    }, [engine, setView]);

    const handleFinish = useCallback((score, _xp) => {
        economy.addCoins(score); // 1 coin per point

        // Check for Event Rewards
        const activeEvent = eventService.getActiveEvent();
        if (activeEvent) {
            // Check if current quiz theme matches event theme
            // We need to access the current questions to check theme
            // Assuming homogeneous theme for the quiz if a theme was selected
            const currentQuestions = engine.questions;
            if (currentQuestions.length > 0) {
                const quizTheme = currentQuestions[0].theme;
                if (quizTheme === activeEvent.theme) {
                    const multiplier = eventService.getMultiplier();
                    const eventTokens = Math.round(score * multiplier);
                    economy.addEventTokens(eventTokens);
                    console.log(`Earned ${eventTokens} Event Tokens!`);
                    speak(`Event Bonus! ${eventTokens} Tokens`);
                }
            }
        }

        // Update stats for achievements
        const unlocked = achievements.updateStats({
            wins: 1,
            totalCoins: score,
            perfectScores: score >= 100 ? 1 : 0
        });

        if (unlocked.length > 0) {
            unlocked.forEach(ach => {
                speak(`Achievement Unlocked! ${ach.title}`);
                triggerConfetti();
                console.log('Unlocked:', ach.title);
            });
        }

        setView('results');
    }, [economy, eventService, engine, achievements, setView]);

    const handleRestart = useCallback(() => {
        setView('quiz');
    }, [setView]);

    const handleStartArena = useCallback(() => {
        console.log('STARTING ARENA');
        setView('arena');
    }, [setView]);

    return (
        <QuestProvider engine={engine} achievements={achievements}>
            <div className="app" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
                {showDailyLogin && <DailyLogin economy={economy} onClose={() => setShowDailyLogin(false)} />}
                {showProfileModal && (
                    <ProfileModal
                        userProfile={userProfile}
                        onClose={() => setShowProfileModal(false)}
                        onSave={() => setTick(t => t + 1)}
                    />
                )}

                {/* Avatar HUD - persistent across all views */}
                {/* Avatar HUD - persistent across all views */}
                <AvatarHUD
                    userProfile={userProfile}
                    economy={economy}
                    onOpenProfile={() => setShowProfileModal(true)}
                />

                <div style={{ flex: 1, position: 'relative', paddingBottom: '80px' }}>
                    {/* Learn Hub - default view */}
                    {(view === 'learn' || view === 'start') && (
                        <LearnHub economy={economy} onNavigate={setView} />
                    )}

                    {/* Quiz Flow */}
                    {view === 'quiz-setup' && <QuizSetup onStart={handleStartQuiz} onStartRevision={handleStartRevision} onBack={() => setView('learn')} engine={engine} />}
                    {view === 'practice' && <QuizSetup onStart={handleStartQuiz} onStartRevision={handleStartRevision} onBack={() => setView('learn')} engine={engine} mode="practice" />}
                    {view === 'quiz' && (() => { console.log('Router: Rendering QuizView', QuizView); return <QuizView engine={engine} economy={economy} onFinish={handleFinish} />; })()}
                    {view === 'arena' && <ArenaView engine={engine} onFinish={handleFinish} onBack={() => setView('learn')} />}
                    {view === 'results' && <ResultsView engine={engine} onRestart={handleRestart} />}

                    {/* Progress */}
                    {view === 'shop' && <ShopView economy={economy} onBack={() => setView('learn')} />}
                    {view === 'stickers' && <StickerBook achievements={achievements} onBack={() => setView('skills')} onNavigate={setView} />}
                    {view === 'skills' && <SkillTreeView engine={engine} onBack={() => setView('learn')} onNavigate={setView} />}

                    {/* Minigames */}
                    {view === 'minigames' && <MinigameHub onSelectGame={setView} onBack={() => setView('learn')} />}
                    {view === 'game-wordsearch' && <WordSearchGame engine={engine} onBack={() => setView('minigames')} />}
                    {view === 'game-definition' && <DefinitionMatchGame engine={engine} onBack={() => setView('minigames')} />}
                    {view === 'game-hangman' && <LetterDeductionGame engine={engine} onBack={() => setView('minigames')} />}
                    {view === 'game-scramble' && <WordScrambleGame engine={engine} onBack={() => setView('minigames')} />}
                    {view === 'game-ladder' && <WordLadderGame engine={engine} onBack={() => setView('minigames')} />}

                    {/* Quests placeholder */}
                    {view === 'quests' && (
                        <div style={{ padding: '2rem', textAlign: 'center' }}>
                            <h2>🗺️ Quests Coming Soon!</h2>
                            <p>Themed learning journeys will be available here.</p>
                            <button onClick={() => setView('learn')} style={{ marginTop: '1rem', padding: '0.5rem 1rem' }}>Back to Learn</button>
                        </div>
                    )}

                    {view.startsWith('game-') && view !== 'game-wordsearch' && view !== 'game-definition' && view !== 'game-hangman' && view !== 'game-scramble' && view !== 'game-ladder' && (
                        <div style={{ padding: '2rem', textAlign: 'center' }}>
                            <h2>Game Under Construction: {view}</h2>
                            <button onClick={() => setView('minigames')}>Back to Arcade</button>
                        </div>
                    )}
                </div>

                <NavBar currentView={view} onViewChange={navigate} />
            </div>
        </QuestProvider>
    );
}
