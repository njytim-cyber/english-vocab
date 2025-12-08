import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import SynthesisView from './SynthesisView';

describe('SynthesisView UX', () => {
    const mockQuestion = {
        id: 1,
        question: "The library was crowded. She managed to find a quiet spot.",
        answer: "Although the library was crowded, she managed to find a quiet spot.",
        trigger_used: "Although",
        logic: "Direct combining using connectors that take a Subject + Verb.",
        category: "Logical Connectors",
        subcategory: "Contrast",
        difficulty: 2
    };

    it('displays the helping word as a visible constraint', () => {
        render(
            <SynthesisView
                questions={[mockQuestion]}
                onComplete={vi.fn()}
                onBack={vi.fn()}
            />
        );

        // Check for Constraint header
        expect(screen.getByText(/Constraint:/i)).toBeInTheDocument();

        // Check that the trigger word is displayed
        expect(screen.getByText('Although')).toBeInTheDocument();

        // Check for "Use the word" text (loose match)
        expect(screen.getByText(/Use the word/i)).toBeInTheDocument();
    });

    it('shows logic in hint but NOT the helping word (redundant)', () => {
        render(
            <SynthesisView
                questions={[mockQuestion]}
                onComplete={vi.fn()}
                onBack={vi.fn()}
            />
        );

        // Logic should be hidden initially
        expect(screen.queryByText(/Direct combining/i)).not.toBeInTheDocument();

        // Click Hint
        const hintBtn = screen.getByText(/Show Hint/i);
        fireEvent.click(hintBtn);

        // Logic should be visible
        expect(screen.getByText(/Direct combining/i)).toBeInTheDocument();

        // "Try using:" should NOT be in the hint box anymore
        expect(screen.queryByText(/Try using:/i)).not.toBeInTheDocument();
    });
});
