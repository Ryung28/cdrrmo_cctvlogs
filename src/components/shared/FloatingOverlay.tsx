import React, { useState, useMemo } from 'react';
import {
    useFloating,
    autoUpdate,
    offset,
    flip,
    shift,
    useInteractions,
    useRole,
    useDismiss,
    useId,
    FloatingPortal,
    Placement,
} from '@floating-ui/react';

interface FloatingOverlayProps {
    isOpen: boolean;
    onClose: () => void;
    trigger: React.ReactNode;
    children: React.ReactNode;
    placement?: Placement;
    className?: string;
}

/**
 * Enterprise Floating Overlay System
 * Powered by Floating UI for bulletproof collision detection and viewport awareness.
 */
export default function FloatingOverlay({
    isOpen,
    onClose,
    trigger,
    children,
    placement = 'bottom-start',
    className = ""
}: FloatingOverlayProps) {
    const { refs, floatingStyles, context } = useFloating({
        open: isOpen,
        onOpenChange: (open) => {
            if (!open) onClose();
        },
        middleware: [
            offset(10),
            flip({
                fallbackPlacements: ['top-start', 'bottom-end', 'top-end'],
                padding: 10,
            }),
            shift({ padding: 10 }),
        ],
        whileElementsMounted: autoUpdate,
        placement,
    });

    const dismiss = useDismiss(context);
    const role = useRole(context);

    const { getReferenceProps, getFloatingProps } = useInteractions([
        dismiss,
        role,
    ]);

    const headingId = useId();

    return (
        <>
            <div ref={refs.setReference} {...getReferenceProps()} className="w-full">
                {trigger}
            </div>
            {isOpen && (
                <FloatingPortal>
                    <div
                        ref={refs.setFloating}
                        style={floatingStyles}
                        aria-labelledby={headingId}
                        {...getFloatingProps()}
                        className={`z-[1000] outline-none ${className}`}
                    >
                        {children}
                    </div>
                </FloatingPortal>
            )}
        </>
    );
}
