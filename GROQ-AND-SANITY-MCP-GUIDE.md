# 🚀 GROQ & Sanity MCP Server Complete Guide

คู่มือครบครันสำหรับ GROQ และ Sanity Model Context Protocol Server

## 🔍 GROQ คืออะไร?

**GROQ** ย่อมาจาก **Graph-Oriented Query Language** เป็นภาษา query ที่ Sanity พัฒนาขึ้นเฉพาะสำหรับการดึงข้อมูลจาก Content Lake

### 🎯 **ทำไม GROQ ถึงดี?**

#### 1. **เข้าใจง่าย กว่า GraphQL/SQL**
```groq
// GROQ - อ่านเข้าใจง่าย
*[_type == "post" && publishedAt > "2024-01-01"]

// เทียบกับ SQL
SELECT * FROM posts WHERE type = 'post' AND published_at > '2024-01-01'
```

#### 2. **ยืดหยุ่นสูง - Projections**
```groq
// ดึงเฉพาะ field ที่ต้องการ
*[_type == "post"]{
  title,
  slug,
  author->{name, image},
  "imageUrl": mainImage.asset->url
}
```

#### 3. **Join ข้อมูลได้ง่าย**
```groq
// ดึงข้อมูล post พร้อม author และ category
*[_type == "post"]{
  title,
  author->{name, bio},
  categories[]->{title, slug}
}
```

#### 4. **Filtering & Sorting ที่ทรงพลัง**
```groq
// ค้นหาและเรียงลำดับ
*[_type == "post" && "javascript" in tags[]->slug.current]
| order(publishedAt desc)[0...10]
```

---

## 🚀 Sanity MCP Server Features แบบละเอียด

### 🔍 **1. Content Intelligence (ค้นหาและวิเคราะห์)**

#### **Natural Language to GROQ**
แทนที่จะเขียน:
```groq
*[_type == "post" && publishedAt > dateTime(now()) - 86400*30]
```

ใช้แค่: **"แสดงบทความทั้งหมดที่เผยแพร่ในเดือนที่แล้ว"**

#### **Semantic Search**
```bash
# แทนที่จะค้นหาคำตรงๆ
"หาบทความที่เกี่ยวกับ Astro และ Sanity"

# MCP จะ:
1. ใช้ AI embeddings หาความหมาย
2. ค้นหาเนื้อหาที่เกี่ยวข้อง
3. รวมผลลัพธ์ที่ relevant
```

#### **Content Analysis**
```bash
"วิเคราะห์ tag ที่ใช้บ่อยที่สุด"
# → สร้าง GROQ query + วิเคราะห์ผลลัพธ์
# → แสดงกราฟหรือตารางสถิติ

"ตรวจสอบบทความไหนที่ยังไม่ได้อัปเดตนานแล้ว"
# → เช็ค _updatedAt field ของทุกบทความ
# → จัดเรียงตามวันที่
```

### ⚡ **2. Content Operations (สร้างและแก้ไข)**

#### **Smart Document Creation**
```bash
"สร้างบทความใหม่เกี่ยวกับ Next.js"

# MCP จะ:
1. สร้าง document ใหม่ตาม schema
2. กำหนด _type = "post"
3. สร้าง slug อัตโนมัติ
4. เติม metadata พื้นฐาน
5. ตั้งสถานะเป็น draft
```

#### **Bulk Operations**
```bash
"อัปเดตข้อมูลราคาในหน้า service ทั้งหมด"

# MCP จะ:
1. หา documents ที่เป็น service pages
2. แก้ไขราคาที่ระบุ
3. ทำ batch update
4. รักษา revision history
```

#### **Content Migration**
```bash
"เปลี่ยนชื่อ 'Sanity Create' เป็น 'Sanity Canvas' ทุกที่"

# MCP จะ:
1. ค้นหาใน title, body, metadata
2. แทนที่ text ทั้งหมด
3. สร้าง content release
4. ให้ preview ก่อน publish
```

### 📅 **3. Release Management**

#### **Advanced Scheduling**
```bash
"สร้าง content release สำหรับ campaign เทศกาล"

# MCP จะ:
1. สร้าง release bundle
2. เพิ่ม related documents
3. ตั้งตารางเผยแพร่
4. กำหนด approval workflow
```

#### **Release Preview**
```bash
# ดู content ที่จะ release
"แสดงเนื้อหาใน Holiday Campaign release"

# ทดสอบก่อน go live
"ทดสอบ release บน staging environment"
```

### 🏗️ **4. Schema และข้อมูลโปรเจ็กต์**

#### **Schema Exploration**
```bash
"แสดง schema ของ content type ทั้งหมด"

# MCP จะ:
1. อ่าน deployed schema manifest
2. แสดง field definitions
3. อธิบาย relationships
4. แสดง validation rules
```

#### **Project Intelligence**
```bash
"ดูข้อมูลโปรเจ็กต์และ dataset"

# ได้ข้อมูล:
- จำนวน documents แต่ละ type
- Storage usage
- API usage statistics
- Recent activity
```

---

## 🛠️ **Advanced Features แบบลึก**

### 💡 **1. GROQ Query Generation**

#### **ตัวอย่างการแปลง Natural Language:**

**Input:** "หาบทความ JavaScript ที่มี author ชื่อ John"
```groq
*[_type == "post" && 
  "javascript" in tags[]->slug.current &&
  author->name match "John*"
]{
  title,
  slug,
  publishedAt,
  author->{name, image}
}
```

