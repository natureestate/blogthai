#!/bin/bash

# สคริปต์สำหรับทดสอบการ restart development server
# Script for testing development server restart

echo "🔍 ตรวจสอบ port ที่ใช้อยู่ในขณะนี้ / Checking currently used ports..."
lsof -i:3333,4321

echo ""
echo "🛑 หยุด development server / Stopping development server..."
npm run stop

echo ""
echo "⏳ รอ 3 วินาที / Waiting 3 seconds..."
sleep 3

echo ""
echo "🔍 ตรวจสอบ port หลังจากหยุด / Checking ports after stop..."
lsof -i:3333,4321 || echo "✅ ไม่มี process ใช้ port เหล่านี้ / No processes using these ports"

echo ""
echo "🚀 เริ่ม development server ใหม่ / Starting development server..."
npm run dev 