
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

// Get options from schema
const barangayOptions = formSchema.shape.barangay.options;
const youthClassificationOptions = formSchema.shape.youth_classification.options;
const youthAgeGroupOptions = formSchema.shape.youth_age_group.options;
const workStatusOptions = formSchema.shape.work_status.options;
const educationOptions = formSchema.shape.highest_education.options;
const sexOptions = formSchema.shape.sex.options;
const civilStatusOptions = formSchema.shape.civil_status.options;
const voterOptions = formSchema.shape.registered_voter.options;
const votedOptions = formSchema.shape.voted_last_election.options;
const assemblyOptions = formSchema.shape.attended_kk_assembly.options;

// Create a zod schema specifically for the edit form
const editFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  age: z.string().min(1, "Age is required"),
  birthday: z.date({
    required_error: "Birthday is required",
  }),
  sex: z.enum(sexOptions),
  civil_status: z.enum(civilStatusOptions),
  barangay: z.enum(barangayOptions),
  youth_classification: z.enum(youthClassificationOptions),
  youth_age_group: z.enum(youthAgeGroupOptions),
  highest_education: z.enum(educationOptions),
  work_status: z.enum(workStatusOptions),
  registered_voter: z.enum(voterOptions),
  voted_last_election: z.enum(votedOptions),
  attended_kk_assembly: z.enum(assemblyOptions),
  home_address: z.string().min(1, "Address is required"),
  email_address: z.string().email("Invalid email address"),
  contact_number: z.string().min(7, "Contact number must be at least 7 characters"),
  kk_assemblies_attended: z.coerce.number().int().nonnegative()
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
      youth_age_group: "CORE YOUTH (18-24)",
      highest_education: "High School",
      work_status: "Employed",
      registered_voter: "Yes",
      voted_last_election: "Yes",
      attended_kk_assembly: "Yes",
      home_address: "",
      email_address: "",
      contact_number: "",
      kk_assemblies_attended: 0
    }
  });

  // Update form values when selected record changes
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
        kk_assemblies_attended: selectedRecord.kk_assemblies_attended
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
                              {sexOptions.map((option) => (
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
                    
                    <FormField
                      control={form.control}
                      name="civil_status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Civil Status</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select civil status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {civilStatusOptions.map((option) => (
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
                    
                    <FormField
                      control={form.control}
                      name="birthday"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Birthday</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={"outline"}
                                  className={`w-full justify-start text-left font-normal ${!field.value ? "text-muted-foreground" : ""}`}
                                >
                                  {field.value ? (
                                    format(field.value, "PPP")
                                  ) : (
                                    <span>Pick a date</span>
                                  )}
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="youth_age_group"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Youth Age Group</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select age group" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {youthAgeGroupOptions.map((option) => (
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
                
                {/* Location Information */}
                <div className="space-y-4 col-span-2">
                  <h3 className="text-lg font-medium border-b pb-2">Location Information</h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="barangay"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Barangay</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select barangay" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {barangayOptions.map((option) => (
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
                    
                    <FormField
                      control={form.control}
                      name="home_address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Complete Home Address</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Enter complete home address" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                
                {/* Contact Information */}
                <div className="space-y-4 col-span-2">
                  <h3 className="text-lg font-medium border-b pb-2">Contact Information</h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="email_address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="contact_number"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Contact Number</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                
                {/* Education and Work */}
                <div className="space-y-4 col-span-2">
                  <h3 className="text-lg font-medium border-b pb-2">Education & Work</h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="youth_classification"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Youth Classification</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select classification" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {youthClassificationOptions.map((option) => (
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
                    
                    <FormField
                      control={form.control}
                      name="highest_education"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Highest Education</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select education level" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {educationOptions.map((option) => (
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
                    
                    <FormField
                      control={form.control}
                      name="work_status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Work Status</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select work status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {workStatusOptions.map((option) => (
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
                
                {/* Civic Engagement */}
                <div className="space-y-4 col-span-2">
                  <h3 className="text-lg font-medium border-b pb-2">Civic Engagement</h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="registered_voter"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Registered Voter</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select option" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {voterOptions.map((option) => (
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
                    
                    <FormField
                      control={form.control}
                      name="voted_last_election"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Voted Last Election</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select option" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {votedOptions.map((option) => (
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
                    
                    <FormField
                      control={form.control}
                      name="attended_kk_assembly"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Attended KK Assembly</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select option" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {assemblyOptions.map((option) => (
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
                    
                    <FormField
                      control={form.control}
                      name="kk_assemblies_attended"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Number of KK Assemblies Attended</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              {...field} 
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)} 
                              value={field.value.toString()}
                            />
                          </FormControl>
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
