import React from 'react';

export default function DifficultyBadge({ level, showIcon = true, style = {} }) {
    const getColor = (lvl) => {
        if (lvl <= 3) return '#2ecc71'; // Green
        if (lvl <= 7) return '#f1c40f'; // Yellow/Orange
        return '#e74c3c'; // Red
    };

    const color = getColor(level);

    return (
        <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: `${color}20`, // Low opacity background
            color: color,
            border: `1px solid ${color}`,
            borderRadius: '12px',
            padding: '2px 6px',
            fontSize: '0.75em',
            fontWeight: 'bold',
            gap: '4px',
            minWidth: showIcon ? '40px' : '20px',
            ...style
        }}>
            {showIcon && <span role="img" aria-label="difficulty">⚡</span>}
            {level}
        </span>
    );
}
