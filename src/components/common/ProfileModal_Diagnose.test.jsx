
import { render } from '@testing-library/react';
import { describe, it } from 'vitest';
import ProfileModal from './ProfileModal';
import React from 'react';

// Mock sfx
const mockSfx = {
    playClick: () => { },
    playPop: () => { }
};

describe('Diagnostic', () => {
    it('catches render error', () => {
        try {
            render(<ProfileModal onClose={() => { }} />);
        } catch (e) {
            console.error('RENDER ERROR CAPTURED:', e.message);
            // also dump stack if possible
            console.error(e.stack);
            throw e;
        }
    });
});
