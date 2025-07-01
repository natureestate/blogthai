/**
 * Script สำหรับแก้ไข Code Blocks ที่มีปัญหาใน Sanity Dataset
 * รันคำสั่ง: node fix-code-blocks.js
 */

import { createClient } from '@sanity/client'

// ตั้งค่า Sanity Client
const client = createClient({
  projectId: 'hj5n35bt', // Project ID ของคุณ
  dataset: 'blog', // Dataset name ของคุณ
  useCdn: false,
  token: process.env.SANITY_TOKEN || '', // ต้องมี write permission
  apiVersion: '2024-01-01'
})

async function fixCodeBlocks() {
  try {
    console.log('🔍 ค้นหา posts ที่มี code blocks ที่มีปัญหา...')
    
    // ค้นหา posts ทั้งหมด
    const posts = await client.fetch(`
      *[_type == "post"] {
        _id,
        title,
        body
      }
    `)
    
    console.log(`📚 พบ ${posts.length} posts`)
    
    for (const post of posts) {
      if (!post.body || !Array.isArray(post.body)) continue
      
      let hasInvalidBlocks = false
      const fixedBody = post.body.map(block => {
        // ถ้าเป็น code block ที่ไม่ valid
        if (block._type === 'code' && typeof block.code === 'string') {
          hasInvalidBlocks = true
          console.log(`🔧 แก้ไข code block ใน post: ${post.title}`)
          
          // แปลงให้เป็น format ที่ถูกต้อง
          return {
            ...block,
            _type: 'code',
            language: block.language || 'javascript'
          }
        }
        return block
      })
      
      // ถ้ามีการแก้ไข ให้ update post
      if (hasInvalidBlocks) {
        await client
          .patch(post._id)
          .set({ body: fixedBody })
          .commit()
          
        console.log(`✅ แก้ไข post สำเร็จ: ${post.title}`)
      }
    }
    
    console.log('🎉 แก้ไขเสร็จสิ้น!')
    
  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาด:', error)
  }
}

// รัน script
fixCodeBlocks() 