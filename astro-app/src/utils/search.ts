import Fuse from 'fuse.js'
import type { FuseResult } from 'fuse.js'
import { extractTextFromPortableText } from './readingTime'

/**
 * Search Utility สำหรับค้นหาบทความด้วย Fuse.js
 * รองรับการค้นหาในหัวข้อ, เนื้อหา, แท็ก และหมวดหมู่
 */

interface SearchablePost {
  _id: string
  title: string
  excerpt: string
  slug: { current: string }
  body: any[]
  tags?: string[]
  categories?: Array<{ title: string }>
  author?: { name: string }
  publishedAt?: string
  _plainTextContent?: string // เก็บ plain text ของเนื้อหา
}

type SearchResult = FuseResult<SearchablePost>

/**
 * เตรียม posts สำหรับการค้นหา
 * แปลง Portable Text เป็น plain text เพื่อให้ค้นหาได้ง่าย
 */
export function preparePostsForSearch(posts: SearchablePost[]): SearchablePost[] {
  return posts.map(post => ({
    ...post,
    _plainTextContent: extractTextFromPortableText(post.body)
  }))
}

/**
 * สร้าง Fuse.js instance พร้อม configuration
 */
export function createSearchEngine(posts: SearchablePost[]) {
  // ✅ การตั้งค่า Fuse.js สำหรับภาษาไทย
  const fuseOptions = {
    // กำหนดคะแนนขั้นต่ำ (0 = ตรงที่สุด, 1 = ไม่ตรงเลย)
    threshold: 0.4,
    
    // ระยะห่างสูงสุดในการจับคู่ fuzzy
    distance: 100,
    
    // รวมคะแนนและตำแหน่งที่พบ
    includeScore: true,
    includeMatches: true,
    
    // จำนวนตัวอักษรขั้นต่ำในการค้นหา
    minMatchCharLength: 2,
    
    // ฟิลด์ที่ต้องการค้นหา พร้อมน้ำหนัก
    keys: [
      {
        name: 'title',
        weight: 0.4 // ความสำคัญสูงสุด
      },
      {
        name: 'excerpt',
        weight: 0.3
      },
      {
        name: 'tags',
        weight: 0.2
      },
      {
        name: 'categories.title',
        weight: 0.2
      },
      {
        name: 'author.name',
        weight: 0.1
      },
      {
        name: '_plainTextContent',
        weight: 0.1 // น้ำหนักต่ำสุด แต่ครอบคลุมทั้งเนื้อหา
      }
    ]
  }
  
  const preparedPosts = preparePostsForSearch(posts)
  return new Fuse(preparedPosts, fuseOptions)
}

/**
 * ค้นหาบทความ
 */
export function searchPosts(
  searchEngine: Fuse<SearchablePost>, 
  query: string, 
  limit = 10
): SearchResult[] {
  if (!query || query.trim().length < 2) {
    return []
  }
  
  const results = searchEngine.search(query.trim(), { limit })
  
  return results as SearchResult[]
}

/**
 * ค้นหาแบบง่าย - รีเทิร์น posts เฉยๆ
 */
export function simpleSearch(
  posts: SearchablePost[], 
  query: string, 
  limit = 10
): SearchablePost[] {
  const searchEngine = createSearchEngine(posts)
  const results = searchPosts(searchEngine, query, limit)
  return results.map(result => result.item)
}

/**
 * ค้นหาตาม category
 */
export function searchByCategory(
  posts: SearchablePost[], 
  categoryTitle: string
): SearchablePost[] {
  return posts.filter(post => 
    post.categories?.some(cat => 
      cat.title.toLowerCase().includes(categoryTitle.toLowerCase())
    )
  )
}

/**
 * ค้นหาตาม tags
 */
export function searchByTag(
  posts: SearchablePost[], 
  tag: string
): SearchablePost[] {
  return posts.filter(post => 
    post.tags?.some(postTag => 
      postTag.toLowerCase().includes(tag.toLowerCase())
    )
  )
}

/**
 * ค้นหาตาม author
 */
export function searchByAuthor(
  posts: SearchablePost[], 
  authorName: string
): SearchablePost[] {
  return posts.filter(post => 
    post.author?.name.toLowerCase().includes(authorName.toLowerCase())
  )
}

/**
 * ค้นหาขั้นสูง - รวมหลายเงื่อนไข
 */
export function advancedSearch(
  posts: SearchablePost[],
  filters: {
    query?: string
    category?: string
    tag?: string
    author?: string
    dateFrom?: string
    dateTo?: string
  },
  limit = 10
): SearchablePost[] {
  let filteredPosts = [...posts]
  
  // กรองตาม category
  if (filters.category) {
    filteredPosts = searchByCategory(filteredPosts, filters.category)
  }
  
  // กรองตาม tag
  if (filters.tag) {
    filteredPosts = searchByTag(filteredPosts, filters.tag)
  }
  
  // กรองตาม author
  if (filters.author) {
    filteredPosts = searchByAuthor(filteredPosts, filters.author)
  }
  
  // กรองตามวันที่
  if (filters.dateFrom || filters.dateTo) {
    filteredPosts = filteredPosts.filter(post => {
      if (!post.publishedAt) return false
      
      const postDate = new Date(post.publishedAt)
      
      if (filters.dateFrom && postDate < new Date(filters.dateFrom)) {
        return false
      }
      
      if (filters.dateTo && postDate > new Date(filters.dateTo)) {
        return false
      }
      
      return true
    })
  }
  
  // ค้นหาด้วย text query
  if (filters.query && filters.query.trim()) {
    filteredPosts = simpleSearch(filteredPosts, filters.query, limit)
  }
  
  return filteredPosts.slice(0, limit)
}

/**
 * แนะนำคำค้นหาที่เป็นไปได้
 */
export function getSuggestions(posts: SearchablePost[]): {
  popularTags: string[]
  categories: string[]
  authors: string[]
} {
  const tagCounts: Record<string, number> = {}
  const categories: Set<string> = new Set()
  const authors: Set<string> = new Set()
  
  posts.forEach(post => {
    // นับ tags
    post.tags?.forEach(tag => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1
    })
    
    // รวบรวม categories
    post.categories?.forEach(cat => {
      categories.add(cat.title)
    })
    
    // รวบรวม authors
    if (post.author?.name) {
      authors.add(post.author.name)
    }
  })
  
  // เรียง tags ตามความนิยม
  const popularTags = Object.entries(tagCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .map(([tag]) => tag)
  
  return {
    popularTags,
    categories: Array.from(categories),
    authors: Array.from(authors)
  }
} 