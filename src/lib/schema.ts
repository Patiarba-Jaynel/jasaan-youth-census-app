
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
  sex: ["MALE", "FEMALE"] as const,
  civil_status: ["SINGLE", "MARRIED", "LIVED-IN", "WIDOWED"] as const,
  youth_classification: ["ISY", "OSY", "WY", "YSN"] as const,
  youth_age_group: ["CORE YOUTH (18-24)", "CHILD YOUTH (15-17)", "YOUNG ADULT (25-30)"] as const,
  educational_background: [
    "ELEMENTARY UNDERGRADUATE",
    "ELEMENTARY GRADUATE", 
    "HIGH SCHOOL UNDERGRADUATE",
    "HIGH SCHOOL GRADUATE",
    "VOCATIONAL UNDERGRADUATE",
    "VOCATIONAL GRADUATE",
    "COLLEGE UNDERGRADUATE",
    "COLLEGE GRADUATE",
    "MASTERAL UNDERGRADUATE",
    "MASTERAL GRADUATE",
    "DOCTORAL UNDERGRADUATE",
    "DOCTORAL GRADUATE"
  ] as const,
  work_status: ["EMPLOYED", "UNEMPLOYED", "STUDENT", "SELF-EMPLOYED"] as const,
  registered_sk_voter: ["YES", "NO"] as const,
  registered_national_voter: ["YES", "NO"] as const,
  attended_kk_assembly: ["YES", "NO"] as const,
  voted_last_sk_election: ["YES", "NO"] as const,
  voted_last_national_election: ["YES", "NO"] as const,
  assembly_attendance: ["NEVER", "SOMETIMES", "ALWAYS"] as const,
  barangay: [
    "APLAYA", "BOBONTUGAN", "CORRALES", "DANSOLIHON", "I. S. CRUZ", "JAMPASON",
    "KIMAYA", "LIGHT HOUSE (POB.)", "LOWER JASAAN", "NATUBO", "SAN ANTONIO",
    "SAN NICOLAS", "SANTA CRUZ", "SOLANA", "UPPER JASAAN"
  ] as const,
  // Add aliases for form compatibility
  highest_education: [
    "ELEMENTARY UNDERGRADUATE",
    "ELEMENTARY GRADUATE", 
    "HIGH SCHOOL UNDERGRADUATE",
    "HIGH SCHOOL GRADUATE",
    "VOCATIONAL UNDERGRADUATE",
    "VOCATIONAL GRADUATE",
    "COLLEGE UNDERGRADUATE",
    "COLLEGE GRADUATE",
    "MASTERAL UNDERGRADUATE",
    "MASTERAL GRADUATE",
    "DOCTORAL UNDERGRADUATE",
    "DOCTORAL GRADUATE"
  ] as const,
  registered_voter: ["YES", "NO"] as const,
  voted_last_election: ["YES", "NO"] as const
};

// Form schema and types for Census form
export const formSchema = z.object({
  region: z.string().min(1, "Region is required"),
  province: z.string().min(1, "Province is required"),
  city_municipality: z.string().min(1, "City/Municipality is required"),
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
