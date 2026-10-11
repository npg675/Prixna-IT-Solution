"use client";

import * as React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, Calendar, Clock, ArrowRight, Share2, Facebook, Twitter, Linkedin, Mail, Link2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ConsultationForm } from "@/components/forms/ConsultationForm";
import { formatDate, getWhatsAppUrl } from "@/lib/utils";
import { cn } from "@/lib/utils";

export interface InsightArticleData {
  title: string;
  category: string;
  excerpt: string;
  author: { name: string; role: string; image?: string };
  publishDate: string;
  readTime: string;
  tags: string[];
  content: Array<{
    type: "paragraph" | "heading" | "list" | "cta";
    content?: string;
    items?: string[];
    text?: string;
    link?: string;
  }>;
  relatedArticles: Array<{ title: string; href: string; category: string }>;
}

interface InsightArticlePageProps {
  data: InsightArticleData;
}

export function InsightArticlePage({ data }: InsightArticlePageProps) {
  const [showShare, setShowShare] = React.useState(false);

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
  const shareTitle = data.title;

  const handleShare = (platform: string) => {
    let url = "";
    switch (platform) {
      case "facebook":
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
        break;
      case "twitter":
        url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareTitle)}&url=${encodeURIComponent(shareUrl)}`;
        break;
      case "linkedin":
        url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
        break;
      case "whatsapp":
        url = getWhatsAppUrl(`Check out this article: ${shareTitle} ${shareUrl}`);
        break;
      case "email":
        url = `mailto:?subject=${encodeURIComponent(shareTitle)}&body=${encodeURIComponent(shareUrl)}`;
        break;
      default:
        return;
    }
    window.open(url, "_blank", "width=600,height=400");
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(shareUrl);
  };

  return (
    <>
      <section className="section bg-background pt-24">
        <div className="container-custom max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Link
              href="/insights"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-6"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Back to Insights
            </Link>
            <div className="flex items-center gap-3 mb-4">
              <Badge variant="outline">{data.category}</Badge>
              <span className="text-muted-foreground text-sm flex items-center gap-1">
                <Calendar className="h-3 w-3" aria-hidden="true" />
                {formatDate(data.publishDate)}
              </span>
              <span className="text-muted-foreground text-sm flex items-center gap-1">
                <Clock className="h-3 w-3" aria-hidden="true" />
                {data.readTime}
              </span>
            </div>
            <h1 className="text-display-md text-foreground mb-4">{data.title}</h1>
            <p className="text-muted-foreground text-body-lg mb-8">{data.excerpt}</p>

            <div className="flex items-center gap-4 pb-8 border-b border-border">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="text-primary font-medium">{data.author.name.charAt(0)}</span>
                </div>
                <div>
                  <p className="font-medium text-foreground">{data.author.name}</p>
                  <p className="text-muted-foreground text-sm">{data.author.role}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 ml-auto">
                <button onClick={() => setShowShare(!showShare)} className="p-2 rounded-lg hover:bg-secondary dark:hover:bg-secondary transition-colors" aria-label="Share">
                  <Share2 className="h-5 w-5 text-muted-foreground" />
                </button>
              </div>
            </div>

            {showShare && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute right-0 top-full mt-2 p-3 bg-background border border-border rounded-lg shadow-lg z-10 flex gap-2"
              >
                <button onClick={() => handleShare("facebook")} className="p-2 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors" aria-label="Share on Facebook">
                  <Facebook className="h-5 w-5 text-blue-600" />
                </button>
                <button onClick={() => handleShare("twitter")} className="p-2 rounded-lg hover:bg-sky-100 dark:hover:bg-sky-900/30 transition-colors" aria-label="Share on Twitter">
                  <Twitter className="h-5 w-5 text-sky-500" />
                </button>
                <button onClick={() => handleShare("linkedin")} className="p-2 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors" aria-label="Share on LinkedIn">
                  <Linkedin className="h-5 w-5 text-blue-700" />
                </button>
                <button onClick={() => handleShare("whatsapp")} className="p-2 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors" aria-label="Share on WhatsApp">
                  <svg className="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.472.099-.174.05-.372-.025-.52-.075-.148-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.29.173-1.414z"/></svg>
                </button>
                <button onClick={() => handleShare("email")} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" aria-label="Share via Email">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                </button>
                <button onClick={copyLink} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" aria-label="Copy link">
                  <Link2 className="h-5 w-5 text-muted-foreground" />
                </button>
              </motion.div>
            )}
          </motion.div>

          <motion.article
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="prose prose-navy max-w-none"
          >
            {data.content.map((block, index) => {
              switch (block.type) {
                case "paragraph":
                  return <p key={index} className="text-body-md text-muted-foreground mb-6">{block.content}</p>;
                case "heading":
                  return <h2 key={index} className="text-headline-lg text-foreground mb-4 mt-10">{block.content}</h2>;
                case "list":
                  return (
                    <ul key={index} className="space-y-3 mb-6 ml-6 list-disc">
                      {block.items?.map((item, i) => (
                        <li key={i} className="text-body-md text-muted-foreground">{item}</li>
                      ))}
                    </ul>
                  );
                case "cta":
                  return (
                    <div key={index} className="my-10 p-6 bg-primary/20 border border-primary/50 rounded-xl text-center">
                      <p className="text-body-md text-foreground mb-4">{block.text}</p>
                      <Button asChild variant="default" size="lg">
                        <Link href={block.link ?? "/contact"}>{block.text}</Link>
                      </Button>
                    </div>
                  );
                default:
                  return null;
              }
            })}

            <div className="mt-12 pt-8 border-t border-border">
              <h3 className="text-headline-md text-foreground mb-4">Tags</h3>
              <div className="flex flex-wrap gap-2 mb-8">
                {data.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                ))}
              </div>
            </div>

            {/* Related Articles */}
            {data.relatedArticles.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <h3 className="text-headline-md text-foreground mb-6">Related Articles</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  {data.relatedArticles.map((article) => (
                    <Card key={article.href} className="group hover:shadow-card-hover transition-all duration-300">
                      <CardContent className="p-6 flex flex-col h-full">
                        <Badge variant="outline" className="text-xs mb-3">{article.category}</Badge>
                        <Link
                          href={article.href}
                          className="text-headline-sm text-foreground hover:text-primary transition-colors group mb-2 block"
                        >
                          {article.title}
                        </Link>
                        <Link
                          href={article.href}
                          className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary transition-colors group mt-auto"
                        >
                          Read article →
                          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                        </Link>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Newsletter / Consultation CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mt-16 p-8 bg-background text-foreground rounded-2xl"
            >
              <div className="max-w-2xl mx-auto text-center">
                <h3 className="text-headline-lg text-foreground mb-4">Want More Practical Guides?</h3>
                <p className="text-muted-foreground text-body-md mb-6">
                  We publish weekly articles on business software, IT infrastructure, and technology for Nepal. Get them delivered to your inbox.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button asChild variant="white" size="lg">
                    <Link href="/contact?service=Free%20Business%20Consultation">Get Free Consultation</Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="border-white/30 hover:bg-white/10">
                    <a href="https://wa.me/9779813714582?text=Hello%20Prixna%20IT%20Solution%2C%20I%20want%20to%20receive%20your%20weekly%20tech%20guides." target="_blank" rel="noopener noreferrer">
                      Subscribe via WhatsApp
                    </a>
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.article>
        </div>
      </section>
    </>
  );
}