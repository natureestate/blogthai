# 🚀 แผนการพัฒนา AI Blog ด้วย Astro

## 📋 ภาพรวมโครงการ

สร้าง AI Blog ที่เป็นมิตรกับ SEO และ LLM โดยใช้ Astro เป็นหลัก

### 🎯 เป้าหมาย
- ✅ SEO-Optimized สำหรับ Google Bot
- ✅ LLM-Friendly สำหรับ AI search engines
- ✅ ใช้ ShadCN/UI เป็นหลัก
- ✅ Comment ภาษาไทยในโค้ด
- ✅ Content Collections สำหรับจัดการเนื้อหา
- ✅ Performance ที่ยอดเยี่ยม

---

## 🏗️ โครงสร้างโปรเจค

```
aiblog/
├── src/
│   ├── content/
│   │   ├── blog/           # บทความ blog (Markdown)
│   │   ├── authors/        # ข้อมูลผู้เขียน (JSON)
│   │   └── config.ts       # Content Collections config
│   ├── components/
│   │   ├── ui/             # ShadCN/UI components
│   │   ├── blog/           # Blog components
│   │   └── seo/            # SEO components
│   ├── layouts/            # Layout components
│   ├── pages/              # Astro pages
│   └── styles/             # CSS styles
├── public/                 # Static assets
└── astro.config.mjs        # Astro configuration
```

---

## 📝 Phase 1: Setup โครงสร้างพื้นฐาน

### 1.1 สร้างโปรเจค Astro
```bash
# สร้างโปรเจค Astro ใหม่
npm create astro@latest aiblog

# เข้าไปในโฟลเดอร์
cd aiblog

# ติดตั้ง dependencies
npm install
```

### 1.2 ติดตั้ง Dependencies สำคัญ
```bash
# ShadCN/UI และ dependencies
npm install @astrojs/tailwind @astrojs/react
npm install tailwindcss @tailwindcss/typography
npm install class-variance-authority clsx tailwind-merge
npm install lucide-react

# SEO และ utilities
npm install @astrojs/sitemap @astrojs/rss

# Image optimization
npm install sharp

# Content utilities
npm install reading-time
```

### 1.3 กำหนดค่า Astro Config
```typescript
// astro.config.mjs
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://your-domain.com', // เปลี่ยนเป็น domain จริง
  integrations: [
    tailwind({
      applyBaseStyles: false, // ใช้ ShadCN styles
    }),
    react(),
    sitemap(),
  ],
  markdown: {
    shikiConfig: {
      theme: 'github-dark',
      langs: [],
      wrap: true,
    },
  },
  vite: {
    optimizeDeps: {
      exclude: ['@resvg/resvg-js'],
    },
  },
});
```

---

## 📝 Phase 2: Content Collections Setup

### 2.1 กำหนด Content Collections Schema
```typescript
// src/content/config.ts
import { defineCollection, reference, z } from 'astro:content';
import { glob } from 'astro/loaders';

/**
 * Schema สำหรับ collection ของผู้เขียน
 * เก็บข้อมูลผู้เขียนในรูปแบบ JSON
 */
const authors = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/authors' }),
  schema: z.object({
    name: z.string(), // ชื่อผู้เขียน
    bio: z.string(), // ประวัติย่อ
    avatar: z.string().url(), // URL รูปโปรไฟล์
    website: z.string().url().optional(), // เว็บไซต์ส่วนตัว
    twitter: z.string().optional(), // Twitter handle
    github: z.string().optional(), // GitHub username
  }),
});

/**
 * Schema สำหรับ blog posts
 * รองรับการอ้างอิงผู้เขียนและบทความที่เกี่ยวข้อง
 */
const blog = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/blog' }),
  schema: ({ image }) => z.object({
    title: z.string(), // หัวเรื่องบทความ
    description: z.string(), // คำอธิบายสั้นๆ สำหรับ SEO
    pubDate: z.date(), // วันที่เผยแพร่
    updatedDate: z.date().optional(), // วันที่แก้ไขล่าสุด
    heroImage: image().optional(), // รูปหลักของบทความ
    heroImageAlt: z.string().optional(), // Alt text สำหรับรูปหลัก
    author: reference('authors'), // อ้างอิงไปยัง authors collection
    tags: z.array(z.string()), // แท็กของบทความ
    featured: z.boolean().default(false), // บทความแนะนำ
    draft: z.boolean().default(false), // บทความร่าง
    relatedPosts: z.array(reference('blog')).optional(), // บทความที่เกี่ยวข้อง
    seo: z.object({
      metaTitle: z.string().optional(), // Title สำหรับ SEO
      metaDescription: z.string().optional(), // Description สำหรับ SEO
      keywords: z.array(z.string()).optional(), // Keywords สำหรับ SEO
    }).optional(),
  }),
});

// ส่งออก collections
export const collections = {
  blog,
  authors,
};
```

