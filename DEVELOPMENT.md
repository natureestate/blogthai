# 🚀 AI Blog Development Guide

# ดู Astro App
open http://localhost:4321

# ดู Sanity Studio  
open http://localhost:3333

# ตรวจสอบข้อมูล
node test-connection.js

# สร้างข้อมูลตัวอย่าง (ถ้าต้องการ)
node create-sample-data.js

## ℹ️ ข้อมูลพื้นฐาน / Basic Information

**โปรเจค:** AI Blog ด้วย Astro + Sanity CMS  
**Astro App:** http://localhost:4321  
**Sanity Studio:** http://localhost:3333  

## 📦 การติดตั้ง / Installation

โปรเจคนี้ถูกสร้างด้วยคำสั่ง:
```bash
npm create sanity@latest -- --template sanity-io/sanity-template-astro-clean --project yor24whn --dataset production
```

## 🛠️ คำสั่งที่ใช้บ่อย / Common Commands

### 1. เริ่มต้น Development Server
```bash
npm run dev
```
- เปิด Astro app ที่ http://localhost:4321
- เปิด Sanity Studio ที่ http://localhost:3333

### 2. หยุด Development Server
```bash
npm run stop
```
- หยุด process ที่ใช้ port 3333 และ 4321

### 3. Restart Development Server
```bash
npm run restart
```
- หยุด process เก่า รอ 2 วินาที แล้วเริ่มใหม่

### 4. Kill Ports (ฉุกเฉิน)
```bash
npm run kill-ports
```
- ฆ่า process ที่ใช้ port 3333 และ 4321 แบบแยกกัน

### 5. ทดสอบ Restart Script
```bash
./test-restart.sh
```
- ทดสอบการทำงานของ restart script พร้อมแสดงสถานะ

## 🌐 URL ที่สำคัญ / Important URLs

- **เว็บไซต์หลัก:** http://localhost:4321
- **Sanity Studio:** http://localhost:3333
- **Sanity Project Management:** https://sanity.io/manage

## 📁 โครงสร้างโปรเจค / Project Structure

```
blogthai/
├── astro-app/          # Astro frontend application
│   ├── src/
│   ├── public/
│   └── astro.config.mjs
├── studio/             # Sanity Studio CMS
│   ├── sanity.config.ts
│   └── schemas/
├── package.json        # Root package.json with scripts
└── test-restart.sh     # Restart testing script
```

## 🔧 การแก้ไขปัญหา / Troubleshooting

### ปัญหา Port ถูกใช้งานอยู่
```bash
# ตรวจสอบ process ที่ใช้ port
lsof -i:3333,4321

# ฆ่า process ที่ใช้ port เฉพาะ
npm run kill-ports
```

### ปัญหา Development Server ไม่เริ่ม
```bash
# ลบ node_modules และติดตั้งใหม่
rm -rf node_modules package-lock.json
npm install

# หรือใช้ restart script
npm run restart
```

### ปัญหา Permission Denied
```bash
# ให้สิทธิ์ execute script
chmod +x test-restart.sh
```

## 🚀 การ Deploy / Deployment

### Production Build
```bash
# Build Astro app
cd astro-app
npm run build

# Build Sanity Studio
cd ../studio
npm run build
```

### Environment Variables ที่จำเป็น
- `PUBLIC_SANITY_PROJECT_ID=yor24whn`
- `PUBLIC_SANITY_DATASET=production`

## 📝 หมายเหตุ / Notes

1. **Authentication**: ใช้ GitHub account ที่ login ไว้แล้วสำหรับ Sanity Studio
2. **CORS**: Port 3333 และ 4321 ถูกเพิ่มใน CORS origins แล้วโดยอัตโนมัติ
3. **API Version**: ใช้ API version 2024-12-08 (วันที่ setup)
4. **Adapter**: ใช้ Vercel adapter สำหรับ deployment

## 🔗 เอกสารอ้างอิง / References

- [Astro Documentation](https://docs.astro.build/)
- [Sanity Documentation](https://www.sanity.io/docs)
- [Sanity Astro Integration](https://github.com/sanity-io/sanity-astro) 