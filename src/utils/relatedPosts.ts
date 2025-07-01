/**
 * Related Posts Utility
 * หาบทความที่เกี่ยวข้องตาม tags, categories, keywords และความคล้ายคลึงของเนื้อหา
 */

interface RelatedPost {
  _id: string
  title: string
  slug: { current: string }
  excerpt: string
  tags?: string[]
  categories?: Array<{ title: string; _id: string }>
  author?: { name: string; _id: string }
  publishedAt?: string
  mainImage?: any
}

interface RelatedPostWithScore extends RelatedPost {
  relevanceScore: number
  matchReasons: string[]
}

/**
 * หาบทความที่เกี่ยวข้องตาม algorithm แบบง่าย
 */
export function findRelatedPosts(
  currentPost: RelatedPost,
  allPosts: RelatedPost[],
  limit = 3
): RelatedPostWithScore[] {
  // กรองบทความที่ไม่ใช่บทความปัจจุบัน
  const otherPosts = allPosts.filter(post => post._id !== currentPost._id)
  
  // คำนวณคะแนนความเกี่ยวข้อง
  const scoredPosts = otherPosts.map(post => {
    let score = 0
    const matchReasons: string[] = []
    
    // ✅ เปรียบเทียบ Categories (คะแนนสูงสุด)
    const sharedCategories = getSharedCategories(currentPost, post)
    if (sharedCategories.length > 0) {
      score += sharedCategories.length * 30
      matchReasons.push(`หมวดหมู่เดียวกัน: ${sharedCategories.join(', ')}`)
    }
    
    // ✅ เปรียบเทียบ Tags
    const sharedTags = getSharedTags(currentPost, post)
    if (sharedTags.length > 0) {
      score += sharedTags.length * 20
      matchReasons.push(`แท็กเดียวกัน: ${sharedTags.join(', ')}`)
    }
    
    // ✅ ผู้เขียนเดียวกัน
    if (currentPost.author?._id === post.author?._id && currentPost.author?._id) {
      score += 15
      matchReasons.push(`ผู้เขียนเดียวกัน: ${post.author?.name}`)
    }
    
    // ✅ ความคล้ายคลึงของหัวข้อ
    const titleSimilarity = calculateTitleSimilarity(currentPost.title, post.title)
    if (titleSimilarity > 0.3) {
      score += titleSimilarity * 10
      matchReasons.push(`หัวข้อคล้ายกัน`)
    }
    
    // ✅ วันที่เผยแพร่ใกล้เคียง (bonus points)
    const dateScore = calculateDateProximity(currentPost.publishedAt, post.publishedAt)
    score += dateScore * 5
    
    return {
      ...post,
      relevanceScore: score,
      matchReasons
    }
  })
  
  // เรียงตามคะแนนและกรองแค่ที่มีคะแนน > 0
  return scoredPosts
    .filter(post => post.relevanceScore > 0)
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, limit)
}

/**
 * หา categories ที่เหมือนกัน
 */
function getSharedCategories(post1: RelatedPost, post2: RelatedPost): string[] {
  const categories1 = post1.categories?.map(c => c.title.toLowerCase()) || []
  const categories2 = post2.categories?.map(c => c.title.toLowerCase()) || []
  
  return categories1.filter(cat => categories2.includes(cat))
}

/**
 * หา tags ที่เหมือนกัน
 */
function getSharedTags(post1: RelatedPost, post2: RelatedPost): string[] {
  const tags1 = post1.tags?.map(t => t.toLowerCase()) || []
  const tags2 = post2.tags?.map(t => t.toLowerCase()) || []
  
  return tags1.filter(tag => tags2.includes(tag))
}

/**
 * คำนวณความคล้ายคลึงของหัวข้อ (แบบง่าย)
 */
function calculateTitleSimilarity(title1: string, title2: string): number {
  const words1 = title1.toLowerCase().split(/\s+/)
  const words2 = title2.toLowerCase().split(/\s+/)
  
  let commonWords = 0
  words1.forEach(word => {
    if (words2.includes(word) && word.length > 2) {
      commonWords++
    }
  })
  
  const totalWords = Math.max(words1.length, words2.length)
  return commonWords / totalWords
}

/**
 * คำนวณความใกล้เคียงของวันที่
 */
function calculateDateProximity(date1?: string, date2?: string): number {
  if (!date1 || !date2) return 0
  
  const d1 = new Date(date1)
  const d2 = new Date(date2)
  const daysDifference = Math.abs(d1.getTime() - d2.getTime()) / (1000 * 60 * 60 * 24)
  
  // คะแนนลดลงตามระยะเวลา (สูงสุด 30 วัน)
  if (daysDifference <= 7) return 1.0      // ภายใน 1 สัปดาห์
  if (daysDifference <= 30) return 0.5     // ภายใน 1 เดือน
  if (daysDifference <= 90) return 0.2     // ภายใน 3 เดือน
  return 0
}

