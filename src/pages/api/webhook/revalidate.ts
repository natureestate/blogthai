import type { APIRoute } from 'astro'
import { handleWebhook, type WebhookPayload } from '../../../utils/preview'

/**
 * Webhook Endpoint: Revalidate content เมื่อมีการเปลี่ยนแปลงใน Sanity
 * POST /api/webhook/revalidate
 */
export const POST: APIRoute = async ({ request }) => {
  try {
    // ตรวจสอบ webhook secret
    const webhookSecret = import.meta.env.SANITY_WEBHOOK_SECRET
    const signature = request.headers.get('sanity-webhook-signature')
    
    if (webhookSecret && signature) {
      // TODO: ตรวจสอบ signature (optional สำหรับความปลอดภัย)
      // const isValid = verifySignature(body, signature, webhookSecret)
      // if (!isValid) {
      //   return new Response('Invalid signature', { status: 401 })
      // }
    }
    
    // อ่าน payload
    const payload: WebhookPayload = await request.json()
    
    // ตรวจสอบ payload format
    if (!payload._type || !payload._id) {
      return new Response('Invalid payload', { 
        status: 400,
        headers: {
          'Content-Type': 'text/plain'
        }
      })
    }
    
    // จัดการ webhook
    const { shouldRevalidate, revalidatePaths } = handleWebhook(payload)
    
    if (!shouldRevalidate) {
      return new Response(JSON.stringify({
        message: 'No revalidation needed',
        type: payload._type,
        id: payload._id
      }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json'
        }
      })
    }
    
    // Log การ revalidate
    console.log('Revalidating paths:', revalidatePaths)
    console.log('Triggered by:', {
      type: payload._type,
      id: payload._id,
      slug: payload.slug?.current
    })
    
    // ใน Astro ไม่มี built-in revalidation เหมือน Next.js
    // แต่เราสามารถส่ง signal ไปยัง build system หรือ CDN ได้
    
    // ส่งข้อความไปยัง clients ที่เชื่อมต่ออยู่ (ถ้ามี WebSocket)
    await notifyConnectedClients({
      type: 'content-updated',
      paths: revalidatePaths,
      payload
    })
    
    return new Response(JSON.stringify({
      message: 'Revalidation triggered',
      type: payload._type,
      id: payload._id,
      paths: revalidatePaths,
      timestamp: new Date().toISOString()
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    })
    
  } catch (error) {
    console.error('Webhook error:', error)
    return new Response(JSON.stringify({
      message: 'Webhook processing failed',
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
 * ส่งข้อความไปยัง connected clients (สำหรับ real-time updates)
 */
async function notifyConnectedClients(data: {
  type: string
  paths: string[]
  payload: WebhookPayload
}) {
  // ใน production จริงจะใช้ WebSocket, Server-Sent Events หรือ third-party service
  // เช่น Pusher, Socket.io, หรือ Supabase Realtime
  
  try {
    // ตัวอย่างการส่งไปยัง Browser clients ผ่าน Server-Sent Events
    // หรือเก็บ event ใน memory/database เพื่อให้ clients poll
    
    // Log สำหรับ development
    console.log('Notifying clients:', data)
    
    // TODO: Implement real-time notification
    // - WebSocket broadcasting
    // - Server-Sent Events
    // - Third-party real-time service
    
  } catch (error) {
    console.error('Error notifying clients:', error)
  }
}

/**
 * GET endpoint สำหรับ health check
 */
export const GET: APIRoute = async () => {
  return new Response(JSON.stringify({
    message: 'Webhook endpoint is running',
    timestamp: new Date().toISOString(),
    status: 'healthy'
  }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json'
    }
  })
} 