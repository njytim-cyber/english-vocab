/**
 * UserProgress - Tracks learning progress and recommends next modules
 */
export default class UserProgress {
    constructor() {
        this.storageKey = 'vocab_user_progress';
        this.state = this.load();
    }

    load() {
        const stored = localStorage.getItem(this.storageKey);
        return stored ? JSON.parse(stored) : {
            lastModule: null,
            moduleProgress: {},  // { 'vocab-mcq': { completed: 50, total: 100 } }
            completedToday: [],
            preferences: { lastTheme: null, lastDifficulty: null }
        };
    }

    save() {
        localStorage.setItem(this.storageKey, JSON.stringify(this.state));
    }

    updateProgress(moduleId, completed, total) {
        this.state.moduleProgress[moduleId] = { completed, total };
        this.state.lastModule = moduleId;
        this.save();
    }

    getProgress(moduleId) {
        return this.state.moduleProgress[moduleId] || { completed: 0, total: 0 };
    }

    getProgressPercent(moduleId) {
        const { completed, total } = this.getProgress(moduleId);
        return total > 0 ? Math.round((completed / total) * 100) : 0;
    }

    markCompletedToday(moduleId) {
        const today = new Date().toDateString();
        if (!this.state.completedToday.includes(today + '_' + moduleId)) {
            this.state.completedToday.push(today + '_' + moduleId);
            this.save();
        }
    }

    getRecommendedModule(modules) {
        // Priority order:
        // 1. Last module in progress (not 100%)
        if (this.state.lastModule) {
            const progress = this.getProgressPercent(this.state.lastModule);
            if (progress > 0 && progress < 100) {
                return this.state.lastModule;
            }
        }

        // 2. Any module with progress
        for (const moduleId in this.state.moduleProgress) {
            const progress = this.getProgressPercent(moduleId);
            if (progress > 0 && progress < 100) {
                return moduleId;
            }
        }

        // 3. First available module
        return modules[0]?.id || null;
    }
}
