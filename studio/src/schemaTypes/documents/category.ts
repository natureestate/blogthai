import {defineField, defineType} from 'sanity'

/**
 * Category Schema สำหรับจัดหมวดหมู่บทความ
 * ใช้สำหรับการจัดกลุ่มบทความตามหัวข้อหลัก
 */

export default defineType({
  name: 'category',
  title: 'Category',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required().min(2).max(50),
      description: 'ชื่อหมวดหมู่ (2-50 ตัวอักษร)'
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
      description: 'URL ของหมวดหมู่ (จะถูกสร้างอัตโนมัติ)'
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 3,
      validation: (Rule) => Rule.max(200),
      description: 'คำอธิบายหมวดหมู่ (สูงสุด 200 ตัวอักษร)'
    }),
    defineField({
      name: 'color',
      title: 'Color',
      type: 'string',
      options: {
        list: [
          {title: 'Blue', value: 'blue'},
          {title: 'Green', value: 'green'},
          {title: 'Red', value: 'red'},
          {title: 'Yellow', value: 'yellow'},
          {title: 'Purple', value: 'purple'},
          {title: 'Pink', value: 'pink'},
          {title: 'Indigo', value: 'indigo'},
          {title: 'Gray', value: 'gray'}
        ]
      },
      initialValue: 'blue',
      description: 'สีประจำหมวดหมู่'
    }),
    defineField({
      name: 'icon',
      title: 'Icon',
      type: 'string',
      description: 'ไอคอนหมวดหมู่ (emoji หรือ icon name)'
    }),
    defineField({
      name: 'featured',
      title: 'Featured Category',
      type: 'boolean',
      description: 'หมวดหมู่เด่น (จะแสดงในหน้าแรก)',
      initialValue: false
    }),
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
      title: 'title',
      description: 'description',
      color: 'color',
      icon: 'icon',
      featured: 'featured'
    },
    prepare(selection) {
      const {title, description, color, icon, featured} = selection
      return {
        title: `${icon ? icon + ' ' : ''}${title}`,
        subtitle: [
          description,
          color && `สี: ${color}`,
          featured && '⭐ เด่น'
        ].filter(Boolean).join(' • '),
        media: () => icon || '📁'
      }
    }
  },
  orderings: [
    {
      title: 'Title A-Z',
      name: 'titleAsc',
      by: [
        {field: 'title', direction: 'asc'}
      ]
    },
    {
      title: 'Featured First',
      name: 'featuredFirst',
      by: [
        {field: 'featured', direction: 'desc'},
        {field: 'title', direction: 'asc'}
      ]
    }
  ]
}) 