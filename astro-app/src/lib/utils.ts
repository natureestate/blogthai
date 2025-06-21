import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * ✅ Utility function สำหรับรวม CSS classes
 * ใช้ clsx สำหรับ conditional classes และ tailwind-merge สำหรับ merge Tailwind classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
} 