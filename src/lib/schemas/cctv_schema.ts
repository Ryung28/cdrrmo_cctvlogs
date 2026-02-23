import { z } from "zod";

export const cctvLogSchema = z.object({
  action_type: z.enum(["CCTV Review", "Footage Extraction", "Offline Cameras"], {
    required_error: "Please select an action type.",
  }),
  date_of_action: z.string().min(1, "Date of review/extraction is required."),
  classification: z.string().min(1, "Classification is required."),
  camera_name: z.string().min(1, "Camera name is required."),
  incident_datetime: z.string().min(1, "Incident time and date is required."),
  client_name: z.string().min(1, "Client name is required."),
  remarks: z.string().optional(),
});

export type CctvLog = z.infer<typeof cctvLogSchema>;
// Adding id and created_at for the database model
export type CctvLogModel = CctvLog & {
  id: string;
  created_at: string;
};
