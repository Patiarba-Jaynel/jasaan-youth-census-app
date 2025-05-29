
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
  const navigate = useNavigate();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      region: "X",
      province: "Misamis Oriental",
      city_municipality: "Jasaan",
      kk_assemblies_attended: 1,
    },
  });

  async function onSubmit(data: FormValues) {
    try {
      setIsSubmitting(true);
      
      // Validate age consistency before submission
      const ageValidation = validateAgeConsistency(
        Number(data.age), 
        data.birthday.toISOString().split('T')[0], 
        data.youth_age_group
      );
      
      if (!ageValidation.isValid) {
        toast.error("Validation Error", {
          description: ageValidation.errors.join(". ") + " Please correct this before submitting."
        });
        return;
      }

      // Show warnings if any
      if (ageValidation.warnings && ageValidation.warnings.length > 0) {
        toast.warning("Please verify:", {
          description: ageValidation.warnings.join(". ")
        });
      }

      // Create properly typed youth record
      const youthRecord: Omit<YouthRecord, 'id' | 'created' | 'updated'> = {
        region: data.region,
        province: data.province,
        city_municipality: data.city_municipality,
        barangay: data.barangay,
        name: data.name,
        age: data.age,
        birthday: data.birthday,
        sex: data.sex,
        civil_status: data.civil_status,
        youth_classification: data.youth_classification,
        youth_age_group: data.youth_age_group,
        email_address: data.email_address,
        contact_number: data.contact_number,
        home_address: data.home_address,
        highest_education: data.highest_education,
        work_status: data.work_status,
        registered_voter: data.registered_voter,
        voted_last_election: data.voted_last_election,
        attended_kk_assembly: data.attended_kk_assembly,
        kk_assemblies_attended: data.kk_assemblies_attended,
      };

      // Standardize the data before submission
      const standardizedData = standardizeYouthRecord(youthRecord);
      
      await pbClient.youth.create(standardizedData);
      
      toast.success("Census form submitted successfully!", {
        description: "Thank you for participating in the Jasaan Youth Census.",
      });
      
      navigate("/success");
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Failed to submit form", {
        description: "Please try again or contact support if the problem persists.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Youth Census Registration</CardTitle>
        <CardDescription>
          Please fill out this form accurately to register for the Jasaan Youth Census.
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
        </div>
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
            
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit Census Form"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
