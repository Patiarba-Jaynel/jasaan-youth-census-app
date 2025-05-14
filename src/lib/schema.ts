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
  home_address: z.string().min(1, "Address is required"),
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

// Helper function to get enum values from schema
export const getSchemaEnumValues = (field: keyof FormValues): string[] => {
  const fieldSchema = formSchema.shape[field];
  if (fieldSchema instanceof z.ZodEnum) {
    return fieldSchema.options;
  }
  return [];
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