### 2.2 สร้างตัวอย่างข้อมูลผู้เขียน
```json
// src/content/authors/admin.json
{
  "name": "AI Blog Admin",
  "bio": "ผู้เขียนและผู้พัฒนาเว็บไซต์ที่หลงใหลในเทคโนโลยี AI และการพัฒนาเว็บสมัยใหม่",
  "avatar": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
  "website": "https://your-domain.com",
  "twitter": "yourusername",
  "github": "yourusername"
}
```

### 2.3 สร้างตัวอย่างบทความ
```markdown
---
title: "การเริ่มต้นพัฒนา AI Blog ด้วย Astro"
description: "เรียนรู้วิธีการสร้าง AI Blog ที่เป็นมิตรกับ SEO และ LLM ด้วย Astro framework"
pubDate: 2024-01-15
heroImage: "./hero-astro-blog.jpg"
heroImageAlt: "Astro framework logo กับ AI symbols"
author: "admin"
tags: ["astro", "ai", "blog", "seo", "web-development"]
featured: true
seo:
  metaTitle: "สร้าง AI Blog ด้วย Astro - คู่มือฉบับสมบูรณ์"
  metaDescription: "เรียนรู้การสร้าง blog ที่เป็นมิตรกับ AI search engines ด้วย Astro framework พร้อมเทคนิค SEO ขั้นสูง"
  keywords: ["astro blog", "ai blog", "seo optimization", "web development", "static site generator"]
---

# การเริ่มต้นพัฒนา AI Blog ด้วย Astro

ในยุคที่ AI กำลังเปลี่ยนแปลงโลกของการค้นหาข้อมูล การสร้าง blog ที่เป็นมิตรกับทั้ง search engines แบบดั้งเดิมและ AI-powered search กลายเป็นสิ่งสำคัญมากขึ้น

## ทำไมต้องเลือก Astro?

Astro เป็น modern web framework ที่:

- **Performance สูง** - โหลดเร็วด้วย partial hydration
- **SEO-friendly** - Server-side rendering โดย default
- **Developer Experience ดี** - TypeScript support และ hot reload
- **Flexible** - ใช้ได้กับ React, Vue, Svelte หรือ vanilla HTML

## Content Collections: พลังของการจัดการเนื้อหา

Astro Content Collections ช่วยให้เราจัดการเนื้อหาได้อย่างมีระบบ:

```typescript
// ตัวอย่าง schema definition
const blog = defineCollection({
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.date(),
    // ... fields อื่นๆ
  }),
});
```

## สิ่งสำคัญที่ควรจำ

- ใช้ semantic HTML สำหรับ accessibility
- เพิ่ม structured data สำหรับ search engines  
- ปรับปรุง Core Web Vitals อย่างสม่ำเสมอ
- เขียนเนื้อหาสำหรับมนุษย์ ไม่ใช่เครื่องจักร

การพัฒนา AI Blog ด้วย Astro จะช่วยให้เราสร้างเว็บไซต์ที่ทั้งรวดเร็ว เป็นมิตรกับ SEO และพร้อมสำหรับอนาคตของการค้นหาด้วย AI
```

---

## 📝 Phase 3: ShadCN/UI Components

### 3.1 Setup ShadCN/UI
```bash
# ติดตั้ง ShadCN/UI CLI
npx shadcn-ui@latest init

# เลือก configuration:
# - TypeScript: Yes
# - Style: Default
# - Base color: Slate
# - CSS variables: Yes
```

### 3.2 ติดตั้ง Components พื้นฐาน
```bash
# Components สำคัญสำหรับ blog
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add separator
npx shadcn-ui@latest add avatar
npx shadcn-ui@latest add navigation-menu
```

### 3.3 สร้าง Blog Components

