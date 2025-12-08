
const DEFAULT_AVATAR = { base: 'fox', face: { eyes: 'default' }, accessories: { hat: null } };

function checkAvatarBuilder(avatarData, ownedItems) {
    console.log('Testing AvatarBuilder...');

    // Logic from AvatarBuilder.jsx
    const safeAvatarData = {
        ...DEFAULT_AVATAR,
        ...(avatarData || {}),
        face: { ...DEFAULT_AVATAR.face, ...(avatarData?.face || {}) },
        accessories: { ...DEFAULT_AVATAR.accessories, ...(avatarData?.accessories || {}) }
    };

    console.log('Safe Data:', JSON.stringify(safeAvatarData));

    // Simulate Tabs
    const bases = [{ id: 'human', name: 'Human' }];

    // Simulate Mapping
    try {
        const rendered = bases.map(item => {
            const isSelected = safeAvatarData.base === item.id;
            return `Item ${item.name}: ${isSelected ? 'Selected' : ''}`;
        });
        console.log('Render Success:', rendered);
    } catch (e) {
        console.error('Render Fail:', e);
    }
}

checkAvatarBuilder(null, []);
checkAvatarBuilder(undefined, []);
checkAvatarBuilder({ base: 'human' }, []);
checkAvatarBuilder({ crazy: 'data' }, []);
