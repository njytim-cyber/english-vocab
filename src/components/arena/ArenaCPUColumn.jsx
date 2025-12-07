
export function ArenaCPUColumn({ engine, state, config, maxQuestions }) {
    const q = engine.getCurrentQuestion();
    const totalQ = engine.questions?.length || maxQuestions;
    const progress = totalQ > 0 ? (state.currentQuestionIndex / totalQ) * 100 : 0;

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
                <span style={{ fontSize: '3rem' }}>{config?.emoji || '🤖'}</span>
                <div style={{ textAlign: 'center' }}>
                    <h2 style={{ margin: 0, color: '#ff6b6b', fontSize: '1.2rem' }}>
                        {config?.name || 'CPU'}
                    </h2>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ff6b6b' }}>
                        {state.score} pts
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
                Question {state.currentQuestionIndex + 1} / {totalQ}
            </div>

            {q && !state.isFinished ? (
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
}
