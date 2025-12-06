import { describe, it, expect, beforeEach, vi } from 'vitest';
import { EventService } from './EventService';

describe('EventService', () => {
    let service;

    beforeEach(() => {
        service = new EventService();
    });

    it('returns active event based on date', () => {
        // Mock Date.now to be within Winter 2025 (Dec 2025)
        const winterDate = new Date('2025-12-15').getTime();
        vi.setSystemTime(winterDate);

        const event = service.getActiveEvent();
        expect(event).not.toBeNull();
        expect(event.id).toBe('winter_2025');
        expect(event.theme).toBe('Winter Sports');
    });

    it('returns null if no event is active', () => {
        // Mock Date.now to be in a gap (e.g. Nov 2025)
        const gapDate = new Date('2025-11-15').getTime();
        vi.setSystemTime(gapDate);

        const event = service.getActiveEvent();
        expect(event).toBeNull();
    });

    it('returns correct multiplier', () => {
        // Active
        vi.setSystemTime(new Date('2025-12-15').getTime());
        expect(service.getMultiplier()).toBe(1.5);

        // Inactive
        vi.setSystemTime(new Date('2025-11-15').getTime());
        expect(service.getMultiplier()).toBe(1.0);
    });
});
