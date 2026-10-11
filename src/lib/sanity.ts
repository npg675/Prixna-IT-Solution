import { createClient } from "next-sanity";
import imageUrlBuilder from "@sanity/image-url";
import type { SanityImageSource } from "@sanity/image-url/lib/types/types";

export const sanityConfig = {
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "your-project-id",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2024-07-01",
  useCdn: process.env.NODE_ENV === "production",
};

export const sanityClient = createClient(sanityConfig);

const builder = imageUrlBuilder(sanityClient);

export function urlFor(source: SanityImageSource) {
  return builder.image(source);
}

export async function getSiteSettings() {
  return sanityClient.fetch(`*[_type == "siteSettings"][0]`);
}

export async function getServices() {
  return sanityClient.fetch(`
    *[_type == "service" && isActive == true] | order(order asc) {
      _id,
      title,
      slug,
      shortDescription,
      icon,
      category,
      businessProblem,
      proposedSolution,
      benefits,
      scopeOfService,
      implementationApproach,
      ctaText,
      ctaLink,
      featuredImage,
      gallery,
      seo
    }
  `);
}

export async function getServiceBySlug(slug: string) {
  return sanityClient.fetch(`
    *[_type == "service" && slug.current == $slug][0] {
      _id,
      title,
      slug,
      shortDescription,
      icon,
      category,
      businessProblem,
      proposedSolution,
      benefits,
      scopeOfService,
      implementationApproach,
      ctaText,
      ctaLink,
      featuredImage,
      gallery,
      seo
    }
  `, { slug });
}

export async function getIndustries() {
  return sanityClient.fetch(`
    *[_type == "industry" && isActive == true] | order(order asc) {
      _id,
      title,
      slug,
      description,
      icon,
      challenges,
      typicalSetup,
      "relatedServices": relatedServices[]->{_id, title, slug, shortDescription, icon},
      "relatedProducts": relatedProducts[]->{_id, title, slug, shortDescription, badge, icon},
      "caseStudies": caseStudies[]->{_id, title, slug, clientName, images, outcomes},
      ctaText,
      featuredImage,
      seo
    }
  `);
}

export async function getIndustryBySlug(slug: string) {
  return sanityClient.fetch(`
    *[_type == "industry" && slug.current == $slug][0] {
      _id,
      title,
      slug,
      description,
      icon,
      challenges,
      typicalSetup,
      "relatedServices": relatedServices[]->{_id, title, slug, shortDescription, icon},
      "relatedProducts": relatedProducts[]->{_id, title, slug, shortDescription, badge, icon},
      "caseStudies": caseStudies[]->{_id, title, slug, clientName, images, outcomes},
      ctaText,
      featuredImage,
      seo
    }
  `, { slug });
}

export async function getProducts() {
  return sanityClient.fetch(`
    *[_type == "product" && isActive == true] | order(order asc) {
      _id,
      title,
      slug,
      shortDescription,
      tagline,
      badge,
      icon,
      purpose,
      coreCapabilities,
      businessBenefits,
      integrationOptions,
      screenshots,
      demoUrl,
      ctaText,
      ctaLink,
      isFree,
      freeTierDetails,
      seo
    }
  `);
}

export async function getProductBySlug(slug: string) {
  return sanityClient.fetch(`
    *[_type == "product" && slug.current == $slug][0] {
      _id,
      title,
      slug,
      shortDescription,
      tagline,
      badge,
      icon,
      purpose,
      coreCapabilities,
      businessBenefits,
      integrationOptions,
      screenshots,
      demoUrl,
      ctaText,
      ctaLink,
      isFree,
      freeTierDetails,
      seo
    }
  `, { slug });
}

export async function getCaseStudies(featuredOnly = false) {
  const filter = featuredOnly ? '&& isFeatured == true' : '';
  return sanityClient.fetch(`
    *[_type == "caseStudy" && isPublished == true ${filter}] | order(publishedAt desc) {
      _id,
      title,
      slug,
      clientName,
      "industry": industry->{_id, title, slug},
      "services": services[]->{_id, title, slug},
      "products": products[]->{_id, title, slug},
      challenge,
      solution,
      outcomes,
      clientQuote,
      clientRole,
      images,
      beforeAfterImages,
      duration,
      teamSize,
      publishedAt,
      seo
    }
  `);
}

export async function getCaseStudyBySlug(slug: string) {
  return sanityClient.fetch(`
    *[_type == "caseStudy" && slug.current == $slug && isPublished == true][0] {
      _id,
      title,
      slug,
      clientName,
      "industry": industry->{_id, title, slug},
      "services": services[]->{_id, title, slug},
      "products": products[]->{_id, title, slug},
      challenge,
      solution,
      outcomes,
      clientQuote,
      clientRole,
      images,
      beforeAfterImages,
      duration,
      teamSize,
      publishedAt,
      seo
    }
  `, { slug });
}

export async function getBlogPosts(limit?: number) {
  const limitClause = limit ? `[0...${limit}]` : '';
  return sanityClient.fetch(`
    *[_type == "blogPost" && isPublished == true] | order(publishedAt desc) ${limitClause} {
      _id,
      title,
      slug,
      excerpt,
      category,
      tags,
      author,
      featuredImage,
      publishedAt,
      isFeatured,
      seo
    }
  `);
}

export async function getBlogPostBySlug(slug: string) {
  return sanityClient.fetch(`
    *[_type == "blogPost" && slug.current == $slug && isPublished == true][0] {
      _id,
      title,
      slug,
      excerpt,
      category,
      tags,
      author,
      featuredImage,
      content,
      "relatedPosts": relatedPosts[]->{_id, title, slug, excerpt, category, featuredImage},
      publishedAt,
      seo
    }
  `, { slug });
}

export async function getPageBySlug(slug: string) {
  return sanityClient.fetch(`
    *[_type == "page" && slug.current == $slug][0] {
      _id,
      title,
      slug,
      pageType,
      sections,
      seo
    }
  `, { slug });
}