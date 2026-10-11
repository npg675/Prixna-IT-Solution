import { defineField, defineType } from "sanity";

export const service = defineType({
  name: "service",
  title: "Service / Solution",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
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
      name: "icon",
      title: "Icon (Lucide name)",
      type: "string",
      description: "Lucide icon name (e.g., 'Server', 'ShoppingCart', 'Shield', 'Cpu')",
    }),
    defineField({
      name: "category",
      title: "Category",
      type: "string",
      options: {
        list: [
          "Software & SaaS",
          "Custom Development",
          "Hardware & Infrastructure",
          "Security & Surveillance",
          "Networking & Servers",
          "Support & Maintenance",
          "Digital Marketing & AI",
        ],
      },
    }),
    defineField({
      name: "businessProblem",
      title: "Business Problem",
      type: "array",
      of: [{ type: "block" }],
    }),
    defineField({
      name: "proposedSolution",
      title: "Proposed Solution",
      type: "array",
      of: [{ type: "block" }],
    }),
    defineField({
      name: "benefits",
      title: "Key Benefits",
      type: "array",
      of: [{ type: "string" }],
    }),
    defineField({
      name: "scopeOfService",
      title: "Scope of Service",
      type: "array",
      of: [{ type: "string" }],
    }),
    defineField({
      name: "implementationApproach",
      title: "Implementation Approach",
      type: "array",
      of: [{ type: "block" }],
    }),
    defineField({
      name: "ctaText",
      title: "CTA Text",
      type: "string",
      initialValue: "Request a Consultation",
    }),
    defineField({
      name: "ctaLink",
      title: "CTA Link",
      type: "string",
      initialValue: "/contact",
    }),
    defineField({
      name: "featuredImage",
      title: "Featured Image",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "gallery",
      title: "Gallery",
      type: "array",
      of: [{ type: "image", options: { hotspot: true } }],
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