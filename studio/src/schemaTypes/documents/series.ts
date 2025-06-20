import {defineField, defineType} from 'sanity'

/**
 * Series Schema สำหรับจัดกลุ่มบทความแบบซีรี่ส์
 * ใช้สำหรับการสร้างคอร์สหรือชุดบทความที่เชื่อมโยงกัน
 */

export default defineType({
  name: 'series',
  title: 'Series',
  type: 'document',
  fields: [
    // ✅ ข้อมูลพื้นฐาน
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required().min(5).max(100),
      description: 'ชื่อซีรี่ส์ (5-100 ตัวอักษร)'
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
      description: 'URL ของซีรี่ส์ (จะถูกสร้างอัตโนมัติ)'
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'blockContent',
      description: 'คำอธิบายของซีรี่ส์'
    }),
    defineField({
      name: 'excerpt',
      title: 'Excerpt',
      type: 'text',
      rows: 3,
      validation: (Rule) => Rule.required().min(50).max(200),
      description: 'สรุปย่อของซีรี่ส์ (50-200 ตัวอักษร)'
    }),

    // ✅ รูปภาพ
    defineField({
      name: 'coverImage',
      title: 'Cover Image',
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
          description: 'คำบรรยายรูปภาพ'
        })
      ],
      description: 'รูปภาพหน้าปกของซีรี่ส์'
    }),

    // ✅ การจัดหมวดหมู่
    defineField({
      name: 'category',
      title: 'Category',
      type: 'reference',
      to: {type: 'category'},
      validation: (Rule) => Rule.required(),
      description: 'หมวดหมู่ของซีรี่ส์'
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
      description: 'แท็กของซีรี่ส์ (สูงสุด 10 แท็ก)'
    }),

    // ✅ ข้อมูลผู้เขียนและการเผยแพร่
    defineField({
      name: 'author',
      title: 'Author',
      type: 'reference',
      to: {type: 'author'},
      validation: (Rule) => Rule.required(),
      description: 'ผู้เขียนหลักของซีรี่ส์'
    }),
    defineField({
      name: 'startDate',
      title: 'Start Date',
      type: 'date',
      description: 'วันที่เริ่มซีรี่ส์'
    }),
    defineField({
      name: 'estimatedPosts',
      title: 'Estimated Posts',
      type: 'number',
      validation: (Rule) => Rule.min(2).max(100),
      description: 'จำนวนบทความที่คาดว่าจะมีในซีรี่ส์ (2-100 บทความ)'
    }),

    // ✅ สถานะ
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: [
          {title: 'Planning', value: 'planning'},
          {title: 'In Progress', value: 'in-progress'},
          {title: 'Completed', value: 'completed'},
          {title: 'On Hold', value: 'on-hold'}
        ]
      },
      initialValue: 'planning',
      description: 'สถานะของซีรี่ส์'
    }),
    defineField({
      name: 'featured',
      title: 'Featured Series',
      type: 'boolean',
      description: 'ซีรี่ส์เด่น (จะแสดงในหน้าแรก)',
      initialValue: false
    }),
    defineField({
      name: 'difficulty',
      title: 'Difficulty Level',
      type: 'string',
      options: {
        list: [
          {title: 'Beginner', value: 'beginner'},
          {title: 'Intermediate', value: 'intermediate'},
          {title: 'Advanced', value: 'advanced'},
          {title: 'Expert', value: 'expert'}
        ]
      },
      description: 'ระดับความยากของซีรี่ส์'
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
      author: 'author.name',
      media: 'coverImage',
      status: 'status',
      difficulty: 'difficulty',
      featured: 'featured',
      estimatedPosts: 'estimatedPosts'
    },
    prepare(selection) {
      const {title, author, status, difficulty, featured, estimatedPosts} = selection
      const subtitle = [
        author && `โดย ${author}`,
        status && `สถานะ: ${status}`,
        difficulty && `ระดับ: ${difficulty}`,
        estimatedPosts && `${estimatedPosts} บทความ`,
        featured && '⭐ เด่น'
      ].filter(Boolean).join(' • ')
      
      return {
        ...selection,
        title,
        subtitle
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
      title: 'Start Date, New',
      name: 'startDateDesc',
      by: [
        {field: 'startDate', direction: 'desc'}
      ]
    },
    {
      title: 'Featured First',
      name: 'featuredFirst',
      by: [
        {field: 'featured', direction: 'desc'},
        {field: 'title', direction: 'asc'}
      ]
    },
    {
      title: 'Status',
      name: 'statusOrder',
      by: [
        {field: 'status', direction: 'asc'},
        {field: 'title', direction: 'asc'}
      ]
    }
  ]
}) 