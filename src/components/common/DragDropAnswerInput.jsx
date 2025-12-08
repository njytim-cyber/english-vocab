import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { colors, borderRadius, shadows, spacing } from '../../styles/designTokens';

/**
 * DragDropAnswerInput - Drag-and-drop word bank for sentence construction
 * Users select words from a shuffled bank and drag them into sentence slots
 */
export default function DragDropAnswerInput({ answerParts, onChange, disabled }) {
    // Extract all words from the answer (blank parts only)
    const allWords = answerParts
        .filter(part => part.type === 'blank')
        .flatMap(part => part.expected.split(' '))
        .filter(word => word.trim().length > 0);

    // Shuffle words for word bank
    const [wordBank] = useState(() => shuffleArray([...allWords]));

    // Track which words are placed in which slots
    const [placedWords, setPlacedWords] = useState(
        Array(answerParts.filter(p => p.type === 'blank').length).fill([])
    );

    const [draggedWord, setDraggedWord] = useState(null);
    const [draggedFrom, setDraggedFrom] = useState(null); // { type: 'bank' | 'slot', index: number }
    const [selectedSlot, setSelectedSlot] = useState(0); // Currently selected slot for click-to-add

    // Update parent component whenever placement changes
    useEffect(() => {
        const answer = answerParts.map((part, idx) => {
            if (part.type === 'locked') {
                return part.text;
            } else {
                const blankIndex = answerParts.slice(0, idx).filter(p => p.type === 'blank').length;
                return placedWords[blankIndex]?.join(' ') || '';
            }
        }).join('');

        onChange(answer);
    }, [placedWords, answerParts, onChange]);

    const handleDragStart = (word, source) => {
        setDraggedWord(word);
        setDraggedFrom(source);
    };

    const handleDragEnd = () => {
        setDraggedWord(null);
        setDraggedFrom(null);
    };

    const handleDrop = (targetSlotIndex) => {
        if (!draggedWord || disabled) return;

        const newPlacedWords = [...placedWords];

        // Remove word from source
        if (draggedFrom.type === 'slot') {
            const sourceSlot = newPlacedWords[draggedFrom.index];
            newPlacedWords[draggedFrom.index] = sourceSlot.filter((_, i) => i !== draggedFrom.wordIndex);
        }

        // Add word to target slot
        newPlacedWords[targetSlotIndex] = [...newPlacedWords[targetSlotIndex], draggedWord];

        setPlacedWords(newPlacedWords);
        handleDragEnd();
    };

    const removeWord = (slotIndex, wordIndex) => {
        const newPlacedWords = [...placedWords];
        newPlacedWords[slotIndex] = newPlacedWords[slotIndex].filter((_, i) => i !== wordIndex);
        setPlacedWords(newPlacedWords);
    };

    // Click to add word from bank to selected (or first) slot
    const addWordToSlot = (word) => {
        if (disabled) return;

        const targetSlot = selectedSlot;
        const newPlacedWords = [...placedWords];
        newPlacedWords[targetSlot] = [...newPlacedWords[targetSlot], word];
        setPlacedWords(newPlacedWords);
    };

    const usedWords = placedWords.flat();
    const availableWords = wordBank.filter(word => !usedWords.includes(word));

    return (
        <div style={{ width: '100%' }}>
            {/* Word Bank */}
            <div style={{
                marginBottom: spacing.lg,
                padding: spacing.md,
                background: colors.light,
                borderRadius: borderRadius.lg,
                border: `2px dashed ${colors.border}`
            }}>
                <div style={{
                    fontSize: '0.85rem',
                    fontWeight: '600',
                    marginBottom: spacing.sm,
                    color: colors.textMuted
                }}>Word Bank (drag words below):</div>
                <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: spacing.sm,
                    minHeight: '40px'
                }}>
                    {availableWords.map((word, idx) => (
                        <div
                            key={`bank-${word}-${idx}`}
                            draggable={!disabled}
                            onDragStart={() => handleDragStart(word, { type: 'bank', index: idx })}
                            onDragEnd={handleDragEnd}
                            onClick={() => addWordToSlot(word)}
                            style={{
                                padding: `${spacing.xs} ${spacing.sm}`,
                                background: colors.white,
                                border: `1px solid ${colors.border}`,
                                borderRadius: borderRadius.sm,
                                cursor: disabled ? 'not-allowed' : 'pointer',
                                fontSize: '0.95rem',
                                boxShadow: shadows.sm,
                                userSelect: 'none',
                                transition: 'all 0.15s',
                                ':hover': { transform: 'scale(1.05)' }
                            }}
                            onMouseEnter={(e) => !disabled && (e.currentTarget.style.transform = 'scale(1.05)')}
                            onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                        >
                            {word}
                        </div>
                    ))}
                </div>
            </div>

            {/* Sentence Construction Area */}
            <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                gap: spacing.xs,
                padding: spacing.md,
                background: colors.white,
                borderRadius: borderRadius.lg,
                border: `2px solid ${colors.border}`,
                minHeight: '80px',
                fontSize: '1.05rem'
            }}>
                {answerParts.map((part, idx) => {
                    if (part.type === 'locked') {
                        return (
                            <span
                                key={idx}
                                style={{
                                    background: colors.light,
                                    padding: '4px 8px',
                                    borderRadius: borderRadius.sm,
                                    color: colors.textMuted,
                                    fontWeight: '500',
                                    userSelect: 'none'
                                }}
                            >
                                {part.text}
                            </span>
                        );
                    } else {
                        const blankIndex = answerParts.slice(0, idx).filter(p => p.type === 'blank').length;
                        const wordsInSlot = placedWords[blankIndex] || [];
                        const isSelected = selectedSlot === blankIndex;

                        return (
                            <div
                                key={idx}
                                onClick={() => setSelectedSlot(blankIndex)}
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={() => handleDrop(blankIndex)}
                                style={{
                                    minWidth: '150px',
                                    minHeight: '36px',
                                    padding: spacing.xs,
                                    border: isSelected
                                        ? `3px solid ${colors.primary}`
                                        : `2px dashed ${colors.border}`,
                                    borderRadius: borderRadius.sm,
                                    background: wordsInSlot.length > 0 ? `${colors.primary}08` : 'transparent',
                                    display: 'flex',
                                    flexWrap: 'wrap',
                                    gap: spacing.xs,
                                    alignItems: 'center',
                                    cursor: 'pointer',
                                    transition: 'all 0.15s',
                                    boxShadow: isSelected ? shadows.sm : 'none'
                                }}
                            >
                                {wordsInSlot.length === 0 && (
                                    <span style={{ color: colors.textMuted, fontSize: '0.85rem' }}>
                                        Drop words here
                                    </span>
                                )}
                                {wordsInSlot.map((word, wordIdx) => (
                                    <div
                                        key={`slot-${blankIndex}-${wordIdx}`}
                                        draggable={!disabled}
                                        onDragStart={() => handleDragStart(word, { type: 'slot', index: blankIndex, wordIndex: wordIdx })}
                                        onDragEnd={handleDragEnd}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (!disabled) removeWord(blankIndex, wordIdx);
                                        }}
                                        style={{
                                            padding: `${spacing.xs} ${spacing.sm}`,
                                            background: colors.primary,
                                            color: 'white',
                                            borderRadius: borderRadius.sm,
                                            cursor: disabled ? 'not-allowed' : 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: spacing.xs,
                                            fontSize: '0.95rem',
                                            userSelect: 'none',
                                            transition: 'all 0.15s'
                                        }}
                                        onMouseEnter={(e) => !disabled && (e.currentTarget.style.opacity = '0.8')}
                                        onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
                                    >
                                        {word}
                                    </div>
                                ))}
                            </div>
                        );
                    }
                })}
            </div>
        </div>
    );
}

function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

DragDropAnswerInput.propTypes = {
    answerParts: PropTypes.arrayOf(PropTypes.shape({
        type: PropTypes.oneOf(['locked', 'blank']).isRequired,
        text: PropTypes.string,
        expected: PropTypes.string
    })).isRequired,
    onChange: PropTypes.func.isRequired,
    disabled: PropTypes.bool
};
