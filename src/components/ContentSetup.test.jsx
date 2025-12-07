
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ContentSetup from './ContentSetup';

describe('ContentSetup', () => {
    const mockData = [
        { id: 1, theme: 'Science', difficulty: 1 },
        { id: 2, theme: 'Nature', difficulty: 5 },
        { id: 3, theme: 'Science', difficulty: 8 }
    ];

    it('renders themes correctly', () => {
        render(<ContentSetup title="Test Setup" data={mockData} />);
        expect(screen.getByText('Science')).toBeDefined();
        expect(screen.getByText('Nature')).toBeDefined();
        expect(screen.getByText('All')).toBeDefined();
    });

    it('filters data on start', () => {
        const onStart = vi.fn();
        render(<ContentSetup title="Test Setup" data={mockData} onStart={onStart} />);

        // Default is All, Full Range -> Should match all
        const startBtn = screen.getByText('Start Activity');
        fireEvent.click(startBtn);

        expect(onStart).toHaveBeenCalledWith(mockData);
    });

    it('filters data by theme selection', () => {
        const onStart = vi.fn();
        render(<ContentSetup title="Test Setup" data={mockData} onStart={onStart} />);

        // Select 'Science'
        fireEvent.click(screen.getByText('Science'));
        fireEvent.click(screen.getByText('Start Activity'));

        // Should filtered out 'Nature'
        expect(onStart).toHaveBeenCalledWith([
            { id: 1, theme: 'Science', difficulty: 1 },
            { id: 3, theme: 'Science', difficulty: 8 }
        ]);
    });
});
