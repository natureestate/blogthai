import { createClient } from '@sanity/client'
import type { SanityClient } from '@sanity/client'

/**
 * Live Preview และ Visual Editing Utilities
 * สำหรับระบบ draft mode และ real-time preview
 */

interface PreviewConfig {
  projectId: string
  dataset: string
  apiVersion: string
  useCdn: boolean
  token?: string
}

/**
 * สร้าง Sanity client สำหรับ preview mode
 */
export function createPreviewClient(config: PreviewConfig): SanityClient {
  return createClient({
    ...config,
    useCdn: false, // ปิด CDN เพื่อให้ได้ data ล่าสุด
    token: config.token, // ใช้ token สำหรับ draft content
    perspective: 'previewDrafts', // เห็น draft content
    stega: {
      enabled: true, // เปิดใช้ Visual Editing
      studioUrl: `https://${config.projectId}.sanity.studio`, // URL ของ Studio
    }
  })
}

/**
 * ตรวจสอบว่าอยู่ใน preview mode หรือไม่
 */
export function isPreviewMode(request?: Request): boolean {
  if (!request) return false
  
  const url = new URL(request.url)
  const searchParams = url.searchParams
  
  // ตรวจสอบจาก query parameters
  return (
    searchParams.has('preview') ||
    searchParams.has('draft') ||
    searchParams.get('sanity-preview') === 'true'
  )
}

/**
 * สร้าง preview URL สำหรับบทความ
 */
export function createPreviewUrl(slug: string, baseUrl: string): string {
  const url = new URL(`/post/${slug}`, baseUrl)
  url.searchParams.set('preview', 'true')
  url.searchParams.set('sanity-preview', 'true')
  return url.toString()
}

/**
 * ข้อมูล configuration สำหรับ Visual Editing
 */
export const visualEditingConfig = {
  // เปิดใช้ Visual Editing overlay
  enabled: true,
  
  // URL ของ Studio
  studioUrl: process.env.SANITY_STUDIO_URL || 'http://localhost:3333',
  
  // Refresh strategies
  refresh: {
    manual: true, // ให้ user กด refresh เอง
    auto: false   // ไม่ auto refresh
  },
  
  // Overlay configuration
  overlay: {
    zIndex: 999999,
    background: 'rgba(0, 0, 0, 0.8)'
  }
}

/**
 * Draft Mode utilities
 */
export class DraftMode {
  private static readonly DRAFT_COOKIE = 'sanity-draft-mode'
  
  /**
   * เปิด draft mode
   */
  static enable(response: Response): void {
    response.headers.set(
      'Set-Cookie', 
      `${this.DRAFT_COOKIE}=true; Path=/; HttpOnly; SameSite=Strict; Max-Age=3600`
    )
  }
  
  /**
   * ปิด draft mode
   */
  static disable(response: Response): void {
    response.headers.set(
      'Set-Cookie', 
      `${this.DRAFT_COOKIE}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0`
    )
  }
  
  /**
   * ตรวจสอบ draft mode จาก request
   */
  static isEnabled(request: Request): boolean {
    const cookies = request.headers.get('cookie') || ''
    return cookies.includes(`${this.DRAFT_COOKIE}=true`)
  }
}

/**
 * สร้าง GROQ query สำหรับ preview
 */
export function createPreviewQuery(baseQuery: string): string {
  // เพิ่ม _updatedAt สำหรับ real-time updates
  const queryWithMetadata = baseQuery.replace(
    /^(\*\[.*?\])/,
    '$1 | {..., _updatedAt, _rev}'
  )
  
  return queryWithMetadata
}

/**
 * Webhook payload types สำหรับ real-time updates
 */
export interface WebhookPayload {
  _type: string
  _id: string
  _rev: string
  slug?: {
    current: string
  }
}

/**
 * จัดการ webhook จาก Sanity
 */
export function handleWebhook(payload: WebhookPayload): {
  shouldRevalidate: boolean
  revalidatePaths: string[]
} {
  const shouldRevalidate = payload._type === 'post'
  const revalidatePaths: string[] = []
  
  if (shouldRevalidate) {
    // Revalidate homepage
    revalidatePaths.push('/')
    
    // Revalidate post page ถ้ามี slug
    if (payload.slug?.current) {
      revalidatePaths.push(`/post/${payload.slug.current}`)
    }
    
    // Revalidate posts list
    revalidatePaths.push('/posts')
  }
  
  return {
    shouldRevalidate,
    revalidatePaths
  }
}

/**
 * Live Query utilities สำหรับ real-time data
 */
export class LiveQuery {
  private client: SanityClient
  private subscriptions = new Map<string, any>()
  
  constructor(client: SanityClient) {
    this.client = client
  }
  
  /**
   * Subscribe ไปยัง query สำหรับ real-time updates
   */
  subscribe<T = any>(
    query: string, 
    params: Record<string, any> = {},
    callback: (data: T) => void
  ): () => void {
    const subscriptionId = `${query}-${JSON.stringify(params)}`
    
    const subscription = this.client.listen(query, params).subscribe({
      next: (update) => {
        if (update.result) {
          callback(update.result as T)
        }
      },
      error: (error) => {
        console.error('Live query error:', error)
      }
    })
    
    this.subscriptions.set(subscriptionId, subscription)
    
    // Return unsubscribe function
    return () => {
      subscription.unsubscribe()
      this.subscriptions.delete(subscriptionId)
    }
  }
  
  /**
   * ยกเลิก subscription ทั้งหมด
   */
  unsubscribeAll(): void {
    for (const subscription of this.subscriptions.values()) {
      subscription.unsubscribe()
    }
    this.subscriptions.clear()
  }
}

/**
 * Time-based utilities สำหรับ scheduled publishing
 */
export class ScheduledPublishing {
  /**
   * ตรวจสอบว่าบทความควรจะถูก publish แล้วหรือยัง
   */
  static shouldBePublished(publishedAt?: string): boolean {
    if (!publishedAt) return false
    
    const publishDate = new Date(publishedAt)
    const now = new Date()
    
    return publishDate <= now
  }
  
  /**
   * กรองบทความที่ควรจะแสดง (published และถึงเวลาแล้ว)
   */
  static filterPublishedPosts<T extends { publishedAt?: string }>(posts: T[]): T[] {
    return posts.filter(post => this.shouldBePublished(post.publishedAt))
  }
  
  /**
   * คำนวณเวลาที่เหลือก่อน publish
   */
  static getTimeUntilPublish(publishedAt: string): {
    isPast: boolean
    days: number
    hours: number
    minutes: number
    totalSeconds: number
  } {
    const publishDate = new Date(publishedAt)
    const now = new Date()
    const diffMs = publishDate.getTime() - now.getTime()
    
    if (diffMs <= 0) {
      return {
        isPast: true,
        days: 0,
        hours: 0,
        minutes: 0,
        totalSeconds: 0
      }
    }
    
    const totalSeconds = Math.floor(diffMs / 1000)
    const days = Math.floor(totalSeconds / (24 * 60 * 60))
    const hours = Math.floor((totalSeconds % (24 * 60 * 60)) / (60 * 60))
    const minutes = Math.floor((totalSeconds % (60 * 60)) / 60)
    
    return {
      isPast: false,
      days,
      hours,
      minutes,
      totalSeconds
    }
  }
} 