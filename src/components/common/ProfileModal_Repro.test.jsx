
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ProfileModal from './ProfileModal';

// Mock sfx
vi.mock('../../utils/soundEffects', () => ({
    sfx: {
        playClick: vi.fn(),
        playPop: vi.fn()
    }
}));

describe('ProfileModal Crash Reproduction', () => {
    it('renders without crashing with minimal props', () => {
        render(<ProfileModal onClose={() => { }} />);
        expect(screen.getByText('Your Profile')).toBeDefined();
    });

    it('renders without crashing with userProfile prop', () => {
        const mockProfile = {
            getName: () => 'Test User',
            getAvatarData: () => null
        };
        render(<ProfileModal userProfile={mockProfile} onClose={() => { }} />);
        expect(screen.getByDisplayValue('Test User')).toBeDefined();
    });

    it('renders with AvatarBuilder', () => {
        const mockProfile = {
            getName: () => 'Test User',
            getAvatarData: () => ({ base: 'human' })
        };
        render(<ProfileModal userProfile={mockProfile} onClose={() => { }} />);
        expect(screen.getByText('Customize Avatar')).toBeDefined();
    });
});
