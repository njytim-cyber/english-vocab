
import { useEffect, useState, useMemo, useCallback, Suspense, lazy } from 'react';
import { useGame } from './contexts/GameContext';
import { useNavigation } from './contexts/NavigationContext';
import { speak } from './utils/audio';
import { triggerConfetti } from './utils/effects';
import { UserProfile } from './engine/UserProfile';

// Lazy Loaded Components (Heavy Views)
const StickerBook = lazy(() => import('./components/StickerBook'));
const ArenaView = lazy(() => import('./components/ArenaView'));
const MinigameHub = lazy(() => import('./components/minigames/MinigameHub'));
const ShopView = lazy(() => import('./components/ShopView'));
const ArenaHub = lazy(() => import('./components/ArenaHub'));
const WordSearchGame = lazy(() => import('./components/minigames/WordSearchGame'));
const DefinitionMatchGame = lazy(() => import('./components/minigames/DefinitionMatchGame'));
const LetterDeductionGame = lazy(() => import('./components/minigames/LetterDeductionGame'));
const WordScrambleGame = lazy(() => import('./components/minigames/WordScrambleGame'));
const WordLadderGame = lazy(() => import('./components/minigames/WordLadderGame'));

// Eager Loaded Components (Core/Fast Views)
import LoadingSpinner from './components/common/LoadingSpinner';
import LearnHub from './components/LearnHub';
import QuizSetup from './components/QuizSetup';
import QuizView from './components/QuizView';
import ResultsView from './components/ResultsView';
import SkillTreeView from './components/SkillTreeView';
import NavBar from './components/NavBar';
import DailyLogin from './components/DailyLogin';
import AvatarHUD from './components/common/AvatarHUD';
import ProfileModal from './components/common/ProfileModal';
import SplashScreen from './components/common/SplashScreen';
import ClozeView from "./components/ClozeView";
import GrammarQuizView from './components/GrammarQuizView';
import GrammarClozeView from './components/GrammarClozeView';
import SpellingView from './components/SpellingView';
import { VOCAB_CLOZE, GRAMMAR_MCQ, SPELLING, COMPREHENSION, GRAMMAR_CLOZE, LISTENING } from './data/dataManifest';
import SpellingProgress from './engine/SpellingProgress';
import GrammarSetup from './components/GrammarSetup';
import ComprehensionView from './components/ComprehensionView';
import ListeningView from './components/ListeningView';


const spellingWords = SPELLING;
const grammarClozePassages = GRAMMAR_CLOZE;
const comprehensionPassages = COMPREHENSION;
const listeningPassages = LISTENING;
import ReviseHub from './components/ReviseHub';
import FlashcardView from './components/FlashcardView';
import ProgressHub from './components/ProgressHub';
import ContentSetup from './components/ContentSetup';
import SynthesisView from './components/SynthesisView';
import synthesisQuestions from './data/synthesis_transformation.json';

