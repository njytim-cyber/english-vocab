import React, { createContext, useContext, useState } from 'react';

const NavigationContext = createContext(null);

export function NavigationProvider({ children }) {
    const [view, setView] = useState('start');

    const navigate = (newView) => {
        console.log('NavigationContext: navigate called with', newView);
        if (newView === 'start') {
            setView('start');
        } else {
            setView(newView);
        }
    };

    const value = {
        view,
        setView,
        navigate
    };

    return (
        <NavigationContext.Provider value={value}>
            {children}
        </NavigationContext.Provider>
    );
}

export function useNavigation() {
    const context = useContext(NavigationContext);
    if (!context) {
        throw new Error('useNavigation must be used within a NavigationProvider');
    }
    return context;
}
