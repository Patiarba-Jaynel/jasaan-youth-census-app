
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

// Import the new component sections
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
      kk_assemblies_attended: 0,
    },
  });

  async function onSubmit(data: FormValues) {
    try {
      setIsSubmitting(true);
      
      // Convert date to ISO string for PocketBase
      const formattedData = {
        ...data,
        birthday: data.birthday.toISOString(),
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
