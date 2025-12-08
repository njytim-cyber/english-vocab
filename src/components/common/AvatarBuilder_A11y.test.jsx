import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import AvatarBuilder from './AvatarBuilder';
import { SHOP_ITEMS } from '../../engine/Economy';

import { vi } from 'vitest';

describe('AvatarBuilder Optimization & A11y', () => {
    const mockOnChange = vi.fn();
    const defaultProps = {
        avatarData: {},
        ownedItems: ['party_hat'], // User owns party hat
        onChange: mockOnChange,
    };

    it('renders filtered lists with correct items', () => {
        render(<AvatarBuilder {...defaultProps} />);

        // Check "Hat" tab - Updated to finding by title/aria-label as text "🎩 Hat" was replaced by just icon
        const hatTab = screen.getByRole('button', { name: 'hat' }); // ID is used as aria-label/title
        fireEvent.click(hatTab);

        // "None" option (always present)
        expect(screen.getByLabelText('Equip None')).toBeInTheDocument();

        // "Party Hat" (from shop, owned)
        // Should have "Equip Party Hat"
        const partyHat = screen.getByLabelText('Equip Party Hat');
        expect(partyHat).toBeInTheDocument();
        expect(partyHat.tagName).toBe('BUTTON');

        // "Royal Crown" (from shop, not owned)
        // Should have "Locked: Royal Crown"
        const crown = screen.getByLabelText('Locked: Royal Crown');
        expect(crown).toBeInTheDocument();
        expect(crown).toBeDisabled();
    });

    it('memoizes filtered lists (functional check)', () => {
        // We can't easily check useMemo directly without profiling, 
        // but we can ensure re-renders don't crash or lose data.
        const { rerender } = render(<AvatarBuilder {...defaultProps} />);

        fireEvent.click(screen.getByRole('button', { name: 'hat' }));
        expect(screen.getByLabelText('Equip Party Hat')).toBeInTheDocument();

        // Rerender with same props
        rerender(<AvatarBuilder {...defaultProps} />);
        expect(screen.getByLabelText('Equip Party Hat')).toBeInTheDocument();
    });
});
