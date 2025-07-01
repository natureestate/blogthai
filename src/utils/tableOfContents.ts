/**
 * Table of Contents Utility
 * สร้างสารบัญอัตโนมัติจาก Portable Text หรือ HTML content
 */

interface PortableTextBlock {
  _type: string
  style?: string
  children?: Array<{
    text?: string
    _type: string
  }>
  _key?: string
}

export interface TocItem {
  id: string
  title: string
  level: number
  slug: string
  children?: TocItem[]
}

/**
 * แปลง heading style เป็น level number
 */
function getHeadingLevel(style: string): number {
  const headingMatch = style.match(/^h([1-6])$/)
  return headingMatch ? parseInt(headingMatch[1], 10) : 0
}

/**
 * สร้าง slug จากข้อความ
 */
export function createSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\u0E00-\u0E7F\w\s-]/g, '') // รองรับภาษาไทย
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
    .replace(/^-|-$/g, '')
}

/**
 * แยกข้อความจาก Portable Text children
 */
function extractTextFromChildren(children: Array<{ text?: string; _type: string }>): string {
  return children
    .filter(child => child._type === 'span' && child.text)
    .map(child => child.text)
    .join('')
    .trim()
}

/**
 * สร้าง Table of Contents จาก Portable Text
 */
export function generateTocFromPortableText(blocks: PortableTextBlock[]): TocItem[] {
  if (!blocks || !Array.isArray(blocks)) return []
  
  const headings: TocItem[] = []
  let counter = 1
  
  blocks.forEach(block => {
    // ตรวจสอบว่าเป็น heading block หรือไม่
    if (block._type === 'block' && block.style && block.children) {
      const level = getHeadingLevel(block.style)
      
      if (level > 0) {
        const title = extractTextFromChildren(block.children)
        
        if (title) {
          const slug = createSlug(title)
          const id = `heading-${counter++}`
          
          headings.push({
            id,
            title,
            level,
            slug,
          })
        }
      }
    }
  })
  
  return headings
}

/**
 * สร้าง Table of Contents จาก HTML string
 */
export function generateTocFromHTML(html: string): TocItem[] {
  // สำหรับ server-side ใช้ regex แทน DOM parser
  const headingRegex = /<h([1-6])[^>]*(?:\sid=['"]([^'"]*))?>([^<]+)<\/h[1-6]>/gi
  const headings: TocItem[] = []
  let counter = 1
  let match
  
  while ((match = headingRegex.exec(html)) !== null) {
    const level = parseInt(match[1], 10)
    const existingId = match[2]
    const title = match[3].trim()
    
    if (title) {
      const slug = createSlug(title)
      const id = existingId || `heading-${counter++}`
      
      headings.push({
        id,
        title,
        level,
        slug,
      })
    }
  }
  
  return headings
}

/**
 * จัดโครงสร้าง TOC แบบ nested (ลูกใต้แม่)
 */
export function buildNestedToc(flatToc: TocItem[]): TocItem[] {
  const nested: TocItem[] = []
  const stack: TocItem[] = []
  
  flatToc.forEach(item => {
    const newItem = { ...item, children: [] }
    
    // หา parent ที่เหมาะสม
    while (stack.length > 0 && stack[stack.length - 1].level >= newItem.level) {
      stack.pop()
    }
    
    if (stack.length === 0) {
      // Top level item
      nested.push(newItem)
    } else {
      // Child item
      const parent = stack[stack.length - 1]
      if (!parent.children) parent.children = []
      parent.children.push(newItem)
    }
    
    stack.push(newItem)
  })
  
  return nested
}

/**
 * กรอง TOC ตาม level ที่ต้องการ
 */
export function filterTocByLevel(toc: TocItem[], maxLevel = 3, minLevel = 1): TocItem[] {
  return toc.filter(item => item.level >= minLevel && item.level <= maxLevel)
}

/**
 * สร้าง HTML สำหรับ TOC
 */
export function renderTocHTML(toc: TocItem[], options: {
  className?: string
  linkClassName?: string
  includeNumbers?: boolean
} = {}): string {
  const {
    className = 'table-of-contents',
    linkClassName = 'toc-link',
    includeNumbers = false
  } = options
  
  if (!toc.length) return ''
  
  function renderItem(item: TocItem, index: number): string {
    const numberPrefix = includeNumbers ? `${index + 1}. ` : ''
    const link = `<a href="#${item.id}" class="${linkClassName}">${numberPrefix}${item.title}</a>`
    
    let html = `<li>${link}`
    
    if (item.children && item.children.length > 0) {
      html += `<ul>${item.children.map((child, childIndex) => renderItem(child, childIndex)).join('')}</ul>`
    }
    
    html += '</li>'
    return html
  }
  
  return `<nav class="${className}">
    <ul>
      ${toc.map((item, index) => renderItem(item, index)).join('')}
    </ul>
  </nav>`
}

/**
 * สร้าง TOC compact (แค่ flat list)
 */
export function generateCompactToc(blocks: PortableTextBlock[], maxItems = 5): TocItem[] {
  const toc = generateTocFromPortableText(blocks)
  return filterTocByLevel(toc, 3, 1).slice(0, maxItems)
}

/**
 * หา heading ถัดไปและก่อนหน้า
 */
export function getAdjacentHeadings(toc: TocItem[], currentId: string): {
  previous?: TocItem
  next?: TocItem
} {
  const flatToc = flattenToc(toc)
  const currentIndex = flatToc.findIndex(item => item.id === currentId)
  
  if (currentIndex === -1) return {}
  
  return {
    previous: currentIndex > 0 ? flatToc[currentIndex - 1] : undefined,
    next: currentIndex < flatToc.length - 1 ? flatToc[currentIndex + 1] : undefined
  }
}

/**
 * แปลง nested TOC เป็น flat array
 */
function flattenToc(toc: TocItem[]): TocItem[] {
  const result: TocItem[] = []
  
  function traverse(items: TocItem[]) {
    items.forEach(item => {
      result.push(item)
      if (item.children) {
        traverse(item.children)
      }
    })
  }
  
  traverse(toc)
  return result
} 