import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/sonner";

import { formSchema, type FormValues } from "@/lib/schema";
import { pbClient } from "@/lib/pb-client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormItem,
} from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

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
      
      // Ensure all required fields are defined before submission
      // Note that we're not converting birthday to string - keeping it as a Date object
      const formattedData = {
        region: data.region,
        province: data.province,
        city_municipality: data.city_municipality,
        barangay: data.barangay,
        name: data.name,
        age: data.age,
        birthday: data.birthday, // Keep as Date object as required by YouthRecord
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
      
      await pbClient.youth.create(formattedData);
      
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
