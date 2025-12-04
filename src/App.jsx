import React, { useState, useEffect } from 'react';
import { QuizEngine } from './engine/QuizEngine';
import { Economy } from './engine/Economy';
import StartScreen from './components/StartScreen';
import QuizView from './components/QuizView';
import ResultsView from './components/ResultsView';
import ShopView from './components/ShopView';
import NavBar from './components/NavBar';
import SkillTreeView from './components/SkillTreeView';
import SplashScreen from './components/SplashScreen';
import QuizSetup from './components/QuizSetup';
import MinigameHub from './components/minigames/MinigameHub';
import WordSearchGame from './components/minigames/WordSearchGame';
import DefinitionMatchGame from './components/minigames/DefinitionMatchGame';
import LetterDeductionGame from './components/minigames/LetterDeductionGame';
import WordScrambleGame from './components/minigames/WordScrambleGame';
import WordLadderGame from './components/minigames/WordLadderGame';
import DailyLogin from './components/DailyLogin';
import { Achievements } from './engine/Achievements';
import StickerBook from './components/StickerBook';
import CertificateView from './components/CertificateView';
import { speak } from './utils/audio';
import { triggerConfetti } from './utils/effects';
import ErrorBoundary from './components/ErrorBoundary';

const engine = new QuizEngine();
const economy = new Economy();
const achievements = new Achievements();

export default function App() {
    const [view, setView] = useState('start'); // Start directly at home
    const [engineState, setEngineState] = useState(engine.getState());
    const [showDailyLogin, setShowDailyLogin] = useState(false);

    // Force re-render when engine state changes
    useEffect(() => {
        const interval = setInterval(() => {
            setEngineState(engine.getState());
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

    const handleStartQuiz = (theme, difficulty) => {
        console.log('STARTING QUIZ:', theme, difficulty);
        try {
            engine.startNewGame(theme, difficulty);
            console.log('ENGINE STARTED');
            setView('quiz');
            console.log('VIEW SET TO QUIZ');
        } catch (e) {
            console.error('ERROR STARTING QUIZ:', e);
        }
    };

    const handleFinish = (score, xp) => {
        economy.addCoins(score); // 1 coin per point

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
    };

    const handleRestart = () => {
        setView('quiz');
    };

    // Helper to handle navigation from NavBar
    const handleNavChange = (newView) => {
        if (newView === 'start') {
            // Reset to home hub
            setView('start');
        } else {
            setView(newView);
        }
    };

    console.log('RENDERING APP, VIEW:', view);
    return (
        <ErrorBoundary>
            <div className="app" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
                {showDailyLogin && <DailyLogin economy={economy} onClose={() => setShowDailyLogin(false)} />}

                <div style={{ flex: 1, position: 'relative', paddingBottom: '80px' }}>
                    {view === 'start' && <StartScreen onNavigate={setView} engine={engine} />}
                    {view === 'quiz-setup' && <QuizSetup onStart={handleStartQuiz} onBack={() => setView('start')} engine={engine} />}
                    {view === 'quiz' && <QuizView engine={engine} economy={economy} onFinish={handleFinish} />}
                    {view === 'results' && <ResultsView engine={engine} onRestart={handleRestart} />}
                    {view === 'shop' && <ShopView economy={economy} onBack={() => setView('start')} />}
                    {view === 'stickers' && <StickerBook achievements={achievements} onBack={() => setView('start')} onViewCertificate={() => setView('certificate')} />}
                    {view === 'certificate' && <CertificateView achievements={achievements} economy={economy} onBack={() => setView('stickers')} />}
                    {view === 'skills' && <SkillTreeView engine={engine} onBack={() => setView('start')} />}
                    {view === 'minigames' && <MinigameHub onSelectGame={setView} onBack={() => setView('start')} />}

                    {/* Minigame Routes */}
                    {view === 'game-wordsearch' && <WordSearchGame engine={engine} onBack={() => setView('minigames')} />}
                    {view === 'game-definition' && <DefinitionMatchGame engine={engine} onBack={() => setView('minigames')} />}
                    {view === 'game-hangman' && <LetterDeductionGame engine={engine} onBack={() => setView('minigames')} />}
                    {view === 'game-scramble' && <WordScrambleGame engine={engine} onBack={() => setView('minigames')} />}
                    {view === 'game-ladder' && <WordLadderGame engine={engine} onBack={() => setView('minigames')} />}

                    {view.startsWith('game-') && view !== 'game-wordsearch' && view !== 'game-definition' && view !== 'game-hangman' && view !== 'game-scramble' && view !== 'game-ladder' && (
                        <div style={{ padding: '2rem', textAlign: 'center' }}>
                            <h2>Game Under Construction: {view}</h2>
                            <button onClick={() => setView('minigames')}>Back to Arcade</button>
                        </div>
                    )}
                </div>

                <NavBar currentView={view} onViewChange={handleNavChange} />
            </div>
        </ErrorBoundary>
    );
}
