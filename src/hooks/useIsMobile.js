import { useState, useEffect } from 'react';

/**
 * Custom hook for responsive mobile detection
 * Uses debounced resize listener for performance
 * @param {number} breakpoint - Width threshold for mobile (default: 768px)
 * @returns {boolean} isMobile - True if viewport width <= breakpoint
 */
export function useIsMobile(breakpoint = 768) {
    const [isMobile, setIsMobile] = useState(window.innerWidth <= breakpoint);

    useEffect(() => {
        let timeoutId;

        const handleResize = () => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                setIsMobile(window.innerWidth <= breakpoint);
            }, 150); // Debounce: wait 150ms after last resize event
        };

        window.addEventListener('resize', handleResize);

        return () => {
            clearTimeout(timeoutId);
            window.removeEventListener('resize', handleResize);
        };
    }, [breakpoint]);

    return isMobile;
}