/**
 * หาบทความที่เกี่ยวข้องตาม category เฉพาะ
 */
export function findRelatedByCategory(
  categoryId: string,
  currentPostId: string,
  allPosts: RelatedPost[],
  limit = 3
): RelatedPost[] {
  return allPosts
    .filter(post => 
      post._id !== currentPostId && 
      post.categories?.some(cat => cat._id === categoryId)
    )
    .slice(0, limit)
}

/**
 * หาบทความที่เกี่ยวข้องตาม tag เฉพาะ
 */
export function findRelatedByTag(
  tag: string,
  currentPostId: string,
  allPosts: RelatedPost[],
  limit = 3
): RelatedPost[] {
  const lowerTag = tag.toLowerCase()
  return allPosts
    .filter(post => 
      post._id !== currentPostId && 
      post.tags?.some(postTag => postTag.toLowerCase() === lowerTag)
    )
    .slice(0, limit)
}

/**
 * หาบทความอื่นๆ ของผู้เขียนคนเดียวกัน
 */
export function findMoreByAuthor(
  authorId: string,
  currentPostId: string,
  allPosts: RelatedPost[],
  limit = 3
): RelatedPost[] {
  return allPosts
    .filter(post => 
      post._id !== currentPostId && 
      post.author?._id === authorId
    )
    .sort((a, b) => {
      // เรียงตามวันที่เผยแพร่ล่าสุด
      const dateA = a.publishedAt ? new Date(a.publishedAt).getTime() : 0
      const dateB = b.publishedAt ? new Date(b.publishedAt).getTime() : 0
      return dateB - dateA
    })
    .slice(0, limit)
}

/**
 * สร้างข้อความอธิบายเหตุผลที่เกี่ยวข้อง
 */
export function getRelevanceReasonText(reasons: string[]): string {
  if (reasons.length === 0) return 'บทความที่น่าสนใจ'
  if (reasons.length === 1) return reasons[0]
  if (reasons.length === 2) return reasons.join(' และ ')
  
  const lastReason = reasons.pop()
  return `${reasons.join(', ')} และ${lastReason}`
}

/**
 * หาบทความแนะนำสำหรับผู้อ่านใหม่ (ตาม popularity หรือ featured)
 */
export function findRecommendedPosts(
  allPosts: (RelatedPost & { featured?: boolean })[],
  limit = 5
): RelatedPost[] {
  // แยกบทความ featured ออกมาก่อน
  const featuredPosts = allPosts.filter(post => post.featured)
  const regularPosts = allPosts.filter(post => !post.featured)
  
  // เรียงตามวันที่ล่าสุด
  const sortedRegular = regularPosts.sort((a, b) => {
    const dateA = a.publishedAt ? new Date(a.publishedAt).getTime() : 0
    const dateB = b.publishedAt ? new Date(b.publishedAt).getTime() : 0
    return dateB - dateA
  })
  
  // รวม featured กับ regular posts
  const recommended = [...featuredPosts, ...sortedRegular].slice(0, limit)
  
  return recommended
}

/**
 * หาบทความที่เป็นไปได้สำหรับ "อ่านต่อ" (Next/Previous ใน series)
 */
export function findSeriesNavigation(
  currentPost: RelatedPost & { series?: { _id: string } },
  allPosts: (RelatedPost & { series?: { _id: string } })[],
): {
  previous?: RelatedPost
  next?: RelatedPost
  seriesPosts?: RelatedPost[]
} {
  // ถ้าไม่ได้อยู่ในซีรี่ส์ ไม่ต้องหาอะไร
  if (!currentPost.series?._id) {
    return {}
  }
  
  // หาบทความทั้งหมดในซีรี่ส์เดียวกัน
  const seriesPosts = allPosts
    .filter(post => post.series?._id === currentPost.series?._id)
    .sort((a, b) => {
      const dateA = a.publishedAt ? new Date(a.publishedAt).getTime() : 0
      const dateB = b.publishedAt ? new Date(b.publishedAt).getTime() : 0
      return dateA - dateB // เรียงจากเก่าไปใหม่
    })
  
  const currentIndex = seriesPosts.findIndex(post => post._id === currentPost._id)
  
  return {
    previous: currentIndex > 0 ? seriesPosts[currentIndex - 1] : undefined,
    next: currentIndex < seriesPosts.length - 1 ? seriesPosts[currentIndex + 1] : undefined,
    seriesPosts
  }
} 