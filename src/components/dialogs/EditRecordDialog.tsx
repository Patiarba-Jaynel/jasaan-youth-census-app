/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { YouthRecord } from "@/lib/pb-client";
import { formSchema } from "@/lib/schema";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface EditRecordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedRecord: YouthRecord | null;
  onSave: (data: any) => void;
}

const editFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  age: z.string().min(1, "Age is required"),
  birthday: z.date({
    required_error: "Birthday is required",
  }),
  sex: z.enum(["MALE", "FEMALE"]),
  civil_status: z.enum(["SINGLE", "MARRIED", "DIVORCED", "WIDOWED"]),
  barangay: z.enum([
    "Aplaya",
    "Bobontugan",
    "Corrales",
    "Jampason",
    "Kimaya",
    "Luz Banzon",
    "Lower Jasaan",
    "Solana",
    "San Antonio",
    "San Nicolas",
    "Upper Jasaan",
  ]),
  youth_classification: z.enum(["ISY", "OSY", "WY", "YSN"]),
  youth_age_group: z.enum(["15-17", "18-24", "25-30"]),
  highest_education: z.enum([
    "Elementary",
    "High School",
    "College",
    "Postgraduate",
  ]),
  work_status: z.enum(["Employed", "Self-Employed", "Unemployed", "Student"]),
  registered_voter: z.enum(["Yes", "No"]),
  voted_last_election: z.enum(["Yes", "No"]),
  attended_kk_assembly: z.enum(["Yes", "No"]),
  home_address: z.string().min(1, "Address is required"),
  email_address: z.string().email("Invalid email address"),
  contact_number: z.string().min(7, "Contact number must be at least 7 characters"),
  kk_assemblies_attended: z.coerce.number().int().nonnegative(),
});

type EditFormValues = z.infer<typeof editFormSchema>;

export function EditRecordDialog({
  open,
  onOpenChange,
  selectedRecord,
  onSave,
}: EditRecordDialogProps) {
  const form = useForm<EditFormValues>({
    resolver: zodResolver(editFormSchema),
    defaultValues: {
      name: "",
      age: "",
      birthday: new Date(),
      sex: "MALE",
      civil_status: "SINGLE",
      barangay: "Aplaya",
      youth_classification: "ISY",
      youth_age_group: "18-24",
      highest_education: "High School",
      work_status: "Employed",
      registered_voter: "Yes",
      voted_last_election: "Yes",
      attended_kk_assembly: "Yes",
      home_address: "",
      email_address: "",
      contact_number: "",
      kk_assemblies_attended: 0,
    },
  });

  useEffect(() => {
    if (selectedRecord) {
      form.reset({
        name: selectedRecord.name,
        age: selectedRecord.age,
        birthday: new Date(selectedRecord.birthday),
        sex: selectedRecord.sex as any,
        civil_status: selectedRecord.civil_status as any,
        barangay: selectedRecord.barangay as any,
        youth_classification: selectedRecord.youth_classification as any,
        youth_age_group: selectedRecord.youth_age_group as any,
        highest_education: selectedRecord.highest_education as any,
        work_status: selectedRecord.work_status as any,
        registered_voter: selectedRecord.registered_voter as any,
        voted_last_election: selectedRecord.voted_last_election as any,
        attended_kk_assembly: selectedRecord.attended_kk_assembly as any,
        home_address: selectedRecord.home_address,
        email_address: selectedRecord.email_address,
        contact_number: selectedRecord.contact_number,
        kk_assemblies_attended: selectedRecord.kk_assemblies_attended,
      });
    }
  }, [selectedRecord, form]);

  const handleSubmit = (data: EditFormValues) => {
    onSave(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Edit Youth Record</DialogTitle>
          <DialogDescription>
            Update the information for this youth record. All fields can be edited.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[70vh] pr-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Personal Information Section */}
                <div className="space-y-4 col-span-2">
                  <h3 className="text-lg font-medium border-b pb-2">Personal Information</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="age"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Age</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="sex"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Sex</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select sex" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {["MALE", "FEMALE"].map((option) => (
                                <SelectItem key={option} value={option}>
                                  {option}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button type="submit">Save changes</Button>
              </DialogFooter>
            </form>
          </Form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}