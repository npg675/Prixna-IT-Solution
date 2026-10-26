"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Label } from "@/components/ui/Label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";
import { Checkbox } from "@/components/ui/Checkbox";
import { Separator } from "@/components/ui/Separator";
import { cn } from "@/lib/utils";
import { getTelUrl, getWhatsAppUrl } from "@/lib/utils";
import { getWhatsAppUrlForLead } from "@/lib/whatsapp";
import { leadFormSchema, type LeadFormData } from "@/lib/validation/schemas";

interface ConsultationFormProps {
  title?: string;
  subtitle?: string;
  submitText?: string;
  service?: string;
  formType?: string;
  showBooking?: boolean;
  className?: string;
  onSuccess?: (data: LeadFormData) => void;
}

const SERVICE_OPTIONS = [
  "Free Business Consultation",
  "Business Software / SaaS Demo",
  "JigriTools Enquiry",
  "Custom Software / Website Development",
  "Accounting / ERP / CRM",
  "Restaurant / Hospitality Solution",
  "Attendance & Payroll",
  "Computers / Laptops / Equipment",
  "CCTV & Security Installation",
  "Biometric / Access Control",
  "Networking / Servers",
  "Repair & Maintenance",
  "Digital Marketing / AI Automation",
  "Bulk / Dealer Enquiry",
  "Other",
];

const CONTACT_VIA_OPTIONS = [
  "Phone call",
  "WhatsApp",
  "Email",
  "On-site visit (Valley)",
];

