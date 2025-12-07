/**
 * Avatar Data Types and Defaults
 * Emoji-based layered avatar system
 */

// Avatar data structure
export const AVATAR_STRUCTURE = {
    base: 'human',           // human | cat | dog | bear
    skin: 'yellow',          // yellow | brown | pink | blue
    face: {
        eyes: 'default',     // default | sunglasses | glasses | star_eyes
        mouth: 'smile',      // smile | neutral | laugh | cool
    },
    hair: 'short',           // short | long | curly | bald
    hairColor: 'brown',      // brown | blonde | black | red | blue
    accessories: {
        hat: null,           // null | cap | crown | headphones | graduation
        faceItem: null,      // null | mustache | beard
    },
    background: 'none'       // none | gradient1 | gradient2 | stars
};

// Base characters (body types)
export const BASE_TYPES = {
    human: { emoji: '🧑', name: 'Human' },
    cat: { emoji: '🐱', name: 'Cat' },
    dog: { emoji: '🐶', name: 'Dog' },
    bear: { emoji: '🐻', name: 'Bear' },
    fox: { emoji: '🦊', name: 'Fox' },
    panda: { emoji: '🐼', name: 'Panda' }
};

// Skin tones (for human base)
export const SKIN_TONES = {
    yellow: '💛',
    brown: '🤎',
    pink: '🩷',
    blue: '💙'
};

// Eye styles
export const EYE_STYLES = {
    default: '👀',
    sunglasses: '😎',
    glasses: '🤓',
    star_eyes: '🤩',
    wink: '😉'
};

// Mouth expressions
export const MOUTH_STYLES = {
    smile: '😊',
    neutral: '😐',
    laugh: '😂',
    cool: '😏',
    tongue: '😛'
};

// Hair styles (overlays)
export const HAIR_STYLES = {
    short: null,  // Default, no overlay
    long: '💇',
    curly: '💁',
    bald: '🧑‍🦲'
};

// Hats and headwear
export const HATS = {
    cap: '🧢',
    crown: '👑',
    headphones: '🎧',
    graduation: '🎓',
    tophat: '🎩',
    cowboy: '🤠'
};

// Face accessories
export const FACE_ACCESSORIES = {
    mustache: { emoji: '🥸', name: 'Mustache' },
    beard: { emoji: '🧔', name: 'Beard' }
};

// Backgrounds
export const BACKGROUNDS = {
    none: null,
    gradient1: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    gradient2: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    stars: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
};

// Default avatar (starter)
export const DEFAULT_AVATAR = {
    base: 'human',
    skin: 'yellow',
    face: {
        eyes: 'default',
        mouth: 'smile'
    },
    hair: 'short',
    hairColor: 'brown',
    accessories: {
        hat: null,
        faceItem: null
    },
    background: 'none'
};

// Migration map from old emoji avatars
export const EMOJI_TO_AVATAR_MAP = {
    '🎓': { base: 'human', accessories: { hat: 'graduation' } },
    '🦊': { base: 'fox' },
    '🐱': { base: 'cat' },
    '🐶': { base: 'dog' },
    '🦁': { base: 'bear', hairColor: 'blonde' },
    '🐼': { base: 'panda' },
    '🐨': { base: 'bear' },
    '🐸': { base: 'human', skin: 'green' },
    '🦉': { base: 'bear', accessories: { hat: 'graduation' } },
    '🐙': { base: 'human', skin: 'pink' },
    '🦋': { base: 'human', background: 'stars' },
    '🌟': { base: 'human', background: 'gradient2' }
};

/**
 * Migrate old emoji avatar to new avatar data
 */
export function migrateEmojiToAvatarData(emoji) {
    const mapped = EMOJI_TO_AVATAR_MAP[emoji];
    if (!mapped) return { ...DEFAULT_AVATAR };

    return {
        ...DEFAULT_AVATAR,
        ...mapped
    };
}

/**
 * Render avatar as emoji composition string
 * Combines base + expressions + accessories
 */
export function renderAvatarEmoji(avatarData) {
    const parts = [];

    // Base
    const baseEmoji = BASE_TYPES[avatarData.base]?.emoji || BASE_TYPES.human.emoji;
    parts.push(baseEmoji);

    // Hat (if present)
    if (avatarData.accessories?.hat && HATS[avatarData.accessories.hat]) {
        parts.push(HATS[avatarData.accessories.hat]);
    }

    // For now, return base + hat
    // More complex layering will come in Avatar component
    return parts.join('');
}
