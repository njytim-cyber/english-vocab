import { useMemo } from 'react';

/**
 * AvatarRenderer - Composable avatar system with layer-based rendering
 * 
 * @param {Object} props
 * @param {string} props.baseAvatar - Base avatar emoji/character
 * @param {Object} props.equippedItems - Map of equipped items { hat: 'item_id', accessory: 'item_id' }
 * @param {number} props.size - Size in pixels (default: 80)
 * @param {Object} props.shopItems - Reference to SHOP_ITEMS for layer data
 */
export default function AvatarRenderer({
    baseAvatar = '😀',
    equippedItems = {},
    size = 80,
    shopItems = []
}) {
    const layers = useMemo(() => {
        const result = [
            { type: 'base', content: baseAvatar, zIndex: 1 }
        ];

        // Add accessory layers from equipped items
        Object.entries(equippedItems).forEach(([type, itemId]) => {
            const item = shopItems.find(i => i.id === itemId);
            if (item?.layer) {
                result.push({
                    type,
                    content: item.icon,
                    zIndex: item.layer.zIndex || 2,
                    position: item.layer.position || 'center'
                });
            }
        });

        // Sort by zIndex for proper rendering order
        return result.sort((a, b) => a.zIndex - b.zIndex);
    }, [baseAvatar, equippedItems, shopItems]);

    const getPositionStyle = (position) => {
        const positions = {
            'top': { top: 0, left: '50%', transform: 'translateX(-50%)' },
            'top-right': { top: 0, right: 0 },
            'top-left': { top: 0, left: 0 },
            'center': { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' },
            'bottom': { bottom: 0, left: '50%', transform: 'translateX(-50%)' }
        };
        return positions[position] || positions.center;
    };

    return (
        <div style={{
            position: 'relative',
            width: `${size}px`,
            height: `${size}px`,
            display: 'inline-block'
        }}>
            {layers.map((layer, idx) => (
                <div
                    key={`${layer.type}-${idx}`}
                    style={{
                        position: 'absolute',
                        fontSize: layer.type === 'base' ? `${size}px` : `${size * 0.4}px`,
                        lineHeight: 1,
                        zIndex: layer.zIndex,
                        ...getPositionStyle(layer.position),
                        pointerEvents: 'none',
                        userSelect: 'none'
                    }}
                >
                    {layer.content}
                </div>
            ))}
        </div>
    );
}
