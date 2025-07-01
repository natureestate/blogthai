#!/bin/bash

# Script สำหรับจัดการ Posts ผ่าน Sanity CLI
# ใช้งาน: ./manage-posts.sh [command] [options]

# เปลี่ยนไปยัง studio directory
cd "$(dirname "$0")/../studio" || exit 1

case "$1" in
  "list")
    # แสดงรายการ posts ทั้งหมด
    echo "📚 รายการ Posts ทั้งหมด:"
    npx sanity documents query '*[_type == "post"]{_id, title, slug, publishedAt, featured} | order(_createdAt desc)' --pretty
    ;;
    
  "search")
    # ค้นหา posts ตามคำค้นหา
    if [ -z "$2" ]; then
      echo "❌ กรุณาใส่คำค้นหา: ./manage-posts.sh search 'คำค้นหา'"
      exit 1
    fi
    echo "🔍 ค้นหา Posts: $2"
    npx sanity documents query "*[_type == \"post\" && title match \"$2*\"]{_id, title, slug}" --pretty
    ;;
    
  "get")
    # ดู post เฉพาะ
    if [ -z "$2" ]; then
      echo "❌ กรุณาใส่ Post ID: ./manage-posts.sh get 'post-id'"
      exit 1
    fi
    echo "📖 Post: $2"
    npx sanity documents get "$2" --pretty
    ;;
    
  "create")
    # สร้าง post ใหม่
    if [ -z "$2" ]; then
      echo "📝 สร้าง Post ใหม่ (เปิด Editor):"
      npx sanity documents create
    else
      echo "📝 สร้าง Post จากไฟล์: $2"
      npx sanity documents create "$2"
    fi
    ;;
    
  "edit")
    # แก้ไข post
    if [ -z "$2" ]; then
      echo "❌ กรุณาใส่ Post ID: ./manage-posts.sh edit 'post-id'"
      exit 1
    fi
    echo "✏️ แก้ไข Post: $2"
    npx sanity documents create --id "$2" --replace
    ;;
    
  "delete")
    # ลบ post
    if [ -z "$2" ]; then
      echo "❌ กรุณาใส่ Post ID: ./manage-posts.sh delete 'post-id'"
      exit 1
    fi
    echo "🗑️ ลบ Post: $2"
    read -p "❓ ยืนยันการลบ? (y/N): " confirm
    if [[ $confirm == [yY] || $confirm == [yY][eE][sS] ]]; then
      npx sanity documents delete "$2"
      echo "✅ ลบ Post เรียบร้อยแล้ว"
    else
      echo "❌ ยกเลิกการลบ"
    fi
    ;;
    
  "published")
    # ดู posts ที่ publish แล้ว
    echo "🌟 Posts ที่ Publish แล้ว:"
    npx sanity documents query '*[_type == "post" && defined(publishedAt)]{_id, title, publishedAt} | order(publishedAt desc)' --pretty
    ;;
    
  "drafts")
    # ดู drafts
    echo "📝 Draft Posts:"
    npx sanity documents query '*[_type == "post" && !defined(publishedAt)]{_id, title, _createdAt} | order(_createdAt desc)' --pretty
    ;;
    
  "authors")
    # ดู authors ทั้งหมด
    echo "👥 Authors ทั้งหมด:"
    npx sanity documents query '*[_type == "author"]{_id, name, email}' --pretty
    ;;
    
  "categories")
    # ดู categories ทั้งหมด
    echo "📂 Categories ทั้งหมด:"
    npx sanity documents query '*[_type == "category"]{_id, title, slug}' --pretty
    ;;
    
  "help"|*)
    # แสดงวิธีใช้งาน
    echo "🛠️ Sanity Posts Management Script"
    echo ""
    echo "การใช้งาน:"
    echo "  ./manage-posts.sh list                 - แสดงรายการ posts ทั้งหมด"
    echo "  ./manage-posts.sh search 'คำค้นหา'      - ค้นหา posts"
    echo "  ./manage-posts.sh get 'post-id'        - ดู post เฉพาะ"
    echo "  ./manage-posts.sh create               - สร้าง post ใหม่ (Editor)"
    echo "  ./manage-posts.sh create 'file.json'   - สร้าง post จากไฟล์"
    echo "  ./manage-posts.sh edit 'post-id'       - แก้ไข post"
    echo "  ./manage-posts.sh delete 'post-id'     - ลบ post"
    echo "  ./manage-posts.sh published            - ดู posts ที่ publish แล้ว"
    echo "  ./manage-posts.sh drafts               - ดู draft posts"
    echo "  ./manage-posts.sh authors              - ดู authors ทั้งหมด"
    echo "  ./manage-posts.sh categories           - ดู categories ทั้งหมด"
    echo "  ./manage-posts.sh help                 - แสดงวิธีใช้งาน"
    echo ""
    echo "ตัวอย่าง:"
    echo "  ./manage-posts.sh list"
    echo "  ./manage-posts.sh search 'Astro'"
    echo "  ./manage-posts.sh edit 'my-post-id'"
    ;;
esac 