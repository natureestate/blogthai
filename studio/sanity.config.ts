import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {
  dashboardTool,
  sanityTutorialsWidget,
  projectUsersWidget,
  projectInfoWidget,
} from '@sanity/dashboard'
import {schemaTypes} from './src/schemaTypes'

// Environment variables สำหรับการตั้งค่าโปรเจ็กต์
const projectId = process.env.SANITY_STUDIO_PROJECT_ID || 'yor24whn'
const dataset = process.env.SANITY_STUDIO_DATASET || 'blog'

export default defineConfig({
  name: 'sanity-template-astro-clean',
  title: 'Sanity Astro Starter',
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
    visionTool()
  ],
  schema: {
    types: schemaTypes,
  },
})
