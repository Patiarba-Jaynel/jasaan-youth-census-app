
import { z } from "zod";

export const formSchema = z.object({
  region: z.enum(["X"]),
  province: z.enum(["Misamis Oriental"]),
  city_municipality: z.enum(["Jasaan"]),
  barangay: z.enum([
    "Aplaya", "Bobontugan", "Corrales", "Danao", "Jampason", "Kimaya",
    "Lower Jasaan (Pob.)", "Luz Banzon", "Natubo", "San Antonio", 
    "San Isidro", "San Nicolas", "Upper Jasaan (Pob.)", "I. S. Cruz",
  ]),
  name: z.string().min(1, "Name is required"),
  age: z.string().min(1, "Age is required"),
  birthday: z.date({
    required_error: "Birthday is required",
  }),
  sex: z.enum(["MALE", "FEMALE"]),
  civil_status: z.enum(["SINGLE", "MARRIED", "LIVED-IN", "WIDOWED"]),
  youth_classification: z.enum(["ISY", "OSY", "WY", "YSN"]),
  youth_age_group: z.enum([
    "CORE YOUTH (18-24)", 
    "CHILD YOUTH (15-17)", 
    "YOUNG ADULT (25-30)",
  ]),
  email_address: z.string().email("Invalid email address"),
  contact_number: z.string().min(7, "Contact number must be at least 7 characters"),
  home_address: z.enum([
    "ZONE 1", "ZONE 2", "ZONE 3", "ZONE 4", "ZONE 5", "ZONE 6",
  ]),
  highest_education: z.enum([
    "Elementary",
    "High School",
    "College Undergraduate",
    "College Graduate",
    "Masters Degree",
    "College Level",
    "Doctorate Degree",
    "Vocational",
    "Other",
  ]),
  work_status: z.enum(["Employed", "Unemployed", "Student", "Self-Employed"]),
  registered_voter: z.enum(["Yes", "No"]),
  voted_last_election: z.enum(["Yes", "No"]),
  attended_kk_assembly: z.enum(["Yes", "No"]),
  kk_assemblies_attended: z.number().int().nonnegative(),
});

export type FormValues = z.infer<typeof formSchema>;
