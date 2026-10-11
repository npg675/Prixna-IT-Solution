import { type SchemaTypeDefinition } from "sanity";
import { service } from "./service";
import { industry } from "./industry";
import { product } from "./product";
import { caseStudy } from "./caseStudy";
import { blogPost } from "./blogPost";
import { page } from "./page";
import { siteSettings } from "./siteSettings";

export const schemaTypes: SchemaTypeDefinition[] = [
  siteSettings,
  service,
  industry,
  product,
  caseStudy,
  blogPost,
  page,
];