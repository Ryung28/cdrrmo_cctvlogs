import { toast } from 'sonner';
import { CheckCircle2, AlertCircle, Trash2 } from 'lucide-react';
import React from 'react';

/**
 * Senior Dev Notification System
 * Follows Separation of Concerns by isolating UI feedback logic from business logic.
 */
export const notify = {
    /**
     * Standard success message with a premium feel
     */
    success: (message: string) => {
        toast.success(message, {
            icon: <CheckCircle2 className="w-4 h-4 text-blue-400" />,
            duration: 3000,
        });
    },

    /**
     * Error message with a professional warning tone
     */
    error: (title: string, description?: string) => {
        toast.error(title, {
            description,
            icon: <AlertCircle className="w-4 h-4 text-red-400" />,
            duration: 4000,
        });
    },

    /**
     * Specific 'Removal' notification for deletion events
     * Uses a specific color palette and icon for clarity
     */
    removal: (success: boolean, message?: string) => {
        if (success) {
            toast.success(message || 'Record deleted successfully', {
                icon: <Trash2 className="w-4 h-4 text-orange-400" />,
                duration: 2000,
            });
        } else {
            toast.error(message || 'Deletion failed', {
                icon: <AlertCircle className="w-4 h-4 text-red-500" />,
                duration: 4000,
            });
        }
    },

    /**
     * Senior Action: Custom Confirmation Toast
     * Replaces native confirm() with a beautiful, actionable UI
     */
    confirm: (message: string, onConfirm: () => void) => {
        toast(message, {
            icon: <AlertCircle className="w-4 h-4 text-blue-400" />,
            duration: Infinity, // Stay open until action
            action: {
                label: 'Confirm Delete',
                onClick: onConfirm,
            },
            cancel: {
                label: 'Cancel',
                onClick: () => { /* No-op */ },
            }
        });
    }
};
