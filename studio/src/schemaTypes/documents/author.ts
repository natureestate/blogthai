import {defineField, defineType} from 'sanity'

/**
 * Author Schema สำหรับข้อมูลผู้เขียนบทความ
 * รองรับข้อมูลส่วนตัว, Social Media และ Bio
 */

export default defineType({
  name: 'author',
  title: 'Author',
  type: 'document',
  fields: [
    // ✅ ข้อมูลพื้นฐาน
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: (Rule) => Rule.required().min(2).max(50),
      description: 'ชื่อผู้เขียน (2-50 ตัวอักษร)'
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      validation: (Rule) => Rule.required(),
      options: {
        source: 'name',
        maxLength: 96,
        slugify: (input: string) => input
          .toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[^\w-]+/g, '')
          .slice(0, 96)
      },
      description: 'URL ของผู้เขียน (จะถูกสร้างอัตโนมัติ)'
    }),
    defineField({
      name: 'avatar',
      title: 'Avatar',
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
          description: 'คำอธิบายรูปภาพสำหรับ accessibility'
        })
      ],
      description: 'รูปผู้เขียน (แนะนำขนาด 400x400px)'
    }),
    defineField({
      name: 'bio',
      title: 'Bio',
      type: 'blockContent',
      description: 'ประวัติและข้อมูลของผู้เขียน'
    }),
    defineField({
      name: 'shortBio',
      title: 'Short Bio',
      type: 'text',
      rows: 3,
      validation: (Rule) => Rule.max(200),
      description: 'ประวัติย่อ (สูงสุด 200 ตัวอักษร) สำหรับแสดงในบทความ'
    }),

    // ✅ ข้อมูลติดต่อ
    defineField({
      name: 'email',
      title: 'Email',
      type: 'string',
      validation: (Rule) => Rule.email(),
      description: 'อีเมลสำหรับติดต่อ'
    }),
    defineField({
      name: 'website',
      title: 'Website',
      type: 'url',
      description: 'เว็บไซต์ส่วนตัว'
    }),

    // ✅ Social Media
    defineField({
      name: 'socialMedia',
      title: 'Social Media',
      type: 'object',
      fields: [
        defineField({
          name: 'twitter',
          title: 'Twitter',
          type: 'string',
          description: 'Twitter username (ไม่ต้องใส่ @)'
        }),
        defineField({
          name: 'facebook',
          title: 'Facebook',
          type: 'url',
          description: 'Facebook profile URL'
        }),
        defineField({
          name: 'instagram',
          title: 'Instagram',
          type: 'string',
          description: 'Instagram username (ไม่ต้องใส่ @)'
        }),
        defineField({
          name: 'linkedin',
          title: 'LinkedIn',
          type: 'url',
          description: 'LinkedIn profile URL'
        }),
        defineField({
          name: 'github',
          title: 'GitHub',
          type: 'string',
          description: 'GitHub username'
        }),
        defineField({
          name: 'youtube',
          title: 'YouTube',
          type: 'url',
          description: 'YouTube channel URL'
        })
      ],
      options: {
        collapsible: true,
        collapsed: true
      }
    }),

    // ✅ ข้อมูลเพิ่มเติม
    defineField({
      name: 'role',
      title: 'Role',
      type: 'string',
      options: {
        list: [
          {title: 'Admin', value: 'admin'},
          {title: 'Editor', value: 'editor'},
          {title: 'Author', value: 'author'},
          {title: 'Contributor', value: 'contributor'},
          {title: 'Guest Writer', value: 'guest'}
        ]
      },
      initialValue: 'author',
      description: 'บทบาทของผู้เขียน'
    }),
    defineField({
      name: 'specialties',
      title: 'Specialties',
      type: 'array',
      of: [{type: 'string'}],
      options: {
        layout: 'tags'
      },
      validation: (Rule) => Rule.max(10),
      description: 'ความเชี่ยวชาญ/สาขาที่ถนัด (สูงสุด 10 สาขา)'
    }),
    defineField({
      name: 'featured',
      title: 'Featured Author',
      type: 'boolean',
      description: 'ผู้เขียนเด่น (จะแสดงในหน้าแรก)',
      initialValue: false
    }),
    defineField({
      name: 'active',
      title: 'Active',
      type: 'boolean',
      description: 'ผู้เขียนที่ยังคงเขียนอยู่',
      initialValue: true
    }),

    // ✅ SEO
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
        })
      ],
      options: {
        collapsible: true,
        collapsed: true
      }
    })
  ],

  preview: {
    select: {
      title: 'name',
      subtitle: 'role',
      media: 'avatar',
      shortBio: 'shortBio',
      featured: 'featured',
      active: 'active'
    },
    prepare(selection) {
      const {title, subtitle, shortBio, featured, active} = selection
      const statusText = [
        subtitle,
        !active && '⏸️ Inactive',
        featured && '⭐ เด่น'
      ].filter(Boolean).join(' • ')
      
      return {
        ...selection,
        subtitle: statusText || shortBio
      }
    }
  },

  orderings: [
    {
      title: 'Name A-Z',
      name: 'nameAsc',
      by: [
        {field: 'name', direction: 'asc'}
      ]
    },
    {
      title: 'Featured First',
      name: 'featuredFirst',
      by: [
        {field: 'featured', direction: 'desc'},
        {field: 'name', direction: 'asc'}
      ]
    },
    {
      title: 'Active First',
      name: 'activeFirst',
      by: [
        {field: 'active', direction: 'desc'},
        {field: 'name', direction: 'asc'}
      ]
    }
  ]
}) 