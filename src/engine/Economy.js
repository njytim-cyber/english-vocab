const STORAGE_KEY = 'vocab_quest_economy';

export const SHOP_ITEMS = [
    { id: 'sunglasses', name: 'Cool Shades', cost: 100, icon: '🕶️', type: 'accessory' },
    { id: 'hat', name: 'Party Hat', cost: 200, icon: '🎩', type: 'accessory' },
    { id: 'crown', name: 'Royal Crown', cost: 500, icon: '👑', type: 'accessory' },
    { id: 'gold_skin', name: 'Gold Skin', cost: 1000, icon: '✨', type: 'skin' },
    // Avatars
    { id: 'avatar_robot', name: 'Robot', cost: 300, icon: '🤖', type: 'avatar' },
    { id: 'avatar_alien', name: 'Alien', cost: 400, icon: '👽', type: 'avatar' },
    { id: 'avatar_ghost', name: 'Ghost', cost: 500, icon: '👻', type: 'avatar' },
    { id: 'avatar_ninja', name: 'Ninja', cost: 600, icon: '🥷', type: 'avatar' },
    // Themes (Dark Mode is free - accessible in settings)
    { id: 'theme_ocean', name: 'Ocean', cost: 750, icon: '🌊', type: 'theme' },
    { id: 'theme_forest', name: 'Forest', cost: 750, icon: '🌲', type: 'theme' }
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
            const defaultState = { coins: 0, xp: 0, level: 1, eventTokens: 0, inventory: [] };
            if (!data) return defaultState;

            const parsed = JSON.parse(data);
            // Merge with default to ensure new fields (xp, level) exist for old users
            return { ...defaultState, ...parsed };
        } catch (e) {
            console.error('Economy load failed:', e);
            return { coins: 0, xp: 0, level: 1, eventTokens: 0, inventory: [] };
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
        return this.state.coins;
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
        this.state.coins += amount;
        this.save();
    }

    addXP(amount) {
        this.state.xp = (this.state.xp || 0) + amount;
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

    reset() {
        this.state = { coins: 0, xp: 0, level: 1, eventTokens: 0, inventory: [] };
        this.save();
    }
}
