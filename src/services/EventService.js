/**
 * Service to manage seasonal events and time synchronization.
 */
export class EventService {
    constructor() {
        this.events = [
            {
                id: 'winter_2025',
                theme: 'Winter Sports',
                type: 'Quarterly',
                startDate: new Date('2025-12-01').getTime(),
                endDate: new Date('2026-02-28').getTime(),
                multiplier: 1.5
            },
            {
                id: 'spring_2026',
                theme: 'Spring Botany',
                type: 'Quarterly',
                startDate: new Date('2026-03-01').getTime(),
                endDate: new Date('2026-05-31').getTime(),
                multiplier: 1.5
            }
        ];

        // Mock server time offset (0 for now)
        this.serverTimeOffset = 0;
    }

    /**
     * Simulate fetching time from server.
     * In a real app, this would hit an API endpoint.
     */
    async syncWithServer() {
        // Mock network delay
        await new Promise(resolve => setTimeout(resolve, 100));
        // Assume client time is close enough for this mock, 
        // or set a fixed offset if we want to test time travel.
        this.serverTimeOffset = 0;
        return Date.now() + this.serverTimeOffset;
    }

    /**
     * Get the current server time.
     * @returns {number} timestamp
     */
    getCurrentTime() {
        return Date.now() + this.serverTimeOffset;
    }

    /**
     * Get the currently active event, if any.
     * @returns {Object|null} Event object or null
     */
    getActiveEvent() {
        const now = this.getCurrentTime();
        return this.events.find(e => now >= e.startDate && now <= e.endDate) || null;
    }

    /**
     * Check if a specific event is active.
     * @param {string} eventId 
     * @returns {boolean}
     */
    isEventActive(eventId) {
        const event = this.events.find(e => e.id === eventId);
        if (!event) return false;
        const now = this.getCurrentTime();
        return now >= event.startDate && now <= event.endDate;
    }

    /**
     * Get the token multiplier for the current active event.
     * @returns {number} 1.0 or event multiplier
     */
    getMultiplier() {
        const active = this.getActiveEvent();
        return active ? active.multiplier : 1.0;
    }
}
