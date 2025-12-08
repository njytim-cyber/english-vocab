import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { colors, borderRadius, spacing } from '../../styles/designTokens';

/**
 * StructuredAnswerInput - Multi-part input with locked sections and fillable blanks
 * Used for synthesis questions where trigger words must appear at specific positions
 */
export default function StructuredAnswerInput({ answerParts, onChange, disabled }) {
    const [blankValues, setBlankValues] = useState(() => {
        // Initialize blank values
        return answerParts
            .map((part, idx) => part.type === 'blank' ? { idx, value: '' } : null)
            .filter(Boolean);
    });

    const inputRefs = useRef([]);

    // Assemble full answer whenever blank values change
    useEffect(() => {
        const fullAnswer = answerParts.map((part, idx) => {
            if (part.type === 'locked') {
                return part.text;
            } else {
                const blank = blankValues.find(b => b.idx === idx);
                return blank?.value || '';
            }
        }).join('');

        onChange(fullAnswer);
    }, [blankValues, answerParts, onChange]);

    const handleBlankChange = (partIdx, value) => {
        setBlankValues(prev => {
            const updated = [...prev];
            const blankIdx = updated.findIndex(b => b.idx === partIdx);
            if (blankIdx >= 0) {
                updated[blankIdx] = { idx: partIdx, value };
            }
            return updated;
        });
    };

    const handleKeyDown = (currentBlankIdx, e) => {
        // Move to next input on Tab or Enter
        if (e.key === 'Tab' || e.key === 'Enter') {
            e.preventDefault();
            const nextInput = inputRefs.current[currentBlankIdx + 1];
            if (nextInput) {
                nextInput.focus();
            }
        }
    };

    let blankCounter = 0;

    return (
        <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: spacing.xs,
            padding: spacing.md,
            background: colors.white,
            borderRadius: borderRadius.lg,
            border: `2px solid ${colors.border}`,
            minHeight: '60px',
            fontSize: '1.05rem',
            lineHeight: '1.6'
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
                                userSelect: 'none',
                                whiteSpace: 'pre'
                            }}
                        >
                            {part.text}
                        </span>
                    );
                } else {
                    const currentBlankIdx = blankCounter++;
                    const blank = blankValues.find(b => b.idx === idx);
                    const expectedLength = Math.max(part.expected?.length || 20, 20);

                    return (
                        <input
                            key={idx}
                            ref={el => inputRefs.current[currentBlankIdx] = el}
                            type="text"
                            value={blank?.value || ''}
                            onChange={(e) => handleBlankChange(idx, e.target.value)}
                            onKeyDown={(e) => handleKeyDown(currentBlankIdx, e)}
                            disabled={disabled}
                            placeholder="___"
                            style={{
                                border: 'none',
                                borderBottom: `2px solid ${colors.primary}`,
                                background: 'transparent',
                                outline: 'none',
                                fontSize: '1.05rem',
                                padding: '4px 8px',
                                width: `${Math.min(expectedLength * 10, 300)}px`,
                                color: colors.dark,
                                fontFamily: 'inherit'
                            }}
                        />
                    );
                }
            })}
        </div>
    );
}

StructuredAnswerInput.propTypes = {
    answerParts: PropTypes.arrayOf(PropTypes.shape({
        type: PropTypes.oneOf(['locked', 'blank']).isRequired,
        text: PropTypes.string,
        expected: PropTypes.string
    })).isRequired,
    onChange: PropTypes.func.isRequired,
    disabled: PropTypes.bool
};
