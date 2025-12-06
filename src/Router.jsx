import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useGame } from './contexts/GameContext';
import { useNavigation } from './contexts/NavigationContext';
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
import ClozeView from './components/ClozeView';
import clozePassages from './data/cloze_sample.json';
import GrammarQuizView from './components/GrammarQuizView';
import grammarQuestions from './data/grammar_questions.json';
import GrammarClozeView from './components/GrammarClozeView';
import grammarClozePassages from './data/grammar_cloze_sample.json';
import SpellingView from './components/SpellingView';
import spellingWords from './data/spelling_words.json';
import SpellingProgress from './engine/SpellingProgress';
import GrammarSetup from './components/GrammarSetup';
import ComprehensionView from './components/ComprehensionView';
import comprehensionPassages from './data/comprehension_sample.json';
import ReviseHub from './components/ReviseHub';
import FlashcardView from './components/FlashcardView';
import ProgressHub from './components/ProgressHub';
import ArenaHub from './components/ArenaHub';

export default function Router() {
    const { engine, economy, achievements, eventService } = useGame();
    const { view, setView, navigate } = useNavigation();
    const userProfile = useMemo(() => new UserProfile(), []);
    const spellingProgress = useMemo(() => new SpellingProgress(), []);
    // console.log('ROUTER VIEW:', view); // Removed spam
    const [showDailyLogin, setShowDailyLogin] = useState(false);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [clozePassageIndex, setClozePassageIndex] = useState(() => Math.floor(Math.random() * clozePassages.length));
    const [grammarClozeIndex, setGrammarClozeIndex] = useState(() => Math.floor(Math.random() * grammarClozePassages.length));
    const [grammarQuizQuestions, setGrammarQuizQuestions] = useState(null);
    const [comprehensionIndex, setComprehensionIndex] = useState(() => Math.floor(Math.random() * comprehensionPassages.length));
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
            <AvatarHUD
                userProfile={userProfile}
                economy={economy}
                onOpenProfile={() => setShowProfileModal(true)}
                onOpenShop={() => setView('shop')}
            />

            <div style={{ flex: 1, position: 'relative', paddingBottom: '80px' }}>
                {/* Learn Hub - default view */}
                {(view === 'learn' || view === 'start') && (
                    <LearnHub economy={economy} onNavigate={setView} />
                )}

                {/* Quiz Flow */}
                {view === 'quiz-setup' && <QuizSetup onStart={handleStartQuiz} onStartRevision={handleStartRevision} onBack={() => setView('learn')} engine={engine} />}
                {view === 'practice' && (
                    <ReviseHub
                        engine={engine}
                        spellingProgress={spellingProgress}
                        onNavigate={setView}
                        onBack={() => setView('learn')}
                    />
                )}
                {view === 'quiz' && (() => { console.log('Router: Rendering QuizView', QuizView); return <QuizView engine={engine} economy={economy} onFinish={handleFinish} />; })()}
                {view === 'arena' && (
                    <ArenaHub
                        engine={engine}
                        onStartBattle={() => setView('arena-battle')}
                        onBack={() => setView('learn')}
                    />
                )}
                {view === 'arena-battle' && <ArenaView engine={engine} onFinish={handleFinish} onBack={() => setView('arena')} />}
                {view === 'results' && <ResultsView engine={engine} onRestart={handleRestart} />}

                {/* Vocab Cloze */}
                {view === 'cloze' && (
                    <ClozeView
                        key={clozePassageIndex}
                        passage={clozePassages[clozePassageIndex]}
                        onComplete={() => setClozePassageIndex((i) => (i + 1) % clozePassages.length)}
                        onBack={() => setView('learn')}
                        economy={economy}
                        spacedRep={engine?.spacedRep}
                    />
                )}

                {/* Grammar Setup -> Quiz flow */}
                {view === 'grammar' && (
                    <GrammarSetup
                        allQuestions={grammarQuestions}
                        onStart={(questions) => {
                            setGrammarQuizQuestions(questions);
                            setView('grammar-quiz');
                        }}
                        onBack={() => setView('learn')}
                    />
                )}
                {view === 'grammar-quiz' && grammarQuizQuestions && (
                    <GrammarQuizView
                        questions={grammarQuizQuestions}
                        onComplete={() => {
                            setGrammarQuizQuestions(null);
                            setView('grammar');
                        }}
                        onBack={() => setView('grammar')}
                        economy={economy}
                    />
                )}

                {/* Grammar Cloze */}
                {view === 'grammar-cloze' && (
                    <GrammarClozeView
                        key={grammarClozeIndex}
                        passage={grammarClozePassages[grammarClozeIndex]}
                        onComplete={() => setGrammarClozeIndex((i) => (i + 1) % grammarClozePassages.length)}
                        onBack={() => setView('learn')}
                        economy={economy}
                    />
                )}

                {/* Spelling */}
                {view === 'spelling' && (
                    <SpellingView
                        words={spellingProgress.getWordsForPractice(spellingWords, 10)}
                        onComplete={() => setView('spelling')}
                        onBack={() => setView('learn')}
                        economy={economy}
                        spellingProgress={spellingProgress}
                    />
                )}

                {/* Comprehension */}
                {view === 'comprehension' && (
                    <ComprehensionView
                        key={comprehensionIndex}
                        passage={comprehensionPassages[comprehensionIndex]}
                        onComplete={() => setComprehensionIndex((i) => (i + 1) % comprehensionPassages.length)}
                        onBack={() => setView('learn')}
                        economy={economy}
                    />
                )}

                {/* Flashcards */}
                {view === 'flashcards' && (
                    <FlashcardView
                        words={engine?.spacedRep?.getDueWords?.() || []}
                        onComplete={() => setView('practice')}
                        onBack={() => setView('practice')}
                        economy={economy}
                        engine={engine}
                    />
                )}

                {/* Progress */}
                {view === 'shop' && <ShopView economy={economy} userProfile={userProfile} onBack={() => setView('learn')} />}
                {view === 'stickers' && <StickerBook achievements={achievements} onBack={() => setView('skills')} onNavigate={setView} />}
                {view === 'skills' && (
                    <ProgressHub
                        engine={engine}
                        economy={economy}
                        spellingProgress={spellingProgress}
                        achievements={achievements}
                        onNavigate={setView}
                        onBack={() => setView('learn')}
                    />
                )}
                {view === 'skill-tree' && <SkillTreeView engine={engine} onBack={() => setView('skills')} onNavigate={setView} />}

                {/* Minigames */}
                {view === 'minigames' && <MinigameHub onSelectGame={setView} onBack={() => setView('learn')} />}
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

            <NavBar currentView={view} onViewChange={navigate} />
        </div>
    );
}
