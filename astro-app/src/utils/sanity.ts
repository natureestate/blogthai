import { sanityClient } from "sanity:client";
import type { PortableTextBlock } from "@portabletext/types";
import type { ImageAsset, Slug } from "@sanity/types";
import groq from "groq";

export interface Post {
  _type: "post";
  _id: string;
  _createdAt: string;
  _updatedAt: string;
  title?: string;
  slug: Slug;
  excerpt?: string;
  mainImage?: ImageAsset & { 
    alt?: string;
    caption?: string;
  };
  body: PortableTextBlock[];
  categories?: Array<{
    _id: string;
    title: string;
    slug: Slug;
    color?: string;
    icon?: string;
  }>;
  tags?: string[];
  author?: {
    _id: string;
    name: string;
    slug: Slug;
    avatar?: ImageAsset & { alt?: string };
    shortBio?: string;
  };
  publishedAt?: string;
  featured?: boolean;
  readingTime?: number;
  series?: {
    _id: string;
    title: string;
    slug: Slug;
  };
  relatedPosts?: Post[];
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string[];
    ogImage?: ImageAsset & { alt?: string };
    noIndex?: boolean;
  };
}

export interface Author {
  _id: string;
  name: string;
  slug: Slug;
  avatar?: ImageAsset & { alt?: string };
  bio?: PortableTextBlock[];
  shortBio?: string;
  email?: string;
  website?: string;
  socialMedia?: {
    twitter?: string;
    facebook?: string;
    instagram?: string;
    linkedin?: string;
    github?: string;
    youtube?: string;
  };
  role?: string;
  specialties?: string[];
  featured?: boolean;
  active?: boolean;
}

export interface Category {
  _id: string;
  title: string;
  slug: Slug;
  description?: string;
  color?: string;
  icon?: string;
  featured?: boolean;
}

export interface Series {
  _id: string;
  title: string;
  slug: Slug;
  description?: PortableTextBlock[];
  excerpt?: string;
  coverImage?: ImageAsset & { alt?: string; caption?: string };
  category?: Category;
  author?: Author;
  startDate?: string;
  estimatedPosts?: number;
  status?: 'planning' | 'in-progress' | 'completed' | 'on-hold';
  difficulty?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  featured?: boolean;
}

const postsQuery = groq`*[_type == "post" && defined(slug.current)] | order(publishedAt desc, _createdAt desc) {
  _id,
  _type,
  _createdAt,
  _updatedAt,
  title,
  slug,
  excerpt,
  mainImage {
    asset,
    alt,
    caption
  },
  body,
  categories[]-> {
    _id,
    title,
    slug,
    color,
    icon
  },
  tags,
  author-> {
    _id,
    name,
    slug,
    avatar {
      asset,
      alt
    },
    shortBio
  },
  publishedAt,
  featured,
  readingTime,
  series-> {
    _id,
    title,
    slug
  },
  seo {
    metaTitle,
    metaDescription,
    keywords,
    ogImage {
      asset,
      alt
    },
    noIndex
  }
}`;

const postQuery = groq`*[_type == "post" && slug.current == $slug][0] {
  _id,
  _type,
  _createdAt,
  _updatedAt,
  title,
  slug,
  excerpt,
  mainImage {
    asset,
    alt,
    caption
  },
  body,
  categories[]-> {
    _id,
    title,
    slug,
    color,
    icon,
    description
  },
  tags,
  author-> {
    _id,
    name,
    slug,
    avatar {
      asset,
      alt
    },
    bio,
    shortBio,
    socialMedia
  },
  publishedAt,
  featured,
  readingTime,
  series-> {
    _id,
    title,
    slug,
    description,
    status,
    difficulty
  },
  relatedPosts[]-> {
    _id,
    title,
    slug,
    excerpt,
    mainImage {
      asset,
      alt
    },
    categories[]-> {
      title
    },
    author-> {
      name
    },
    publishedAt
  },
  seo {
    metaTitle,
    metaDescription,
    keywords,
    ogImage {
      asset,
      alt
    },
    noIndex
  }
}`;

export async function getPosts(): Promise<Post[]> {
  return await sanityClient.fetch(postsQuery);
}

export async function getPost(slug: string): Promise<Post> {
  return await sanityClient.fetch(postQuery, { slug });
}

