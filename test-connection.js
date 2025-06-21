// ✅ Test Sanity Connection
// ไฟล์นี้ใช้สำหรับทดสอบการเชื่อมต่อระหว่าง Astro และ Sanity

import { createClient } from '@sanity/client'

// ใช้ค่าเดียวกับใน config
const projectId = 'yor24whn'
const dataset = 'blog'

const client = createClient({
  projectId,
  dataset,
  useCdn: false,
  apiVersion: '2024-12-08',
})

async function testConnection() {
  console.log('🔗 กำลังทดสอบการเชื่อมต่อ Sanity...')
  console.log(`📋 Project ID: ${projectId}`)
  console.log(`📊 Dataset: ${dataset}`)
  
  try {
    // ✅ ทดสอบ basic query
    const posts = await client.fetch('*[_type == "post"]')
    console.log(`✅ พบบทความ: ${posts.length} บทความ`)
    
    if (posts.length > 0) {
      console.log('📰 บทความแรก:', posts[0].title || 'ไม่มีหัวข้อ')
    }
    
    // ✅ ทดสอบ categories
    const categories = await client.fetch('*[_type == "category"]')
    console.log(`📂 พบหมวดหมู่: ${categories.length} หมวด`)
    
    // ✅ ทดสอบ authors
    const authors = await client.fetch('*[_type == "author"]')
    console.log(`👥 พบผู้เขียน: ${authors.length} คน`)
    
    // ✅ ทดสอบ series
    const series = await client.fetch('*[_type == "series"]')
    console.log(`📚 พซีรี่ส์: ${series.length} ซีรี่ส์`)
    
    console.log('🎉 การเชื่อมต่อ Sanity สำเร็จ!')
    
  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาดในการเชื่อมต่อ:', error.message)
  }
}

testConnection() 