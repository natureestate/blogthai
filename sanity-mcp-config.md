# 🤖 Sanity MCP Server Setup Guide

## การติดตั้งและตั้งค่า Sanity Model Context Protocol Server

### 📋 ข้อมูลโปรเจ็กต์
- **Project ID:** `yor24whn`
- **Dataset:** `blog` [[memory:731084680206983923]]
- **Sanity Studio:** https://blogthai.sanity.studio/ [[memory:2175666107078836013]]
- **Schema:** ✅ Deployed (with feature flag enabled)

### 🚀 การติดตั้ง MCP Server

#### 1. ตั้งค่า Schema Deployment (เสร็จแล้ว)
```bash
cd studio
SANITY_CLI_SCHEMA_STORE_ENABLED=true npx sanity@latest schema deploy
```

#### 2. สร้าง Sanity API Token
1. ไปที่ https://www.sanity.io/manage/personal/tokens
2. สร้าง token ใหม่ด้วย permissions:
   - **Read:** All datasets
   - **Write:** All datasets (ถ้าต้องการแก้ไข content)

#### 3. Configuration สำหรับ Cursor

เพิ่มใน Cursor workspace settings หรือ global settings:

```json
{
  "mcpServers": {
    "sanity": {
      "command": "npx",
      "args": ["-y", "@sanity/mcp-server@latest"],
      "env": {
        "SANITY_PROJECT_ID": "yor24whn",
        "SANITY_DATASET": "blog",
        "SANITY_API_TOKEN": "YOUR_SANITY_API_TOKEN_HERE",
        "MCP_USER_ROLE": "developer"
      }
    }
  }
}
```

### 🎯 คำสั่งที่สามารถใช้ได้

#### Content Intelligence (ค้นหาและวิเคราะห์)
- "แสดงบทความทั้งหมดที่เผยแพร่ในเดือนที่แล้ว"
- "หาบทความที่เกี่ยวกับ Astro และ Sanity"
- "ตรวจสอบบทความไหนที่ยังไม่ได้อัปเดตนานแล้ว"
- "วิเคราะห์ tag ที่ใช้บ่อยที่สุด"

#### Content Operations (สร้างและแก้ไข)
- "สร้างบทความใหม่เกี่ยวกับ Next.js"
- "อัปเดตข้อมูลราคาในหน้า service ทั้งหมด"
- "สร้าง content release สำหรับ campaign เทศกาล"
- "เปลี่ยนชื่อ 'Sanity Create' เป็น 'Sanity Canvas' ทุกที่"

#### Schema และข้อมูลโปรเจ็กต์
- "แสดง schema ของ content type ทั้งหมด"
- "ดูข้อมูลโปรเจ็กต์และ dataset"
- "ตรวจสอบ embedding indices ที่มี"

### 🛠️ Advanced Features

#### GROQ Queries
- MCP Server รองรับ GROQ queries แบบเต็ม
- สามารถใช้ natural language แทน GROQ syntax ได้

#### Semantic Search
- ใช้ AI embeddings เพื่อค้นหาเนื้อหาตามความหมาย
- เหมาะสำหรับการหา related content

#### Release Management
- สร้างและจัดการ content releases
- กำหนดตารางการเผยแพร่
- ควบคุมสถานะ draft/published

### 🔧 Troubleshooting

#### Node.js Version Managers
ถ้าใช้ `nvm` หรือ version manager อื่น:

```bash
# macOS/Linux
sudo ln -sf "$(which node)" /usr/local/bin/node
sudo ln -sf "$(which npx)" /usr/local/bin/npx

# Windows (PowerShell as Administrator)
New-Item -ItemType SymbolicLink -Path "C:\Program Files\nodejs\node.exe" -Target (Get-Command node).Source -Force
New-Item -ItemType SymbolicLink -Path "C:\Program Files\nodejs\npx.cmd" -Target (Get-Command npx).Source -Force
```

#### การตั้งค่า Permissions
- MCP จะขออนุญาตใช้ tools ในครั้งแรก
- Cursor อาจรัน tools อัตโนมัติตามการตั้งค่า

### 📚 Documentation Links

- [Official Sanity MCP Blog Post](https://www.sanity.io/blog/introducing-sanity-model-context-protocol-server)
- [Model Context Protocol Docs](https://modelcontextprotocol.io/)
- [GitHub Repository](https://github.com/sanity-io/mcp-server)

### 🎊 ผลลัพธ์ที่คาดหวัง

หลังจากติดตั้งเสร็จสิ้น คุณจะสามารถ:

1. **สื่อสารกับ Sanity Content** ผ่าน natural language
2. **ประหยัดเวลา** ในการจัดการ content
3. **ลดข้อผิดพลาด** จากการเขียน GROQ queries
4. **เพิ่มประสิทธิภาพ** ใน content operations
5. **ใช้ AI** ช่วยวิเคราะห์และจัดระเบียบ content

---

🎯 **Next Steps:** ลองใช้คำสั่งง่ายๆ เริ่มต้นด้วย "Show me all blog posts" เพื่อทดสอบการทำงาน! 