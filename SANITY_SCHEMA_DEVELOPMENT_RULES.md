# 🏗️ Sanity Schema Development Rules - คู่มือการพัฒนา Schema อย่างมืออาชีพ

## 📋 **Overview**
คู่มือนี้รวบรวม best practices และ conventions สำหรับการพัฒนา Sanity Schema ที่ถูกต้อง, ปลอดภัย, และ maintainable สำหรับโปรเจ็กต์ระดับ production

---

## 🎯 **Core Principles**

### 1. **TypeScript First Approach**
```typescript
// ✅ ใช้ helper functions เสมอ
import { defineType, defineField, defineArrayMember } from 'sanity'

export const postType = defineType({
  name: 'post',
  title: 'Post',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      validation: (rule) => rule.required()
    })
  ]
})

// ❌ อย่าใช้ plain objects
export default {
  name: 'post',
  type: 'document'
}
```

### 2. **Named Exports Only**
```typescript
// ✅ ใช้ named exports
export const postType = defineType({...})

// ❌ หลีกเลี่ยง default exports
export default defineType({...})
```

---

## 📁 **File Organization**

### **Directory Structure**
```
src/
├─ schemaTypes/
│  ├─ index.ts
│  ├─ documents/
│  │  ├─ post.ts
│  │  ├─ author.ts
│  │  └─ category.ts
│  ├─ objects/
│  │  ├─ blockContent.tsx
│  │  ├─ seo.ts
│  │  └─ customLink.ts
│  └─ components/
│     ├─ seoType/
│     │  ├─ index.ts
│     │  ├─ seoInput.tsx
│     │  └─ seoField.tsx
│     └─ customComponents.tsx
```

### **Naming Conventions**
- **Documents:** `postType`, `authorType`, `categoryType`
- **Objects:** `blockContent`, `seoType`, `customLink`
- **Components:** `seoInput`, `customField`, `richTextEditor`

---

## 🔧 **Schema Best Practices**

### 1. **Field Type Guidelines**

#### **Avoid Boolean Fields**
```typescript
// ❌ Avoid boolean - limited flexibility
defineField({
  name: 'isPublished',
  type: 'boolean'
})

// ✅ Use string literals - extensible
defineField({
  name: 'status',
  type: 'string',
  options: {
    list: [
      { title: 'Draft', value: 'draft' },
      { title: 'Published', value: 'published' },
      { title: 'Archived', value: 'archived' }
    ]
  },
  initialValue: 'draft'
})
```

#### **Prefer Array References**
```typescript
// ❌ Single reference - hard to extend
defineField({
  name: 'author',
  type: 'reference',
  to: { type: 'author' }
})

// ✅ Array of references - future-proof
defineField({
  name: 'authors',
  type: 'array',
  of: [defineArrayMember({ 
    type: 'reference', 
    to: { type: 'author' } 
  })],
  validation: (rule) => rule.max(1).required()
})
```

### 2. **Code Block Schema - CRITICAL FIX**
```typescript
// ✅ CORRECT - ใช้ type: 'codeBlock' เท่านั้น
defineField({
  name: 'codeExample',
  type: 'codeBlock',
  options: {
    language: 'javascript',
    languageAlternatives: [
      { title: 'JavaScript', value: 'javascript' },
      { title: 'TypeScript', value: 'typescript' },
      { title: 'Python', value: 'python' },
      { title: 'HTML', value: 'html' },
      { title: 'CSS', value: 'css' }
    ]
  }
})

// ❌ NEVER USE - type: 'code' จะทำให้เกิด validation error
defineField({
  name: 'wrongCode',
  type: 'code' // ← นี่คือปัญหา!
})
```

### 3. **Rich Content (Block Content)**
```typescript
// ใน blockContent.tsx
import { defineType, defineArrayMember } from 'sanity'

export const blockContent = defineType({
  name: 'blockContent',
  title: 'Rich Text',
  type: 'array',
  of: [
    defineArrayMember({
      type: 'block',
      styles: [
        { title: 'Normal', value: 'normal' },
        { title: 'H2', value: 'h2' },
        { title: 'H3', value: 'h3' },
        { title: 'Quote', value: 'blockquote' }
      ],
      lists: [
        { title: 'Bullet', value: 'bullet' },
        { title: 'Numbered', value: 'number' }
      ],
      marks: {
        decorators: [
          { title: 'Strong', value: 'strong' },
          { title: 'Emphasis', value: 'em' }
        ],
        annotations: [
          {
            name: 'link',
            type: 'object',
            title: 'External Link',
            fields: [
              {
                name: 'href',
                type: 'url',
                title: 'URL'
              }
            ]
          }
        ]
      }
    }),
    // ✅ ใช้ codeBlock สำหรับ code examples
    defineArrayMember({
      type: 'codeBlock'
    }),
    defineArrayMember({
      type: 'image',
      options: { hotspot: true }
    })
  ]
})
```

