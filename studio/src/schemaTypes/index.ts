// ✅ Import Schema Types สำหรับ Blog ไทย

// Documents (เอกสารหลัก)
import post from './documents/post'
import category from './documents/category'
import author from './documents/author'
import series from './documents/series'

// Objects (วัตถุย่อย)
import blockContent from './objects/blockContent'

/**
 * รวมรวม Schema Types ทั้งหมดสำหรับ Sanity Studio
 * สำหรับโปรเจ็กต์ Blog ไทย
 */
export const schemaTypes = [
  // ✅ Document Types
  post,        // บทความ
  category,    // หมวดหมู่
  author,      // ผู้เขียน
  series,      // ซีรี่ส์/คอร์ส
  
  // ✅ Object Types
  blockContent // เนื้อหา Rich Text
]
