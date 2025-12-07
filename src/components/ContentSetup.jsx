
import { useState, useMemo } from 'react';
import PageLayout from './common/PageLayout';
import DualRangeSlider from './common/DualRangeSlider';
import { colors, borderRadius, shadows, spacing } from '../styles/designTokens';

/**
 * ContentSetup - Generic setup screen for filtering content
 * 
 * Props:
 * - title: String (e.g. "Vocab Cloze Setup")
 * - data: Array (The list of items to filter)
 * - onStart: Function(filteredItems) -> void
 * - onBack: Function
 * - themeKey: String (The property to group by, default 'theme', e.g. 'category')
 */
export default function ContentSetup({
    title,
    data = [],
    onStart,
    onBack,
    themeKey = 'theme'
}) {
    const [selectedThemes, setSelectedThemes] = useState(['All']);
    const [minDifficulty, setMinDifficulty] = useState(1);
    const [maxDifficulty, setMaxDifficulty] = useState(10); // Default to max range

    // Extract unique themes/categories
    const availableThemes = useMemo(() => {
        const themes = new Set(data.map(item => item[themeKey]).filter(Boolean));
        return ['All', ...Array.from(themes).sort()];
    }, [data, themeKey]);

    const handleThemeToggle = (t) => {
        setSelectedThemes(prev => {
            if (t === 'All') return ['All'];
            const newSelection = prev.includes('All') ? [] : [...prev];

            if (newSelection.includes(t)) {
                return newSelection.filter(item => item !== t).length ? newSelection.filter(item => item !== t) : ['All'];
            } else {
                return [...newSelection, t];
            }
        });
    };

    const handleStart = () => {
        const filtered = data.filter(item => {
            const matchesTheme = selectedThemes.includes('All') || selectedThemes.includes(item[themeKey]);
            const matchesDiff = (item.difficulty || 1) >= minDifficulty && (item.difficulty || 1) <= maxDifficulty;
            return matchesTheme && matchesDiff;
        });
        onStart(filtered);
    };

    const getFilteredCount = () => {
        return data.filter(item => {
            const matchesTheme = selectedThemes.includes('All') || selectedThemes.includes(item[themeKey]);
            const matchesDiff = (item.difficulty || 1) >= minDifficulty && (item.difficulty || 1) <= maxDifficulty;
            return matchesTheme && matchesDiff;
        }).length;
    };

    return (
        <PageLayout title={title} onBack={onBack} maxWidth="600px">
            <div style={{ background: colors.white, padding: '1.5rem', borderRadius: borderRadius.lg, boxShadow: shadows.sm }}>

                {/* Theme Selection */}
                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: 'bold', fontSize: '1.1rem', color: colors.dark }}>
                        Select Topics
                    </label>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                        gap: '0.6rem',
                        maxHeight: '40vh',
                        overflowY: 'auto',
                        padding: '0.3rem'
                    }}>
                        {availableThemes.map(t => {
                            const isSelected = selectedThemes.includes(t);
                            return (
                                <button
                                    key={t}
                                    onClick={() => handleThemeToggle(t)}
                                    style={{
                                        padding: '0.8rem',
                                        borderRadius: borderRadius.md,
                                        border: isSelected ? `2px solid ${colors.primary}` : `1px solid ${colors.border}`,
                                        background: isSelected ? `${colors.primary}10` : colors.white,
                                        cursor: 'pointer',
                                        textAlign: 'left',
                                        transition: 'all 0.2s',
                                        position: 'relative',
                                        fontWeight: isSelected ? 'bold' : 'normal',
                                        color: colors.dark
                                    }}
                                >
                                    {t}
                                    {isSelected && <span style={{ position: 'absolute', top: '5px', right: '5px', color: colors.primary, fontSize: '0.8rem' }}>✓</span>}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Difficulty */}
                <div style={{ marginBottom: '2rem' }}>
                    <DualRangeSlider
                        min={1}
                        max={10} // Assumed max difficulty
                        minValue={minDifficulty}
                        maxValue={maxDifficulty}
                        onChange={(min, max) => { setMinDifficulty(min); setMaxDifficulty(max); }}
                        label="Difficulty Range"
                    />
                </div>

                <div style={{ textAlign: 'center', marginBottom: '1rem', color: colors.textMuted }}>
                    {getFilteredCount()} items available
                </div>

                <button
                    onClick={handleStart}
                    disabled={getFilteredCount() === 0}
                    style={{
                        width: '100%',
                        padding: '1rem',
                        fontSize: '1.2rem',
                        background: getFilteredCount() > 0 ? colors.primaryGradient : colors.light,
                        color: getFilteredCount() > 0 ? 'white' : colors.textMuted,
                        borderRadius: borderRadius.lg,
                        border: 'none',
                        cursor: getFilteredCount() > 0 ? 'pointer' : 'not-allowed',
                        boxShadow: getFilteredCount() > 0 ? shadows.primary : 'none',
                        fontWeight: 'bold'
                    }}
                >
                    Start Activity
                </button>
            </div>
        </PageLayout>
    );
}
