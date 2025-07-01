# 👥 Frontend User Management & Content Gating System

คู่มือการสร้างระบบจัดการสมาชิกและควบคุมการเข้าถึงเนื้อหาสำหรับ Blog ไทย

## 🎯 ภาพรวมระบบ

อ้อ! เข้าใจแล้วครับ คุณหมายถึง **Frontend User Management** สำหรับ visitors/readers ที่มาอ่าน blog ใช่มั้ยครับ ไม่ใช่ Sanity Studio members

ผมจะอธิบายวิธีการสร้างระบบ membership และ content gating ให้ฟังครับ

## 👥 Frontend User Authentication & Content Gating

### 🎯 **ระบบที่ต้องสร้าง:**

1. **User Registration/Login** - สมัครสมาชิก/เข้าสู่ระบบ
2. **Subscription Tiers** - ระดับสมาชิกแต่ละแบบ  
3. **Content Access Control** - ควบคุมการเข้าถึงเนื้อหา
4. **Paywall System** - ระบบเสียเงิน

---

## 🔐 การออกแบบ Authentication System

### 📋 **User Schema (เพิ่มใน Sanity):**

```typescript
// studio/src/schemaTypes/documents/user.ts
import {defineField, defineType} from 'sanity'
import {UserIcon} from '@sanity/icons'

export default defineType({
  name: 'user',
  title: 'User',
  type: 'document',
  icon: UserIcon,
  fields: [
    defineField({
      name: 'email',
      title: 'Email',
      type: 'string',
      validation: Rule => Rule.required().email()
    }),
    defineField({
      name: 'displayName',
      title: 'Display Name',
      type: 'string',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'avatar',
      title: 'Avatar',
      type: 'image',
      options: {
        hotspot: true
      }
    }),
    defineField({
      name: 'membershipTier',
      title: 'Membership Tier',
      type: 'string',
      options: {
        list: [
          {title: '🆓 Free', value: 'free'},
          {title: '⭐ Premium', value: 'premium'},
          {title: '💎 Pro', value: 'pro'},
          {title: '🏆 Lifetime', value: 'lifetime'}
        ]
      },
      initialValue: 'free'
    }),
    defineField({
      name: 'subscriptionStatus',
      title: 'Subscription Status',
      type: 'string',
      options: {
        list: [
          {title: 'Active', value: 'active'},
          {title: 'Expired', value: 'expired'},
          {title: 'Cancelled', value: 'cancelled'},
          {title: 'Trial', value: 'trial'}
        ]
      },
      initialValue: 'active'
    }),
    defineField({
      name: 'subscriptionExpiry',
      title: 'Subscription Expiry',
      type: 'datetime'
    }),
    defineField({
      name: 'joinedAt',
      title: 'Joined At',
      type: 'datetime',
      initialValue: () => new Date().toISOString()
    })
  ]
})
```

### 🔒 **เพิ่ม Access Control ใน Post Schema**

```typescript
// เพิ่มใน studio/src/schemaTypes/documents/post.ts
defineField({
  name: 'accessLevel',
  title: 'Access Level',
  type: 'string',
  options: {
    list: [
      {title: '🌍 Public (ทุกคนเข้าถึงได้)', value: 'public'},
      {title: '👤 Member Only (สมาชิกเท่านั้น)', value: 'member'},
      {title: '⭐ Premium Only (Premium+)', value: 'premium'},
      {title: '💎 Pro Only (Pro+)', value: 'pro'},
      {title: '🏆 Lifetime Only', value: 'lifetime'}
    ],
    layout: 'radio'
  },
  initialValue: 'public',
  description: 'ใครสามารถเข้าถึงบทความนี้ได้บ้าง'
}),
defineField({
  name: 'previewLength',
  title: 'Preview Length (characters)',
  type: 'number',
  description: 'จำนวนตัวอักษรที่ให้ดูฟรี (สำหรับ member content)',
  initialValue: 300,
  hidden: ({document}: any) => document?.accessLevel === 'public'
}),
defineField({
  name: 'isPremium',
  title: 'Premium Content',
  type: 'boolean',
  description: 'เนื้อหาพรีเมียม (จะแสดง badge พิเศษ)',
  initialValue: false
})
```

