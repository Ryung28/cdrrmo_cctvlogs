import { useState, useLayoutEffect, RefObject } from 'react';

/**
 * Enterprise Viewport-Aware Positioning Hook
 * Detects collisions with screen edges and applies real-time corrective offsets.
 * 
 * Features:
 * - Gutter Awareness: Maintains a "Safe Zone" buffer from viewport edges.
 * - Resize Resilience: Recalculates positioning on window resize.
 * - Translation Stability: Uses CSS transforms for high-performance GPU-accelerated adjustments.
 */
export function useViewportPosition(ref: RefObject<HTMLElement | null>, isOpen: boolean, gutter = 20) {
    const [correctionStyle, setCorrectionStyle] = useState<React.CSSProperties>({});

    useLayoutEffect(() => {
        if (!isOpen || !ref.current) {
            setCorrectionStyle({});
            return;
        }

        const detectCollision = () => {
            const el = ref.current;
            if (!el) return;

            // Force a layout pass to get accurate dimensions
            const rect = el.getBoundingClientRect();
            const vw = window.innerWidth;
            const vh = window.innerHeight;

            let translateX = 0;
            let translateY = 0;

            // Horizontal Collision Detection (X-Axis)
            if (rect.right > vw - gutter) {
                // If the right edge exceeds the viewport, shift left
                translateX = (vw - gutter) - rect.right;
            } else if (rect.left < gutter) {
                // If the left edge is outside the viewport, shift right
                translateX = gutter - rect.left;
            }

            // Vertical Collision Detection (Y-Axis) - Enterprise "Auto-Flip" logic
            if (rect.bottom > vh - gutter) {
                // If it hits the bottom, we translate upward
                translateY = (vh - gutter) - rect.bottom;
            } else if (rect.top < gutter) {
                translateY = gutter - rect.top;
            }

            setCorrectionStyle({
                transform: `translate(${translateX}px, ${translateY}px)`,
                visibility: 'visible',
                opacity: 1
            });
        };

        // Small delay to ensure the animation/mount state is captured correctly
        const frame = requestAnimationFrame(detectCollision);

        window.addEventListener('resize', detectCollision);
        window.addEventListener('scroll', detectCollision, true);

        return () => {
            cancelAnimationFrame(frame);
            window.removeEventListener('resize', detectCollision);
            window.removeEventListener('scroll', detectCollision, true);
        };
    }, [isOpen, ref, gutter]);

    return correctionStyle;
}