export function ConsultationForm({
  title = "Request a Consultation",
  subtitle = "Fill in the form and our team will call you back during business hours.",
  submitText = "Send Enquiry →",
  service,
  formType = "general",
  showBooking = false,
  className,
  onSuccess,
}: ConsultationFormProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitStatus, setSubmitStatus] = React.useState<"idle" | "success" | "error">("idle");
  const [referenceId, setReferenceId] = React.useState<string>("");

  const form = useForm<LeadFormData>({
    resolver: zodResolver(leadFormSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      company: "",
      location: "",
      service: service || "",
      message: "",
      preferredDate: "",
      contactVia: "",
      consent: false,
    },
    mode: "onChange",
  });

  const selectedService = form.watch("service");
  const selectedContactVia = form.watch("contactVia");

  React.useEffect(() => {
    if (service) {
      form.setValue("service", service, { shouldValidate: true });
    }
  }, [service, form]);

  const generateReferenceId = () => {
    return "L-" + Date.now().toString(36).toUpperCase() + "-" + Math.floor(Math.random() * 1296).toString(36).toUpperCase();
  };

  const onSubmit = async (data: LeadFormData) => {
    setIsSubmitting(true);
    setSubmitStatus("idle");

    try {
      const refId = generateReferenceId();
      setReferenceId(refId);

      const leadData = {
        ...data,
        id: refId,
        createdAt: new Date().toISOString(),
        form: formType,
        status: "new" as const,
        followUp: "",
        assignee: "",
        history: [{ ts: new Date().toISOString(), note: "Enquiry received." }],
      };

      // Store in localStorage (lead inbox)
      const existingLeads = JSON.parse(localStorage.getItem("prixna_leads_v1") || "[]");
      existingLeads.unshift(leadData);
      localStorage.setItem("prixna_leads_v1", JSON.stringify(existingLeads));

      // Send email notification
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(leadData),
      });

      if (!response.ok) {
        throw new Error("Failed to submit form");
      }

      setSubmitStatus("success");
      form.reset();

      toast({
        title: "Enquiry submitted successfully",
        description: `Reference ID: ${refId}. Our team will contact you soon.`,
        variant: "success",
      });

      onSuccess?.(data);
    } catch (error) {
      console.error("Form submission error:", error);
      setSubmitStatus("error");
      toast({
        title: "Submission failed",
        description: "Please try again or contact us directly on WhatsApp.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConsentChange = (checked: boolean) => {
    form.setValue("consent", checked, { shouldValidate: true });
  };

  if (submitStatus === "success") {
    return (
      <div className={cn("animate-in slide-up-in", className)} role="alert">
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
              <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-green-900">Thank you, {form.getValues("name").split(" ")[0]}!</h3>
              <p className="text-green-700 mt-1">Your enquiry has been received. Reference ID: <strong>{referenceId}</strong></p>
              <p className="text-green-700 mt-1">Our team will call you back on <strong>{form.getValues("phone")}</strong> during business hours.</p>
              <div className="mt-4">
                <a
                  href={getWhatsAppUrlForLead({
                    name: form.getValues("name"),
                    phone: form.getValues("phone"),
                    service: form.getValues("service"),
                    referenceId,
                  })}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-medium text-foreground bg-[#25D366] hover:bg-[#25D366]/90 px-4 py-2 rounded-md transition-colors"
                >
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.472.099-.174.05-.372-.025-.52-.075-.148-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.29.173-1.414z" />
                  </svg>
                  Send this enquiry on WhatsApp
                </a>
              </div>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => {
                  form.reset();
                  setSubmitStatus("idle");
                }}
              >
                Submit another enquiry
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className={cn("space-y-6", className)} noValidate>
      <div>
        <h3 className="text-headline-lg text-foreground mb-1">{title}</h3>
        <p className="text-muted-foreground text-body-md">{subtitle}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="name" className="flex items-center gap-1">
            Full name <span className="text-destructive" aria-hidden="true">*</span>
          </Label>
          <Input
            id="name"
            placeholder="Your name"
            autoComplete="name"
            {...form.register("name")}
            aria-invalid={form.formState.errors.name ? "true" : "false"}
            aria-describedby={form.formState.errors.name ? "name-error" : undefined}
          />
          {form.formState.errors.name && (
            <p id="name-error" className="text-sm text-destructive" role="alert">
              {form.formState.errors.name.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="phone" className="flex items-center gap-1">
            Phone / WhatsApp <span className="text-destructive" aria-hidden="true">*</span>
          </Label>
          <Input
            id="phone"
            type="tel"
            placeholder="98XXXXXXXX"
            inputMode="tel"
            autoComplete="tel"
            {...form.register("phone")}
            aria-invalid={form.formState.errors.phone ? "true" : "false"}
            aria-describedby={form.formState.errors.phone ? "phone-error" : undefined}
          />
          {form.formState.errors.phone && (
            <p id="phone-error" className="text-sm text-destructive" role="alert">
              {form.formState.errors.phone.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5 md:col-span-2">
          <Label htmlFor="email">Email (optional)</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@company.com"
            inputMode="email"
            autoComplete="email"
            {...form.register("email")}
            aria-invalid={form.formState.errors.email ? "true" : "false"}
            aria-describedby={form.formState.errors.email ? "email-error" : undefined}
          />
          {form.formState.errors.email && (
            <p id="email-error" className="text-sm text-destructive" role="alert">
              {form.formState.errors.email.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="company">Company (optional)</Label>
          <Input
            id="company"
            placeholder="Business name"
            autoComplete="organization"
            {...form.register("company")}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            placeholder="e.g. Koteshwor, Kathmandu"
            {...form.register("location")}
          />
        </div>

        <div className="space-y-1.5 md:col-span-2">
          <Label htmlFor="service">Service needed</Label>
          <Select
            {...form.register("service")}
            value={selectedService || ""}
            onValueChange={(value) => form.setValue("service", value)}
          >
            <SelectTrigger id="service" aria-invalid={form.formState.errors.service ? "true" : "false"}>
              <SelectValue placeholder="Select a service" />
            </SelectTrigger>
            <SelectContent>
              {SERVICE_OPTIONS.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {form.formState.errors.service && (
            <p className="text-sm text-destructive" role="alert">
              {form.formState.errors.service.message}
            </p>
          )}
        </div>

        {showBooking && (
          <>
            <div className="space-y-1.5">
              <Label htmlFor="preferredDate">Preferred date (optional)</Label>
              <Input
                id="preferredDate"
                type="date"
                {...form.register("preferredDate")}
                min={new Date().toISOString().split("T")[0]}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="contactVia">How should we reach you?</Label>
              <Select
                {...form.register("contactVia")}
                value={selectedContactVia || ""}
                onValueChange={(value) => form.setValue("contactVia", value)}
              >
                <SelectTrigger id="contactVia">
                  <SelectValue placeholder="Select contact method" />
                </SelectTrigger>
                <SelectContent>
                  {CONTACT_VIA_OPTIONS.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </>
        )}

        <div className="space-y-1.5 md:col-span-2">
          <Label htmlFor="message" className="flex items-center gap-1">
            How can we help? <span className="text-destructive" aria-hidden="true">*</span>
          </Label>
          <Textarea
            id="message"
            placeholder="Tell us about your requirement…"
            rows={4}
            {...form.register("message")}
            aria-invalid={form.formState.errors.message ? "true" : "false"}
            aria-describedby={form.formState.errors.message ? "message-error" : undefined}
          />
          {form.formState.errors.message && (
            <p id="message-error" className="text-sm text-destructive" role="alert">
              {form.formState.errors.message.message}
            </p>
          )}
        </div>

        <div className="md:col-span-2">
          <div className="flex items-start gap-2">
            <Checkbox
              id="consent"
              checked={form.getValues("consent")}
              onCheckedChange={handleConsentChange}
              aria-invalid={form.formState.errors.consent ? "true" : "false"}
            />
            <Label htmlFor="consent" className="text-sm text-muted-foreground mt-0.5 leading-relaxed">
              I agree to be contacted about my enquiry by call, SMS, email or WhatsApp.
              <span className="text-destructive" aria-hidden="true">*</span>
              <span className="text-muted-foreground"> (Required — we never share your details.)</span>
            </Label>
          </div>
          {form.formState.errors.consent && (
            <p className="text-sm text-destructive mt-1" role="alert">
              {form.formState.errors.consent.message}
            </p>
          )}
        </div>
      </div>

      <Button type="submit" className="w-full md:w-auto" size="lg" loading={isSubmitting}>
        {submitText}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Prefer talking?{" "}
        <a href={getTelUrl("+9779813714582")} className="text-primary hover:underline font-medium">
          📞 +977 9813714582
        </a>
      </p>
    </form>
  );
}