**Input:** "ดึงบทความ 5 อันล่าสุด พร้อมรูปภาพ"
```groq
*[_type == "post" && defined(publishedAt)]
| order(publishedAt desc)[0...5]
{
  title,
  slug,
  publishedAt,
  "imageUrl": mainImage.asset->url,
  "imageAlt": mainImage.alt
}
```

### 🔍 **2. Semantic Search Deep Dive**

#### **Embedding-Based Search:**
```bash
# Traditional keyword search
*[_type == "post" && title match "*React*"]

# Semantic search ผ่าน MCP
"หาบทความเกี่ยวกับ component-based development"
# → หา React, Vue, Angular, Web Components
```

#### **Cross-Reference Search:**
```bash
"หาเนื้อหาที่เกี่ยวข้องกับบทความนี้"
# → วิเคราะห์ content similarity
# → แนะนำ related posts
# → สร้าง content clusters
```

### 📊 **3. Content Analytics**

#### **Performance Insights:**
```bash
"วิเคราะห์ performance ของ content"

# MCP ให้ข้อมูล:
- อัตราการอ่าน (reading time)
- Content engagement
- Popular topics
- Content gaps
```

#### **SEO Analysis:**
```bash
"ตรวจสอบ SEO readiness ของบทความทั้งหมด"

# เช็ค:
- Meta descriptions
- Title lengths
- Image alt texts
- Internal linking
```

---

## 🎯 **ประโยชน์ที่ได้จริง**

### ⏰ **ประหยัดเวลา 80%**
- ไม่ต้องจำ GROQ syntax
- ไม่ต้องเขียน complex queries
- Batch operations แบบอัตโนมัติ

### 🎯 **ลดข้อผิดพลาด**
- AI ตรวจสอบ syntax
- Validation ก่อน execute
- Preview ก่อน apply changes

### 🚀 **เพิ่มประสิทธิภาพ**
- Natural language interface
- Intelligent suggestions
- Automated workflows

### 📈 **Scale ได้ง่าย**
- Handle เนื้อหาเป็นร้อยหรือพันชิ้น
- Bulk operations
- Cross-project management

---

## 🔧 **การติดตั้งและใช้งาน**

### 📋 **Prerequisites**
- Sanity project ที่มี deployed schema
- API token ที่มี read/write permissions
- Cursor หรือ AI tool ที่รองรับ MCP

### ⚙️ **Configuration**
```json
{
  "mcpServers": {
    "sanity": {
      "command": "npx",
      "args": ["-y", "@sanity/mcp-server@latest"],
      "env": {
        "SANITY_PROJECT_ID": "your-project-id",
        "SANITY_DATASET": "your-dataset",
        "SANITY_API_TOKEN": "your-api-token",
        "MCP_USER_ROLE": "developer"
      }
    }
  }
}
```

### 🚀 **เริ่มใช้งาน**
1. Restart AI tool
2. ทดสอบด้วยคำสั่งง่ายๆ: "Show me all posts"
3. ลองใช้ natural language commands

---

## 📚 **ตัวอย่างการใช้งานจริง**

### 🔍 **Content Discovery**
```bash
"หาบทความที่เกี่ยวกับ AI และ Machine Learning"
"แสดงบทความที่ได้รับความนิยมสูงสุด"
"ตรวจสอบบทความที่ไม่มี featured image"
```

### ✏️ **Content Creation**
```bash
"สร้างบทความใหม่เรื่อง 'How to use Tailwind CSS'"
"เพิ่ม author profile สำหรับ John Doe"
"สร้าง category ใหม่ชื่อ 'Web Development'"
```

### 🔄 **Content Management**
```bash
"อัปเดตวันที่เผยแพร่ของบทความทั้งหมดใน draft"
"เปลี่ยน category ของบทความ React เป็น Frontend"
"เพิ่ม tag 'tutorial' ให้บทความที่มี step-by-step"
```

### 📊 **Analytics & Reporting**
```bash
"สร้างรายงานบทความที่เผยแพร่ในเดือนนี้"
"วิเคราะห์การใช้ tags ในระบบ"
"แสดงสถิติ authors ที่เขียนบทความมากที่สุด"
```

---

## 🎉 **สรุป**

**GROQ + Sanity MCP Server = Content Management ที่ทรงพลังและใช้งานง่าย**

ทำให้การจัดการเนื้อหาเป็นเรื่องง่ายเหมือนการสนทนากับ AI โดยไม่ต้องเรียนรู้ syntax ซับซ้อนหรือจำคำสั่งต่างๆ มากมาย

### 🌟 **Key Takeaways:**
- **GROQ**: ภาษา query ที่อ่านง่ายและทรงพลัง
- **MCP Server**: เชื่อมต่อ AI กับ Sanity ได้อย่างราบรื่น
- **Natural Language**: ใช้ภาษาธรรมชาติแทน code
- **AI-Powered**: ประหยัดเวลาและลดข้อผิดพลาด

---

**📝 หมายเหตุ:** คู่มือนี้เป็นส่วนหนึ่งของโปรเจ็กต์ Blog ไทย ที่ใช้ Astro + Sanity CMS พร้อม AI-powered content management

**🔗 Links:**
- [Sanity Documentation](https://www.sanity.io/docs)
- [GROQ Reference](https://www.sanity.io/docs/groq)
- [MCP Protocol](https://modelcontextprotocol.io/)
- [โปรเจ็กต์ GitHub](https://github.com/your-repo) 