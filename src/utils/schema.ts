// JSON-LD Schema utilities สำหรับ SEO และ LLM optimization
import type { Post, Author } from './sanity';

interface SchemaConfig {
  siteName: string;
  siteUrl: string;
  organizationName: string;
  organizationUrl: string;
  organizationLogo: string;
  organizationEmail: string;
  organizationPhone: string;
}

// ค่าเริ่มต้นสำหรับองค์กร
export const defaultSchemaConfig: SchemaConfig = {
  siteName: 'Blog ไทย',
  siteUrl: 'https://blogthai.com',
  organizationName: 'Blog ไทย',
  organizationUrl: 'https://blogthai.com',
  organizationLogo: 'https://blogthai.com/logo.png',
  organizationEmail: 'contact@blogthai.com',
  organizationPhone: '+66-2-xxx-xxxx'
};

// สร้าง Organization Schema
export function createOrganizationSchema(config: SchemaConfig = defaultSchemaConfig) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": config.organizationName,
    "url": config.organizationUrl,
    "logo": {
      "@type": "ImageObject",
      "url": config.organizationLogo,
      "width": 250,
      "height": 250
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": config.organizationPhone,
      "contactType": "customer service",
      "email": config.organizationEmail,
      "availableLanguage": ["Thai", "English"]
    },
    "sameAs": [
      "https://www.facebook.com/blogthai",
      "https://twitter.com/blogthai",
      "https://www.linkedin.com/company/blogthai"
    ],
    "description": "แหล่งรวมบทความคุณภาพสำหรับนักพัฒนาเว็บไซต์และผู้สนใจเทคโนโลジี การพัฒนาซอฟต์แวร์ และเทคนิคการทำงานแบบ Freelance",
    "foundingDate": "2024",
    "location": {
      "@type": "Place",
      "addressCountry": "TH",
      "addressLocality": "Bangkok"
    }
  };
}

// สร้าง WebSite Schema สำหรับหน้าแรก
export function createWebSiteSchema(config: SchemaConfig = defaultSchemaConfig) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": config.siteName,
    "url": config.siteUrl,
    "description": "แหล่งรวมบทความคุณภาพสำหรับนักพัฒนาเว็บไซต์และผู้สนใจเทคโนโลยี",
    "inLanguage": "th",
    "publisher": {
      "@type": "Organization",
      "name": config.organizationName,
      "url": config.organizationUrl
    },
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${config.siteUrl}/search?q={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    }
  };
}

// สร้าง Author Schema
export function createAuthorSchema(author: Author, config: SchemaConfig = defaultSchemaConfig) {
  const schema: any = {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": author.name,
    "description": author.shortBio || author.bio,
    "url": `${config.siteUrl}/author/${author.slug?.current}`,
    "worksFor": {
      "@type": "Organization",
      "name": config.organizationName,
      "url": config.organizationUrl
    }
  };

  // เพิ่ม avatar ถ้ามี
  if (author.avatar) {
    schema.image = {
      "@type": "ImageObject",
      "url": author.avatar,
      "width": 300,
      "height": 300
    };
  }

  // เพิ่ม social links ถ้ามี
  if ((author as any).socialLinks && (author as any).socialLinks.length > 0) {
    schema.sameAs = (author as any).socialLinks.map((link: any) => link.url);
  }

  // เพิ่มข้อมูล credentials ถ้ามี
  if ((author as any).credentials && (author as any).credentials.length > 0) {
    schema.hasCredential = (author as any).credentials.map((cred: any) => ({
      "@type": "EducationalOccupationalCredential",
      "name": cred.title,
      "description": cred.description,
      "credentialCategory": cred.type || "certification"
    }));
  }

  return schema;
}

// สร้าง Article Schema
export function createArticleSchema(
  post: Post, 
  fullUrl: string,
  config: SchemaConfig = defaultSchemaConfig
) {
  const schema: any = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": post.title,
    "description": post.excerpt,
    "url": fullUrl,
    "datePublished": post.publishedAt || post._createdAt,
    "dateModified": post._updatedAt || post.publishedAt || post._createdAt,
    "inLanguage": (post as any).language || "th",
    "publisher": {
      "@type": "Organization",
      "name": config.organizationName,
      "url": config.organizationUrl,
      "logo": {
        "@type": "ImageObject",
        "url": config.organizationLogo
      }
    }
  };

  // เพิ่ม author ถ้ามี
  if (post.author) {
    schema.author = {
      "@type": "Person",
      "name": post.author.name,
      "url": `${config.siteUrl}/author/${post.author.slug?.current}`
    };
  }

  // เพิ่ม featured image ถ้ามี
  if (post.mainImage && post.mainImage.asset) {
    schema.image = {
      "@type": "ImageObject",
      "url": post.mainImage.asset,
      "width": 1200,
      "height": 630,
      "caption": post.mainImage.alt || post.title
    };
  }

  // เพิ่ม categories
  if (post.categories && post.categories.length > 0) {
    schema.articleSection = post.categories.map(cat => cat.title);
    schema.about = post.categories.map(cat => ({
      "@type": "Thing",
      "name": cat.title,
      "description": (cat as any).description || cat.title
    }));
  }

  // เพิ่ม keywords
  if (post.seo?.keywords && post.seo.keywords.length > 0) {
    schema.keywords = post.seo.keywords.join(', ');
  }

  // เพิ่ม reading time
  if (post.readingTime) {
    schema.timeRequired = `PT${post.readingTime}M`;
  }

  // เพิ่ม word count ถ้าคำนวณได้
  if (post.body) {
    const wordCount = calculateWordCount(post.body);
    if (wordCount > 0) {
      schema.wordCount = wordCount;
    }
  }

  return schema;
}

// สร้าง BreadcrumbList Schema
export function createBreadcrumbSchema(
  breadcrumbs: Array<{ name: string; url: string }>,
  config: SchemaConfig = defaultSchemaConfig
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbs.map((crumb, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": crumb.name,
      "item": crumb.url.startsWith('http') ? crumb.url : `${config.siteUrl}${crumb.url}`
    }))
  };
}

// สร้าง FAQ Schema สำหรับบทความที่มี FAQ
export function createFAQSchema(faqs: Array<{ question: string; answer: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };
}

// Helper function สำหรับนับคำในเนื้อหา
function calculateWordCount(body: any[]): number {
  if (!body || !Array.isArray(body)) return 0;
  
  let wordCount = 0;
  
  for (const block of body) {
    if (block._type === 'block' && block.children) {
      for (const child of block.children) {
        if (child._type === 'span' && child.text) {
          // นับคำสำหรับภาษาไทยและอังกฤษ
          const thaiWords = (child.text.match(/[\u0E00-\u0E7F]+/g) || []).length;
          const englishWords = (child.text.match(/[a-zA-Z]+/g) || []).length;
          wordCount += thaiWords + englishWords;
        }
      }
    }
  }
  
  return wordCount;
}

// สร้าง schema tags สำหรับ HTML head
export function generateSchemaScript(schema: object): string {
  return `<script type="application/ld+json">${JSON.stringify(schema, null, 2)}</script>`;
} 