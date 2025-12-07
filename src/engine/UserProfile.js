import { DEFAULT_AVATAR, migrateEmojiToAvatarData } from '../data/avatarTypes';

const STORAGE_KEY = 'vocab_user_profile';

/**
 * UserProfile - Manages user identity and preferences
 * Persists to localStorage
 */
export class UserProfile {
    constructor() {
        this.state = this.load();
    }

    load() {
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            const parsed = data ? JSON.parse(data) : null;

            // If no data, return default
            if (!parsed) {
                return {
                    name: '',
                    avatar: '🦊',
                    avatarData: { ...DEFAULT_AVATAR },
                    createdAt: new Date().toISOString(),
                    totalPlayTime: 0,
                    equippedItems: { hat: null, accessory: null, skin: null }
                };
            }

            // Migration: if avatarData doesn't exist, create from emoji
            if (!parsed.avatarData && parsed.avatar) {
                parsed.avatarData = migrateEmojiToAvatarData(parsed.avatar);
            }

            return parsed;
        } catch (e) {
            return {
                name: '',
                avatar: '🦊',
                avatarData: { ...DEFAULT_AVATAR },
                createdAt: new Date().toISOString(),
                totalPlayTime: 0,
                equippedItems: { hat: null, accessory: null, skin: null }
            };
        }
    }

    save() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
        } catch (e) {
            console.error('Failed to save profile', e);
        }
    }

    getName() {
        return this.state.name;
    }

    setName(name) {
        this.state.name = name.slice(0, 20); // Max 20 chars
        this.save();
    }

    getAvatar() {
        return this.state.avatar;
    }

    setAvatar(avatar) {
        this.state.avatar = avatar;
        this.save();
    }

    getAvatarData() {
        return this.state.avatarData || { ...DEFAULT_AVATAR };
    }

    setAvatarData(avatarData) {
        this.state.avatarData = avatarData;
        // Also update legacy emoji for backwards compatibility
        const baseEmoji = {
            human: '🧑',
            cat: '🐱',
            dog: '🐶',
            bear: '🐻',
            fox: '🦊',
            panda: '🐼'
        }[avatarData.base] || '🦊';
        this.state.avatar = baseEmoji;
        this.save();
    }

    getEquippedItems() {
        return this.state.equippedItems;
    }

    equipItem(itemId, itemType) {
        if (this.state.equippedItems[itemType] !== undefined) {
            this.state.equippedItems[itemType] = itemId;
            this.save();
            return true;
        }
        return false;
    }

    unequipItem(itemType) {
        if (this.state.equippedItems[itemType] !== undefined) {
            this.state.equippedItems[itemType] = null;
            this.save();
            return true;
        }
        return false;
    }

    // Get display name (with fallback)
    getDisplayName() {
        return this.state.name || 'Adventurer';
    }

    // Get avatar with equipped hat overlay
    getAvatarWithItems() {
        const equipped = this.state.equippedItems;
        return {
            base: this.state.avatar,
            hat: equipped.hat,
            accessory: equipped.accessory,
            skin: equipped.skin
        };
    }

    isNewUser() {
        return !this.state.name;
    }

    reset() {
        this.state = {
            name: '',
            avatar: '🦊',
            createdAt: new Date().toISOString(),
            totalPlayTime: 0,
            equippedItems: { hat: null, accessory: null, skin: null }
        };
        this.save();
    }
}
