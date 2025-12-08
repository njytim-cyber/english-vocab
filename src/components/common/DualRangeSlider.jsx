/**
 * DualRangeSlider - Single slider with two knobs for min/max selection
 */
import React, { useState, useRef, useEffect } from 'react';
import { colors, borderRadius } from '../../styles/designTokens';

export default function DualRangeSlider({
    min = 1,
    max = 10,
    minValue,
    maxValue,
    onChange,
    label = 'Range'
}) {
    const trackRef = useRef(null);
    const [dragging, setDragging] = useState(null); // 'min' | 'max' | null

    const getPercent = (value) => ((value - min) / (max - min)) * 100;

    const handleMouseDown = (knob) => (e) => {
        e.preventDefault();
        setDragging(knob);
    };

    const handleMouseUp = () => {
        setDragging(null);
    };

    const handleMouseMove = (e) => {
        if (!dragging || !trackRef.current) return;

        const rect = trackRef.current.getBoundingClientRect();
        const percent = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
        const value = Math.round(min + (percent / 100) * (max - min));

        if (dragging === 'min') {
            const newMin = Math.min(value, maxValue - 1);
            onChange(Math.max(min, newMin), maxValue);
        } else {
            const newMax = Math.max(value, minValue + 1);
            onChange(minValue, Math.min(max, newMax));
        }
    };

    useEffect(() => {
        if (dragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
            window.addEventListener('touchmove', handleTouchMove);
            window.addEventListener('touchend', handleMouseUp);
        }
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
            window.removeEventListener('touchmove', handleTouchMove);
            window.removeEventListener('touchend', handleMouseUp);
        };
    }, [dragging, minValue, maxValue]);

    const handleTouchMove = (e) => {
        if (!dragging || !trackRef.current) return;
        const touch = e.touches[0];
        const rect = trackRef.current.getBoundingClientRect();
        const percent = Math.max(0, Math.min(100, ((touch.clientX - rect.left) / rect.width) * 100));
        const value = Math.round(min + (percent / 100) * (max - min));

        if (dragging === 'min') {
            const newMin = Math.min(value, maxValue - 1);
            onChange(Math.max(min, newMin), maxValue);
        } else {
            const newMax = Math.max(value, minValue + 1);
            onChange(minValue, Math.min(max, newMax));
        }
    };

    const minPercent = getPercent(minValue);
    const maxPercent = getPercent(maxValue);

    return (
        <div style={{ width: '100%' }}>
            {/* Label only - no range display */}
            <div style={{ marginBottom: '1rem' }}>
                <span style={{ fontSize: '0.95rem', fontWeight: 'bold', color: colors.dark }}>
                    Difficulty
                </span>
            </div>

            <div
                ref={trackRef}
                style={{
                    position: 'relative',
                    height: '8px',
                    background: colors.border,
                    borderRadius: '4px',
                    cursor: 'pointer',
                    marginLeft: '4px',
                    marginTop: '0.5rem'
                }}
            >
                {/* Active range */}
                <div style={{
                    position: 'absolute',
                    left: `${minPercent}%`,
                    width: `${maxPercent - minPercent}%`,
                    height: '100%',
                    background: colors.primaryGradient,
                    borderRadius: '4px'
                }} />

                {/* Min knob with number inside */}
                <div
                    onMouseDown={handleMouseDown('min')}
                    onTouchStart={handleMouseDown('min')}
                    style={{
                        position: 'absolute',
                        left: `${minPercent}%`,
                        top: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '28px',
                        height: '28px',
                        background: colors.white,
                        border: `3px solid ${colors.primary}`,
                        borderRadius: '50%',
                        cursor: 'grab',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                        zIndex: dragging === 'min' ? 3 : 2,
                        transition: dragging ? 'none' : 'left 0.1s',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.7rem',
                        fontWeight: 'bold',
                        color: colors.primary
                    }}
                >
                    {minValue}
                </div>

                {/* Max knob with number inside */}
                <div
                    onMouseDown={handleMouseDown('max')}
                    onTouchStart={handleMouseDown('max')}
                    style={{
                        position: 'absolute',
                        left: `${maxPercent}%`,
                        top: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '28px',
                        height: '28px',
                        background: colors.white,
                        border: `3px solid ${colors.primaryDark}`,
                        borderRadius: '50%',
                        cursor: 'grab',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                        zIndex: dragging === 'max' ? 3 : 2,
                        transition: dragging ? 'none' : 'left 0.1s',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.7rem',
                        fontWeight: 'bold',
                        color: colors.primaryDark
                    }}
                >
                    {maxValue}
                </div>
            </div>
        </div>
    );
}
