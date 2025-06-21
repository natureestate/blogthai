// ✅ Create Sample Data for Sanity Studio
// ไฟล์นี้ใช้สำหรับสร้างข้อมูลตัวอย่างใน Sanity

import { createClient } from '@sanity/client'

const client = createClient({
  projectId: 'yor24whn',
  dataset: 'blog',
  useCdn: false,
  apiVersion: '2024-12-08',
  token: process.env.SANITY_API_TOKEN, // ต้องมี token สำหรับเขียนข้อมูล
})

async function createSampleData() {
  console.log('🚀 เริ่มสร้างข้อมูลตัวอย่าง...')
  
  try {
    // ✅ สร้าง Categories
    console.log('📂 สร้างหมวดหมู่...')
    const categories = [
      {
        _type: 'category',
        title: 'Web Development',
        slug: { current: 'web-development' },
        description: 'บทความเกี่ยวกับการพัฒนาเว็บไซต์',
        color: 'blue',
        icon: '💻',
        featured: true
      },
      {
        _type: 'category',
        title: 'React',
        slug: { current: 'react' },
        description: 'บทความเกี่ยวกับ React และ JavaScript',
        color: 'cyan',
        icon: '⚛️',
        featured: true
      },
      {
        _type: 'category',
        title: 'Astro',
        slug: { current: 'astro' },
        description: 'บทความเกี่ยวกับ Astro framework',
        color: 'purple',
        icon: '🚀',
        featured: true
      },
      {
        _type: 'category',
        title: 'Tutorial',
        slug: { current: 'tutorial' },
        description: 'บทความสอนใช้งานต่างๆ',
        color: 'green',
        icon: '📖',
        featured: false
      }
    ]
    
    for (const category of categories) {
      const result = await client.create(category)
      console.log(`✅ สร้างหมวดหมู่: ${category.title}`)
    }
    
    // ✅ สร้าง Authors
    console.log('👤 สร้างผู้เขียน...')
    const authors = [
      {
        _type: 'author',
        name: 'สมชาย นักเขียน',
        slug: { current: 'somchai-writer' },
        shortBio: 'นักพัฒนาเว็บไซต์และนักเขียนที่หลงใหลในเทคโนโลยี',
        email: 'somchai@example.com',
        role: 'author',
        specialties: ['JavaScript', 'React', 'Node.js'],
        featured: true,
        active: true
      },
      {
        _type: 'author',
        name: 'สมหญิง เทคโนโลยี',
        slug: { current: 'somying-tech' },
        shortBio: 'ผู้เชี่ยวชาญด้าน Frontend Development และ UX/UI Design',
        email: 'somying@example.com',
        role: 'editor',
        specialties: ['CSS', 'Design', 'Astro'],
        featured: true,
        active: true
      }
    ]
    
    for (const author of authors) {
      const result = await client.create(author)
      console.log(`✅ สร้างผู้เขียน: ${author.name}`)
    }
    
    // ✅ สร้าง Series
    console.log('📚 สร้างซีรี่ส์...')
    const series = [
      {
        _type: 'series',
        title: 'เริ่มต้นกับ Astro',
        slug: { current: 'getting-started-astro' },
        excerpt: 'ซีรี่ส์สำหรับผู้เริ่มต้นเรียนรู้ Astro framework',
        estimatedPosts: 5,
        status: 'in-progress',
        difficulty: 'beginner',
        featured: true,
        startDate: '2024-01-01'
      },
      {
        _type: 'series',
        title: 'React Advanced Techniques',
        slug: { current: 'react-advanced' },
        excerpt: 'เทคนิคขั้นสูงสำหรับการพัฒนา React applications',
        estimatedPosts: 8,
        status: 'planning',
        difficulty: 'advanced',
        featured: false,
        startDate: '2024-02-01'
      }
    ]
    
    for (const serie of series) {
      const result = await client.create(serie)
      console.log(`✅ สร้างซีรี่ส์: ${serie.title}`)
    }
    
    console.log('🎉 สร้างข้อมูลตัวอย่างเสร็จสิ้น!')
    
  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาด:', error.message)
    console.log('💡 หมายเหตุ: ต้องมี SANITY_API_TOKEN ในไฟล์ .env เพื่อสร้างข้อมูล')
  }
}

createSampleData() 