---

## ✅ **Validation Rules**

### **Comprehensive Validation**
```typescript
defineField({
  name: 'title',
  type: 'string',
  validation: (rule) => [
    rule.required().min(10).max(100)
      .error('Title must be 10-100 characters'),
    rule.max(80)
      .warning('Shorter titles perform better for SEO')
  ]
})

// Advanced validation with custom logic
defineField({
  name: 'publishedAt',
  type: 'datetime',
  validation: (rule) => rule.custom((value, context) => {
    const status = context.document?.status
    if (status === 'published' && !value) {
      return 'Published posts must have a publish date'
    }
    return true
  })
})
```

---

## 🎨 **UI Enhancement**

### **Icons and Previews**
```typescript
import { DocumentIcon, TagIcon } from '@sanity/icons'

export const postType = defineType({
  name: 'post',
  title: 'Blog Post',
  type: 'document',
  icon: DocumentIcon,
  fields: [...],
  preview: {
    select: {
      title: 'title',
      subtitle: 'excerpt',
      media: 'mainImage'
    },
    prepare({ title, subtitle, media }) {
      return {
        title,
        subtitle: subtitle || 'No excerpt',
        media
      }
    }
  },
  orderings: [
    {
      title: 'Created Date, Newest',
      name: 'createdDesc',
      by: [{ field: '_createdAt', direction: 'desc' }]
    }
  ]
})
```

### **Field Groups**
```typescript
export const postType = defineType({
  name: 'post',
  type: 'document',
  groups: [
    {
      name: 'content',
      title: 'Content',
      icon: DocumentIcon,
      default: true
    },
    {
      name: 'seo',
      title: 'SEO',
      icon: TagIcon
    },
    {
      name: 'settings',
      title: 'Settings',
      icon: CogIcon
    }
  ],
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      group: 'content'
    }),
    defineField({
      name: 'metaTitle',
      type: 'string',
      group: 'seo'
    })
  ]
})
```

---

## 🚫 **Common Pitfalls & Solutions**

### **1. Code Block Type Error**
```bash
# Error: "Block with key xxx is of type code, which is not allowed by the schema"
# Solution: ใช้ type: 'codeBlock' แทน type: 'code'
```

### **2. Schema Validation Conflicts**
```typescript
// ปัญหา: AI สร้าง invalid types
// วิธีแก้: ตรวจสอบ schema ก่อนเสมอ
const availableTypes = ['codeBlock', 'image', 'file'] // ดูจาก schema
```

### **3. Missing Field Validation**
```typescript
// เพิ่ม validation สำหรับ fields ที่สำคัญ
defineField({
  name: 'slug',
  type: 'slug',
  options: { source: 'title', maxLength: 96 },
  validation: (rule) => rule.required()
})
```

---

## 🛠️ **Development Workflow**

### **1. Schema Development Process**
```bash
# 1. ตรวจสอบ existing schema
npm run dev
# เปิด Studio และดู Schema types ที่มีอยู่

# 2. สร้าง schema ใหม่
# ใช้ defineType, defineField helpers

# 3. Test validation
# สร้าง document ทดสอบใน Studio

# 4. Deploy schema
sanity deploy
```

### **2. Pre-Creation Checks**
```typescript
// ก่อนสร้าง document ด้วย AI เสมอตรวจสอบ:
// 1. Schema types ที่ available
// 2. Field validation rules
// 3. Code block types (ใช้ 'codeBlock' เท่านั้น)
```

---

## 📚 **References & Resources**

### **Documentation Links**
- [Sanity Schema Types](https://www.sanity.io/docs/schema-types)
- [Validation Rules](https://www.sanity.io/docs/validation)
- [defineType Helper](https://www.sanity.io/docs/schema-field-types)

### **Community Best Practices**
- [Opinionated Sanity Guide](https://www.sanity.io/guides/an-opinionated-guide-to-sanity-studio)
- [Schema Organization](https://www.sanity.io/schemas)

---

## ⚡ **Quick Reference**

### **Essential Commands**
```bash
# Schema development
npm run dev                    # Start dev server
sanity schema extract        # Extract current schema
sanity deploy                # Deploy schema changes

# Validation
sanity documents validate    # Validate existing documents
```

### **Must-Remember Rules**
1. ✅ **Always use `defineType`, `defineField`, `defineArrayMember`**
2. ✅ **Use `type: 'codeBlock'` for code - NEVER `type: 'code'`**
3. ✅ **Prefer string literals over booleans**
4. ✅ **Use array references instead of single references**
5. ✅ **Add validation rules for all important fields**
6. ✅ **Include icons and previews for better UX**
7. ✅ **Check schema before creating documents with AI**

---

*อัปเดตล่าสุด: ธันวาคม 2024 | Version: 2.0* 