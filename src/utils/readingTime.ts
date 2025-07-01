import readingTime from 'reading-time'

/**
 * คำนวณเวลาในการอ่านจาก Portable Text content
 * รองรับ block content ที่มา Sanity
 */

interface PortableTextBlock {
  _type: string
  children?: Array<{
    text?: string
    _type: string
  }>
  code?: string
  language?: string
}

/**
 * แปลง Portable Text เป็น plain text เพื่อคำนวณเวลาในการอ่าน
 */
export function extractTextFromPortableText(blocks: PortableTextBlock[]): string {
  if (!blocks || !Array.isArray(blocks)) return ''
  
  return blocks
    .map(block => {
      // ✅ Text blocks
      if (block._type === 'block' && block.children) {
        return block.children
          .map(child => child.text || '')
          .join('')
      }
      
      // ✅ Code blocks
      if (block._type === 'codeBlock' && block.code) {
        // นับโค้ดเป็น 1/3 ของเวลาอ่านปกติ (เพราะอ่านเร็วกว่าข้อความ)
        return block.code.split('\n').join(' ').repeat(0.3)
      }
      
      // ✅ อื่นๆ
      return ''
    })
    .join(' ')
    .trim()
}

/**
 * คำนวณเวลาในการอ่าน (นาที)
 */
export function calculateReadingTime(content: PortableTextBlock[] | string): {
  minutes: number
  words: number
  text: string
} {
  let text: string
  
  if (typeof content === 'string') {
    text = content
  } else {
    text = extractTextFromPortableText(content)
  }
  
  const stats = readingTime(text, {
    wordsPerMinute: 200 // ความเร็วในการอ่านเฉลี่ยสำหรับภาษาไทย
  })
  
  return {
    minutes: Math.ceil(stats.minutes), // ปัดขึ้นเป็นจำนวนเต็ม
    words: stats.words,
    text: `${Math.ceil(stats.minutes)} นาที`
  }
}

/**
 * สร้างข้อความแสดงเวลาในการอ่านแบบเป็นมิตร
 */
export function formatReadingTime(minutes: number): string {
  if (minutes < 1) return 'น้อยกว่า 1 นาที'
  if (minutes === 1) return '1 นาที'
  if (minutes < 60) return `${minutes} นาที`
  
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  
  if (remainingMinutes === 0) {
    return hours === 1 ? '1 ชั่วโมง' : `${hours} ชั่วโมง`
  }
  
  return `${hours} ชั่วโมง ${remainingMinutes} นาที`
}

/**
 * คำนวณเวลาในการอ่านสำหรับ array ของ posts
 */
export function calculatePostsReadingTime(posts: Array<{ body: PortableTextBlock[] }>) {
  return posts.map(post => ({
    ...post,
    readingTime: calculateReadingTime(post.body)
  }))
} 