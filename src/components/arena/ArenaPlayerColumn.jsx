
import { colors } from '../../styles/designTokens';
import { getQuestionTypeTheme } from '../../utils/arenaQuestionBuilder';

export function ArenaPlayerColumn({ engine, state, avatar, totalQuestions, onAnswer }) {
    const q = engine.getCurrentQuestion();
    const progress = totalQuestions > 0 ? ((state.currentQuestionIndex) / totalQuestions) * 100 : 0;
    const theme = q && q.questionType ? getQuestionTypeTheme(q.questionType) : { primary: '#667eea', background: '#e0e7ff', name: 'Vocab MCQ' };

    return (
        <div style={{
            flex: 1,
            padding: '1rem',
            background: `linear-gradient(180deg, ${theme.background}, #ffffff)`,
            borderRadius: '20px',
            margin: '0.5rem',
            border: `3px solid ${theme.primary}`,
            display: 'flex',
            flexDirection: 'column'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <div style={{ fontSize: '3rem', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}>
                    {avatar}
                </div>
                <div>
                    <div style={{ fontWeight: 'bold', fontSize: '1.2rem', color: colors.dark }}>YOU</div>
                    <div style={{ fontSize: '0.9rem', color: colors.textMuted }}>
                        Streak: {state.streak} 🔥
                    </div>
                </div>
            </div>

            {/* Progress Bar */}
            <div style={{ height: '8px', background: '#eee', borderRadius: '4px', marginBottom: '1rem', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${progress}%`, background: theme.primary, transition: 'width 0.3s' }} />
            </div>

            {q && !state.isFinished ? (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {/* Question Badge */}
                    <div style={{
                        alignSelf: 'center',
                        background: theme.primary,
                        color: 'white',
                        padding: '0.3rem 0.8rem',
                        borderRadius: '12px',
                        fontSize: '0.8rem',
                        fontWeight: 'bold'
                    }}>
                        {theme.name || 'QUESTION'}
                    </div>

                    {/* Question Text */}
                    <div style={{
                        fontSize: q.question.length > 100 ? '1rem' : '1.3rem',
                        fontWeight: '600',
                        textAlign: 'center',
                        color: colors.dark,
                        whiteSpace: 'pre-wrap'
                    }}>
                        {q.question}
                    </div>

                    {/* Options */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: 'auto' }}>
                        {Object.entries(q.options)
                            .sort(() => Math.random() - 0.5) // Shuffle display order
                            .map(([key, opt]) => (
                                <button
                                    key={key}
                                    onClick={() => onAnswer(opt)}
                                    style={{
                                        padding: '1rem',
                                        background: 'white',
                                        border: `2px solid ${theme.primary}40`,
                                        borderRadius: '12px',
                                        cursor: 'pointer',
                                        fontWeight: '600',
                                        color: colors.dark,
                                        transition: 'all 0.2s',
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
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
}
