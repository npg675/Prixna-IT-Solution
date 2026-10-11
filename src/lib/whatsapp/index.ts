const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "9779813714582";

export function getWhatsAppUrl(message?: string): string {
  const baseUrl = `https://wa.me/${WHATSAPP_NUMBER}`;
  if (message) {
    return `${baseUrl}?text=${encodeURIComponent(message)}`;
  }
  return baseUrl;
}

export function getWhatsAppUrlForLead(data: {
  name: string;
  phone: string;
  service?: string;
  referenceId: string;
}): string {
  const message = `Hello Prixna IT Solution, I am ${data.name} (${data.phone}). I am interested in: ${data.service || "a consultation"}. My reference: ${data.referenceId}`;
  return getWhatsAppUrl(message);
}

export function getWhatsAppUrlForService(service: string): string {
  const message = `Hello Prixna IT Solution, I would like to know more about ${service}. Can we schedule a free consultation?`;
  return getWhatsAppUrl(message);
}

export function getWhatsAppUrlForProduct(productName: string): string {
  const message = `Hello Prixna IT Solution, I'm interested in ${productName}. Could you share more details and pricing?`;
  return getWhatsAppUrl(message);
}