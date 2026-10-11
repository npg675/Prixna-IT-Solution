import { defineField, defineType } from "sanity";

export const siteSettings = defineType({
  name: "siteSettings",
  title: "Site Settings",
  type: "document",
  fields: [
    defineField({
      name: "companyName",
      title: "Company Name",
      type: "string",
      initialValue: "Prixna IT Solution Pvt. Ltd.",
    }),
    defineField({
      name: "tagline",
      title: "Tagline",
      type: "string",
      initialValue: "Complete Business Technology. One Trusted Partner.",
    }),
    defineField({
      name: "phone",
      title: "Phone Number",
      type: "string",
      initialValue: "+977 9813714582",
    }),
    defineField({
      name: "whatsappNumber",
      title: "WhatsApp Number (country code + number, no +)",
      type: "string",
      initialValue: "9779813714582",
    }),
    defineField({
      name: "email",
      title: "Email",
      type: "string",
      initialValue: "info@prixnaitsolution.com.np",
    }),
    defineField({
      name: "address",
      title: "Address",
      type: "string",
      initialValue: "Koteshwor-32, Kathmandu, Nepal",
    }),
    defineField({
      name: "hours",
      title: "Business Hours",
      type: "string",
      initialValue: "Sun–Fri, 9:30 AM – 6:30 PM (Sat: closed)",
    }),
    defineField({
      name: "mapsUrl",
      title: "Google Maps URL",
      type: "url",
      initialValue: "https://maps.google.com/?cid=5858322710047837393",
    }),
    defineField({
      name: "reviewUrl",
      title: "Google Review URL",
      type: "url",
      initialValue: "https://search.google.com/local/writereview?placeid=ChIJLeSgRjcZ6zkR0UwBUHfxTFE",
    }),
    defineField({
      name: "facebookUrl",
      title: "Facebook URL",
      type: "url",
      initialValue: "https://www.facebook.com/prixnaitsolution",
    }),
    defineField({
      name: "jigriToolsUrl",
      title: "JigriTools URL",
      type: "url",
      initialValue: "https://jigritools.com/",
    }),
    defineField({
      name: "logo",
      title: "Logo",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "seo",
      title: "Global SEO",
      type: "object",
      fields: [
        { name: "title", title: "Default Title", type: "string" },
        { name: "description", title: "Default Description", type: "text" },
        { name: "ogImage", title: "Default OG Image", type: "image" },
      ],
    }),
  ],
});