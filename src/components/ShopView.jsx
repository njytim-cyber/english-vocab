import { useState } from 'react';
import { SHOP_ITEMS } from '../engine/Economy';
import { speak } from '../utils/audio';
import PageLayout from './common/PageLayout';
import StarDisplay, { StarCost } from './common/StarDisplay';
import { colors, borderRadius, shadows } from '../styles/designTokens';

export default function ShopView({ economy, userProfile, onBack }) {
    const [coins, setCoins] = useState(economy.getCoins());
    const [inventory, setInventory] = useState(economy.state.inventory);
    const [message, setMessage] = useState(null);
    const [activeCategory, setActiveCategory] = useState('accessory');
    const [equipped, setEquipped] = useState(userProfile ? userProfile.getEquippedItems() : {});

    const handleEquip = (item) => {
        if (!userProfile) return;

        if (item.type === 'avatar') {
            userProfile.setAvatar(item.icon); // Assuming icon is the emoji char
            setMessage(`Equipped ${item.name}!`);
            speak("Equipped!");
        } else {
            // For accessories/skins
            userProfile.equipItem(item.id, item.type);
            setEquipped({ ...userProfile.getEquippedItems() });
            setMessage(`Equipped ${item.name}!`);
            speak("Equipped!");
        }
    };

    const handleBuy = (item) => {
        const result = economy.buyItem(item.id);
        if (result.success) {
            setCoins(economy.getCoins());
            setInventory([...economy.state.inventory]);
            speak("Purchased!");
            setMessage(`Bought ${item.name}!`);

            // Auto-equip logic if userProfile is available
            if (userProfile) {
                handleEquip(item);
                setMessage(`Bought & Equipped ${item.name}!`);
                speak("Purchased and Equipped!");
            }
        } else {
            speak(result.message);
            setMessage(result.message);
        }
        setTimeout(() => setMessage(null), 3000);
    };

    const isEquipped = (item) => {
        if (!userProfile) return false;
        if (item.type === 'avatar') return userProfile.getAvatar() === item.icon;
        return equipped[item.type] === item.id;
    };

    const categories = [
        { id: 'accessory', label: 'Accessories' },
        { id: 'avatar', label: 'Avatars' },
        { id: 'theme', label: 'Themes' }
    ];

    const filteredItems = SHOP_ITEMS.filter(item => item.type === activeCategory);

    return (
        <PageLayout
            title="Item Shop 🛍️"
            onBack={onBack}
            maxWidth="700px"
        >
            {/* Category Tabs */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                {categories.map(cat => (
                    <button
                        key={cat.id}
                        onClick={() => setActiveCategory(cat.id)}
                        style={{
                            padding: '0.5rem 1rem',
                            borderRadius: borderRadius.pill,
                            border: 'none',
                            background: activeCategory === cat.id
                                ? colors.primaryGradient
                                : colors.white,
                            color: activeCategory === cat.id ? 'white' : colors.dark,
                            cursor: 'pointer',
                            fontWeight: activeCategory === cat.id ? 'bold' : 'normal',
                            boxShadow: shadows.sm,
                            fontSize: '0.9rem'
                        }}
                    >
                        {cat.label}
                    </button>
                ))}
            </div>

            {message && (
                <div className="animate-pop" style={{
                    position: 'fixed',
                    top: '20px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: colors.primaryGradient,
                    color: 'white',
                    padding: '1rem 2rem',
                    borderRadius: borderRadius.pill,
                    zIndex: 100,
                    fontWeight: 'bold',
                    boxShadow: shadows.lg
                }}>
                    {message}
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem' }}>
                {filteredItems.map(item => {
                    const isOwned = inventory.includes(item.id);
                    const canAfford = coins >= item.cost;
                    const currentlyEquipped = isEquipped(item);

                    return (
                        <div key={item.id} style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            padding: '1.5rem',
                            opacity: 1, // Always fully opaque
                            borderRadius: borderRadius.lg,
                            background: colors.white,
                            boxShadow: shadows.sm,
                            border: currentlyEquipped ? `3px solid ${colors.primary}` : 'none'
                        }}>
                            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{item.icon}</div>
                            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem', color: colors.dark, textAlign: 'center' }}>{item.name}</h3>
                            <StarCost cost={item.cost} />

                            {isOwned ? (
                                currentlyEquipped ? (
                                    <button disabled style={{
                                        background: colors.primary,
                                        color: 'white',
                                        padding: '0.4rem 1rem',
                                        borderRadius: borderRadius.pill,
                                        border: 'none',
                                        fontWeight: 'bold',
                                        fontSize: '0.85rem',
                                        marginTop: '0.5rem'
                                    }}>
                                        Equipped
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => handleEquip(item)}
                                        style={{
                                            background: colors.light,
                                            color: colors.dark,
                                            padding: '0.4rem 1rem',
                                            borderRadius: borderRadius.pill,
                                            border: `1px solid ${colors.border}`,
                                            fontWeight: 'bold',
                                            fontSize: '0.85rem',
                                            marginTop: '0.5rem',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Equip
                                    </button>
                                )
                            ) : (
                                <button
                                    onClick={() => handleBuy(item)}
                                    disabled={!canAfford}
                                    style={{
                                        background: canAfford
                                            ? colors.primaryGradient
                                            : colors.border,
                                        color: 'white',
                                        padding: '0.4rem 1rem',
                                        borderRadius: borderRadius.pill,
                                        cursor: canAfford ? 'pointer' : 'not-allowed',
                                        border: 'none',
                                        fontWeight: 'bold',
                                        fontSize: '0.85rem',
                                        boxShadow: canAfford ? shadows.primary : 'none',
                                        marginTop: '0.5rem'
                                    }}
                                >
                                    Buy
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>
        </PageLayout>
    );
}