export async function getFeaturedPosts(limit = 5): Promise<Post[]> {
  const query = groq`*[_type == "post" && featured == true && defined(slug.current)] | order(publishedAt desc) [0...${limit}] {
    ${postsQuery.split('{')[1].split('}')[0]}
  }`;
  
  return await sanityClient.fetch(query);
}

export async function getPostsByCategory(categorySlug: string, limit = 10): Promise<Post[]> {
  const query = groq`*[_type == "post" && references(*[_type == "category" && slug.current == $categorySlug]._id)] | order(publishedAt desc) [0...${limit}] {
    ${postsQuery.split('{')[1].split('}')[0]}
  }`;
  
  return await sanityClient.fetch(query, { categorySlug });
}

export async function getPostsByAuthor(authorSlug: string, limit = 10): Promise<Post[]> {
  const query = groq`*[_type == "post" && author->slug.current == $authorSlug] | order(publishedAt desc) [0...${limit}] {
    ${postsQuery.split('{')[1].split('}')[0]}
  }`;
  
  return await sanityClient.fetch(query, { authorSlug });
}

export async function getPostsBySeries(seriesSlug: string): Promise<Post[]> {
  const query = groq`*[_type == "post" && series->slug.current == $seriesSlug] | order(publishedAt asc) {
    ${postsQuery.split('{')[1].split('}')[0]}
  }`;
  
  return await sanityClient.fetch(query, { seriesSlug });
}

export async function getCategories(): Promise<Category[]> {
  const query = groq`*[_type == "category"] | order(title asc) {
    _id,
    title,
    slug,
    description,
    color,
    icon,
    featured
  }`;
  
  return await sanityClient.fetch(query);
}

export async function getCategory(slug: string): Promise<Category> {
  const query = groq`*[_type == "category" && slug.current == $slug][0] {
    _id,
    title,
    slug,
    description,
    color,
    icon,
    featured
  }`;
  
  return await sanityClient.fetch(query, { slug });
}

export async function getAuthors(): Promise<Author[]> {
  const query = groq`*[_type == "author"] | order(name asc) {
    _id,
    name,
    slug,
    avatar {
      asset,
      alt
    },
    shortBio,
    role,
    specialties,
    featured,
    active
  }`;
  
  return await sanityClient.fetch(query);
}

export async function getAuthor(slug: string): Promise<Author> {
  const query = groq`*[_type == "author" && slug.current == $slug][0] {
    _id,
    name,
    slug,
    avatar {
      asset,
      alt
    },
    bio,
    shortBio,
    email,
    website,
    socialMedia,
    role,
    specialties,
    featured,
    active
  }`;
  
  return await sanityClient.fetch(query, { slug });
}

export async function getSeries(): Promise<Series[]> {
  const query = groq`*[_type == "series"] | order(startDate desc) {
    _id,
    title,
    slug,
    excerpt,
    coverImage {
      asset,
      alt
    },
    category-> {
      title,
      color
    },
    author-> {
      name
    },
    startDate,
    estimatedPosts,
    status,
    difficulty,
    featured
  }`;
  
  return await sanityClient.fetch(query);
}

export async function getSeriesDetail(slug: string): Promise<Series> {
  const query = groq`*[_type == "series" && slug.current == $slug][0] {
    _id,
    title,
    slug,
    description,
    excerpt,
    coverImage {
      asset,
      alt,
      caption
    },
    category-> {
      _id,
      title,
      slug,
      color,
      icon
    },
    author-> {
      _id,
      name,
      slug,
      avatar {
        asset,
        alt
      },
      shortBio
    },
    startDate,
    estimatedPosts,
    status,
    difficulty,
    featured
  }`;
  
  return await sanityClient.fetch(query, { slug });
}

export async function searchPostsInSanity(searchTerm: string, limit = 10): Promise<Post[]> {
  const query = groq`*[_type == "post" && (
    title match $searchTerm + "*" ||
    excerpt match $searchTerm + "*" ||
    tags[] match $searchTerm + "*"
  )] | order(_score desc, publishedAt desc) [0...${limit}] {
    ${postsQuery.split('{')[1].split('}')[0]}
  }`;
  
  return await sanityClient.fetch(query, { searchTerm });
}

// ฟังก์ชันสำหรับดึงจำนวนบทความในแต่ละหมวดหมู่
export async function getCategoryPostCount(categorySlug: string): Promise<number> {
  const query = groq`count(*[_type == "post" && references(*[_type == "category" && slug.current == $categorySlug]._id)])`;
  return await sanityClient.fetch(query, { categorySlug });
}
