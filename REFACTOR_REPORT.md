# Frontend Refactor Report — ProductTrace-AI
**Ngày thực hiện:** 2026-07-09 | **Build:** ✅ `npm run build` thành công (2190 modules, 2.58s)

---

## 1. Báo cáo vấn đề hiện tại

| # | File / Phạm vi | Vấn đề | Impact | Giải pháp đã thực hiện |
|---|---|---|---|---|
| 1 | `src/App.tsx` | Routing bằng `window.location.pathname` + useState | CRITICAL — không phải SPA thật, mất lịch sử trình duyệt | Thay bằng React Router v7 với `BrowserRouter` |
| 2 | `src/admin/components/Layout.tsx` | Login chỉ set state `isLoggedOut = false`, không gọi API | CRITICAL — không có authentication thật | Thay bằng `AdminLayout.tsx` với Zustand + logout thật |
| 3 | Toàn bộ Admin pages | Dùng `onNavigate(tabId)` — không có real URL | HIGH — bookmark/reload sẽ hỏng route | Tạo `withNav` HOC adapter backward-compatible |
| 4 | Không có API layer | Axios chưa được cấu hình, tất cả là mock data | CRITICAL | Tạo `src/api/axios.ts` với interceptors đầy đủ |
| 5 | Không có State Management | Không có token/user session management | CRITICAL | Tạo Zustand auth store với persist middleware |
| 6 | Không có Route Guards | Tất cả routes đều public | CRITICAL — ai cũng vào được admin | Tạo `ProtectedRoute` + `GuestRoute` |
| 7 | Không có `.env` | `VITE_API_URL` chưa có, URL hardcoded | HIGH | Tạo `.env.example`, `.env.production` |
| 8 | Không có `vercel.json` | SPA routes sẽ trả 404 khi refresh trên Vercel | HIGH | Tạo `vercel.json` với SPA rewrites |
| 9 | `tsconfig.json` | Thiếu các alias mới `@features`, `@routes`, `@layouts` | MEDIUM | Cập nhật paths + bật strict mode |
| 10 | `vite.config.ts` | Thiếu alias mới, chưa có chunk splitting | MEDIUM | Cập nhật với manualChunks và aliases mới |

---

## 2. Cấu trúc folder sau refactor

```
src/
├── api/
│   └── axios.ts                    ← ✅ MỚI — Axios instance + interceptors
│
├── app/                            (dùng src/routes thay thế)
│
├── assets/                         (giữ nguyên)
│
├── features/
│   ├── auth/
│   │   ├── api/
│   │   │   └── auth.api.ts         ← ✅ MỚI — typed auth API functions
│   │   ├── hooks/
│   │   │   └── useAdminNavigate.ts ← ✅ MỚI — backward-compat navigate hook
│   │   ├── pages/
│   │   │   ├── LoginPage.tsx       ← ✅ MỚI — real API login
│   │   │   ├── RegisterPage.tsx    ← ✅ MỚI — real API register
│   │   │   ├── VerifyOtpPage.tsx   ← ✅ MỚI — real OTP verification
│   │   │   └── ForgotPasswordPage.tsx ← ✅ MỚI — 2-step password reset
│   │   └── store/
│   │       └── auth.store.ts       ← ✅ MỚI — Zustand auth store
│   │
│   └── products/
│       └── api/
│           └── product.api.ts      ← ✅ MỚI — typed product API functions
│
├── layouts/
│   └── AdminLayout.tsx             ← ✅ MỚI — Layout với Outlet + NavLink + Zustand logout
│
├── routes/
│   ├── guards/
│   │   ├── ProtectedRoute.tsx      ← ✅ MỚI — Auth + Role guard
│   │   └── GuestRoute.tsx          ← ✅ MỚI — Redirect nếu đã đăng nhập
│   └── AppRouter.tsx               ← ✅ MỚI — Central route config (BrowserRouter + lazy)
│
├── admin/                          (giữ nguyên, backward-compatible)
├── customer/                       (giữ nguyên)
├── shared/                         (giữ nguyên)
│
├── App.tsx                         ← ✅ SỬA — chỉ render AppRouter
├── main.tsx                        (giữ nguyên)
└── index.css                       (giữ nguyên)
```

---

## 3. File cần tạo (đã hoàn thành ✅)

