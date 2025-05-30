
import { z } from "zod";

export const formSchema = z.object({
  region: z.enum(["X"]),
  province: z.enum(["Misamis Oriental"]),
  city_municipality: z.enum(["Jasaan"]),
  barangay: z.enum([
    "Aplaya", "Bobontugan", "Corrales", "Danao", "Jampason", "Kimaya",
    "Lower Jasaan (Pob.)", "Luz Banzon", "Natubo", "San Antonio", 
    "San Isidro", "San Nicolas", "Upper Jasaan (Pob.)", "I. S. Cruz",
  ]).optional(),
  name: z.string().min(1, "Name is required"),
  birthday: z.date({
    required_error: "Birthday is required",
  }),
  sex: z.enum(["MALE", "FEMALE"]).optional(),
  civil_status: z.enum(["SINGLE", "MARRIED", "LIVED-IN", "WIDOWED"]).optional(),
  youth_classification: z.enum(["ISY", "OSY", "WY", "YSN"]).optional(),
  youth_age_group: z.enum([
    "CORE YOUTH (18-24)", 
    "CHILD YOUTH (15-17)", 
    "YOUNG ADULT (25-30)",
  ]).optional(),
  email_address: z.string().email("Invalid email address").optional().or(z.literal("")),
  contact_number: z.string().min(7, "Contact number must be at least 7 characters").optional().or(z.literal("")),
  home_address: z.string().min(1, "Address is required").optional().or(z.literal("")),
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
  ]).optional(),
  work_status: z.enum(["Employed", "Unemployed", "Student", "Self-Employed"]).optional(),
  registered_voter: z.enum(["Yes", "No"]).optional(),
  voted_last_election: z.enum(["Yes", "No"]).optional(),
  attended_kk_assembly: z.enum(["Yes", "No"]).optional(),
  kk_assemblies_attended: z.number().int().nonnegative(),
});

export type FormValues = z.infer<typeof formSchema>;

// Helper function to get enum values from schema - now handles optional enums
export const getSchemaEnumValues = (field: keyof FormValues): string[] => {
  const fieldSchema = formSchema.shape[field];
  if (fieldSchema instanceof z.ZodEnum) {
    return fieldSchema.options;
  }
  // Handle optional enums
  if (fieldSchema instanceof z.ZodOptional && fieldSchema._def.innerType instanceof z.ZodEnum) {
    return fieldSchema._def.innerType.options;
  }
  return [];
};

// Export individual enum options for easier access
export const enumOptions = {
  sex: ["MALE", "FEMALE"] as const,
  civil_status: ["SINGLE", "MARRIED", "LIVED-IN", "WIDOWED"] as const,
  youth_classification: ["ISY", "OSY", "WY", "YSN"] as const,
  youth_age_group: ["CORE YOUTH (18-24)", "CHILD YOUTH (15-17)", "YOUNG ADULT (25-30)"] as const,
  highest_education: ["Elementary", "High School", "College Undergraduate", "College Graduate", "Masters Degree", "College Level", "Doctorate Degree", "Vocational", "Other"] as const,
  work_status: ["Employed", "Unemployed", "Student", "Self-Employed"] as const,
  registered_voter: ["Yes", "No"] as const,
  voted_last_election: ["Yes", "No"] as const,
  attended_kk_assembly: ["Yes", "No"] as const,
  barangay: ["Aplaya", "Bobontugan", "Corrales", "Danao", "Jampason", "Kimaya", "Lower Jasaan (Pob.)", "Luz Banzon", "Natubo", "San Antonio", "San Isidro", "San Nicolas", "Upper Jasaan (Pob.)", "I. S. Cruz"] as const,
};

// Generate template data for CSV/Excel export
export const generateTemplateData = () => {
  // Get all field definitions from the schema
  const fields = Object.keys(formSchema.shape);
  
  // Sample row with placeholder values
  const sampleRow = fields.reduce((acc, field) => {
    const fieldSchema = formSchema.shape[field as keyof typeof formSchema.shape];
    
    if (fieldSchema instanceof z.ZodEnum) {
      // For enum fields, provide the first valid option
      acc[field] = fieldSchema.options[0];
    } else if (field === "birthday") {
      // Format date as YYYY-MM-DD
      acc[field] = "2000-01-01";
    } else if (field === "kk_assemblies_attended") {
      acc[field] = "0";
    } else if (field === "home_address") {
      acc[field] = "Enter complete home address";
    } else {
      // For other fields, provide a descriptive placeholder
      acc[field] = `Enter ${field.replace(/_/g, " ")}`;
    }
    
    return acc;
  }, {} as Record<string, string>);
  
  return {
    headers: fields,
    sampleRow
  };
};