---

## 🚀 การสร้าง Authentication System

### 🔐 **Auth API Routes**

```typescript
// astro-app/src/pages/api/auth/login.ts
import type { APIRoute } from 'astro';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { getClient } from '../../../utils/sanity';

export const POST: APIRoute = async ({ request }) => {
  try {
    const { email, password } = await request.json();
    
    // ค้นหา user ใน Sanity
    const client = getClient();
    const user = await client.fetch(
      `*[_type == "user" && email == $email][0]`,
      { email }
    );
    
    if (!user) {
      return new Response(JSON.stringify({
        error: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง'
      }), { status: 401 });
    }
    
    // ตรวจสอบรหัสผ่าน (ในระบบจริงต้อง hash password)
    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return new Response(JSON.stringify({
        error: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง'
      }), { status: 401 });
    }
    
    // สร้าง JWT token
    const token = jwt.sign(
      { 
        userId: user._id,
        email: user.email,
        membershipTier: user.membershipTier,
        subscriptionStatus: user.subscriptionStatus
      },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );
    
    return new Response(JSON.stringify({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        displayName: user.displayName,
        membershipTier: user.membershipTier,
        subscriptionStatus: user.subscriptionStatus
      }
    }));
    
  } catch (error) {
    return new Response(JSON.stringify({
      error: 'เกิดข้อผิดพลาดในระบบ'
    }), { status: 500 });
  }
};
```

### 👤 **User Registration**

```typescript
// astro-app/src/pages/api/auth/register.ts
import type { APIRoute } from 'astro';
import bcrypt from 'bcryptjs';
import { getClient } from '../../../utils/sanity';

export const POST: APIRoute = async ({ request }) => {
  try {
    const { email, password, displayName } = await request.json();
    
    const client = getClient();
    
    // ตรวจสอบว่าอีเมลซ้ำหรือไม่
    const existingUser = await client.fetch(
      `*[_type == "user" && email == $email][0]`,
      { email }
    );
    
    if (existingUser) {
      return new Response(JSON.stringify({
        error: 'อีเมลนี้ถูกใช้แล้ว'
      }), { status: 400 });
    }
    
    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);
    
    // สร้าง user ใหม่
    const newUser = await client.create({
      _type: 'user',
      email,
      displayName,
      passwordHash,
      membershipTier: 'free',
      subscriptionStatus: 'active',
      joinedAt: new Date().toISOString()
    });
    
    return new Response(JSON.stringify({
      success: true,
      message: 'สมัครสมาชิกสำเร็จ'
    }));
    
  } catch (error) {
    return new Response(JSON.stringify({
      error: 'เกิดข้อผิดพลาดในระบบ'
    }), { status: 500 });
  }
};
```

---

## 🛡️ Content Access Control

### 🔒 **Middleware สำหรับตรวจสอบสิทธิ์**

```typescript
// astro-app/src/utils/auth.ts
import jwt from 'jsonwebtoken';

export interface UserSession {
  userId: string;
  email: string;
  membershipTier: 'free' | 'premium' | 'pro' | 'lifetime';
  subscriptionStatus: 'active' | 'expired' | 'cancelled' | 'trial';
}

export function verifyToken(token: string): UserSession | null {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as UserSession;
    return decoded;
  } catch {
    return null;
  }
}

export function canAccessContent(
  userTier: string | null, 
  contentAccessLevel: string
): boolean {
  // Public content - ทุกคนเข้าถึงได้
  if (contentAccessLevel === 'public') return true;
  
  // ไม่มี user session - เข้าถึงแค่ public
  if (!userTier) return false;
  
  // Tier hierarchy
  const tierLevels = {
    'free': 1,
    'premium': 2,
    'pro': 3,
    'lifetime': 4
  };
  
  const requiredLevels = {
    'member': 1,    // Free+
    'premium': 2,   // Premium+
    'pro': 3,       // Pro+
    'lifetime': 4   // Lifetime only
  };
  
  const userLevel = tierLevels[userTier as keyof typeof tierLevels] || 0;
  const requiredLevel = requiredLevels[contentAccessLevel as keyof typeof requiredLevels] || 999;
  
  return userLevel >= requiredLevel;
}

export function getContentPreview(content: string, previewLength: number = 300): string {
  if (content.length <= previewLength) return content;
  
  // ตัดที่คำเต็ม
  const preview = content.substring(0, previewLength);
  const lastSpace = preview.lastIndexOf(' ');
  
  return preview.substring(0, lastSpace > 0 ? lastSpace : previewLength) + '...';
}
```

