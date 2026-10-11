import { z } from "zod";

export const leadFormSchema = z.object({
  name: z.string().min(2, "Please enter your name (at least 2 characters)"),
  phone: z
    .string()
    .min(10, "Please enter a valid phone number")
    .regex(/^[\d\s\-\+\(\)]{10,}$/, "Please enter a valid phone number"),
  email: z.string().email("Please enter a valid email address").optional().or(z.literal("")),
  company: z.string().optional(),
  location: z.string().optional(),
  service: z.string().optional(),
  message: z.string().min(10, "Please tell us more about your requirement (at least 10 characters)"),
  preferredDate: z.string().optional(),
  contactVia: z.string().optional(),
  consent: z.boolean().refine((val) => val === true, "You must agree to be contacted about your enquiry"),
});

export type LeadFormData = z.infer<typeof leadFormSchema>;

export const consultationFormSchema = leadFormSchema.extend({
  service: z.string().min(1, "Please select a service"),
});

export type ConsultationFormData = z.infer<typeof consultationFormSchema>;

export const contactFormSchema = leadFormSchema;

export type ContactFormData = z.infer<typeof contactFormSchema>;

export const newsletterSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

export type NewsletterData = z.infer<typeof newsletterSchema>;