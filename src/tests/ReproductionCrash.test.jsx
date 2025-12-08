// eslint-disable-next-line no-unused-vars
import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import GrammarSetup from '../components/GrammarSetup';
import AvatarBuilder from '../components/common/AvatarBuilder';

describe('Crash Reproduction', () => {
    it('renders GrammarSetup without crashing', () => {
        render(<GrammarSetup allQuestions={[]} onStart={() => { }} onBack={() => { }} />);
    });

    it('renders AvatarBuilder without crashing', () => {
        render(<AvatarBuilder avatarData={{}} ownedItems={[]} onChange={() => { }} />);
    });
});