### 📄 **Update Post Page ด้วย Access Control**

```astro
---
// astro-app/src/pages/post/[slug].astro
import { verifyToken, canAccessContent, getContentPreview } from "../../utils/auth";

// ... existing code ...

// ตรวจสอบ authentication
const authCookie = Astro.cookies.get('auth-token');
const userSession = authCookie ? verifyToken(authCookie.value) : null;

// ตรวจสอบสิทธิ์เข้าถึง
const hasAccess = canAccessContent(
  userSession?.membershipTier || null, 
  post.accessLevel || 'public'
);

// สำหรับ member content ที่ไม่มีสิทธิ์ - แสดง preview
const contentToShow = hasAccess 
  ? post.body 
  : getContentPreview(post.body, post.previewLength || 300);

const showPaywall = !hasAccess && post.accessLevel !== 'public';
---

<Layout>
  <article class="post-article">
    <!-- Post header (เหมือนเดิม) -->
    
    <!-- Content with access control -->
    <div class="post-content">
      {showPaywall ? (
        <!-- Preview content -->
        <div class="content-preview">
          <PortableText value={contentToShow} />
          
          <!-- Paywall -->
          <div class="paywall">
            <div class="paywall__gradient"></div>
            <div class="paywall__content">
              <h3>🔒 เนื้อหาสำหรับสมาชิก</h3>
              <p>เข้าสู่ระบบหรือสมัครสมาชิกเพื่ออ่านเนื้อหาฉบับเต็ม</p>
              
              {post.accessLevel === 'premium' && (
                <div class="tier-required">
                  <span class="tier-badge tier-badge--premium">⭐ Premium เท่านั้น</span>
                </div>
              )}
              
              <div class="paywall__actions">
                <a href="/login" class="btn btn--primary">เข้าสู่ระบบ</a>
                <a href="/pricing" class="btn btn--secondary">ดูแพ็คเกจ</a>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <!-- Full content -->
        <PortableText value={post.body} />
      )}
    </div>
  </article>
</Layout>

<style>
.paywall {
  position: relative;
  margin-top: 2rem;
  text-align: center;
}

.paywall__gradient {
  position: absolute;
  top: -4rem;
  left: 0;
  right: 0;
  height: 4rem;
  background: linear-gradient(transparent, white);
  pointer-events: none;
}

.paywall__content {
  background: #f8fafc;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  padding: 2rem;
  margin: 1rem 0;
}

.tier-badge {
  display: inline-block;
  padding: 0.5rem 1rem;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 600;
  margin: 1rem 0;
}

.tier-badge--premium {
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
  color: white;
}

.paywall__actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 1.5rem;
}

.btn {
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.2s;
}

.btn--primary {
  background: #3b82f6;
  color: white;
}

.btn--secondary {
  background: #6b7280;
  color: white;
}
</style>
```

---

## 💳 Pricing & Subscription System

### 💰 **Pricing Page**

