import { defineField, defineType } from "sanity";

export const product = defineType({
  name: "product",
  title: "Product / Platform",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Product Title",
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
      name: "shortDescription",
      title: "Short Description",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "tagline",
      title: "Tagline",
      type: "string",
    }),
    defineField({
      name: "badge",
      title: "Badge",
      type: "string",
      options: {
        list: ["FREE · LIVE NOW", "REQUEST DEMO · COMING SOON", "BETA ACCESS", "ENTERPRISE"],
      },
    }),
    defineField({
      name: "icon",
      title: "Icon (Lucide name)",
      type: "string",
    }),
    defineField({
      name: "purpose",
      title: "Purpose & Target Audience",
      type: "array",
      of: [{ type: "block" }],
    }),
    defineField({
      name: "coreCapabilities",
      title: "Core Capabilities",
      type: "array",
      of: [{ type: "string" }],
    }),
    defineField({
      name: "businessBenefits",
      title: "Business Benefits",
      type: "array",
      of: [{ type: "string" }],
    }),
    defineField({
      name: "integrationOptions",
      title: "Integration Options",
      type: "array",
      of: [{ type: "string" }],
    }),
    defineField({
      name: "screenshots",
      title: "Screenshots",
      type: "array",
      of: [{ type: "image", options: { hotspot: true } }],
    }),
    defineField({
      name: "demoUrl",
      title: "Demo URL",
      type: "url",
    }),
    defineField({
      name: "ctaText",
      title: "CTA Text",
      type: "string",
      initialValue: "Request a Demo",
    }),
    defineField({
      name: "ctaLink",
      title: "CTA Link",
      type: "string",
    }),
    defineField({
      name: "isFree",
      title: "Free Tier Available",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "freeTierDetails",
      title: "Free Tier Details",
      type: "text",
    }),
    defineField({
      name: "order",
      title: "Display Order",
      type: "number",
    }),
    defineField({
      name: "isActive",
      title: "Active",
      type: "boolean",
      initialValue: true,
    }),
    defineField({
      name: "seo",
      title: "SEO Override",
      type: "object",
      fields: [
        { name: "title", title: "SEO Title", type: "string" },
        { name: "description", title: "SEO Description", type: "text" },
        { name: "ogImage", title: "OG Image", type: "image" },
      ],
    }),
  ],
});