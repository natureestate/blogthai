# 🔧 การแก้ไขปัญหา Sanity Studio InvalidCharacterError

## 📋 สรุปปัญหา

**ข้อผิดพลาด:**
```
InvalidCharacterError: Failed to execute 'createElement' on 'Document': 
The tag name provided ('https://images.unsplash.com/photo-...') is not a valid name.
```

**สาเหตุ:** ใน JSON sample data มีการใส่ URL ของรูปภาพ Unsplash โดยตรงในฟิลด์ `mainImage` แทนที่จะใช้โครงสร้าง Sanity image object ที่ถูกต้อง

## ✅ การแก้ไขที่ทำแล้ว

### 1. แก้ไขไฟล์ JSON Sample Data

**ผิด (เก่า):**
```json
{
  "mainImage": "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?ixlib=rb-4.0.3&ixid=..."
}
```

**ถูก (ใหม่):**
```json
{
  "mainImage": {
    "_type": "image",
    "asset": {
      "_type": "reference",
      "_ref": "image-placeholder-computer-setup"
    },
    "alt": "Modern computer setup with multiple screens showing code for web development",
    "caption": "เครื่องมือสำหรับการพัฒนาเว็บไซต์สมัยใหม่"
  }
}
```

### 2. ไฟล์ที่แก้ไข

- ✅ `studio/updated-astro-post.json`
- ✅ `studio/updated-js-post.json`  
- ✅ `studio/updated-design-post.json`
- 🗑️ `studio/add-unsplash-images.json` (ลบออก - มีโครงสร้างผิด)

### 3. สร้างไฟล์ Sample ใหม่

สร้าง `studio/sample-posts-corrected.json` ที่มีโครงสร้างถูกต้องตาม Sanity schema

## 📝 โครงสร้าง Image Object ที่ถูกต้อง

### สำหรับ Sanity Images
```json
{
  "mainImage": {
    "_type": "image",
    "asset": {
      "_type": "reference",
      "_ref": "image-asset-id"
    },
    "alt": "คำอธิบายรูปภาพ",
    "caption": "คำบรรยายใต้รูป (ไม่บังคับ)"
  }
}
```

### สำหรับ External URLs (ถ้าจำเป็น)
```json
{
  "mainImage": {
    "_type": "image",
    "asset": {
      "_type": "reference", 
      "_ref": "image-placeholder-id"
    },
    "alt": "คำอธิบายรูปภาพ",
    "caption": "คำบรรยาย"
  }
}
```

## 🔍 การตรวจสอบ Image Utilities

### ฟังก์ชันตรวจสอบใน `astro-app/src/utils/image.ts`

- ✅ `isValidImage()` - ตรวจสอบ Sanity image object
- ✅ `isExternalUrl()` - ตรวจสอบ external URLs
- ✅ `hasValidImage()` - ตรวจสอบว่ามีรูปภาพหรือไม่
- ✅ `urlFor()` - สร้าง URL พร้อม fallback
- ✅ `getImageProps()` - สร้าง props สำหรับ components

### Error Handling
```typescript
// Fallback สำหรับกรณีที่ไม่มีรูปภาพ
const placeholderUrl = '/placeholder-image.svg';
return {
  url: () => placeholderUrl,
  width: () => ({ url: () => placeholderUrl }),
  height: () => ({ url: () => placeholderUrl }),
  quality: () => ({ url: () => placeholderUrl }),
  format: () => ({ url: () => placeholderUrl })
};
```

## 🚀 การทดสอบ

### 1. เริ่ม Sanity Studio
```bash
cd studio
npm run dev
```

### 2. ตรวจสอบ Console
- ไม่ควรมี InvalidCharacterError
- Studio ควรโหลดได้ปกติ

### 3. ทดสอบ Astro App
```bash
cd astro-app  
npm run dev
```

## 📌 ข้อควรระวังในอนาคต

1. **อย่าใส่ URL โดยตรงใน image fields**
2. **ใช้ Sanity image asset references เสมอ**
3. **ทดสอบ JSON data ก่อนนำเข้า**
4. **ใช้ image utilities ที่มี error handling**

## 🛠️ เครื่องมือสำหรับ Debug

### ตรวจสอบ Console Errors
```javascript
// เปิด Browser Console และดู errors
console.log('Sanity Studio errors');
```

### ตรวจสอบ Image Structure
```javascript
// ใน component
console.log('Image source:', post.mainImage);
console.log('Is valid:', isValidImage(post.mainImage));
```

---

✅ **สถานะ:** ปัญหาได้รับการแก้ไขแล้ว - Sanity Studio ควรทำงานได้ปกติ 