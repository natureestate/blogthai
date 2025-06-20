import {defineField, defineType} from 'sanity'

/**
 * Post Schema สำหรับ Blog ไทย
 * รองรับ SEO, Categories, Tags, และ Rich Content ครบครัน
 * Learn more: https://www.sanity.io/docs/schema-types
 */

export default defineType({
  name: 'post',
  title: 'Post',
  type: 'document',
  fields: [
    // ✅ ข้อมูลพื้นฐาน
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required().min(10).max(100),
      description: 'หัวข้อบทความ (10-100 ตัวอักษร)'
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      validation: (Rule) => Rule.required(),
      options: {
        source: 'title',
        maxLength: 96,
        slugify: (input: string) => input
          .toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[^\w-]+/g, '')
          .slice(0, 96)
      },
      description: 'URL ของบทความ (จะถูกสร้างอัตโนมัติจากหัวข้อ)'
    }),
    defineField({
      name: 'excerpt',
      title: 'Excerpt',
      type: 'text',
      rows: 4,
      validation: (Rule) => Rule.required().min(50).max(200),
      description: 'สรุปย่อของบทความ (50-200 ตัวอักษร) สำหรับแสดงในหน้ารายการ'
    }),

    // ✅ รูปภาพหลัก
    defineField({
      name: 'mainImage',
      title: 'Main Image',
      type: 'image',
      options: {
        hotspot: true,
      },
      fields: [
        defineField({
          name: 'alt',
          title: 'Alternative Text',
          type: 'string',
          validation: (Rule) => Rule.required(),
          description: 'คำอธิบายรูปภาพสำหรับ SEO และ accessibility'
        }),
        defineField({
          name: 'caption',
          title: 'Caption',
          type: 'string',
          description: 'คำบรรยายรูปภาพ (ไม่บังคับ)'
        })
      ],
      description: 'รูปภาพหลักของบทความ'
    }),

    // ✅ เนื้อหาหลัก
    defineField({
      name: 'body',
      title: 'Body',
      type: 'blockContent',
      validation: (Rule) => Rule.required(),
      description: 'เนื้อหาหลักของบทความ'
    }),

    // ✅ การจัดหมวดหมู่
    defineField({
      name: 'categories',
      title: 'Categories',
      type: 'array',
      of: [{type: 'reference', to: {type: 'category'}}],
      validation: (Rule) => Rule.min(1).max(3),
      description: 'หมวดหมู่ของบทความ (1-3 หมวด)'
    }),
    defineField({
      name: 'tags',
      title: 'Tags',
      type: 'array',
      of: [{type: 'string'}],
      options: {
        layout: 'tags'
      },
      validation: (Rule) => Rule.max(10),
      description: 'แท็กของบทความ (สูงสุด 10 แท็ก)'
    }),

    // ✅ ข้อมูลการเผยแพร่
    defineField({
      name: 'publishedAt',
      title: 'Published At',
      type: 'datetime',
      description: 'วันที่เผยแพร่บทความ'
    }),
    defineField({
      name: 'author',
      title: 'Author',
      type: 'reference',
      to: {type: 'author'},
      description: 'ผู้เขียนบทความ'
    }),

    // ✅ SEO Fields
    defineField({
      name: 'seo',
      title: 'SEO',
      type: 'object',
      fields: [
        defineField({
          name: 'metaTitle',
          title: 'Meta Title',
          type: 'string',
          validation: (Rule) => Rule.max(60),
          description: 'หัวข้อสำหรับ Google (สูงสุด 60 ตัวอักษร)'
        }),
        defineField({
          name: 'metaDescription',
          title: 'Meta Description',
          type: 'text',
          rows: 3,
          validation: (Rule) => Rule.max(160),
          description: 'คำอธิบายสำหรับ Google (สูงสุด 160 ตัวอักษร)'
        }),
        defineField({
          name: 'keywords',
          title: 'Keywords',
          type: 'array',
          of: [{type: 'string'}],
          options: {
            layout: 'tags'
          },
          validation: (Rule) => Rule.max(10),
          description: 'คำสำคัญสำหรับ SEO (สูงสุด 10 คำ)'
        }),
        defineField({
          name: 'ogImage',
          title: 'Open Graph Image',
          type: 'image',
          description: 'รูปภาพสำหรับแชร์ใน Social Media (1200x630px)',
          options: {
            hotspot: true,
          },
          fields: [
            defineField({
              name: 'alt',
              title: 'Alternative Text',
              type: 'string'
            })
          ]
        }),
        defineField({
          name: 'noIndex',
          title: 'No Index',
          type: 'boolean',
          description: 'ไม่ให้ Google index บทความนี้',
          initialValue: false
        })
      ],
      options: {
        collapsible: true,
        collapsed: true
      }
    }),

    // ✅ ข้อมูลเพิ่มเติม
    defineField({
      name: 'featured',
      title: 'Featured Post',
      type: 'boolean',
      description: 'บทความเด่น (จะแสดงในหน้าแรก)',
      initialValue: false
    }),
    defineField({
      name: 'readingTime',
      title: 'Reading Time (minutes)',
      type: 'number',
      description: 'เวลาในการอ่าน (นาที) - จะคำนวณอัตโนมัติ',
      readOnly: true
    }),
    defineField({
      name: 'series',
      title: 'Series',
      type: 'reference',
      to: {type: 'series'},
      description: 'ซีรี่ส์ที่บทความนี้เป็นส่วนหนึ่ง (ไม่บังคับ)'
    }),
    defineField({
      name: 'relatedPosts',
      title: 'Related Posts',
      type: 'array',
      of: [{type: 'reference', to: {type: 'post'}}],
      validation: (Rule) => Rule.max(5),
      description: 'บทความที่เกี่ยวข้อง (สูงสุด 5 บทความ)'
    })
  ],

  // ✅ การแสดงตัวอย่างใน Studio
  preview: {
    select: {
      title: 'title',
      author: 'author.name',
      media: 'mainImage',
      publishedAt: 'publishedAt',
      featured: 'featured'
    },
    prepare(selection) {
      const {author, publishedAt, featured} = selection
      const subtitle = [
        author && `โดย ${author}`,
        publishedAt && `เผยแพร่ ${new Date(publishedAt).toLocaleDateString('th-TH')}`,
        featured && '⭐ เด่น'
      ].filter(Boolean).join(' • ')
      
      return {
        ...selection, 
        subtitle
      }
    },
  },

  // ✅ การเรียงลำดับ
  orderings: [
    {
      title: 'Published Date, New',
      name: 'publishedAtDesc',
      by: [
        {field: 'publishedAt', direction: 'desc'}
      ]
    },
    {
      title: 'Published Date, Old',
      name: 'publishedAtAsc',
      by: [
        {field: 'publishedAt', direction: 'asc'}
      ]
    },
    {
      title: 'Title A-Z',
      name: 'titleAsc',
      by: [
        {field: 'title', direction: 'asc'}
      ]
    }
  ]
})