| File | Mục đích |
|---|---|
| `src/api/axios.ts` | Axios instance, interceptors, token helpers |
| `src/features/auth/api/auth.api.ts` | Typed auth API functions |
| `src/features/auth/store/auth.store.ts` | Zustand auth store |
| `src/features/auth/pages/LoginPage.tsx` | Login với real API |
| `src/features/auth/pages/RegisterPage.tsx` | Register với real API |
| `src/features/auth/pages/VerifyOtpPage.tsx` | OTP verification |
| `src/features/auth/pages/ForgotPasswordPage.tsx` | Forgot/Reset password |
| `src/features/auth/hooks/useAdminNavigate.ts` | Navigation adapter hook |
| `src/features/products/api/product.api.ts` | Typed product API functions |
| `src/layouts/AdminLayout.tsx` | React Router Outlet layout |
| `src/routes/AppRouter.tsx` | Central BrowserRouter config |
| `src/routes/guards/ProtectedRoute.tsx` | Auth + role guard |
| `src/routes/guards/GuestRoute.tsx` | Guest-only guard |
| `.env.example` | Mẫu biến môi trường |
| `.env.production` | Template cho Vercel |
| `vercel.json` | SPA rewrite rules |

---

## 4. File cần sửa (đã hoàn thành ✅)

| File | Thay đổi |
|---|---|
| `src/App.tsx` | Thay toàn bộ routing logic bằng `<AppRouter />` |
| `tsconfig.json` | Thêm aliases `@features`, `@routes`, `@layouts`, `@api` + strict mode |
| `vite.config.ts` | Thêm aliases tương ứng + manualChunks cho vendor splitting |

---

## 5. Code quan trọng — tóm tắt

### Axios Interceptor Flow
```
Request → Attach Authorization: Bearer {accessToken}
Response 401 → Gọi /auth/refresh → Lưu token mới → Retry request
Refresh fail → Clear token → Redirect /login
```

### Auth Store (Zustand)
```typescript
useAuthStore.login()       // POST /api/auth/login → save tokens → fetchProfile()
useAuthStore.logout()      // POST /api/auth/logout → clear()
useAuthStore.fetchProfile() // GET /api/users/profile → set user + role
useAuthStore.setTokens()   // Called by axios interceptor after silent refresh
useAuthStore.clear()       // Clear tokens + state → logout
```

### Route Structure
```
/ → redirect /dashboard
/login            (GuestRoute)
/register         (GuestRoute)
/verify-otp       (GuestRoute)
/forgot-password  (GuestRoute)

/dashboard        (ProtectedRoute: ADMIN | STAFF | DEALER)
/products         (ProtectedRoute: ADMIN | STAFF | DEALER)
/batches          (ProtectedRoute: ADMIN | STAFF | DEALER)
... (12 admin routes)
/users            (ProtectedRoute: ADMIN only)

/customer/scan    (ProtectedRoute: any authenticated)
/customer/...     (ProtectedRoute: any authenticated)
```

---

## 6. Deploy Vercel — Checklist

- [x] `vercel.json` với SPA rewrites
- [x] `.env.production` template sẵn sàng
- [x] `npm run build` thành công ✅
- [x] Lazy loading cho tất cả Admin/Customer pages
- [x] Vendor chunk splitting (react, zustand, axios tách riêng)
- [ ] **Việc cần làm trước deploy:** Thiết lập Environment Variables trên Vercel Dashboard:
  - `VITE_API_URL` = `https://api.yourdomain.com/api`
  - `VITE_APP_NAME` = `ProductTrace-AI`

### Lệnh deploy
```bash
# Option 1: Via Vercel CLI
npm install -g vercel
vercel --prod

# Option 2: Connect GitHub repo → Vercel auto-deploy on push
```

---

## 7. Checklist cuối cùng

- [x] `npm install` (zustand, axios, react-router-dom@7 đã cài)
- [x] `npm run build` — **✅ 2190 modules, 0 errors, 2.58s**
- [ ] Deploy Vercel (cần thiết lập `VITE_API_URL` trên Vercel Dashboard)
- [ ] Connect Backend API (đổi `.env.local` → `VITE_API_URL=http://localhost:8000/api`)
- [ ] Login flow working (kiểm tra sau khi backend running)
- [ ] Refresh token working (kiểm tra với token hết hạn 401)

---

## 8. Cách sử dụng API layer

### Gọi API trong component
```typescript
// ✅ ĐÚNG — dùng qua feature api module
import { authApi } from '@features/auth/api/auth.api';
const { data } = await authApi.login({ email, password });

// ✅ ĐÚNG — dùng qua store
const { login } = useAuthStore();
await login({ email, password });

// ❌ SAI — không gọi axios trực tiếp trong component
import axios from 'axios';
axios.post('/api/auth/login', ...);
```

### Thêm API mới cho feature khác
```typescript
// src/features/batches/api/batch.api.ts
import apiClient, { ApiResponse } from '../../../api/axios';

export const batchApi = {
  getAll: (params?: BatchListParams) =>
    apiClient.get<ApiResponse<PaginatedResponse<Batch>>>('/batches', { params }),
};
```
