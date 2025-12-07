import { useState, useRef, useEffect } from 'react';
import { colors, borderRadius, shadows } from '../../styles/designTokens';

/**
 * BottomSheet - Draggable bottom sheet component for mobile layouts
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Content to display in the sheet
 * @param {string[]} props.snapPoints - Array of snap point percentages (e.g., ['30%', '50%', '90%'])
 * @param {string} props.initialSnap - Initial snap point (default: first snap point)
 * @param {number} props.minHeight - Minimum height in px when collapsed
 * @param {Function} props.onSnapChange - Callback when snap point changes
 */
export default function BottomSheet({
    children,
    snapPoints = ['30%', '50%', '90%'],
    initialSnap = snapPoints[0],
    minHeight = 100,
    onSnapChange
}) {
    const [currentSnap, setCurrentSnap] = useState(initialSnap);
    const [isDragging, setIsDragging] = useState(false);
    const [startY, setStartY] = useState(0);
    const [currentY, setCurrentY] = useState(0);
    const sheetRef = useRef(null);

    // Convert percentage snap points to pixel values
    const getSnapPixels = () => {
        const viewportHeight = window.innerHeight;
        return snapPoints.map(snap => {
            const percent = parseInt(snap);
            return viewportHeight * (percent / 100);
        });
    };

    // Find nearest snap point
    const findNearestSnap = (dragDistance) => {
        const viewportHeight = window.innerHeight;
        const currentHeight = parseInt(currentSnap) * viewportHeight / 100;
        const targetHeight = currentHeight - dragDistance;

        const snapPixels = getSnapPixels();
        let nearest = snapPoints[0];
        let minDiff = Infinity;

        snapPixels.forEach((snapPixel, idx) => {
            const diff = Math.abs(snapPixel - targetHeight);
            if (diff < minDiff) {
                minDiff = diff;
                nearest = snapPoints[idx];
            }
        });

        return nearest;
    };

    // Touch event handlers
    const handleTouchStart = (e) => {
        setIsDragging(true);
        setStartY(e.touches[0].clientY);
        setCurrentY(e.touches[0].clientY);
    };

    const handleTouchMove = (e) => {
        if (!isDragging) return;
        setCurrentY(e.touches[0].clientY);
    };

    const handleTouchEnd = () => {
        if (!isDragging) return;

        const dragDistance = startY - currentY;
        const newSnap = findNearestSnap(dragDistance);

        setCurrentSnap(newSnap);
        setIsDragging(false);

        if (onSnapChange) {
            onSnapChange(newSnap);
        }
    };

    // Mouse event handlers for desktop testing
    const handleMouseDown = (e) => {
        setIsDragging(true);
        setStartY(e.clientY);
        setCurrentY(e.clientY);
    };

    const handleMouseMove = (e) => {
        if (!isDragging) return;
        setCurrentY(e.clientY);
    };

    const handleMouseUp = () => {
        if (!isDragging) return;

        const dragDistance = startY - currentY;
        const newSnap = findNearestSnap(dragDistance);

        setCurrentSnap(newSnap);
        setIsDragging(false);

        if (onSnapChange) {
            onSnapChange(newSnap);
        }
    };

    useEffect(() => {
        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);

            return () => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
            };
        }
    }, [isDragging]);

    // Calculate dynamic height during drag
    const getHeight = () => {
        if (isDragging) {
            const viewportHeight = window.innerHeight;
            const currentHeight = parseInt(currentSnap) * viewportHeight / 100;
            const dragDelta = startY - currentY;
            const dynamicHeight = Math.max(minHeight, Math.min(viewportHeight * 0.95, currentHeight + dragDelta));
            return dynamicHeight;
        }
        return currentSnap;
    };

    return (
        <div
            ref={sheetRef}
            style={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                height: getHeight(),
                background: colors.white,
                borderTopLeftRadius: borderRadius.xxl,
                borderTopRightRadius: borderRadius.xxl,
                boxShadow: shadows.xl,
                transition: isDragging ? 'none' : 'height 0.3s cubic-bezier(0.32, 0.72, 0, 1)',
                zIndex: 50,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden'
            }}
        >
            {/* Drag Handle */}
            <div
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onMouseDown={handleMouseDown}
                style={{
                    padding: '12px',
                    cursor: 'grab',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    flexShrink: 0,
                    touchAction: 'none'
                }}
            >
                <div style={{
                    width: '40px',
                    height: '4px',
                    borderRadius: '2px',
                    background: colors.border,
                    opacity: 0.5
                }} />
            </div>

            {/* Content */}
            <div style={{
                flex: 1,
                overflow: 'auto',
                padding: '0 20px 20px',
                WebkitOverflowScrolling: 'touch'
            }}>
                {children}
            </div>
        </div>
    );
}
