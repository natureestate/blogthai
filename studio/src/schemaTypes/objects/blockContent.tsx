import {defineType, defineArrayMember} from 'sanity'

/**
 * Schema สำหรับ Rich Text Fields ของ Blog ไทย
 * รองรับ Portable Text แบบเต็มรูปแบบ พร้อม Code Blocks, Images และ Custom Components
 * สามารถนำไปใช้ในส่วนอื่นๆ ของ studio ได้โดยการ import
 */
export default defineType({
  title: 'Block Content',
  name: 'blockContent',
  type: 'array',
  of: [
    // ✅ Text Blocks พื้นฐาน
    defineArrayMember({
      title: 'Block',
      type: 'block',
      // รูปแบบการจัดรูปแบบข้อความ (Styles)
      styles: [
        {title: 'Normal', value: 'normal'},
        {title: 'H1', value: 'h1'},
        {title: 'H2', value: 'h2'},
        {title: 'H3', value: 'h3'},
        {title: 'H4', value: 'h4'},
        {title: 'H5', value: 'h5'},
        {title: 'H6', value: 'h6'},
        {title: 'Quote', value: 'blockquote'},
      ],
      // รูปแบบรายการ (Lists)
      lists: [
        {title: 'Bullet', value: 'bullet'},
        {title: 'Numbered', value: 'number'},
      ],
      // การจัดรูปแบบข้อความในบรรทัด (Marks)
      marks: {
        // ตัวแต่งข้อความ (Decorators)
        decorators: [
          {title: 'Strong', value: 'strong'},
          {title: 'Emphasis', value: 'em'},
          {title: 'Code', value: 'code'},
          {title: 'Underline', value: 'underline'},
          {title: 'Strike', value: 'strike-through'},
        ],
        // หมายเหตุและลิงก์ (Annotations)
        annotations: [
          {
            title: 'URL',
            name: 'link',
            type: 'object',
            fields: [
              {
                title: 'URL',
                name: 'href',
                type: 'url',
                validation: (Rule) => Rule.uri({
                  scheme: ['http', 'https', 'mailto', 'tel']
                })
              },
              {
                title: 'Open in new tab',
                name: 'blank',
                type: 'boolean',
                initialValue: false
              }
            ],
          },
          {
            title: 'Internal Link',
            name: 'internalLink', 
            type: 'object',
            fields: [
              {
                title: 'Reference',
                name: 'reference',
                type: 'reference',
                to: [
                  {type: 'post'}
                ]
              }
            ]
          }
        ],
      },
    }),

    // ✅ Code Block สำหรับ Technical Blog (รองรับ type 'code' และ 'codeBlock')
    defineArrayMember({
      type: 'object',
      name: 'code',
      title: 'Code Block',
      fields: [
        {
          name: 'language',
          title: 'Language',
          type: 'string',
          options: {
            list: [
              {title: 'JavaScript', value: 'javascript'},
              {title: 'TypeScript', value: 'typescript'},
              {title: 'HTML', value: 'html'},
              {title: 'CSS', value: 'css'},
              {title: 'React/JSX', value: 'jsx'},
              {title: 'Vue', value: 'vue'},
              {title: 'Python', value: 'python'},
              {title: 'PHP', value: 'php'},
              {title: 'JSON', value: 'json'},
              {title: 'Bash/Shell', value: 'bash'},
              {title: 'SQL', value: 'sql'},
              {title: 'Plain Text', value: 'text'},
            ]
          }
        },
        {
          name: 'code',
          title: 'Code',
          type: 'text',
          rows: 10
        },
        {
          name: 'filename',
          title: 'Filename (optional)',
          type: 'string'
        },
        {
          name: 'highlightedLines',
          title: 'Highlighted Lines (optional)',
          type: 'string',
          description: 'เช่น: 1,3-5,8'
        }
      ],
      preview: {
        select: {
          title: 'filename',
          subtitle: 'language',
          code: 'code'
        },
        prepare({title, subtitle, code}) {
          return {
            title: title || 'Code Block',
            subtitle: subtitle || 'text',
            media: () => '💻'
          }
        }
      }
    }),

    // ✅ Code Block แบบเก่า (เพื่อ backward compatibility)
    defineArrayMember({
      type: 'object',
      name: 'codeBlock',
      title: 'Code Block (Legacy)',
      fields: [
        {
          name: 'language',
          title: 'Language',
          type: 'string',
          options: {
            list: [
              {title: 'JavaScript', value: 'javascript'},
              {title: 'TypeScript', value: 'typescript'},
              {title: 'HTML', value: 'html'},
              {title: 'CSS', value: 'css'},
              {title: 'React/JSX', value: 'jsx'},
              {title: 'Vue', value: 'vue'},
              {title: 'Python', value: 'python'},
              {title: 'PHP', value: 'php'},
              {title: 'JSON', value: 'json'},
              {title: 'Bash/Shell', value: 'bash'},
              {title: 'SQL', value: 'sql'},
              {title: 'Plain Text', value: 'text'},
            ]
          }
        },
        {
          name: 'code',
          title: 'Code',
          type: 'text',
          rows: 10
        },
        {
          name: 'filename',
          title: 'Filename (optional)',
          type: 'string'
        },
        {
          name: 'highlightedLines',
          title: 'Highlighted Lines (optional)',
          type: 'string',
          description: 'เช่น: 1,3-5,8'
        }
      ],
      preview: {
        select: {
          title: 'filename',
          subtitle: 'language',
          code: 'code'
        },
        prepare({title, subtitle, code}) {
          return {
            title: title || 'Code Block (Legacy)',
            subtitle: subtitle || 'text',
            media: () => '💻'
          }
        }
      }
    }),

    // ✅ Image Block
    defineArrayMember({
      type: 'image',
      name: 'imageBlock',
      title: 'Image',
      options: {
        hotspot: true,
      },
      fields: [
        {
          name: 'alt',
          title: 'Alternative text',
          type: 'string',
          description: 'สำคัญสำหรับ SEO และ accessibility'
        },
        {
          name: 'caption',
          title: 'Caption',
          type: 'string'
        }
      ]
    }),

    // ✅ YouTube Video Embed
    defineArrayMember({
      type: 'object',
      name: 'youtube',
      title: 'YouTube Video',
      fields: [
        {
          name: 'url',
          title: 'YouTube URL',
          type: 'url',
          validation: (Rule) => Rule.required()
        },
        {
          name: 'title',
          title: 'Video Title',
          type: 'string'
        }
      ],
      preview: {
        select: {
          title: 'title',
          url: 'url'
        },
        prepare({title, url}) {
          return {
            title: title || 'YouTube Video',
            subtitle: url,
            media: () => '🎥'
          }
        }
      }
    }),

    // ✅ Call to Action Box
    defineArrayMember({
      type: 'object',
      name: 'callToAction',
      title: 'Call to Action',
      fields: [
        {
          name: 'title',
          title: 'Title',
          type: 'string',
          validation: (Rule) => Rule.required()
        },
        {
          name: 'description',
          title: 'Description', 
          type: 'text',
          rows: 3
        },
        {
          name: 'buttonText',
          title: 'Button Text',
          type: 'string'
        },
        {
          name: 'buttonUrl',
          title: 'Button URL',
          type: 'url'
        },
        {
          name: 'variant',
          title: 'Style Variant',
          type: 'string',
          options: {
            list: [
              {title: 'Primary', value: 'primary'},
              {title: 'Secondary', value: 'secondary'},
              {title: 'Success', value: 'success'},
              {title: 'Warning', value: 'warning'},
              {title: 'Info', value: 'info'}
            ]
          },
          initialValue: 'primary'
        }
      ],
      preview: {
        select: {
          title: 'title',
          subtitle: 'description'
        },
        prepare({title, subtitle}) {
          return {
            title: title,
            subtitle: subtitle,
            media: () => '📢'
          }
        }
      }
    }),

    // ✅ Table
    defineArrayMember({
      type: 'object',
      name: 'table',
      title: 'Table',
      fields: [
        {
          name: 'caption',
          title: 'Table Caption',
          type: 'string'
        },
        {
          name: 'rows',
          title: 'Table Rows',
          type: 'array',
          of: [
            {
              type: 'object',
              name: 'row',
              fields: [
                {
                  name: 'cells',
                  title: 'Cells',
                  type: 'array',
                  of: [{type: 'string'}]
                }
              ]
            }
          ]
        }
      ],
      preview: {
        select: {
          title: 'caption'
        },
        prepare({title}) {
          return {
            title: title || 'Table',
            media: () => '📊'
          }
        }
      }
    })
  ],
})