```astro
---
// astro-app/src/pages/pricing.astro
---

<Layout title="แพ็คเกจสมาชิก - Blog ไทย">
  <div class="pricing-container">
    <h1>เลือกแพ็คเกจที่เหมาะกับคุณ</h1>
    
    <div class="pricing-grid">
      <!-- Free Tier -->
      <div class="pricing-card">
        <h3>🆓 Free</h3>
        <div class="price">ฟรี</div>
        <ul class="features">
          <li>✅ อ่านบทความฟรี</li>
          <li>✅ แสดงความคิดเห็น</li>
          <li>❌ เนื้อหาพรีเมียม</li>
          <li>❌ ดาวน์โหลด resources</li>
        </ul>
        <button class="btn-pricing">เริ่มใช้ฟรี</button>
      </div>
      
      <!-- Premium Tier -->
      <div class="pricing-card pricing-card--featured">
        <h3>⭐ Premium</h3>
        <div class="price">฿199<span>/เดือน</span></div>
        <ul class="features">
          <li>✅ เนื้อหาทั้งหมด</li>
          <li>✅ บทความพรีเมียม</li>
          <li>✅ ดาวน์โหลด code examples</li>
          <li>✅ เข้าถึง community</li>
        </ul>
        <button class="btn-pricing btn-pricing--primary">สมัครเลย</button>
      </div>
      
      <!-- Pro Tier -->
      <div class="pricing-card">
        <h3>💎 Pro</h3>
        <div class="price">฿399<span>/เดือน</span></div>
        <ul class="features">
          <li>✅ ทุกอย่างใน Premium</li>
          <li>✅ Video tutorials</li>
          <li>✅ 1-on-1 mentoring</li>
          <li>✅ Job opportunities</li>
        </ul>
        <button class="btn-pricing">สมัคร Pro</button>
      </div>
    </div>
  </div>
</Layout>
```

### 🔄 **Payment Integration (Stripe/Omise)**

```typescript
// astro-app/src/pages/api/subscription/create.ts
import type { APIRoute } from 'astro';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export const POST: APIRoute = async ({ request }) => {
  try {
    const { tier, userId } = await request.json();
    
    const priceIds = {
      premium: 'price_premium_monthly',
      pro: 'price_pro_monthly'
    };
    
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price: priceIds[tier as keyof typeof priceIds],
        quantity: 1,
      }],
      mode: 'subscription',
      success_url: `${process.env.SITE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.SITE_URL}/pricing`,
      client_reference_id: userId,
      metadata: {
        tier,
        userId
      }
    });
    
    return new Response(JSON.stringify({ url: session.url }));
    
  } catch (error) {
    return new Response(JSON.stringify({ error: 'เกิดข้อผิดพลาด' }), { 
      status: 500 
    });
  }
};
```

---

## 📊 Admin Dashboard สำหรับจัดการ Members

### 🎛️ **Member Management Component**

```astro
---
// astro-app/src/pages/admin/members.astro (Protected route)
import { verifyToken } from "../../utils/auth";
import { getClient } from "../../utils/sanity";

// ตรวจสอบว่าเป็น admin หรือไม่
const authCookie = Astro.cookies.get('auth-token');
const userSession = authCookie ? verifyToken(authCookie.value) : null;

if (!userSession || userSession.membershipTier !== 'admin') {
  return Astro.redirect('/login');
}

// ดึงข้อมูล members
const client = getClient();
const members = await client.fetch(`
  *[_type == "user"] | order(_createdAt desc) {
    _id,
    email,
    displayName,
    membershipTier,
    subscriptionStatus,
    joinedAt,
    "postsRead": count(*[_type == "post" && references(^._id)])
  }
