import React, { useState } from 'react';
import { SHOP_ITEMS } from '../engine/Economy';
import { speak } from '../utils/audio';

export default function ShopView({ economy, onBack }) {
    const [coins, setCoins] = useState(economy.getCoins());
    const [inventory, setInventory] = useState(economy.state.inventory);
    const [message, setMessage] = useState(null);
    const [activeCategory, setActiveCategory] = useState('all');

    const handleBuy = (item) => {
        const result = economy.buyItem(item.id);
        if (result.success) {
            setCoins(economy.getCoins());
            setInventory([...economy.state.inventory]);
            speak("Purchased!");
            setMessage(`Bought ${item.name}!`);
        } else {
            speak(result.message);
            setMessage(result.message);
        }
        setTimeout(() => setMessage(null), 2000);
    };

    const categories = [
        { id: 'all', label: 'All' },
        { id: 'accessory', label: 'Accessories' },
        { id: 'avatar', label: 'Avatars' },
        { id: 'theme', label: 'Themes' }
    ];

    const filteredItems = SHOP_ITEMS.filter(item =>
        activeCategory === 'all' || item.type === activeCategory
    );

    return (
        <div style={{
            minHeight: '100vh',
            padding: '2rem',
            background: 'var(--light)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
        }}>
            <div style={{ width: '100%', maxWidth: '600px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <button onClick={onBack} style={{ fontSize: '1.5rem', background: 'none', border: 'none', cursor: 'pointer' }}>⬅️ Back</button>
                <div className="card" style={{ padding: '0.5rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span>💰</span> <strong>{coins}</strong>
                </div>
            </div>

            <h1 style={{ fontFamily: 'var(--font-fun)', color: 'var(--primary)', marginBottom: '1rem' }}>Item Shop</h1>

            {/* Category Tabs */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                {categories.map(cat => (
                    <button
                        key={cat.id}
                        onClick={() => setActiveCategory(cat.id)}
                        style={{
                            padding: '0.5rem 1rem',
                            borderRadius: '20px',
                            border: 'none',
                            background: activeCategory === cat.id ? 'var(--primary)' : 'white',
                            color: activeCategory === cat.id ? 'white' : 'var(--dark)',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
                        }}
                    >
                        {cat.label}
                    </button>
                ))}
            </div>

            {message && (
                <div className="animate-pop" style={{
                    position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)',
                    background: 'var(--dark)', color: 'white', padding: '1rem 2rem', borderRadius: '50px', zIndex: 100
                }}>
                    {message}
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', width: '100%', maxWidth: '800px' }}>
                {filteredItems.map(item => {
                    const isOwned = inventory.includes(item.id);
                    const canAfford = coins >= item.cost;

                    return (
                        <div key={item.id} className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '1.5rem', opacity: isOwned ? 0.7 : 1 }}>
                            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{item.icon}</div>
                            <h3 style={{ margin: '0 0 0.5rem 0' }}>{item.name}</h3>
                            <p style={{ color: '#666', marginBottom: '1rem' }}>💰 {item.cost}</p>

                            {isOwned ? (
                                <button disabled style={{ background: '#ccc', color: 'white', padding: '0.5rem 1rem', borderRadius: '20px', cursor: 'default', border: 'none' }}>
                                    Owned
                                </button>
                            ) : (
                                <button
                                    onClick={() => handleBuy(item)}
                                    disabled={!canAfford}
                                    style={{
                                        background: canAfford ? 'var(--secondary)' : '#ccc',
                                        color: 'white',
                                        padding: '0.5rem 1rem',
                                        borderRadius: '20px',
                                        cursor: canAfford ? 'pointer' : 'not-allowed',
                                        border: 'none'
                                    }}
                                >
                                    Buy
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
