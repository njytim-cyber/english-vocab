const STORAGE_KEY = 'vocab_quest_economy';

export const SHOP_ITEMS = [
    // Accessories - Top layer items
    { id: 'sunglasses', name: 'Cool Shades', cost: 100, icon: '🕶️', type: 'accessory', layer: { zIndex: 3, position: 'center' } },
    { id: 'party_hat', name: 'Party Hat', cost: 150, icon: '🎉', type: 'accessory', layer: { zIndex: 4, position: 'top' } },
    { id: 'top_hat', name: 'Top Hat', cost: 200, icon: '🎩', type: 'accessory', layer: { zIndex: 4, position: 'top' } },
    { id: 'crown', name: 'Royal Crown', cost: 500, icon: '👑', type: 'accessory', layer: { zIndex: 4, position: 'top' } },
    { id: 'wizard_hat', name: 'Wizard Hat', cost: 400, icon: '🧙‍♂️', type: 'accessory', layer: { zIndex: 4, position: 'top' } },
    { id: 'headphones', name: 'Headphones', cost: 250, icon: '🎧', type: 'accessory', layer: { zIndex: 3, position: 'center' } },
    { id: 'halo', name: 'Angel Halo', cost: 600, icon: '😇', type: 'accessory', layer: { zIndex: 5, position: 'top' } },
    { id: 'star_eyes', name: 'Star Eyes', cost: 300, icon: '🤩', type: 'accessory', layer: { zIndex: 3, position: 'center' } },

    // Skins/Effects
    { id: 'gold_skin', name: 'Gold Aura', cost: 1000, icon: '✨', type: 'skin', layer: { zIndex: 0, position: 'center' } },
    { id: 'rainbow_skin', name: 'Rainbow Aura', cost: 1500, icon: '🌈', type: 'skin', layer: { zIndex: 0, position: 'center' } },
    { id: 'fire_aura', name: 'Fire Aura', cost: 800, icon: '🔥', type: 'skin', layer: { zIndex: 0, position: 'center' } },

    // Avatars - Base characters
    { id: 'avatar_default', name: 'Happy Scholar', cost: 0, icon: '😊', type: 'avatar' },
    { id: 'avatar_cool', name: 'Cool Student', cost: 200, icon: '😎', type: 'avatar' },
    { id: 'avatar_robot', name: 'Study Robot', cost: 300, icon: '🤖', type: 'avatar' },
    { id: 'avatar_alien', name: 'Space Learner', cost: 400, icon: '👽', type: 'avatar' },
    { id: 'avatar_ninja', name: 'Word Ninja', cost: 600, icon: '🥷', type: 'avatar' },
    { id: 'avatar_unicorn', name: 'Magic Unicorn', cost: 700, icon: '🦄', type: 'avatar' },
    { id: 'avatar_dragon', name: 'Wisdom Dragon', cost: 900, icon: '🐉', type: 'avatar' },
    { id: 'avatar_wizard', name: 'Grand Wizard', cost: 1200, icon: '🧙', type: 'avatar' },

    // Themes
    { id: 'theme_ocean', name: 'Ocean Breeze', cost: 750, icon: '🌊', type: 'theme' },
    { id: 'theme_forest', name: 'Forest Sanctuary', cost: 750, icon: '🌲', type: 'theme' },
    { id: 'theme_sunset', name: 'Sunset Glow', cost: 850, icon: '🌅', type: 'theme' },
    { id: 'theme_galaxy', name: 'Galaxy Space', cost: 1000, icon: '🌌', type: 'theme' }
];

export class Economy {
    constructor() {
        this.listeners = new Set();
        this.state = this.load();
    }

    subscribe(listener) {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }

    notify() {
        this.listeners.forEach(l => l(this.state));
    }

    load() {
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            const defaultState = {
                coins: 0,
                xp: 0,
                level: 1,
                eventTokens: 0,
                inventory: [],
                arenaWins: 0,
                arenaLosses: 0,
                arenaELO: 1000
            };
            if (!data) return defaultState;

            const parsed = JSON.parse(data);
            const state = { ...defaultState, ...parsed };

            // Validate numbers to recover from NaN corruption
            if (isNaN(state.coins)) state.coins = 0;
            if (isNaN(state.xp)) state.xp = 0;
            if (isNaN(state.level)) state.level = 1;

            return state;
        } catch (e) {
            console.error('Economy load failed:', e);
            return { coins: 0, xp: 0, level: 1, eventTokens: 0, inventory: [], arenaWins: 0, arenaLosses: 0, arenaELO: 1000 };
        }
    }

    save() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
            this.notify();
        } catch (e) {
            console.error('Failed to save economy', e);
        }
    }

    getCoins() {
        return this.state.coins || 0; // Return 0 if undefined/null/NaN
    }

    getXP() {
        return this.state.xp || 0;
    }

    getLevel() {
        return this.state.level || 1;
    }

    getEventTokens() {
        return this.state.eventTokens || 0;
    }

    addCoins(amount) {
        if (!amount || isNaN(amount)) {
            console.warn('Economy: Attempted to add invalid coin amount:', amount);
            return;
        }
        this.state.coins += Math.floor(amount); // Ensure integer
        this.save();
    }

    addXP(amount) {
        if (!amount || isNaN(amount)) return;

        this.state.xp = (this.state.xp || 0) + Math.floor(amount);
        // Simple Level Formula: Level = 1 + floor(sqrt(XP / 100))
        // 100xp = lvl 2, 400xp = lvl 3, 900xp = lvl 4
        const newLevel = 1 + Math.floor(Math.sqrt(this.state.xp / 100));

        if (newLevel > (this.state.level || 1)) {
            this.state.level = newLevel;
            // Bonus coins for leveling up
            this.state.coins += newLevel * 50;
        }

        this.save();
    }

    addEventTokens(amount) {
        this.state.eventTokens = (this.state.eventTokens || 0) + amount;
        this.save();
    }

    hasItem(itemId) {
        return this.state.inventory.includes(itemId);
    }

    buyItem(itemId) {
        const item = SHOP_ITEMS.find(i => i.id === itemId);
        if (!item) return { success: false, message: 'Item not found' };
        if (this.hasItem(itemId)) return { success: false, message: 'Already owned' };
        if (this.state.coins < item.cost) return { success: false, message: 'Not enough coins' };

        this.state.coins -= item.cost;
        this.state.inventory.push(itemId);
        this.save();
        return { success: true, message: 'Purchased!' };
    }

    getArenaStats() {
        return {
            wins: this.state.arenaWins || 0,
            losses: this.state.arenaLosses || 0,
            elo: this.state.arenaELO ?? 1000 // Use nullish coalescing to allow 0
        };
    }

    addArenaWin(eloGain = 25) {
        this.state.arenaWins = (this.state.arenaWins || 0) + 1;
        this.state.arenaELO = (this.state.arenaELO || 1000) + eloGain;
        this.save();
        this.notify();
    }

    addArenaLoss(eloChange = 15) {
        this.state.arenaLosses = (this.state.arenaLosses || 0) + 1;
        this.state.arenaELO = Math.max(0, (this.state.arenaELO || 1000) - eloChange); // Floor at 0
        this.save();
        this.notify();
    }

    reset() {
        this.state = {
            coins: 0,
            xp: 0,
            level: 1,
            eventTokens: 0,
            inventory: [],
            arenaWins: 0,
            arenaLosses: 0,
            arenaELO: 1000
        };
        this.save();
    }
}
