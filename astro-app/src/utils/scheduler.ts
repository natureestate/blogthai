import { ScheduledPublishing } from './preview'

/**
 * Scheduler Utilities
 * สำหรับ scheduled publishing และ automation features
 */

export interface ScheduledPost {
  _id: string
  _type: string
  title: string
  slug: {
    current: string
  }
  publishedAt: string
  language?: string
  status?: 'draft' | 'scheduled' | 'published'
}

export interface ScheduleStats {
  total: number
  scheduled: number
  overdue: number
  publishingToday: number
  publishingThisWeek: number
}

/**
 * Scheduled Publishing Manager
 */
export class PublishingScheduler {
  private posts: ScheduledPost[] = []
  
  constructor(posts: ScheduledPost[] = []) {
    this.posts = posts
  }
  
  /**
   * เพิ่มบทความเข้า scheduler
   */
  addPost(post: ScheduledPost): void {
    this.posts.push(post)
  }
  
  /**
   * ดึงบทความที่ควรจะ publish แล้ว
   */
  getPostsToPublish(): ScheduledPost[] {
    return this.posts.filter(post => 
      post.status === 'scheduled' && 
      ScheduledPublishing.shouldBePublished(post.publishedAt)
    )
  }
  
  /**
   * ดึงบทความที่จะ publish วันนี้
   */
  getPostsPublishingToday(): ScheduledPost[] {
    const today = new Date()
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59)
    
    return this.posts.filter(post => {
      if (post.status !== 'scheduled') return false
      
      const publishDate = new Date(post.publishedAt)
      return publishDate >= startOfDay && publishDate <= endOfDay
    })
  }
  
  /**
   * ดึงบทความที่จะ publish ในสัปดาห์นี้
   */
  getPostsPublishingThisWeek(): ScheduledPost[] {
    const today = new Date()
    const startOfWeek = new Date(today)
    startOfWeek.setDate(today.getDate() - today.getDay()) // วันอาทิตย์
    startOfWeek.setHours(0, 0, 0, 0)
    
    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(startOfWeek.getDate() + 6) // วันเสาร์
    endOfWeek.setHours(23, 59, 59, 999)
    
    return this.posts.filter(post => {
      if (post.status !== 'scheduled') return false
      
      const publishDate = new Date(post.publishedAt)
      return publishDate >= startOfWeek && publishDate <= endOfWeek
    })
  }
  
  /**
   * ดึงบทความที่เลยเวลา publish แล้ว (overdue)
   */
  getOverduePosts(): ScheduledPost[] {
    const now = new Date()
    
    return this.posts.filter(post => {
      if (post.status !== 'scheduled') return false
      
      const publishDate = new Date(post.publishedAt)
      return publishDate < now
    })
  }
  
  /**
   * คำนวณสถิติ schedule
   */
  getScheduleStats(): ScheduleStats {
    return {
      total: this.posts.length,
      scheduled: this.posts.filter(p => p.status === 'scheduled').length,
      overdue: this.getOverduePosts().length,
      publishingToday: this.getPostsPublishingToday().length,
      publishingThisWeek: this.getPostsPublishingThisWeek().length
    }
  }
  
  /**
   * สร้าง calendar view สำหรับ scheduled posts
   */
  getCalendarView(year: number, month: number): Record<string, ScheduledPost[]> {
    const calendar: Record<string, ScheduledPost[]> = {}
    
    const filteredPosts = this.posts.filter(post => {
      if (post.status !== 'scheduled') return false
      
      const publishDate = new Date(post.publishedAt)
      return publishDate.getFullYear() === year && publishDate.getMonth() === month
    })
    
    filteredPosts.forEach(post => {
      const publishDate = new Date(post.publishedAt)
      const dateKey = publishDate.toISOString().split('T')[0] // YYYY-MM-DD
      
      if (!calendar[dateKey]) {
        calendar[dateKey] = []
      }
      calendar[dateKey].push(post)
    })
    
    return calendar
  }
}

/**
 * Multi-language support utilities
 */
export interface LanguageConfig {
  code: string
  name: string
  nativeName: string
  flag: string
  isDefault: boolean
  direction: 'ltr' | 'rtl'
}

export const SUPPORTED_LANGUAGES: LanguageConfig[] = [
  {
    code: 'th',
    name: 'Thai',
    nativeName: 'ไทย',
    flag: '🇹🇭',
    isDefault: true,
    direction: 'ltr'
  },
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸',
    isDefault: false,
    direction: 'ltr'
  }
]

export class MultiLanguageManager {
  private defaultLanguage: string
  private supportedLanguages: LanguageConfig[]
  
  constructor(languages: LanguageConfig[] = SUPPORTED_LANGUAGES) {
    this.supportedLanguages = languages
    this.defaultLanguage = languages.find(lang => lang.isDefault)?.code || 'th'
  }
  
