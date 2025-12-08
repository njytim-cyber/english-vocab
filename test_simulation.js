
// Simulate ProfileModal Logic
const DEFAULT_AVATAR = { base: 'fox', accessories: {} };

function useState(init) {
    if (typeof init === 'function') return init();
    return init;
}

function TestProfileModal(userProfile) {
    console.log('Testing ProfileModal initialization...');
    try {
        const name = useState(() => {
            try {
                return userProfile?.getName() || '';
            } catch (e) {
                console.error('Error getting name:', e.message);
                return '';
            }
        });

        const avatarData = useState(() => {
            try {
                return userProfile?.getAvatarData() || DEFAULT_AVATAR;
            } catch (e) {
                console.error('Error getting avatar data:', e.message);
                return DEFAULT_AVATAR;
            }
        });

        console.log('Success! Name:', name, 'Avatar:', avatarData);
        return true;
    } catch (e) {
        console.error('CRITICAL FAIL:', e);
        return false;
    }
}

// Scenarios
console.log('--- Scenario 1: Undefined ---');
TestProfileModal(undefined);

console.log('--- Scenario 2: Null Methods ---');
TestProfileModal({ getName: null, getAvatarData: null });

console.log('--- Scenario 3: Throwing Methods ---');
TestProfileModal({
    getName: () => { throw new Error('Db fail') },
    getAvatarData: () => { throw new Error('Data corrupt') }
});
