
import { z } from "zod";

export interface Youth {
  id?: string;
  name: string;
  sex: typeof enumOptions.sex[number];
  birthdate: string;
  civil_status: typeof enumOptions.civil_status[number];
  barangay: typeof enumOptions.barangay[number];
  purok: string;
  contact_number: string;
  youth_classification: typeof enumOptions.youth_classification[number];
  youth_age_group: typeof enumOptions.youth_age_group[number];
  educational_background: typeof enumOptions.educational_background[number];
  work_status: typeof enumOptions.work_status[number];
  registered_sk_voter: typeof enumOptions.registered_sk_voter[number];
  registered_national_voter: typeof enumOptions.registered_national_voter[number];
  attended_kk_assembly: typeof enumOptions.attended_kk_assembly[number];
  voted_last_sk_election: typeof enumOptions.voted_last_sk_election[number];
  voted_last_national_election: typeof enumOptions.voted_last_national_election[number];
  assembly_attendance: typeof enumOptions.assembly_attendance[number];
  created?: string;
  updated?: string;
}

export const enumOptions = {
  sex: ["Male", "Female"] as const,
  civil_status: ["Single", "Married", "Lived-In", "Widowed"] as const,
  youth_classification: ["ISY", "OSY", "WY", "YSN"] as const, // Keep as acronyms
  youth_age_group: ["Core Youth (18-24)", "Child Youth (15-17)", "Young Adult (25-30)"] as const,
  educational_background: [
    "Elementary Undergraduate",
    "Elementary Graduate", 
    "High School Undergraduate",
    "High School Graduate",
    "Vocational Undergraduate",
    "Vocational Graduate",
    "College Undergraduate",
    "College Graduate",
    "Masteral Undergraduate",
    "Masteral Graduate",
    "Doctoral Undergraduate",
    "Doctoral Graduate"
  ] as const,
  work_status: ["Employed", "Unemployed", "Student", "Self-Employed"] as const,
  registered_sk_voter: ["Yes", "No"] as const,
  registered_national_voter: ["Yes", "No"] as const,
  attended_kk_assembly: ["Yes", "No"] as const,
  voted_last_sk_election: ["Yes", "No"] as const,
  voted_last_national_election: ["Yes", "No"] as const,
  assembly_attendance: ["Never", "Sometimes", "Always"] as const,
  barangay: [
    "Aplaya", "Bobontugan", "Corrales", "I.S. Cruz", "Danao", "Jampason", "Kimaya",
    "Lower Jasaan", "Luz Banzon", "Natubo", "San Antonio", "San Isidro",
    "San Nicolas", "Solana", "Upper Jasaan"
  ] as const,
  // Add aliases for form compatibility
  highest_education: [
    "Elementary Undergraduate",
    "Elementary Graduate", 
    "High School Undergraduate",
    "High School Graduate",
    "Vocational Undergraduate",
    "Vocational Graduate",
    "College Undergraduate",
    "College Graduate",
    "Masteral Undergraduate",
    "Masteral Graduate",
    "Doctoral Undergraduate",
    "Doctoral Graduate"
  ] as const,
  registered_voter: ["Yes", "No"] as const,
  voted_last_election: ["Yes", "No"] as const
};

// Form schema and types for Census form - with automatic defaults for location
export const formSchema = z.object({
  region: z.string().default("X"),
  province: z.string().default("Misamis Oriental"),
  city_municipality: z.string().default("Jasaan"),
  barangay: z.enum(enumOptions.barangay).optional(),
  name: z.string().min(1, "Name is required"),
  birthday: z.date().nullable(),
  sex: z.enum(enumOptions.sex).optional(),
  civil_status: z.enum(enumOptions.civil_status).optional(),
  youth_classification: z.enum(enumOptions.youth_classification).optional(),
  youth_age_group: z.enum(enumOptions.youth_age_group).optional(),
  email_address: z.string().optional(),
  contact_number: z.string().optional(),
  home_address: z.string().optional(),
  highest_education: z.enum(enumOptions.educational_background).optional(),
  work_status: z.enum(enumOptions.work_status).optional(),
  registered_voter: z.enum(enumOptions.registered_sk_voter).optional(),
  voted_last_election: z.enum(enumOptions.voted_last_sk_election).optional(),
  attended_kk_assembly: z.enum(enumOptions.attended_kk_assembly).optional(),
  kk_assemblies_attended: z.number().min(0).default(1),
});

export type FormValues = z.infer<typeof formSchema>;

// Consolidated data schema
export const consolidatedDataSchema = z.object({
  barangay: z.enum(enumOptions.barangay),
  age_bracket: z.string(),
  gender: z.enum(["Male", "Female"] as const),
  year: z.number(),
  month: z.string(),
  count: z.number().min(0),
});

export type ConsolidatedDataValues = z.infer<typeof consolidatedDataSchema>;

// Activity log schema
export const activityLogSchema = z.object({
  id: z.string().optional(),
  user_id: z.string(),
  action: z.string(),
  table_name: z.string(),
  record_id: z.string().optional(),
  details: z.string().optional(),
  timestamp: z.string().optional(),
  created: z.string().optional(),
  updated: z.string().optional(),
});

export type ActivityLog = z.infer<typeof activityLogSchema>;

// Batch operation schema
export const batchOperationSchema = z.object({
  id: z.string().optional(),
  user_id: z.string(),
  operation_type: z.string(),
  table_name: z.string(),
  affected_records: z.number(),
  details: z.string().optional(),
  timestamp: z.string().optional(),
  created: z.string().optional(),
  updated: z.string().optional(),
});

export type BatchOperation = z.infer<typeof batchOperationSchema>;