export default function Router() {
    const { engine, economy, achievements, eventService } = useGame();
    const { view, setView, navigate } = useNavigation();
    const userProfile = useMemo(() => new UserProfile(), []);
    const spellingProgress = useMemo(() => new SpellingProgress(), []);

    const [showDailyLogin, setShowDailyLogin] = useState(false);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [showSplash, setShowSplash] = useState(false);

    const APP_VERSION = '1.2.0'; // Update this when releasing new versions

    const clozePassages = VOCAB_CLOZE;
    const grammarQuestions = GRAMMAR_MCQ;

    const [clozePassageIndex, setClozePassageIndex] = useState(() => Math.floor(Math.random() * clozePassages.length));
    const [grammarClozeIndex, setGrammarClozeIndex] = useState(() => Math.floor(Math.random() * grammarClozePassages.length));
    const [grammarQuizQuestions, setGrammarQuizQuestions] = useState(null);
    const [comprehensionIndex, setComprehensionIndex] = useState(() => Math.floor(Math.random() * comprehensionPassages.length));
    const [listeningIndex, setListeningIndex] = useState(() => Math.floor(Math.random() * listeningPassages.length));
    const [arenaSelectedTypes, setArenaSelectedTypes] = useState(['vocab-mcq']);

    // Filtered lists for setups
    const [filteredClozePassages, setFilteredClozePassages] = useState(null);
    const [filteredGrammarCloze, setFilteredGrammarCloze] = useState(null);
    const [filteredComprehension, setFilteredComprehension] = useState(null);
    const [filteredListening, setFilteredListening] = useState(null);
    const [filteredSynthesis, setFilteredSynthesis] = useState(null);
    const [synthesisIndex, setSynthesisIndex] = useState(0);

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

        // Check version splash
        const lastSeenVersion = localStorage.getItem('vocab_last_seen_version');
        if (!lastSeenVersion || lastSeenVersion !== APP_VERSION) {
            setShowSplash(true);
        }

        return () => clearInterval(interval);
    }, []);

    const handleStartQuiz = useCallback((theme, difficulty) => {
        console.log('STARTING QUIZ:', theme, difficulty);
        try {
            engine.startNewGame(theme, difficulty);
            console.log('ENGINE STARTED');
            setView('quiz');
        } catch (e) {
            console.error('ERROR STARTING QUIZ:', e);
        }
    }, [engine, setView]);

    const handleStartRevision = useCallback(() => {
        const revisionList = engine.getRevisionList();
        if (revisionList.length > 0) {
            // Limit to 20 questions for bite-sized sessions
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

    const handleCloseSplash = () => {
        localStorage.setItem('vocab_last_seen_version', APP_VERSION);
        setShowSplash(false);
    };

    return (
        <div className="app" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            {showDailyLogin && <DailyLogin economy={economy} onClose={() => setShowDailyLogin(false)} />}
            {showSplash && <SplashScreen version={APP_VERSION} onClose={handleCloseSplash} show={showSplash} />}
            {showProfileModal && (
                <ProfileModal
                    userProfile={userProfile}
                    economy={economy}
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
                <Suspense fallback={<LoadingSpinner />}>
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
                    {view === 'quiz' && <QuizView engine={engine} economy={economy} onFinish={handleFinish} />}
                    {view === 'arena' && (
                        <ArenaHub
                            engine={engine}
                            onStartBattle={(selectedTypes) => {
                                setArenaSelectedTypes(selectedTypes);
                                setView('arena-battle');
                            }}
                            onBack={() => setView('learn')}
                        />
                    )}
                    {view === 'arena-battle' && (
                        <ArenaView
                            engine={engine}
                            selectedQuestionTypes={arenaSelectedTypes}
                            onFinish={handleFinish}
                            onBack={() => setView('arena')}
                        />
                    )}
                    {view === 'results' && <ResultsView engine={engine} onRestart={handleRestart} />}

                    {/* Content Setups */}
                    {view === 'cloze-setup' && (
                        <ContentSetup
                            title="Vocab Cloze Setup"
                            data={clozePassages}
                            onStart={(filtered) => {
                                setFilteredClozePassages(filtered);
                                setClozePassageIndex(0);
                                setView('cloze');
                            }}
                            onBack={() => setView('learn')}
                            themeKey="theme"
                        />
                    )}

                    {view === 'grammar-cloze-setup' && (
                        <ContentSetup
                            title="Grammar Cloze Setup"
                            data={grammarClozePassages}
                            onStart={(filtered) => {
                                setFilteredGrammarCloze(filtered);
                                setGrammarClozeIndex(0);
                                setView('grammar-cloze');
                            }}
                            onBack={() => setView('learn')}
                            themeKey="category"
                        />
                    )}

                    {view === 'comprehension-setup' && (
                        <ContentSetup
                            title="Comprehension Setup"
                            data={comprehensionPassages}
                            onStart={(filtered) => {
                                setFilteredComprehension(filtered);
                                setComprehensionIndex(0);
                                setView('comprehension');
                            }}
                            onBack={() => setView('learn')}
                            themeKey="theme"
                        />
                    )}

                    {view === 'listening-setup' && (
                        <ContentSetup
                            title="Listening Comprehension Setup"
                            data={listeningPassages}
                            onStart={(filtered) => {
                                setFilteredListening(filtered);
                                setListeningIndex(0);
                                setView('listening');
                            }}
                            onBack={() => setView('learn')}
                            themeKey="theme"
                        />
                    )}

                    {view === 'synthesis-setup' && (
                        <ContentSetup
                            title="Synthesis & Transformation Setup"
                            data={synthesisQuestions}
                            themeKey="category"
                            onStart={(filtered) => {
                                setFilteredSynthesis(filtered);
                                setSynthesisIndex(0);
                                setView('synthesis');
                            }}
                            onBack={() => setView('learn')}
                        />
                    )}

                    {/* Content Views */}
                    {view === 'cloze' && (
                        <ClozeView
                            key={clozePassageIndex}
                            passage={(filteredClozePassages || clozePassages)[clozePassageIndex]}
                            onComplete={() => setClozePassageIndex((i) => (i + 1) % (filteredClozePassages || clozePassages).length)}
                            onBack={() => setView('cloze-setup')}
                            economy={economy}
                            spacedRep={engine?.spacedRep}
                        />
                    )}

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

                    {view === 'grammar-quiz' && (
                        <GrammarQuizView
                            questions={grammarQuizQuestions}
                            onComplete={() => setView('grammar')}
                            onBack={() => setView('grammar')}
                            economy={economy}
                        />
                    )}

                    {view === 'grammar-cloze' && (
                        <GrammarClozeView
                            key={grammarClozeIndex}
                            passage={(filteredGrammarCloze || grammarClozePassages)[grammarClozeIndex]}
                            onComplete={() => setGrammarClozeIndex((i) => (i + 1) % (filteredGrammarCloze || grammarClozePassages).length)}
                            onBack={() => setView('grammar-cloze-setup')}
                            economy={economy}
                        />
                    )}

                    {view === 'comprehension' && (
                        <ComprehensionView
                            key={comprehensionIndex}
                            passage={(filteredComprehension || comprehensionPassages)[comprehensionIndex]}
                            onComplete={() => setComprehensionIndex((i) => (i + 1) % (filteredComprehension || comprehensionPassages).length)}
                            onBack={() => setView('comprehension-setup')}
                            economy={economy}
                        />
                    )}

                    {view === 'listening' && (
                        <ListeningView
                            key={listeningIndex}
                            passage={(filteredListening || listeningPassages)[listeningIndex]}
                            onComplete={() => setListeningIndex((i) => (i + 1) % (filteredListening || listeningPassages).length)}
                            onBack={() => setView('listening-setup')}
                            economy={economy}
                        />
                    )}

                    {view === 'synthesis' && (
                        <SynthesisView
                            questions={filteredSynthesis || synthesisQuestions}
                            currentIndex={synthesisIndex}
                            onComplete={(nextIndex) => {
                                if (nextIndex === -1) {
                                    setView('synthesis-setup');
                                } else {
                                    setSynthesisIndex(nextIndex);
                                }
                            }}
                            onBack={() => setView('synthesis-setup')}
                            economy={economy}
                            spacedRep={engine?.spacedRep}
                        />
                    )}

                    {view === 'spelling' && (
                        <SpellingView
                            words={spellingWords}
                            spellingProgress={spellingProgress}
                            onBack={() => setView('learn')}
                            economy={economy}
                        />
                    )}

                    {view === 'flashcards' && (
                        <FlashcardView
                            words={engine?.spacedRep?.getDueWords?.() || []}
                            onComplete={() => setView('practice')}
                            onBack={() => setView('practice')}
                            economy={economy}
                            engine={engine}
                        />
                    )}

                    {/* Progress & Persistence */}
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
                </Suspense>
            </div>

            <NavBar currentView={view} onViewChange={navigate} />
        </div>
    );
}
