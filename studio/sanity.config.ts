import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {presentationTool} from 'sanity/presentation'
import {
  dashboardTool,
  sanityTutorialsWidget,
  projectUsersWidget,
  projectInfoWidget,
} from '@sanity/dashboard'
import {schemaTypes} from './src/schemaTypes'

// Environment variables สำหรับการตั้งค่าโปรเจ็กต์
const projectId = 'yor24whn'
const dataset = 'blog'

// URL สำหรับ Preview และ Visual Editing - ปรับตาม port ที่ Astro ใช้
const previewUrl = 'http://localhost:4323'

export default defineConfig({
  name: 'sanity-template-astro-clean',
  title: 'Blog Thai Studio',
  projectId,
  dataset,
  plugins: [
    // เพิ่ม Dashboard tool เป็นตัวแรกเพื่อให้เป็นหน้าแรกที่ผู้ใช้เห็น
    dashboardTool({
      widgets: [
        // แสดง Sanity tutorials
        sanityTutorialsWidget(),
        // แสดงข้อมูลโปรเจ็กต์
        projectInfoWidget(),
        // แสดงรายชื่อผู้ใช้ในโปรเจ็กต์
        projectUsersWidget(),
      ]
    }),
    structureTool(),
    // ✅ เพิ่ม Presentation Tool สำหรับ Visual Editing
    presentationTool({
      title: 'Visual Editor',
      previewUrl: previewUrl,
    }),
    visionTool()
  ],
  schema: {
    types: schemaTypes,
  },
  // ✅ เพิ่ม Form components สำหรับ Visual Editing
  form: {
    // เพิ่ม live preview ใน form
    image: {
      assetSources: (previousAssetSources) => {
        return previousAssetSources.filter((assetSource) => assetSource.name !== 'unsplash')
      },
    },
  },
})