  /**
   * ดึง language config
   */
  getLanguage(code: string): LanguageConfig | undefined {
    return this.supportedLanguages.find(lang => lang.code === code)
  }
  
  /**
   * ดึงภาษาเริ่มต้น
   */
  getDefaultLanguage(): LanguageConfig {
    return this.getLanguage(this.defaultLanguage)!
  }
  
  /**
   * ตรวจสอบว่า language code ถูกต้องหรือไม่
   */
  isValidLanguage(code: string): boolean {
    return this.supportedLanguages.some(lang => lang.code === code)
  }
  
  /**
   * ดึงภาษาจาก URL path
   */
  getLanguageFromPath(path: string): string {
    const segments = path.split('/').filter(Boolean)
    const firstSegment = segments[0]
    
    if (this.isValidLanguage(firstSegment)) {
      return firstSegment
    }
    
    return this.defaultLanguage
  }
  
  /**
   * สร้าง localized URL
   */
  createLocalizedUrl(path: string, targetLanguage: string): string {
    const currentLanguage = this.getLanguageFromPath(path)
    
    // ถ้าเป็นภาษาเดียวกัน return path เดิม
    if (currentLanguage === targetLanguage) {
      return path
    }
    
    // ลบ language prefix ปัจจุบัน
    let cleanPath = path
    if (currentLanguage !== this.defaultLanguage) {
      cleanPath = path.replace(`/${currentLanguage}`, '') || '/'
    }
    
    // เพิ่ม language prefix ใหม่ (ถ้าไม่ใช่ default language)
    if (targetLanguage !== this.defaultLanguage) {
      cleanPath = `/${targetLanguage}${cleanPath}`
    }
    
    return cleanPath
  }
  
  /**
   * กรองเนื้อหาตามภาษา
   */
  filterByLanguage<T extends { language?: string }>(
    items: T[], 
    language: string
  ): T[] {
    return items.filter(item => {
      // ถ้าไม่ระบุภาษา ให้ถือว่าเป็นภาษาเริ่มต้น
      const itemLanguage = item.language || this.defaultLanguage
      return itemLanguage === language
    })
  }
  
  /**
   * จัดกลุ่มเนื้อหาตามภาษา
   */
  groupByLanguage<T extends { language?: string }>(items: T[]): Record<string, T[]> {
    const groups: Record<string, T[]> = {}
    
    this.supportedLanguages.forEach(lang => {
      groups[lang.code] = []
    })
    
    items.forEach(item => {
      const itemLanguage = item.language || this.defaultLanguage
      if (groups[itemLanguage]) {
        groups[itemLanguage].push(item)
      }
    })
    
    return groups
  }
}

/**
 * Automation helpers
 */
export class BlogAutomation {
  /**
   * สร้าง summary อัตโนมัติสำหรับบทความ
   */
  static generateAutoSummary(content: string, maxLength: number = 160): string {
    // ลบ HTML tags และ markdown
    const cleanContent = content
      .replace(/<[^>]*>/g, '') // HTML tags
      .replace(/\*\*([^*]+)\*\*/g, '$1') // Bold markdown
      .replace(/\*([^*]+)\*/g, '$1') // Italic markdown
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Links
      .replace(/#{1,6}\s/g, '') // Headers
      .replace(/\n+/g, ' ') // Line breaks
      .trim()
    
    if (cleanContent.length <= maxLength) {
      return cleanContent
    }
    
    // ตัดที่คำสุดท้ายที่สมบูรณ์
    const truncated = cleanContent.substring(0, maxLength)
    const lastSpace = truncated.lastIndexOf(' ')
    
    return lastSpace > maxLength * 0.8 
      ? truncated.substring(0, lastSpace) + '...'
      : truncated + '...'
  }
  
  /**
   * สร้าง tags อัตโนมัติจาก content
   */
  static generateAutoTags(title: string, content: string): string[] {
    const commonWords = new Set([
      'การ', 'ของ', 'ใน', 'และ', 'ที่', 'จาก', 'เป็น', 'มี', 'ได้', 'จะ',
      'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with'
    ])
    
    const text = `${title} ${content}`.toLowerCase()
    const words = text
      .replace(/[^\w\sก-๙]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2 && !commonWords.has(word))
    
    // นับความถี่
    const wordCount: Record<string, number> = {}
    words.forEach(word => {
      wordCount[word] = (wordCount[word] || 0) + 1
    })
    
    // เรียงตามความถี่และเอา top 5
    return Object.entries(wordCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([word]) => word)
  }
  
  /**
   * คำนวณ estimated reading time
   */
  static calculateReadingTime(content: string): number {
    const wordsPerMinute = 200 // คนไทยเฉลี่ย
    const cleanContent = content.replace(/<[^>]*>/g, '')
    const wordCount = cleanContent.trim().split(/\s+/).length
    
    return Math.ceil(wordCount / wordsPerMinute)
  }
} 