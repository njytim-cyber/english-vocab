import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import SplashScreen from './SplashScreen';

describe('SplashScreen', () => {
    it('renders without crashing when show is true', () => {
        const mockOnClose = vi.fn();
        render(
            <SplashScreen
                version="1.2.0"
                onClose={mockOnClose}
                show={true}
            />
        );

        // Check if the version badge is present
        expect(screen.getByText(/v1.2.0/i)).toBeInTheDocument();
    });

    it('does not render when show is false', () => {
        const mockOnClose = vi.fn();
        const { container } = render(
            <SplashScreen
                version="1.2.0"
                onClose={mockOnClose}
                show={false}
            />
        );

        expect(container.firstChild).toBeNull();
    });

    it('calls onClose when button is clicked', () => {
        const mockOnClose = vi.fn();
        render(
            <SplashScreen
                version="1.2.0"
                onClose={mockOnClose}
                show={true}
            />
        );

        const button = screen.getByRole('button', { name: /let's go/i });
        fireEvent.click(button);

        // onClose should be called after animation delay
        setTimeout(() => {
            expect(mockOnClose).toHaveBeenCalled();
        }, 400);
    });

    it('displays release notes for valid version', () => {
        const mockOnClose = vi.fn();
        render(
            <SplashScreen
                version="1.2.0"
                onClose={mockOnClose}
                show={true}
            />
        );

        expect(screen.getByText(/Welcome to Version 1.2/i)).toBeInTheDocument();
        expect(screen.getByText(/Enhanced Learning Experience/i)).toBeInTheDocument();
    });

    it('renders null for unknown version', () => {
        const mockOnClose = vi.fn();
        const { container } = render(
            <SplashScreen
                version="99.99.99"
                onClose={mockOnClose}
                show={true}
            />
        );

        expect(container.firstChild).toBeNull();
    });
});