```typescript
// src/components/blog/BlogCard.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, Clock } from "lucide-react";

interface BlogCardProps {
  title: string;
  description: string;
  pubDate: Date;
  author: {
    name: string;
    avatar: string;
  };
  tags: string[];
  slug: string;
  readingTime: string;
  heroImage?: string;
}

/**
 * Component สำหรับแสดงการ์ดบทความใน blog listing
 * รองรับการแสดงผลแบบ responsive และมี hover effects
 */
export function BlogCard({
  title,
  description,
  pubDate,
  author,
  tags,
  slug,
  readingTime,
  heroImage
}: BlogCardProps) {
  return (
    <Card className="group hover:shadow-lg transition-all duration-300 h-full">
      {/* รูปภาพหลักของบทความ */}
      {heroImage && (
        <div className="aspect-video overflow-hidden rounded-t-lg">
          <img 
            src={heroImage} 
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        </div>
      )}
      
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          {/* วันที่เผยแพร่ */}
          <Calendar className="w-4 h-4" />
          <time dateTime={pubDate.toISOString()}>
            {pubDate.toLocaleDateString('th-TH')}
          </time>
          
          {/* เวลาในการอ่าน */}
          <Clock className="w-4 h-4 ml-2" />
          <span>{readingTime}</span>
        </div>
        
        {/* หัวเรื่องบทความ */}
        <CardTitle className="line-clamp-2 group-hover:text-primary transition-colors">
          <a href={`/blog/${slug}`} className="block">
            {title}
          </a>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="pt-0">
        {/* คำอธิบายบทความ */}
        <p className="text-muted-foreground line-clamp-3 mb-4">
          {description}
        </p>
        
        {/* แท็กบทความ */}
        <div className="flex flex-wrap gap-2 mb-4">
          {tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
          {tags.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{tags.length - 3}
            </Badge>
          )}
        </div>
        
        {/* ข้อมูลผู้เขียน */}
        <div className="flex items-center gap-2">
          <Avatar className="w-6 h-6">
            <AvatarImage src={author.avatar} alt={author.name} />
            <AvatarFallback>{author.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <span className="text-sm text-muted-foreground">
            โดย {author.name}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
```

---

## 📝 Phase 4: SEO Components

### 4.1 SEO Base Component
```typescript
// src/components/seo/SEOBase.tsx
interface SEOBaseProps {
  title: string;
  description: string;
  image?: string;
  imageAlt?: string;
  type?: 'website' | 'article';
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  keywords?: string[];
  canonicalUrl?: string;
}

/**
 * Component พื้นฐานสำหรับ SEO meta tags
 * รองรับ Open Graph และ Twitter Cards
 */
export function SEOBase({
  title,
  description,
  image,
  imageAlt,
  type = 'website',
  publishedTime,
  modifiedTime,
  author,
  keywords,
  canonicalUrl
}: SEOBaseProps) {
  const fullTitle = `${title} | AI Blog`;
  const siteUrl = 'https://your-domain.com'; // เปลี่ยนเป็น domain จริง
  const fullImageUrl = image ? `${siteUrl}${image}` : `${siteUrl}/og-default.jpg`;
  
  return (
    <>
      {/* Basic Meta Tags */}
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords.join(', ')} />}
      {author && <meta name="author" content={author} />}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
      
      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImageUrl} />
      <meta property="og:image:alt" content={imageAlt || title} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content="AI Blog" />
      
      {/* Article specific OG tags */}
      {type === 'article' && publishedTime && (
        <meta property="article:published_time" content={publishedTime} />
      )}
      {type === 'article' && modifiedTime && (
        <meta property="article:modified_time" content={modifiedTime} />
      )}
      {type === 'article' && author && (
        <meta property="article:author" content={author} />
      )}
      
      {/* Twitter Cards */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImageUrl} />
    </>
  );
}
```

---

## 📝 Phase 5: Layout และ Pages

