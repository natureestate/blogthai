# 🎯 แผนปรับปรุง SEO & LLM Optimization

## เป้าหมาย
ปรับปรุง posts ให้สอดคล้องกับ SEO rules 100% สำหรับ Google Bot & LLM Search

---

## 🚨 Priority 1: Critical Issues

### 1. เพิ่ม JSON-LD Schema Markup
- [ ] Article Schema สำหรับทุก post
- [ ] Author Schema พร้อม credentials
- [ ] Organization Schema สำหรับ Blog ไทย
- [ ] WebPage Schema สำหรับหน้าต่างๆ

### 2. ปรับปรุง Author System
- [ ] เพิ่ม author สำหรับทุก post
- [ ] เพิ่มข้อมูล credentials ใน author schema
- [ ] สร้าง author pages พร้อม portfolio
- [ ] เพิ่ม author avatars และ bios

### 3. เพิ่ม Meta Tags ครบถ้วน
- [ ] Open Graph tags
- [ ] Twitter Card tags  
- [ ] Canonical URLs
- [ ] Last modified dates

---

## 🔧 Priority 2: Content Quality

### 4. ปรับปรุงเนื้อหา posts
- [ ] เพิ่ม heading structure (H2, H3) ที่ชัดเจน
- [ ] เขียนเนื้อหาให้ครบถ้วน comprehensive (800+ คำ)
- [ ] เพิ่ม FAQ sections
- [ ] เพิ่ม Key Takeaways sections

### 5. SEO Metadata
- [ ] เพิ่ม publishedAt สำหรับทุก post
- [ ] ตั้งค่า language metadata
- [ ] เพิ่ม keywords และ descriptions
- [ ] สร้าง compelling titles

---

## 📈 Priority 3: Advanced Features

### 6. Structured Content
- [ ] เพิ่ม breadcrumbs
- [ ] สร้าง sitemap อัตโนมัติ
- [ ] เพิ่ม related posts ที่ดีขึ้น
- [ ] เพิ่ม estimated reading time ที่แม่นยำ

### 7. User Experience
- [ ] เพิ่ม search functionality
- [ ] ปรับปรุง mobile experience
- [ ] เพิ่ม loading performance
- [ ] เพิ่ม accessibility features

---

## 🎯 Success Metrics

### เป้าหมายที่ต้องบรรลุ:
1. **E-E-A-T Score**: จาก 20% → 90%
2. **Schema Markup**: จาก 0% → 100%
3. **Content Quality**: จาก 30% → 95%
4. **Technical SEO**: จาก 70% → 100%

### Timeline: 2-3 สัปดาห์
- สัปดาห์ที่ 1: Priority 1 issues
- สัปดาห์ที่ 2: Priority 2 content  
- สัปดาห์ที่ 3: Priority 3 advanced features

---

## 🛠️ Implementation Steps

### Phase 1: Schema & Meta (Days 1-3)
1. เพิ่ม JSON-LD schema ใน Layout.astro
2. ปรับปรุง post template สำหรับ meta tags
3. สร้าง schema utilities

### Phase 2: Authors & Content (Days 4-10)  
1. ปรับปรุง author schema ใน Sanity
2. เพิ่ม author credentials และ portfolios
3. เขียนเนื้อหา posts ใหม่ที่ comprehensive

### Phase 3: Advanced SEO (Days 11-14)
1. เพิ่ม breadcrumbs และ navigation
2. ปรับปรุง performance และ Core Web Vitals
3. เพิ่ม automated sitemap

---

## 📋 Checklist Template สำหรับแต่ละ Post

### Content Requirements:
- [ ] มี H1 title ที่ชัดเจน
- [ ] มี H2/H3 structure อย่างน้อย 3 sections  
- [ ] เนื้อหาอย่างน้อย 800 คำ
- [ ] มี introduction และ conclusion
- [ ] มี key takeaways หรือ summary
- [ ] มี FAQ section (ถ้าเหมาะสม)

### Technical Requirements:
- [ ] มี publishedAt date
- [ ] มี author พร้อม credentials
- [ ] มี SEO title และ description
- [ ] มี proper categories และ tags
- [ ] มี featured image พร้อม alt text
- [ ] มี estimated reading time

### Schema Requirements:
- [ ] Article schema พร้อม headline, author, datePublished
- [ ] Author schema พร้อม name, credentials, sameAs
- [ ] Organization schema พร้อม contact info
- [ ] ImageObject schema สำหรับ featured image 