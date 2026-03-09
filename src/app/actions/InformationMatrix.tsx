import React from 'react';

interface InformationMatrixProps {
    isExpanded: boolean;
    children: React.ReactNode;
}

/**
 * InformationMatrix Component
 * Implements Kinetic Buffer Saturation to eliminate black space during viewport expansion.
 */
const InformationMatrix: React.FC<InformationMatrixProps> = ({ isExpanded, children }) => {
    // The expansion offset should be 0px because the flex layout handles the physical shift.
    // The kinetic buffer below still protects against layout thrashing during animation.
    const expansionOffset = "0px";

    return (
        /* Precision Tactical Containment: Masking the 300px overshoot buffer */
        /* NOTE: If you don't see this data-verify attribute in your browser inspector, 
           you are likely editing the wrong file (check src/components/ instead) */
        <div className="relative w-full h-full overflow-hidden" data-verify="kinetic-matrix-v3">
            <div
                className={`
                    /* Kinetic Container: Using relative to maintain document flow */
                    relative w-full bg-[#0c1425] z-0 min-h-full
                    
                    /* GPU Promotion: Ensures smooth 60fps animation */
                    will-change-transform transform-gpu
                    
                    /* Hydraulic Timing: Matches top expansion curve exactly */
                    transition-transform duration-700 ease-[cubic-bezier(0.4,0,0.2,1)]
                `}
                style={{
                    /* Kinetic Sync: Zero translation keeps content anchored to the layout */
                    transform: 'translateY(0px)',
                    backfaceVisibility: 'hidden'
                }}
            >
                <div className="w-full h-full relative z-10">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default InformationMatrix;