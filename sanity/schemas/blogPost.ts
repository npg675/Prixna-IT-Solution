import { defineField, defineType } from "sanity";

export const blogPost = defineType({
  name: "blogPost",
  title: "Insights / Blog Post",
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
      name: "excerpt",
      title: "Excerpt",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "category",
      title: "Category",
      type: "string",
      options: {
        list: [
          "Business Software",
          "IT Infrastructure",
          "Cybersecurity",
          "Digital Transformation",
          "Industry Technology",
          "Productivity",
          "Case Study",
        ],
      },
    }),
    defineField({
      name: "tags",
      title: "Tags",
      type: "array",
      of: [{ type: "string" }],
    }),
    defineField({
      name: "author",
      title: "Author",
      type: "object",
      fields: [
        { name: "name", title: "Name", type: "string" },
        { name: "role", title: "Role", type: "string" },
        { name: "image", title: "Photo", type: "image" },
      ],
    }),
    defineField({
      name: "featuredImage",
      title: "Featured Image",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "content",
      title: "Content",
      type: "array",
      of: [
        { type: "block" },
        { type: "image", options: { hotspot: true } },
        {
          name: "codeBlock",
          title: "Code Block",
          type: "object",
          fields: [
            { name: "language", title: "Language", type: "string" },
            { name: "code", title: "Code", type: "text" },
          ],
        },
      ],
    }),
    defineField({
      name: "relatedPosts",
      title: "Related Posts",
      type: "array",
      of: [
        {
          type: "reference",
          to: [{ type: "blogPost" }],
        },
      ],
    }),
    defineField({
      name: "publishedAt",
      title: "Published Date",
      type: "datetime",
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