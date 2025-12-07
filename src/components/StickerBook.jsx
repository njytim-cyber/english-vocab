import { useState, useEffect } from 'react';
import { ACHIEVEMENTS } from '../engine/Achievements';
import PageLayout from './common/PageLayout';
import { colors } from '../styles/designTokens';
import { AchievementGrid } from './progress/AchievementGrid';
import { AchievementModal } from './progress/AchievementModal';

export default function StickerBook({ achievements, onBack, onNavigate }) {
    const [unlocked, setUnlocked] = useState(new Set(achievements.getUnlocked()));
    const [selectedSticker, setSelectedSticker] = useState(null);

    useEffect(() => {
        setUnlocked(new Set(achievements.getUnlocked()));
    }, [achievements]);

    // Convert Set to array of unlocked objects for the grid
    const unlockedAchievements = ACHIEVEMENTS.filter(ach => unlocked.has(ach.id));

    return (
        <PageLayout
            title="Progress 🏆"
            onBack={onBack}
        >

            {/* Regular Achievements */}
            <h2 style={{ color: colors.dark, marginBottom: '1rem', fontSize: '1.2rem' }}>
                ⭐ Achievements
            </h2>

            <AchievementGrid
                achievements={ACHIEVEMENTS}
                unlocked={unlockedAchievements}
                onSelect={setSelectedSticker}
            />

            {/* Detail Modal */}
            {selectedSticker && (
                <AchievementModal
                    sticker={selectedSticker}
                    isUnlocked={unlocked.has(selectedSticker.id)}
                    onClose={() => setSelectedSticker(null)}
                />
            )}
        </PageLayout>
    );
}
