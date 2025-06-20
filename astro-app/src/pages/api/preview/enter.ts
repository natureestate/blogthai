import type { APIRoute } from 'astro'
import { DraftMode, createPreviewUrl } from '../../../utils/preview'

/**
 * API Endpoint: เข้า Preview Mode
 * GET /api/preview/enter?slug=post-slug&secret=preview-secret
 */
export const GET: APIRoute = async ({ request, redirect }) => {
  const url = new URL(request.url)
  const slug = url.searchParams.get('slug')
  const secret = url.searchParams.get('secret')
  
  // ตรวจสอบ secret (ป้องกันการเข้าถึงโดยไม่ได้รับอนุญาต)
  const previewSecret = import.meta.env.SANITY_PREVIEW_SECRET
  if (!previewSecret || secret !== previewSecret) {
    return new Response('Invalid preview secret', { 
      status: 401,
      headers: {
        'Content-Type': 'text/plain'
      }
    })
  }
  
  // ตรวจสอบ slug
  if (!slug) {
    return new Response('Missing slug parameter', { 
      status: 400,
      headers: {
        'Content-Type': 'text/plain'
      }
    })
  }
  
  try {
    // สร้าง preview URL
    const baseUrl = new URL(request.url).origin
    const previewUrl = createPreviewUrl(slug, baseUrl)
    
    // สร้าง response และเปิด draft mode
    const response = redirect(previewUrl, 302)
    DraftMode.enable(response)
    
    return response
    
  } catch (error) {
    console.error('Preview enter error:', error)
    return new Response('Preview mode error', { 
      status: 500,
      headers: {
        'Content-Type': 'text/plain'
      }
    })
  }
} 