`);
---

<Layout title="จัดการสมาชิก - Admin">
  <div class="admin-container">
    <h1>จัดการสมาชิก</h1>
    
    <!-- Stats -->
    <div class="stats-grid">
      <div class="stat-card">
        <h3>สมาชิกทั้งหมด</h3>
        <div class="stat-number">{members.length}</div>
      </div>
      <div class="stat-card">
        <h3>Premium Members</h3>
        <div class="stat-number">
          {members.filter(m => ['premium', 'pro', 'lifetime'].includes(m.membershipTier)).length}
        </div>
      </div>
    </div>
    
    <!-- Members Table -->
    <div class="members-table">
      <table>
        <thead>
          <tr>
            <th>ชื่อ</th>
            <th>อีเมล</th>
            <th>แพ็คเกจ</th>
            <th>สถานะ</th>
            <th>วันที่สมัคร</th>
            <th>การกระทำ</th>
          </tr>
        </thead>
        <tbody>
          {members.map(member => (
            <tr>
              <td>{member.displayName}</td>
              <td>{member.email}</td>
              <td>
                <span class={`tier-badge tier-badge--${member.membershipTier}`}>
                  {member.membershipTier.toUpperCase()}
                </span>
              </td>
              <td>
                <span class={`status-badge status-badge--${member.subscriptionStatus}`}>
                  {member.subscriptionStatus}
                </span>
              </td>
              <td>{new Date(member.joinedAt).toLocaleDateString('th-TH')}</td>
              <td>
                <button class="btn-action btn-action--edit">แก้ไข</button>
                <button class="btn-action btn-action--delete">ลบ</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
</Layout>
```

---

## 🎯 สรุประบบ Member Management

### ✅ **Features ที่ได้:**

1. **User Registration/Login** - สมัครสมาชิก/เข้าสู่ระบบ
2. **4 Membership Tiers** - Free, Premium, Pro, Lifetime
3. **Content Access Control** - ควบคุมการเข้าถึงแต่ละบทความ
4. **Paywall System** - แสดง preview และปุ่มสมัครสมาชิก
5. **Payment Integration** - เชื่อมต่อ Stripe/Omise
6. **Admin Dashboard** - จัดการสมาชิกและสถิติ

### 🔒 **Content Gating Logic:**
- **Public:** ทุกคนเข้าถึงได้
- **Member:** สมาชิกทุกระดับ (Free+)
- **Premium:** Premium, Pro, Lifetime เท่านั้น
- **Pro:** Pro, Lifetime เท่านั้น
- **Lifetime:** Lifetime เท่านั้น

### 💡 **การใช้งานจริง:**
```bash
# ใน Sanity Studio - กำหนด access level
"บทความนี้ให้เฉพาะ Premium members"

# Frontend - แสดงตาม subscription
- Free: เห็น preview + paywall
- Premium: เห็นเนื้อหาเต็ม
```

### 🚀 **การติดตั้ง:**

1. **เพิ่ม User Schema** ใน `studio/src/schemaTypes/documents/user.ts`
2. **อัปเดต Post Schema** เพิ่ม `accessLevel`, `previewLength`, `isPremium`
3. **สร้าง Auth API** - `/api/auth/login.ts`, `/api/auth/register.ts`
4. **เพิ่ม Auth Utils** - `utils/auth.ts`
5. **อัปเดต Post Page** - เพิ่ม access control และ paywall
6. **สร้าง Pricing Page** - `/pricing.astro`
7. **ติดตั้ง Payment** - Stripe/Omise integration
8. **สร้าง Admin Dashboard** - `/admin/members.astro`

### 📦 **Dependencies ที่ต้องเพิ่ม:**
```json
{
  "jsonwebtoken": "^9.0.0",
  "bcryptjs": "^2.4.3",
  "stripe": "^14.0.0",
  "@types/jsonwebtoken": "^9.0.0",
  "@types/bcryptjs": "^2.4.0"
}
```

---

## 🔗 **Resources เพิ่มเติม:**

- 📚 [Sanity Authentication Guide](https://www.sanity.io/docs/authentication)
- 💳 [Stripe Documentation](https://stripe.com/docs)
- 🔐 [JWT Best Practices](https://auth0.com/blog/a-look-at-the-latest-draft-for-jwt-bcp/)
- 🛡️ [Content Security Best Practices](https://web.dev/security-headers/)

ระบบนี้ให้คุณควบคุมการเข้าถึงเนื้อหาได้อย่างละเอียด และสร้างรายได้จากการสมัครสมาชิกได้ครบ! 