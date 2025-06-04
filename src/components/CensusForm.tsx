
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/sonner";

import { formSchema, type FormValues } from "@/lib/schema";
import { validateAgeConsistency } from "@/lib/validation";
import { standardizeYouthRecord } from "@/lib/standardize";
import { pbClient, type YouthRecord } from "@/lib/pb-client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormItem,
} from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Import the component sections
import { LocationSection } from "./census/LocationSection";
import { PersonalInfoSection } from "./census/PersonalInfoSection";
import { ContactSection } from "./census/ContactSection";
import { EducationSection } from "./census/EducationSection";
import { CivicSection } from "./census/CivicSection";

export function CensusForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const navigate = useNavigate();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      region: "X",
      province: "Misamis Oriental",
      city_municipality: "Jasaan",
      barangay: undefined,
      name: "",
      birthday: null,
      sex: undefined,
      civil_status: undefined,
      youth_classification: undefined,
      youth_age_group: undefined,
      email_address: "",
      contact_number: "",
      home_address: "",
      highest_education: undefined,
      work_status: undefined,
      registered_voter: undefined,
      voted_last_election: undefined,
      attended_kk_assembly: undefined,
      kk_assemblies_attended: 1,
    },
  });

  // Helper function to calculate age from birthday
  const calculateAge = (birthday: Date): number => {
    const today = new Date();
    let age = today.getFullYear() - birthday.getFullYear();
    const m = today.getMonth() - birthday.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthday.getDate())) {
      age--;
    }
    return age;
  };

  async function onSubmit(data: FormValues) {
    console.log("CensusForm.onSubmit: Form submission started with data:", data);
    setSubmitError(null);
    
    try {
      setIsSubmitting(true);
      
      // Calculate age from birthday - this is now the only place age is handled
      const calculatedAge = data.birthday ? calculateAge(data.birthday) : 0;
      console.log("CensusForm.onSubmit: Calculated age for submission:", calculatedAge);
      
      // Check for critical fields only
      const criticalFields = ['name', 'birthday', 'sex', 'barangay'];
      const missingCritical = criticalFields.filter(field => {
        const value = data[field as keyof FormValues];
        return !value || (typeof value === 'string' && (value === 'N/A' || value.trim() === ''));
      });
      
      if (missingCritical.length > 0) {
        toast.error("Missing Critical Information", {
          description: `Please fill in: ${missingCritical.join(', ')}. These fields are required for identification.`
        });
        setIsSubmitting(false);
        return;
      }
      
      // Validate age consistency only if youth_age_group is provided and not N/A
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (data.youth_age_group && !['N/A', '', undefined].includes(data.youth_age_group as any)) {
        const ageValidation = validateAgeConsistency(
          calculatedAge, 
          data.birthday.toISOString().split('T')[0], 
          data.youth_age_group
        );
        
        if (!ageValidation.isValid) {
          toast.error("Age Validation Error", {
            description: ageValidation.errors.join(". ") + " Please correct this before submitting."
          });
          setIsSubmitting(false);
          return;
        }

        // Show warnings if any
        if (ageValidation.warnings && ageValidation.warnings.length > 0) {
          toast.warning("Please verify:", {
            description: ageValidation.warnings.join(". ")
          });
        }
      }

      // Show info toast about optional fields if many are missing
      const optionalFields = ['youth_classification', 'civil_status', 'highest_education', 'work_status', 'email_address', 'contact_number'];
      const missingOptional = optionalFields.filter(field => {
        const value = data[field as keyof FormValues];
        return !value || (typeof value === 'string' && value.trim() === '');
      });
      
      if (missingOptional.length > 3) {
        const proceed = confirm(`Several optional fields are blank. The record will be saved with "N/A" for missing information. Continue?`);
        if (!proceed) {
          setIsSubmitting(false);
          return;
        }
      }

      // Create properly typed youth record with calculated age
      const youthRecord: Omit<YouthRecord, 'id' | 'created' | 'updated'> = {
        region: data.region,
        province: data.province,
        city_municipality: data.city_municipality,
        barangay: data.barangay || "",
        name: data.name,
        age: calculatedAge.toString(),
        birthday: data.birthday!,
        sex: data.sex || "Male",
        civil_status: data.civil_status || "Single",
        youth_classification: data.youth_classification || "ISY",
        youth_age_group: data.youth_age_group || "Core Youth (18-24)",
        email_address: data.email_address || "",
        contact_number: data.contact_number || "",
        home_address: data.home_address || "",
        highest_education: data.highest_education || "",
        work_status: data.work_status || "",
        registered_voter: data.registered_voter || "No",
        voted_last_election: data.voted_last_election || "No",
        attended_kk_assembly: data.attended_kk_assembly || "No",
        kk_assemblies_attended: data.kk_assemblies_attended || 0,
      };

      console.log("CensusForm.onSubmit: Creating youth record:", youthRecord);

      // Standardize the data before submission
      const standardizedData = standardizeYouthRecord(youthRecord);
      console.log("CensusForm.onSubmit: Standardized data:", standardizedData);
      
      // Attempt to create the record with error handling
      try {
        const result = await pbClient.youth.create(standardizedData);
        console.log("CensusForm.onSubmit: Youth record created successfully:", result);
        
        toast.success("Census form submitted successfully!", {
          description: "Thank you for participating in the Jasaan Youth Census.",
        });
        
        navigate("/success");
      } catch (createError: any) {
        console.error("CensusForm.onSubmit: Error creating record:", createError);
        
        // Display specific error message
        const errorMessage = createError?.data?.message || 
                            createError?.message || 
                            "Failed to save record. Please check your network connection and try again.";
        
        setSubmitError(errorMessage);
        toast.error("Submission Error", {
          description: errorMessage
        });
      }
    } catch (error: any) {
      console.error("CensusForm.onSubmit: Error submitting form:", error);
      const errorMessage = error?.data?.message || error?.message || "Form submission failed. Please try again.";
      setSubmitError(errorMessage);
      toast.error("Failed to submit form", {
        description: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  console.log("Current form values:", form.watch());
  console.log("Form errors:", form.formState.errors);

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Youth Census Registration</CardTitle>
        <CardDescription>
          Please fill out this form accurately to register for the Jasaan Youth Census. Fields marked with * are required.
        </CardDescription>
        
        {/* Youth Classification Reference */}
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-semibold mb-2">Youth Classification Reference:</h4>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">ISY - In-School Youth</Badge>
            <Badge variant="outline">OSY - Out-of-School Youth</Badge>
            <Badge variant="outline">WY - Working Youth</Badge>
            <Badge variant="outline">YSN - Youth with Special Needs</Badge>
          </div>
          <p className="text-sm mt-2 text-muted-foreground">
            * Required fields: Name, Birthday, Sex, Barangay. While Age will be calculated automatically from given birthday. Other fields can be left as "N/A" if unknown.
          </p>
        </div>
        
        {/* Show error message if submission failed */}
        {submitError && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            <p className="font-medium">Form submission failed:</p>
            <p className="text-sm mt-1">{submitError}</p>
            <p className="text-sm mt-2">Please try again or contact support if the problem persists.</p>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <LocationSection control={form.control} />
              <PersonalInfoSection control={form.control} />

              <ContactSection control={form.control} />
              <EducationSection control={form.control} />
              <CivicSection control={form.control} />
            </div>
            
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Submit Census Form"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
