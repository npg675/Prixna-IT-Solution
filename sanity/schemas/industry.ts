import { defineField, defineType } from "sanity";

export const industry = defineType({
  name: "industry",
  title: "Industry Solution",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Industry Title",
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
      name: "description",
      title: "Description",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "icon",
      title: "Icon (Lucide name)",
      type: "string",
    }),
    defineField({
      name: "challenges",
      title: "Common Challenges",
      type: "array",
      of: [{ type: "string" }],
    }),
    defineField({
      name: "typicalSetup",
      title: "Typical Technology Setup",
      type: "array",
      of: [{ type: "string" }],
    }),
    defineField({
      name: "relatedServices",
      title: "Related Services",
      type: "array",
      of: [
        {
          type: "reference",
          to: [{ type: "service" }],
        },
      ],
    }),
    defineField({
      name: "relatedProducts",
      title: "Related Products",
      type: "array",
      of: [
        {
          type: "reference",
          to: [{ type: "product" }],
        },
      ],
    }),
    defineField({
      name: "caseStudies",
      title: "Relevant Case Studies",
      type: "array",
      of: [
        {
          type: "reference",
          to: [{ type: "caseStudy" }],
        },
      ],
    }),
    defineField({
      name: "ctaText",
      title: "CTA Text",
      type: "string",
      initialValue: "Discuss Your Industry Needs",
    }),
    defineField({
      name: "featuredImage",
      title: "Featured Image",
      type: "image",
      options: { hotspot: true },
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