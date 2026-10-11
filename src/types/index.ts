// PortableText blocks - loose type to avoid version mismatch between @portabletext/react / types
export type PortableTextBlock = any;
export type SanityImageAsset = any;

export interface SanityImage {
  _type: "image";
  asset: SanityImageAsset;
  alt?: string;
  caption?: string;
}

export interface SEOFields {
  title?: string;
  description?: string;
  ogImage?: SanityImage;
  noIndex?: boolean;
}

export interface SiteSettings {
  _id: string;
  companyName: string;
  tagline: string;
  phone: string;
  whatsappNumber: string;
  email: string;
  address: string;
  hours: string;
  mapsUrl: string;
  reviewUrl: string;
  facebookUrl: string;
  jigriToolsUrl: string;
  logo?: SanityImage;
  seo?: SEOFields;
}

export interface Service {
  _id: string;
  title: string;
  slug: { current: string };
  shortDescription?: string;
  icon?: string;
  category?: string;
  businessProblem?: PortableTextBlock[];
  proposedSolution?: PortableTextBlock[];
  benefits?: string[];
  scopeOfService?: string[];
  implementationApproach?: PortableTextBlock[];
  ctaText?: string;
  ctaLink?: string;
  featuredImage?: SanityImage;
  gallery?: SanityImage[];
  order?: number;
  isActive?: boolean;
  seo?: SEOFields;
}

export interface Industry {
  _id: string;
  title: string;
  slug: { current: string };
  description?: string;
  icon?: string;
  challenges?: string[];
  typicalSetup?: string[];
  relatedServices?: Service[];
  relatedProducts?: Product[];
  caseStudies?: CaseStudy[];
  ctaText?: string;
  featuredImage?: SanityImage;
  order?: number;
  isActive?: boolean;
  seo?: SEOFields;
}

export interface Product {
  _id: string;
  title: string;
  slug: { current: string };
  shortDescription?: string;
  tagline?: string;
  badge?: string;
  icon?: string;
  purpose?: PortableTextBlock[];
  coreCapabilities?: string[];
  businessBenefits?: string[];
  integrationOptions?: string[];
  screenshots?: SanityImage[];
  demoUrl?: string;
  ctaText?: string;
  ctaLink?: string;
  isFree?: boolean;
  freeTierDetails?: string;
  order?: number;
  isActive?: boolean;
  seo?: SEOFields;
}

export interface CaseStudy {
  _id: string;
  title: string;
  slug: { current: string };
  clientName?: string;
  industry?: Industry;
  services?: Service[];
  products?: Product[];
  challenge?: PortableTextBlock[];
  solution?: PortableTextBlock[];
  outcomes?: string[];
  clientQuote?: string;
  clientRole?: string;
  images?: SanityImage[];
  beforeAfterImages?: Array<{
    before: SanityImage;
    after: SanityImage;
    caption?: string;
  }>;
  duration?: string;
  teamSize?: string;
  isPublished?: boolean;
  isFeatured?: boolean;
  publishedAt?: string;
  seo?: SEOFields;
}

export interface BlogPost {
  _id: string;
  title: string;
  slug: { current: string };
  excerpt?: string;
  category?: string;
  tags?: string[];
  author?: {
    name: string;
    role: string;
    image?: SanityImage;
  };
  featuredImage?: SanityImage;
  content?: PortableTextBlock[];
  relatedPosts?: BlogPost[];
  publishedAt?: string;
  isPublished?: boolean;
  isFeatured?: boolean;
  seo?: SEOFields;
}

export interface Page {
  _id: string;
  title: string;
  slug: { current: string };
  pageType?: string;
  sections?: PageSection[];
  seo?: SEOFields;
}

export type PageSection =
  | { _type: "hero"; headline: string; subheadline?: string; primaryCtaText?: string; primaryCtaLink?: string; secondaryCtaText?: string; secondaryCtaLink?: string; backgroundImage?: SanityImage; showTrustIndicators?: boolean }
  | { _type: "trustBar"; items: Array<{ icon: string; title: string; description: string }> }
  | { _type: "servicesGrid"; title: string; subtitle?: string; services: Service[]; viewAllText?: string; viewAllLink?: string }
  | { _type: "productsGrid"; title: string; subtitle?: string; products: Product[] }
  | { _type: "industriesGrid"; title: string; subtitle?: string; industries: Industry[]; viewAllText?: string; viewAllLink?: string }
  | { _type: "whyChoose"; title: string; subtitle?: string; points: Array<{ title: string; description: string; icon: string }> }
  | { _type: "testimonials"; title: string; subtitle?: string; items: Array<{ quote: string; author: string; role: string; rating: number; source: string; sourceUrl: string }> }
  | { _type: "processSteps"; title: string; subtitle?: string; steps: Array<{ number: string; title: string; description: string }>; ctaText?: string; ctaLink?: string }
  | { _type: "resources"; title: string; subtitle?: string; posts: BlogPost[]; viewAllText?: string; viewAllLink?: string }
  | { _type: "ctaBand"; headline: string; description?: string; buttons: Array<{ text: string; link: string; variant: "primary" | "outline" | "white" | "whatsapp" }> }
  | { _type: "richText"; content: PortableTextBlock[] }
  | { _type: "stats"; items: Array<{ value: string; label: string }> }
  | { _type: "logoCloud"; title: string; logos: Array<{ name: string; logo: SanityImage; url: string }> };

export interface LeadFormData {
  name: string;
  phone: string;
  email?: string;
  company?: string;
  location?: string;
  service?: string;
  message: string;
  preferredDate?: string;
  contactVia?: string;
  consent: boolean;
}

export interface Lead extends LeadFormData {
  id: string;
  createdAt: string;
  form: string;
  source: Record<string, unknown>;
  status: "new" | "contacted" | "qualified" | "won" | "lost";
  followUp: string;
  assignee: string;
  history: Array<{ ts: string; note: string }>;
}