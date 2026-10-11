import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPhone(phone: string): string {
  if (!phone) return "";
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.startsWith("977")) {
    return `+977 ${cleaned.slice(3, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`;
  }
  return phone;
}

export function getWhatsAppUrl(phone: string = "9779813714582", message?: string): string {
  if (!phone) phone = "9779813714582";
  const cleaned = phone.replace(/\D/g, "");
  const baseUrl = `https://wa.me/${cleaned}`;
  if (message) {
    return `${baseUrl}?text=${encodeURIComponent(message)}`;
  }
  return baseUrl;
}

export function getTelUrl(phone: string): string {
  if (!phone) return "";
  const cleaned = phone.replace(/\D/g, "");
  return `tel:+${cleaned}`;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length).trim() + "…";
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function formatDate(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleDateString("en-NP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatDateShort(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleDateString("en-NP", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}