
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, vi } from 'vitest';

// Mock dependencies aggressively
vi.mock('../../styles/designTokens', () => ({
    colors: { white: '#fff', dark: '#000', textMuted: '#999', border: '#ccc', primary: 'blue' },
    borderRadius: { xl: '20px', md: '12px' },
    shadows: { lg: '0 0 10px black' },
    spacing: { xl: '20px', md: '16px', lg: '24px', sm: '8px', xs: '4px' }
}));

vi.mock('../../utils/soundEffects', () => ({
    sfx: { playClick: vi.fn(), playPop: vi.fn() }
}));

vi.mock('./AvatarBuilder', () => ({
    default: () => <div data-testid="avatar-builder">Avatar Builder</div>
}));

// Import component under test
import ProfileModal from './ProfileModal';

describe('ProfileModal Simplified', () => {
    it('renders with mocked dependencies', () => {
        render(<ProfileModal onClose={() => { }} />);
        screen.getByText('Done');
        screen.getByTestId('avatar-builder');
    });
});
