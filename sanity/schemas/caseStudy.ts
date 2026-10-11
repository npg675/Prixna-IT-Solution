import { defineField, defineType } from "sanity";

export const caseStudy = defineType({
  name: "caseStudy",
  title: "Case Study / Project",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Project Title",
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
      name: "clientName",
      title: "Client Name (or 'Confidential')",
      type: "string",
    }),
    defineField({
      name: "industry",
      title: "Industry",
      type: "reference",
      to: [{ type: "industry" }],
    }),
    defineField({
      name: "services",
      title: "Services Delivered",
      type: "array",
      of: [
        {
          type: "reference",
          to: [{ type: "service" }],
        },
      ],
    }),
    defineField({
      name: "products",
      title: "Products Used",
      type: "array",
      of: [
        {
          type: "reference",
          to: [{ type: "product" }],
        },
      ],
    }),
    defineField({
      name: "challenge",
      title: "Business Challenge",
      type: "array",
      of: [{ type: "block" }],
    }),
    defineField({
      name: "solution",
      title: "Delivered Solution",
      type: "array",
      of: [{ type: "block" }],
    }),
    defineField({
      name: "outcomes",
      title: "Measurable Outcomes",
      type: "array",
      of: [{ type: "string" }],
    }),
    defineField({
      name: "clientQuote",
      title: "Client Testimonial",
      type: "text",
      rows: 4,
    }),
    defineField({
      name: "clientRole",
      title: "Client Role/Title",
      type: "string",
    }),
    defineField({
      name: "images",
      title: "Project Images",
      type: "array",
      of: [{ type: "image", options: { hotspot: true } }],
    }),
    defineField({
      name: "beforeAfterImages",
      title: "Before/After Images",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            { name: "before", title: "Before Image", type: "image" },
            { name: "after", title: "After Image", type: "image" },
            { name: "caption", title: "Caption", type: "string" },
          ],
        },
      ],
    }),
    defineField({
      name: "duration",
      title: "Project Duration",
      type: "string",
    }),
    defineField({
      name: "teamSize",
      title: "Team Size",
      type: "string",
    }),
    defineField({
      name: "isPublished",
      title: "Published",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "isFeatured",
      title: "Featured on Homepage",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "publishedAt",
      title: "Published Date",
      type: "date",
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