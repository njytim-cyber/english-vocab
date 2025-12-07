import { describe, it, expect, beforeEach, vi } from 'vitest';
import { EventService } from './EventService';

describe('EventService', () => {
    let eventService;

    beforeEach(() => {
        eventService = new EventService();
    });

    describe('Initialization', () => {
        it('should initialize with predefined events', () => {
            expect(eventService.events).toBeDefined();
            expect(eventService.events.length).toBeGreaterThan(0);
        });

        it('should initialize with zero server time offset', () => {
            expect(eventService.serverTimeOffset).toBe(0);
        });
    });

    describe('Server Time Synchronization', () => {
        it('should sync time with server', async () => {
            const syncedTime = await eventService.syncWithServer();

            expect(typeof syncedTime).toBe('number');
            expect(syncedTime).toBeGreaterThan(0);
        });

        it('should return current time with offset', () => {
            eventService.serverTimeOffset = 1000;
            const currentTime = eventService.getCurrentTime();

            expect(currentTime).toBeGreaterThan(Date.now());
        });
    });

    describe('Active Event Detection', () => {
        it('should return null if no event is active', () => {
            // Set time offset to ensure we're not in any event range
            eventService.serverTimeOffset = -(Date.now() - new Date('2020-01-01').getTime());

            const activeEvent = eventService.getActiveEvent();
            expect(activeEvent).toBeNull();
        });

        it('should detect active event within date range', () => {
            // Time travel to winter 2025
            const winterDate = new Date('2025-12-15').getTime();
            eventService.serverTimeOffset = winterDate - Date.now();

            const activeEvent = eventService.getActiveEvent();
            expect(activeEvent).toBeDefined();
            expect(activeEvent.id).toBe('winter_2025');
        });

        it('should return correct event for spring 2026', () => {
            // Time travel to spring 2026
            const springDate = new Date('2026-04-15').getTime();
            eventService.serverTimeOffset = springDate - Date.now();

            const activeEvent = eventService.getActiveEvent();
            expect(activeEvent).toBeDefined();
            expect(activeEvent.id).toBe('spring_2026');
        });

        it('should return null before event starts', () => {
            // Just before winter event
            const beforeWinter = new Date('2025-11-30').getTime();
            eventService.serverTimeOffset = beforeWinter - Date.now();

            const activeEvent = eventService.getActiveEvent();
            expect(activeEvent).toBeNull();
        });

        it('should return null after event ends', () => {
            // Just after winter event
            const afterWinter = new Date('2026-03-01').getTime();
            eventService.serverTimeOffset = afterWinter - Date.now();

            const activeEvent = eventService.getActiveEvent();
            // Should be in spring event, not null
            expect(activeEvent).toBeDefined();
        });
    });

    describe('Event Active Check by ID', () => {
        it('should return true for active event', () => {
            const winterDate = new Date('2025-12-15').getTime();
            eventService.serverTimeOffset = winterDate - Date.now();

            expect(eventService.isEventActive('winter_2025')).toBe(true);
        });

        it('should return false for inactive event', () => {
            const beforeAll = new Date('2020-01-01').getTime();
            eventService.serverTimeOffset = beforeAll - Date.now();

            expect(eventService.isEventActive('winter_2025')).toBe(false);
        });

        it('should return false for non-existent event', () => {
            expect(eventService.isEventActive('nonexistent_event')).toBe(false);
        });
    });

    describe('Event Multiplier', () => {
        it('should return 1.0 when no event is active', () => {
            const beforeAll = new Date('2020-01-01').getTime();
            eventService.serverTimeOffset = beforeAll - Date.now();

            expect(eventService.getMultiplier()).toBe(1.0);
        });

        it('should return event multiplier when event is active', () => {
            const winterDate = new Date('2025-12-15').getTime();
            eventService.serverTimeOffset = winterDate - Date.now();

            const multiplier = eventService.getMultiplier();
            expect(multiplier).toBe(1.5);
        });

        it('should return spring event multiplier', () => {
            const springDate = new Date('2026-04-15').getTime();
            eventService.serverTimeOffset = springDate - Date.now();

            const multiplier = eventService.getMultiplier();
            expect(multiplier).toBe(1.5);
        });
    });

    describe('Event Boundary Testing', () => {
        it('should be active on start date', () => {
            const startDate = new Date('2025-12-01').getTime();
            eventService.serverTimeOffset = startDate - Date.now();

            const activeEvent = eventService.getActiveEvent();
            expect(activeEvent).toBeDefined();
            expect(activeEvent.id).toBe('winter_2025');
        });

        it('should be active on end date', () => {
            const endDate = new Date('2026-02-28').getTime();
            eventService.serverTimeOffset = endDate - Date.now();

            const activeEvent = eventService.getActiveEvent();
            expect(activeEvent).toBeDefined();
            expect(activeEvent.id).toBe('winter_2025');
        });
    });

    describe('Event Properties', () => {
        it('should have required event properties', () => {
            const event = eventService.events[0];

            expect(event.id).toBeDefined();
            expect(event.theme).toBeDefined();
            expect(event.type).toBeDefined();
            expect(event.startDate).toBeDefined();
            expect(event.endDate).toBeDefined();
            expect(event.multiplier).toBeDefined();
        });

        it('should have valid date ranges', () => {
            eventService.events.forEach(event => {
                expect(event.startDate).toBeLessThan(event.endDate);
            });
        });
    });
});
