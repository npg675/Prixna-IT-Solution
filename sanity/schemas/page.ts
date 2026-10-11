import { defineField, defineType } from "sanity";

export const page = defineType({
  name: "page",
  title: "Page",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Page Title",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "pageType",
      title: "Page Type",
      type: "string",
      options: {
        list: ["Home", "About", "Contact", "Landing", "Custom"],
      },
    }),
    defineField({
      name: "sections",
      title: "Page Sections",
      type: "array",
      of: [
        { type: "hero" },
        { type: "trustBar" },
        { type: "servicesGrid" },
        { type: "productsGrid" },
        { type: "industriesGrid" },
        { type: "whyChoose" },
        { type: "testimonials" },
        { type: "processSteps" },
        { type: "resources" },
        { type: "ctaBand" },
        { type: "richText" },
        { type: "stats" },
        { type: "logoCloud" },
      ],
    }),
    defineField({
      name: "seo",
      title: "SEO",
      type: "object",
      fields: [
        { name: "title", title: "SEO Title", type: "string" },
        { name: "description", title: "SEO Description", type: "text" },
        { name: "ogImage", title: "OG Image", type: "image" },
        { name: "noIndex", title: "No Index", type: "boolean" },
      ],
    }),
  ],
});

// Section schemas
const hero = defineType({
  name: "hero",
  title: "Hero Section",
  type: "object",
  fields: [
    { name: "headline", title: "Headline", type: "string" },
    { name: "subheadline", title: "Subheadline", type: "text" },
    { name: "primaryCtaText", title: "Primary CTA Text", type: "string" },
    { name: "primaryCtaLink", title: "Primary CTA Link", type: "string" },
    { name: "secondaryCtaText", title: "Secondary CTA Text", type: "string" },
    { name: "secondaryCtaLink", title: "Secondary CTA Link", type: "string" },
    { name: "backgroundImage", title: "Background Image", type: "image" },
    { name: "showTrustIndicators", title: "Show Trust Indicators", type: "boolean" },
  ],
});

const trustBar = defineType({
  name: "trustBar",
  title: "Trust Bar",
  type: "object",
  fields: [
    {
      name: "items",
      title: "Trust Items",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            { name: "icon", title: "Icon (Lucide)", type: "string" },
            { name: "title", title: "Title", type: "string" },
            { name: "description", title: "Description", type: "string" },
          ],
        },
      ],
    },
  ],
});

const servicesGrid = defineType({
  name: "servicesGrid",
  title: "Services Grid",
  type: "object",
  fields: [
    { name: "title", title: "Section Title", type: "string" },
    { name: "subtitle", title: "Subtitle", type: "text" },
    { name: "services", title: "Services", type: "array", of: [{ type: "reference", to: [{ type: "service" }] }] },
    { name: "viewAllText", title: "View All Text", type: "string" },
    { name: "viewAllLink", title: "View All Link", type: "string" },
  ],
});

const productsGrid = defineType({
  name: "productsGrid",
  title: "Products Grid",
  type: "object",
  fields: [
    { name: "title", title: "Section Title", type: "string" },
    { name: "subtitle", title: "Subtitle", type: "text" },
    { name: "products", title: "Products", type: "array", of: [{ type: "reference", to: [{ type: "product" }] }] },
  ],
});

const industriesGrid = defineType({
  name: "industriesGrid",
  title: "Industries Grid",
  type: "object",
  fields: [
    { name: "title", title: "Section Title", type: "string" },
    { name: "subtitle", title: "Subtitle", type: "text" },
    { name: "industries", title: "Industries", type: "array", of: [{ type: "reference", to: [{ type: "industry" }] }] },
    { name: "viewAllText", title: "View All Text", type: "string" },
    { name: "viewAllLink", title: "View All Link", type: "string" },
  ],
});

const whyChoose = defineType({
  name: "whyChoose",
  title: "Why Choose Us",
  type: "object",
  fields: [
    { name: "title", title: "Section Title", type: "string" },
    { name: "subtitle", title: "Subtitle", type: "text" },
    {
      name: "points",
      title: "Points",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            { name: "title", title: "Title", type: "string" },
            { name: "description", title: "Description", type: "text" },
            { name: "icon", title: "Icon (Lucide)", type: "string" },
          ],
        },
      ],
    },
  ],
});

const testimonials = defineType({
  name: "testimonials",
  title: "Testimonials",
  type: "object",
  fields: [
    { name: "title", title: "Section Title", type: "string" },
    { name: "subtitle", title: "Subtitle", type: "text" },
    {
      name: "items",
      title: "Testimonials",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            { name: "quote", title: "Quote", type: "text" },
            { name: "author", title: "Author Name", type: "string" },
            { name: "role", title: "Role/Company", type: "string" },
            { name: "rating", title: "Rating (1-5)", type: "number" },
            { name: "source", title: "Source (e.g., Google Maps)", type: "string" },
            { name: "sourceUrl", title: "Source URL", type: "url" },
          ],
        },
      ],
    },
  ],
});

const processSteps = defineType({
  name: "processSteps",
  title: "Process Steps",
  type: "object",
  fields: [
    { name: "title", title: "Section Title", type: "string" },
    { name: "subtitle", title: "Subtitle", type: "text" },
    {
      name: "steps",
      title: "Steps",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            { name: "number", title: "Step Number", type: "string" },
            { name: "title", title: "Title", type: "string" },
            { name: "description", title: "Description", type: "string" },
          ],
        },
      ],
    },
    { name: "ctaText", title: "CTA Text", type: "string" },
    { name: "ctaLink", title: "CTA Link", type: "string" },
  ],
});

const resources = defineType({
  name: "resources",
  title: "Resources / Insights",
  type: "object",
  fields: [
    { name: "title", title: "Section Title", type: "string" },
    { name: "subtitle", title: "Subtitle", type: "text" },
    { name: "posts", title: "Posts", type: "array", of: [{ type: "reference", to: [{ type: "blogPost" }] }] },
    { name: "viewAllText", title: "View All Text", type: "string" },
    { name: "viewAllLink", title: "View All Link", type: "string" },
  ],
});

const ctaBand = defineType({
  name: "ctaBand",
  title: "CTA Band",
  type: "object",
  fields: [
    { name: "headline", title: "Headline", type: "string" },
    { name: "description", title: "Description", type: "text" },
    {
      name: "buttons",
      title: "Buttons",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            { name: "text", title: "Button Text", type: "string" },
            { name: "link", title: "Link", type: "string" },
            { name: "variant", title: "Variant", type: "string", options: { list: ["primary", "outline", "white", "whatsapp"] } },
          ],
        },
      ],
    },
  ],
});

const richText = defineType({
  name: "richText",
  title: "Rich Text Section",
  type: "object",
  fields: [
    { name: "content", title: "Content", type: "array", of: [{ type: "block" }] },
  ],
});

const stats = defineType({
  name: "stats",
  title: "Statistics",
  type: "object",
  fields: [
    {
      name: "items",
      title: "Stat Items",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            { name: "value", title: "Value", type: "string" },
            { name: "label", title: "Label", type: "string" },
          ],
        },
      ],
    },
  ],
});

const logoCloud = defineType({
  name: "logoCloud",
  title: "Client Logo Cloud",
  type: "object",
  fields: [
    { name: "title", title: "Section Title", type: "string" },
    {
      name: "logos",
      title: "Logos",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            { name: "name", title: "Client Name", type: "string" },
            { name: "logo", title: "Logo Image", type: "image" },
            { name: "url", title: "Website URL", type: "url" },
          ],
        },
      ],
    },
  ],
});