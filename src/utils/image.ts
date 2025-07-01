import imageUrlBuilder from "@sanity/image-url";
import type { Image } from "@sanity/types";
import { sanityClient } from "sanity:client";

const builder = imageUrlBuilder(sanityClient);

// Type definitions สำหรับ image sources ต่างๆ
export type ImageSource = Image | string | null | undefined;

export interface ImageOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'jpg' | 'png';
  fit?: 'clip' | 'crop' | 'fill' | 'fillmax' | 'max' | 'scale' | 'min';
}

// ฟังก์ชันตรวจสอบว่า image object มี asset หรือไม่
export function isValidImage(source: any): source is Image {
  // รองรับข้อมูลจาก Sanity ที่มี asset เป็น reference
  return source && 
         typeof source === 'object' && 
         source.asset &&
         (typeof source.asset === 'string' || 
          (typeof source.asset === 'object' && (source.asset._ref || source.asset._id)));
          
  // เอา _type check ออก เพราะข้อมูลจาก Sanity ไม่จำเป็นต้องมี _type
}

// ฟังก์ชันตรวจสอบว่าเป็น External URL หรือไม่
export function isExternalUrl(source: any): source is string {
  return typeof source === 'string' && 
         (source.startsWith('http://') || source.startsWith('https://'));
}

// ฟังก์ชันตรวจสอบว่าเป็น Unsplash URL หรือไม่
export function isUnsplashUrl(url: string): boolean {
  return url.includes('unsplash.com') || url.includes('images.unsplash.com');
}

// ฟังก์ชันสร้าง optimized Unsplash URL
export function optimizeUnsplashUrl(url: string, options: ImageOptions = {}): string {
  if (!isUnsplashUrl(url)) return url;
  
  const urlObj = new URL(url);
  
  // เพิ่ม query parameters สำหรับ optimization
  if (options.width) urlObj.searchParams.set('w', options.width.toString());
  if (options.height) urlObj.searchParams.set('h', options.height.toString());
  if (options.quality) urlObj.searchParams.set('q', Math.min(100, Math.max(1, options.quality)).toString());
  if (options.format) urlObj.searchParams.set('fm', options.format);
  if (options.fit) urlObj.searchParams.set('fit', options.fit);
  
  // เพิ่ม auto enhancement parameters
  urlObj.searchParams.set('auto', 'format,compress');
  
  return urlObj.toString();
}

// ฟังก์ชันสร้าง responsive image URLs
export function createResponsiveUrls(source: ImageSource, baseOptions: ImageOptions = {}): {
  sm: string;
  md: string;
  lg: string;
  xl: string;
} {
  const breakpoints = {
    sm: { width: 640, ...baseOptions },
    md: { width: 768, ...baseOptions },
    lg: { width: 1024, ...baseOptions },
    xl: { width: 1280, ...baseOptions }
  };
  
  const result = {} as any;
  
  for (const [key, options] of Object.entries(breakpoints)) {
    if (isExternalUrl(source)) {
      result[key] = isUnsplashUrl(source) 
        ? optimizeUnsplashUrl(source, options)
        : source;
    } else if (isValidImage(source)) {
      result[key] = builder.image(source)
        .width(options.width || 800)
        .quality(options.quality || 85)
        .format('webp')
        .url();
    } else {
      result[key] = '/placeholder-image.svg';
    }
  }
  
  return result;
}

// Interface สำหรับ chainable image builder
interface ChainableImageBuilder {
  url: () => string;
  width: (width: number) => ChainableImageBuilder;
  height: (height: number) => ChainableImageBuilder;
  quality: (quality: number) => ChainableImageBuilder;
  format: (format: string) => ChainableImageBuilder;
  fit: (fit: string) => ChainableImageBuilder;
}

// ฟังก์ชันสร้าง chainable builder สำหรับ external URLs
function createExternalBuilder(source: string, baseOptions: ImageOptions = {}): ChainableImageBuilder {
  const buildUrl = (options: ImageOptions) => {
    return isUnsplashUrl(source) 
      ? optimizeUnsplashUrl(source, { ...baseOptions, ...options })
      : source;
  };

  const createBuilder = (currentOptions: ImageOptions = {}): ChainableImageBuilder => ({
    url: () => buildUrl(currentOptions),
    width: (width: number) => createBuilder({ ...currentOptions, width }),
    height: (height: number) => createBuilder({ ...currentOptions, height }),
    quality: (quality: number) => createBuilder({ ...currentOptions, quality }),
    format: (format: string) => createBuilder({ ...currentOptions, format: format as any }),
    fit: (fit: string) => createBuilder({ ...currentOptions, fit: fit as any })
  });

  return createBuilder();
}

// ฟังก์ชันสร้าง chainable builder สำหรับ placeholder
function createPlaceholderBuilder(): ChainableImageBuilder {
  const placeholderUrl = '/placeholder-image.svg';
  const createBuilder = (): ChainableImageBuilder => ({
    url: () => placeholderUrl,
    width: () => createBuilder(),
    height: () => createBuilder(),
    quality: () => createBuilder(),
    format: () => createBuilder(),
    fit: () => createBuilder()
  });

  return createBuilder();
}

// ฟังก์ชันสร้าง URL สำหรับรูปภาพ พร้อม error handling ที่ปรับปรุง
export function urlFor(source: ImageSource, options: ImageOptions = {}) {
  // สำหรับ External URLs
  if (isExternalUrl(source)) {
    return createExternalBuilder(source, options);
  }
  
  // สำหรับ Sanity Images
  if (isValidImage(source)) {
    const imageBuilder = builder.image(source);
    
    // ใช้ options ถ้ามี
    if (options.width) imageBuilder.width(options.width);
    if (options.height) imageBuilder.height(options.height);
    if (options.quality) imageBuilder.quality(options.quality);
    if (options.format) imageBuilder.format(options.format);
    if (options.fit) imageBuilder.fit(options.fit);
    
    return imageBuilder;
  }
  
  // Fallback สำหรับกรณีที่ไม่มีรูปภาพ
  return createPlaceholderBuilder();
}

// ฟังก์ชันตรวจสอบว่ามีรูปภาพจริงหรือไม่
export function hasValidImage(source: ImageSource): boolean {
  return isValidImage(source) || isExternalUrl(source);
}

// ฟังก์ชันสร้าง alt text อัตโนมัติจาก Unsplash URL
export function generateAltFromUnsplash(url: string): string {
  if (!isUnsplashUrl(url)) return 'รูปภาพ';
  
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    
    // ดึง photo ID จาก URL
    const photoId = pathname.split('/').pop()?.split('?')[0];
    
    return `รูปภาพคุณภาพสูงจาก Unsplash - Photo ID: ${photoId}`;
  } catch {
    return 'รูปภาพคุณภาพสูงจาก Unsplash';
  }
}

// ฟังก์ชัน utility สำหรับการใช้งานใน components
export function getImageProps(source: ImageSource, options: ImageOptions = {}) {
  const defaultOptions = {
    quality: 85,
    format: 'webp' as const,
    ...options
  };
  
  return {
    src: urlFor(source, defaultOptions).url(),
    alt: isExternalUrl(source) && isUnsplashUrl(source) 
      ? generateAltFromUnsplash(source)
      : 'รูปภาพ',
    loading: 'lazy' as const,
    decoding: 'async' as const,
    ...createResponsiveUrls(source, defaultOptions)
  };
}
