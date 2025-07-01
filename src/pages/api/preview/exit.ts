import type { APIRoute } from 'astro'
import { DraftMode } from '../../../utils/preview'

/**
 * API Endpoint: ออกจาก Preview Mode
 * POST /api/preview/exit
 */
export const POST: APIRoute = async ({ request, redirect }) => {
  try {
    // สร้าง response และปิด draft mode
    const response = new Response(JSON.stringify({ 
      message: 'Preview mode disabled',
      success: true 
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    })
    
    DraftMode.disable(response)
    
    return response
    
  } catch (error) {
    console.error('Preview exit error:', error)
    return new Response(JSON.stringify({ 
      message: 'Error disabling preview mode',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }), { 
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    })
  }
}

/**
 * GET version เพื่อ redirect ไปหน้าหลัก
 */
export const GET: APIRoute = async ({ request, redirect }) => {
  try {
    // ดึง referrer หรือใช้ homepage เป็น default
    const referer = request.headers.get('referer')
    const baseUrl = new URL(request.url).origin
    
    let redirectUrl = baseUrl
    if (referer && referer.startsWith(baseUrl)) {
      const refererUrl = new URL(referer)
      // ลบ preview parameters
      refererUrl.searchParams.delete('preview')
      refererUrl.searchParams.delete('sanity-preview')
      refererUrl.searchParams.delete('draft')
      redirectUrl = refererUrl.toString()
    }
    
    // สร้าง response และปิด draft mode
    const response = redirect(redirectUrl, 302)
    DraftMode.disable(response)
    
    return response
    
  } catch (error) {
    console.error('Preview exit error:', error)
    return new Response('Error disabling preview mode', { 
      status: 500,
      headers: {
        'Content-Type': 'text/plain'
      }
    })
  }
} 