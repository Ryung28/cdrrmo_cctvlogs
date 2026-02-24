import { z } from "zod";

// ==================== TRANSFORMS ====================
// Transform functions for data preprocessing

// Transform date string to normalized format (YYYY-MM-DD)
const normalizeDateTransform = z.string()
  .transform((date) => {
    if (!date) return "";
    // If already in correct format, return as-is
    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) return date;
    // Try to parse and normalize
    const parsed = new Date(date);
    if (isNaN(parsed.getTime())) return date;
    return parsed.toISOString().split('T')[0];
  });

// Transform datetime string to normalized format (YYYY-MM-DD HH:MM:SS)
const normalizeDateTimeTransform = z.string()
  .transform((datetime) => {
    if (!datetime) return "";
    // If already in correct format, return as-is
    if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(datetime)) return datetime;
    // Try to parse and normalize
    const parsed = new Date(datetime);
    if (isNaN(parsed.getTime())) return datetime;
    return parsed.toISOString().replace('T', ' ').split('.')[0];
  });

// Transform string to uppercase trim
const normalizeStringTransform = z.string()
  .transform((str) => str?.trim().toUpperCase() || "");

// Transform string to title case
const toTitleCaseTransform = z.string()
  .transform((str) => {
    if (!str) return "";
    return str.replace(/\w\S*/g, (txt) => 
      txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    );
  });

// ==================== BASE SCHEMAS ====================

// Offline camera entry schema with transforms
export const offlineCameraEntrySchema = z.object({
  camera_name: z.string()
    .min(1, { message: "Camera name is required." })
    .transform((val) => val?.trim().toUpperCase() || ""),
  offline_date: z.string()
    .min(1, { message: "Date is required." })
    .refine((val) => /^\d{4}-\d{2}-\d{2}$/.test(val), {
      message: "Date must be in YYYY-MM-DD format"
    }),
  offline_time: z.string()
    .min(1, { message: "Time is required." })
    .refine((val) => /^\d{2}:\d{2}(:\d{2})?$/.test(val), {
      message: "Time must be in HH:MM or HH:MM:SS format"
    }),
});

// Base schema with transforms
const baseSchema = z.object({
  date_of_action: z.string()
    .min(1, { message: "Date of review/extraction is required." })
    .refine((val) => /^\d{4}-\d{2}-\d{2}$/.test(val), {
      message: "Date must be in YYYY-MM-DD format"
    })
    .optional()
    .or(z.literal("")),
  remarks: z.string().optional(),
  classification_remarks: z.string().optional(),
});

// ==================== CCTV REVIEW SCHEMA ====================

export const cctvReviewSchema = baseSchema.extend({
  action_type: z.literal("CCTV Review"),
  classification: z.string()
    .min(1, { message: "Classification is required." })
    .transform((val) => toTitleCaseTransform.parse(val)),
  camera_name: z.string()
    .min(1, { message: "Camera name is required." })
    .transform((val) => val?.trim().toUpperCase() || ""),
  incident_datetime: z.string()
    .min(1, { message: "Incident time and date is required." })
    .refine((val) => {
      // Allow both datetime and date-only formats
      return /^\d{4}-\d{2}-\d{2}( \d{2}:\d{2}(:\d{2})?)?$/.test(val) || 
             /^\d{4}-\d{2}-\d{2}$/.test(val);
    }, {
      message: "Incident time must be in YYYY-MM-DD or YYYY-MM-DD HH:MM:SS format"
    }),
  client_name: z.string()
    .min(1, { message: "Client name is required." })
    .transform((val) => {
      // Convert to title case for consistency
      if (!val) return "";
      return val.replace(/\w\S*/g, (txt) => 
        txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
      );
    }),
})
// Cross-field validation using refine
.refine(
  (data) => {
    // Ensure date of action is not in the future
    if (data.date_of_action) {
      const actionDate = new Date(data.date_of_action);
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      return actionDate <= today;
    }
    return true;
  },
  {
    message: "Date of action cannot be in the future",
    path: ["date_of_action"],
  }
);

// ==================== FOOTAGE EXTRACTION SCHEMA ====================

export const footageExtractionSchema = baseSchema.extend({
  action_type: z.literal("Footage Extraction"),
  classification: z.string()
    .min(1, { message: "Classification is required." })
    .transform((val) => toTitleCaseTransform.parse(val)),
  camera_name: z.string()
    .min(1, { message: "Camera name is required." })
    .transform((val) => val?.trim().toUpperCase() || ""),
  incident_datetime: z.string()
    .min(1, { message: "Incident time and date is required." })
    .refine((val) => {
      return /^\d{4}-\d{2}-\d{2}( \d{2}:\d{2}(:\d{2})?)?$/.test(val) || 
             /^\d{4}-\d{2}-\d{2}$/.test(val);
    }, {
      message: "Incident time must be in YYYY-MM-DD or YYYY-MM-DD HH:MM:SS format"
    }),
  client_name: z.string()
    .min(1, { message: "Client name is required." })
    .transform((val) => {
      if (!val) return "";
      return val.replace(/\w\S*/g, (txt) => 
        txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
      );
    }),
})
.refine(
  (data) => {
    if (data.date_of_action) {
      const actionDate = new Date(data.date_of_action);
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      return actionDate <= today;
    }
    return true;
  },
  {
    message: "Date of action cannot be in the future",
    path: ["date_of_action"],
  }
);

// ==================== OFFLINE CAMERAS SCHEMA ====================

export const offlineCamerasSchema = baseSchema.extend({
  action_type: z.literal("Offline Cameras"),
  classification: z.string().optional(),
  camera_name: z.string().optional(),
  incident_datetime: z.string().optional(),
  client_name: z.string().optional(),
  offline_cameras: z.array(offlineCameraEntrySchema)
    .min(1, { message: "At least one offline camera is required." })
    .max(50, { message: "Maximum 50 offline cameras allowed." }),
})
// Validate that at least one offline camera has complete data
.refine(
  (data) => {
    if (!data.offline_cameras || data.offline_cameras.length === 0) return false;
    // Check that all entries have complete data
    return data.offline_cameras.every(
      (cam) => cam.camera_name && cam.offline_date && cam.offline_time
    );
  },
  {
    message: "All offline camera entries must have camera name, date, and time",
    path: ["offline_cameras"],
  }
);

// ==================== DISCRIMINATED UNION ====================

// Union schema for all action types
export const cctvLogSchema = z.discriminatedUnion("action_type", [
  cctvReviewSchema,
  footageExtractionSchema,
  offlineCamerasSchema,
]);

// ==================== TYPE INFERENCES ====================

export type CctvLog = z.infer<typeof cctvLogSchema>;
export type CctvReviewLog = z.infer<typeof cctvReviewSchema>;
export type FootageExtractionLog = z.infer<typeof footageExtractionSchema>;
export type OfflineCamerasLog = z.infer<typeof offlineCamerasSchema>;
export type OfflineCameraEntry = z.infer<typeof offlineCameraEntrySchema>;

// Database model type
export type CctvLogModel = CctvLog & {
  id: string;
  created_at: string;
  offline_cameras?: string;
  classification_remarks?: string;
};

// ==================== VALIDATION HELPERS ====================

// Helper to validate form data with full error details
export function validateCctvLog(data: unknown) {
  return cctvLogSchema.safeParse(data);
}

// Helper to validate and get formatted errors
export function getFormattedErrors(error: z.ZodError) {
  return error.issues.map((issue) => ({
    path: issue.path.join('.'),
    message: issue.message,
  }));
}
