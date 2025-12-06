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
        this.state = this.load();
    }

    load() {
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            return data ? JSON.parse(data) : { coins: 0, eventTokens: 0, inventory: [] };
        } catch (e) {
            return { coins: 0, eventTokens: 0, inventory: [] };
        }
    }

    save() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
        } catch (e) {
            console.error('Failed to save economy', e);
        }
    }

    getCoins() {
        return this.state.coins;
    }

    getEventTokens() {
        return this.state.eventTokens || 0;
    }

    addCoins(amount) {
        this.state.coins += amount;
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
        this.state = { coins: 0, eventTokens: 0, inventory: [] };
        this.save();
    }
}