### 5.1 Base Layout
```astro
---
// src/layouts/BaseLayout.astro
import { SEOBase } from '@/components/seo/SEOBase';

export interface Props {
  title: string;
  description: string;
  image?: string;
  imageAlt?: string;
  type?: 'website' | 'article';
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  keywords?: string[];
  canonicalUrl?: string;
}

const {
  title,
  description,
  image,
  imageAlt,
  type = 'website',
  publishedTime,
  modifiedTime,
  author,
  keywords,
  canonicalUrl
} = Astro.props;
---

<!DOCTYPE html>
<html lang="th" class="scroll-smooth">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{title} | AI Blog</title>
    
    <!-- SEO Meta Tags -->
    <SEOBase
      title={title}
      description={description}
      image={image}
      imageAlt={imageAlt}
      type={type}
      publishedTime={publishedTime}
      modifiedTime={modifiedTime}
      author={author}
      keywords={keywords}
      canonicalUrl={canonicalUrl}
    />
    
    <!-- Favicon -->
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    
    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
  </head>
  
  <body class="min-h-screen bg-background font-sans antialiased">
    <!-- Skip to main content สำหรับ accessibility -->
    <a href="#main-content" class="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-50 bg-primary text-primary-foreground px-4 py-2 rounded-md">
      ข้ามไปยังเนื้อหาหลัก
    </a>
    
    <!-- Navigation -->
    <header class="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div class="container flex h-14 items-center">
        <nav class="flex items-center space-x-6 text-sm font-medium">
          <a href="/" class="transition-colors hover:text-foreground/80">
            หน้าแรก
          </a>
          <a href="/blog" class="transition-colors hover:text-foreground/80">
            บทความ
          </a>
          <a href="/tags" class="transition-colors hover:text-foreground/80">
            หมวดหมู่
          </a>
          <a href="/about" class="transition-colors hover:text-foreground/80">
            เกี่ยวกับ
          </a>
        </nav>
      </div>
    </header>
    
    <!-- Main Content -->
    <main id="main-content" class="flex-1">
      <slot />
    </main>
    
    <!-- Footer -->
    <footer class="border-t py-6 md:py-0">
      <div class="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
        <p class="text-center text-sm leading-loose text-muted-foreground md:text-left">
          © 2024 AI Blog. สร้างด้วย Astro และ ShadCN/UI
        </p>
      </div>
    </footer>
  </body>
</html>
```

---

## 📝 Phase 6: Blog Pages

### 6.1 Blog Index Page
```astro
---
// src/pages/blog/index.astro
import { getCollection } from 'astro:content';
import BaseLayout from '@/layouts/BaseLayout.astro';
import { BlogCard } from '@/components/blog/BlogCard';

/**
 * ดึงข้อมูลบทความทั้งหมดจาก blog collection
 * กรองเฉพาะบทความที่ไม่ใช่ draft และเรียงตามวันที่ใหม่สุด
 */
const allPosts = await getCollection('blog', ({ data }) => {
  return !data.draft;
});

// เรียงลำดับตามวันที่เผยแพร่ (ใหม่สุดก่อน)
const sortedPosts = allPosts.sort((a, b) => 
  new Date(b.data.pubDate).getTime() - new Date(a.data.pubDate).getTime()
);

// คำนวณ reading time สำหรับแต่ละบทความ
const postsWithReadingTime = await Promise.all(
  sortedPosts.map(async (post) => {
    // ใช้ library reading-time หรือคำนวณเอง
    const readingTime = `${Math.ceil(post.body.length / 1000)} นาที`;
    return { ...post, readingTime };
  })
);
---

<BaseLayout
  title="บทความทั้งหมด"
  description="รวมบทความเกี่ยวกับ AI, การพัฒนาเว็บ และเทคโนโลยีใหม่ๆ"
  keywords={['ai blog', 'web development', 'astro', 'programming']}
>
  <div class="container py-8">
    <!-- หัวเรื่องหน้า -->
    <div class="space-y-4 pb-8 text-center md:pb-10 md:text-left">
      <h1 class="text-3xl font-bold leading-tight tracking-tighter md:text-4xl lg:text-5xl">
        บทความทั้งหมด
      </h1>
      <p class="text-lg text-muted-foreground md:text-xl">
        ค้นพบเนื้อหาคุณภาพเกี่ยวกับ AI และการพัฒนาเว็บ
      </p>
    </div>
    
    <!-- รายการบทความ -->
    <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {postsWithReadingTime.map((post) => (
        <BlogCard
          title={post.data.title}
          description={post.data.description}
          pubDate={post.data.pubDate}
          author={{
            name: post.data.author.data?.name || 'Unknown',
            avatar: post.data.author.data?.avatar || '/default-avatar.jpg'
          }}
          tags={post.data.tags}
          slug={post.id}
          readingTime={post.readingTime}
          heroImage={post.data.heroImage?.src}
          client:load
        />
      ))}
    </div>
  </div>
</BaseLayout>
```

---

## 📝 ขั้นตอนถัดไป

1. **ติดตั้งและ setup โปรเจค**
2. **สร้าง content collections**
3. **พัฒนา ShadCN/UI components**
4. **ใช้งาน SEO components**
5. **สร้าง blog pages และ layouts**
6. **เพิ่ม RSS feed**
7. **ปรับปรุง performance**
8. **Deploy และ monitor**

แผนนี้จะช่วยสร้าง AI Blog ที่มีคุณภาพสูง เป็นมิตรกับ SEO และพร้อมสำหรับ AI search engines ครับ! 